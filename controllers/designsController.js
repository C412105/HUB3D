const supabase = require("../db/supabaseClient");

// ── GET /api/designs ────────────────────────────────────────
// Optional query params: ?source=1&q=keyword
exports.getDesigns = async (req, res) => {
    const { source, q } = req.query;

    let query = supabase.from("designs").select("*");

    // Filter by source if provided
    if (source) query = query.eq("source_id", source);

    // Keyword search on title
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query.limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// ── GET /api/designs/my-setup ───────────────────────────────
// Returns designs where compat_check = TRUE (only supported sources)
// TO DO after MVP: Full printer-level filtering requires additional compatibility mapping tables.
exports.getMySetupDesigns = async (req, res) => {
    const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("compat_check", true)
        .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};