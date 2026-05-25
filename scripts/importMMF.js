// scripts/importMMF.js
// ─────────────────────────────────────────────────────────────
// Fetches designs from the MyMiniFactory API and upserts them
// into the Supabase `designs` table (source_id = 1).
//
// Usage:
//   node scripts/importMMF.js
//   npm run import-mmf
//
// Requires MMF_API_KEY in .env
// Docs: https://www.myminifactory.com/api-doc/index.html
// ─────────────────────────────────────────────────────────────

require("dotenv").config();

// Use the service role key so this script can bypass RLS and write to `designs`.
// The anon key (used by the Express app) is read-only on catalog tables by design.
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY   // ← bypasses RLS; never expose in frontend
);

const MMF_API_KEY = process.env.MMF_API_KEY;
const MMF_BASE    = "https://www.myminifactory.com/api/v2";
const PER_PAGE    = 20;    // max per request on the free tier
const SOURCE_ID   = 1;     // MyMiniFactory row in design_sources (seeded as id=1)

// Search queries — adjust or extend to pull more categories
const QUERIES = [
    "tool",
    "replacement part",
    "organizer",
    "gadget",
    "miniature",
];

// ── Fetch one page of results from MMF /search ───────────────
async function fetchMMF(query, page = 1) {
    const url =
        `${MMF_BASE}/search` +
        `?q=${encodeURIComponent(query)}` +
        `&per_page=${PER_PAGE}` +
        `&page=${page}` +
        `&key=${MMF_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`MMF API responded ${res.status}: ${body}`);
    }
    return res.json();
}

// ── Map an MMF Object to our designs table row ───────────────
// Field reference from api-v2.yaml Object definition:
//   id, name, description, url, likes, views, published_at,
//   images[].thumbnail.url
function mapToDesign(item) {
    return {
        source_id:     SOURCE_ID,
        external_id:   String(item.id),
        title:         item.name                            || "Untitled",
        description:   item.description                     || null,
        thumbnail_url: item.images?.[0]?.thumbnail?.url    || null,
        design_url:    item.url                             || null,
        likes_count:   item.likes                           ?? 0,
        views_count:   item.views                           ?? 0,
        compat_check:  true,   // MMF supports API → eligible for "My Setup" filter
        published_at:  item.published_at                    || null,
    };
}

// ── Main ─────────────────────────────────────────────────────
async function run() {
    if (!MMF_API_KEY) {
        console.error("❌  MMF_API_KEY is not set in .env");
        console.error("    Get a key at https://www.myminifactory.com/user/register");
        process.exit(1);
    }
    if (!process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY === "your_service_role_key_here") {
        console.error("❌  SUPABASE_SERVICE_KEY is not set in .env");
        console.error("    Find it in: Supabase dashboard → Project Settings → API → service_role");
        process.exit(1);
    }

    let totalImported = 0;

    for (const query of QUERIES) {
        console.log(`\n🔍  Searching MMF: "${query}"`);

        let data;
        try {
            data = await fetchMMF(query);
        } catch (err) {
            console.error(`   ❌  Fetch failed: ${err.message}`);
            continue;
        }

        if (!data.items?.length) {
            console.log("   ⚠️   No results returned.");
            continue;
        }

        const rows = data.items.map(mapToDesign);

        // upsert — if (source_id, external_id) already exists, update the row
        const { error } = await supabase
            .from("designs")
            .upsert(rows, { onConflict: "source_id,external_id" });

        if (error) {
            console.error(`   ❌  Supabase upsert error: ${error.message}`);
            continue;
        }

        console.log(`   ✅  ${rows.length} designs upserted`);
        totalImported += rows.length;
    }

    console.log(`\n✅  Import complete — ${totalImported} designs upserted across ${QUERIES.length} queries.`);
    console.log("    Duplicate real-world designs (same MMF id) were skipped automatically.\n");
}

run().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
