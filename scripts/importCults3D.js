// scripts/importCults3D.js
// ─────────────────────────────────────────────────────────────
// Fetches designs from the Cults3D GraphQL API and upserts them
// into the Supabase `designs` table (source_id = 2).
//
// Usage:
//   node scripts/importCults3D.js
//   npm run import-cults
//
// Requires CULTS3D_API_KEY in .env
// Docs: https://cults3d.com/en/pages/graphql  (GraphiQL explorer at /graphiql)
//
// Auth: HTTP Basic, API key as username, empty password
//   → Authorization: Basic base64("<key>:")
//
// Rate limits (free tier): ~60 req / 30 s, ~500 req / day
// ─────────────────────────────────────────────────────────────

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY   // bypasses RLS; never expose in frontend
);

const CULTS3D_API_KEY = process.env.CULTS3D_API_KEY;
const GRAPHQL_URL     = "https://cults3d.com/graphql";
const PER_PAGE        = 20;   // keep low to stay within free-tier rate limits
const SOURCE_ID       = 2;    // Cults3D row in design_sources (seeded as id=2)

// Same categories as the MMF import for consistent catalog coverage
const QUERIES = [
    "tool",
    "replacement part",
    "organizer",
    "gadget",
    "miniature",
];

// ── Build Basic-Auth header from the API key ─────────────────
function authHeader() {
    const encoded = Buffer.from(`${CULTS3D_API_KEY}:`).toString("base64");
    return `Basic ${encoded}`;
}

// ── GraphQL query — confirmed fields from creationsSearchBatch ─
// Reference: https://gist.github.com/sunny/07db54478ac030bd277c19cfe734648b
const SEARCH_QUERY = `
    query SearchCreations($q: String!, $limit: Int!) {
        creationsSearchBatch(query: $q, limit: $limit) {
            total
            results {
                name(locale: EN)
                shortUrl
                illustrationImageUrl
                publishedAt
                viewsCount
                likesCount
            }
        }
    }
`;

// ── POST one search request to the GraphQL endpoint ──────────
async function fetchCults3D(query) {
    const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type":  "application/json",
            "Authorization": authHeader(),
        },
        body: JSON.stringify({
            query:     SEARCH_QUERY,
            variables: { q: query, limit: PER_PAGE },
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Cults3D API responded ${res.status}: ${body}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
        throw new Error(`GraphQL error: ${json.errors.map(e => e.message).join(", ")}`);
    }
    return json.data.creationsSearchBatch;
}

// ── Map a Cults3D creation to our designs table row ──────────
// shortUrl is a full URL like: https://cults3d.com/en/3d-model/<slug>
// It is unique per creation and used as both external_id and design_url.
function mapToDesign(item) {
    return {
        source_id:     SOURCE_ID,
        external_id:   item.shortUrl,                    // unique; doubles as URL key
        title:         item.name                 || "Untitled",
        description:   null,                             // not returned by batch search
        thumbnail_url: item.illustrationImageUrl || null,
        design_url:    item.shortUrl             || null,
        likes_count:   item.likesCount           ?? 0,
        views_count:   item.viewsCount           ?? 0,
        compat_check:  true,                             // Cults3D is API-backed
        published_at:  item.publishedAt          || null,
    };
}

// ── Main ─────────────────────────────────────────────────────
async function run() {
    if (!CULTS3D_API_KEY) {
        console.error("❌  CULTS3D_API_KEY is not set in .env");
        console.error("    Get a key at https://cults3d.com/en/api");
        process.exit(1);
    }
    if (!process.env.SUPABASE_SERVICE_KEY) {
        console.error("❌  SUPABASE_SERVICE_KEY is not set in .env");
        process.exit(1);
    }

    let totalImported = 0;

    for (const query of QUERIES) {
        console.log(`\n🔍  Searching Cults3D: "${query}"`);

        let data;
        try {
            data = await fetchCults3D(query);
        } catch (err) {
            console.error(`   ❌  Fetch failed: ${err.message}`);
            continue;
        }

        if (!data.results?.length) {
            console.log("   ⚠️   No results returned.");
            continue;
        }

        const rows = data.results.map(mapToDesign);

        // upsert — if (source_id, external_id) already exists, update the row
        const { error } = await supabase
            .from("designs")
            .upsert(rows, { onConflict: "source_id,external_id" });

        if (error) {
            console.error(`   ❌  Supabase upsert error: ${error.message}`);
            continue;
        }

        console.log(`   ✅  ${rows.length} designs upserted (${data.total} total results available)`);
        totalImported += rows.length;
    }

    console.log(`\n✅  Import complete — ${totalImported} designs upserted across ${QUERIES.length} queries.`);
    console.log("    Duplicate Cults3D designs (same shortUrl) were skipped automatically.\n");
}

run().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
