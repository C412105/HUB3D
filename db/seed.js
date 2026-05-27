// db/seed.js — Run once to guarantee baseline data in Supabase.
//
// Guarantees:
//   • design_sources rows 1–4 (MyMiniFactory, Cults3D, Thingiverse, Printables)
//   • 15 sample designs spread across all 4 sources
//   • Mix of compat_check = true  (source_id 1-2, API-backed)
//            and compat_check = false (source_id 3-4, static catalog)
//
// Usage:
//   node db/seed.js
//   npm run seed   (add "seed": "node db/seed.js" to package.json scripts)
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.
// Uses the service role key so it bypasses RLS and can write to catalog tables.

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ── design_sources (idempotent — safe to re-run) ──────────────────────────
const SOURCES = [
    { source_id: 1, name: "MyMiniFactory", base_url: "https://www.myminifactory.com" },
    { source_id: 2, name: "Cults3D",       base_url: "https://cults3d.com" },
    { source_id: 3, name: "Thingiverse",   base_url: "https://www.thingiverse.com" },
    { source_id: 4, name: "Printables",    base_url: "https://www.printables.com" },
];

// ── Sample designs — external_id uses a "seed-" prefix to avoid clashing
//    with real MMF integer IDs imported via scripts/importMMF.js ───────────
const DESIGNS = [
    // MyMiniFactory — compat_check: true (API supported)
    {
        source_id: 1, external_id: "seed-mmf-01",
        title: "3DBenchy",
        description: "The 3D Printing Torture Test — a classic benchmark boat.",
        thumbnail_url: null,
        design_url: "https://www.myminifactory.com/object/3d-print-3d-benchy",
        compat_check: true, likes_count: 10000, views_count: 50000,
    },
    {
        source_id: 1, external_id: "seed-mmf-02",
        title: "Adjustable Phone Stand",
        description: "Tilting stand for smartphones and small tablets.",
        thumbnail_url: null,
        design_url: "https://www.myminifactory.com/object/3d-print-1",
        compat_check: true, likes_count: 450, views_count: 9800,
    },
    {
        source_id: 1, external_id: "seed-mmf-03",
        title: "Cable Organiser Clip",
        description: "Reusable desk cable clips in three sizes.",
        thumbnail_url: null,
        design_url: "https://www.myminifactory.com/object/3d-print-2",
        compat_check: true, likes_count: 320, views_count: 7600,
    },
    {
        source_id: 1, external_id: "seed-mmf-04",
        title: "Miniature Dice Tower",
        description: "Foldable dice tower for tabletop gaming — prints in 3 parts.",
        thumbnail_url: null,
        design_url: "https://www.myminifactory.com/object/3d-print-3",
        compat_check: true, likes_count: 280, views_count: 6100,
    },

    // Cults3D — compat_check: true (API supported)
    {
        source_id: 2, external_id: "seed-cults-01",
        title: "Wall Key Hook",
        description: "Minimal wall-mounted key organiser — no screws visible.",
        thumbnail_url: null,
        design_url: "https://cults3d.com/en/3d-model/home/wall-key-hook",
        compat_check: true, likes_count: 190, views_count: 5400,
    },
    {
        source_id: 2, external_id: "seed-cults-02",
        title: "Under-Desk Headphone Hanger",
        description: "Mounts under any desk, fits all over-ear headphones.",
        thumbnail_url: null,
        design_url: "https://cults3d.com/en/3d-model/tool/headphone-hanger",
        compat_check: true, likes_count: 410, views_count: 11200,
    },
    {
        source_id: 2, external_id: "seed-cults-03",
        title: "Geometric Planter Pot",
        description: "Modern geometric planter for small succulents and cacti.",
        thumbnail_url: null,
        design_url: "https://cults3d.com/en/3d-model/home/geometric-planter",
        compat_check: true, likes_count: 560, views_count: 14300,
    },
    {
        source_id: 2, external_id: "seed-cults-04",
        title: "Vase Mode Spiral Vase",
        description: "Tall spiral vase — print in vase mode for best results.",
        thumbnail_url: null,
        design_url: "https://cults3d.com/en/3d-model/home/spiral-vase",
        compat_check: true, likes_count: 340, views_count: 8900,
    },

    // Thingiverse — compat_check: false (static catalog)
    {
        source_id: 3, external_id: "seed-thv-01",
        title: "Raspberry Pi 4 Case",
        description: "Vented enclosure for Raspberry Pi 4 Model B with camera slot.",
        thumbnail_url: null,
        design_url: "https://www.thingiverse.com/thing:4764034",
        compat_check: false, likes_count: 870, views_count: 23000,
    },
    {
        source_id: 3, external_id: "seed-thv-02",
        title: "Wall-Mount Filament Spool Holder",
        description: "Holds 1 kg spools, wall-mountable with standard M4 screws.",
        thumbnail_url: null,
        design_url: "https://www.thingiverse.com/thing:2047566",
        compat_check: false, likes_count: 1200, views_count: 45000,
    },
    {
        source_id: 3, external_id: "seed-thv-03",
        title: "Print-in-Place Articulated Fish",
        description: "Fully articulated fish — no assembly required.",
        thumbnail_url: null,
        design_url: "https://www.thingiverse.com/thing:3654335",
        compat_check: false, likes_count: 2300, views_count: 88000,
    },
    {
        source_id: 3, external_id: "seed-thv-04",
        title: "Hex Storage Bins",
        description: "Modular interlocking hexagonal bins for workshop organisation.",
        thumbnail_url: null,
        design_url: "https://www.thingiverse.com/thing:1811354",
        compat_check: false, likes_count: 990, views_count: 32000,
    },

    // Printables — compat_check: false (static catalog)
    {
        source_id: 4, external_id: "seed-prt-01",
        title: "Voronoi Vase",
        description: "Elegant vase with voronoi cut-out pattern — print in vase mode.",
        thumbnail_url: null,
        design_url: "https://www.printables.com/model/1234-voronoi-vase",
        compat_check: false, likes_count: 730, views_count: 18500,
    },
    {
        source_id: 4, external_id: "seed-prt-02",
        title: "Screw Organiser Tray",
        description: "Stackable tray with labelled slots for M2–M8 fasteners.",
        thumbnail_url: null,
        design_url: "https://www.printables.com/model/5678-screw-organiser",
        compat_check: false, likes_count: 480, views_count: 12000,
    },
    {
        source_id: 4, external_id: "seed-prt-03",
        title: "Flexi Rex Dinosaur",
        description: "Print-in-place articulated T-Rex — great benchmark for layer adhesion.",
        thumbnail_url: null,
        design_url: "https://www.printables.com/model/3456-flexi-rex",
        compat_check: false, likes_count: 1800, views_count: 62000,
    },
];

// ── Run ───────────────────────────────────────────────────────────────────
async function run() {
    if (!process.env.SUPABASE_SERVICE_KEY) {
        console.error("❌  SUPABASE_SERVICE_KEY not set in .env");
        process.exit(1);
    }

    // Seed design_sources
    console.log("🌱  Seeding design_sources...");
    const { error: srcErr } = await supabase
        .from("design_sources")
        .upsert(SOURCES, { onConflict: "source_id" });
    if (srcErr) { console.error("❌  design_sources:", srcErr.message); process.exit(1); }
    console.log(`   ✅  ${SOURCES.length} sources upserted`);

    // Seed designs
    console.log("🌱  Seeding designs...");
    const { error: dsnErr } = await supabase
        .from("designs")
        .upsert(DESIGNS, { onConflict: "source_id,external_id" });
    if (dsnErr) { console.error("❌  designs:", dsnErr.message); process.exit(1); }
    console.log(`   ✅  ${DESIGNS.length} designs upserted`);

    // Summary
    const compat = DESIGNS.filter(d => d.compat_check).length;
    console.log(`\n✅  Seed complete.`);
    console.log(`    ${compat} designs with compat_check = true  (MMF + Cults3D)`);
    console.log(`    ${DESIGNS.length - compat} designs with compat_check = false (Thingiverse + Printables)\n`);
}

run().catch(err => { console.error("Unhandled error:", err); process.exit(1); });
