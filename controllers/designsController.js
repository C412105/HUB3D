const supabase = require("../db/supabaseClient");

// ── GET /api/designs ────────────────────────────────────────
// Optional query params: ?source=1&q=keyword&page=1
exports.getDesigns = async (req, res) => {
    const { source, q, page = 1 } = req.query;
    const limit  = 20;
    const offset = (parseInt(page) - 1) * limit;

    let query = supabase
        .from("designs")
        .select("*", { count: "exact" })
        .order("fetched_at", { ascending: false });

    if (source) query = query.eq("source_id", parseInt(source));
    if (q)      query = query.ilike("title", `%${q}%`);

    const { data, count, error } = await query.range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ designs: data, total: count, page: parseInt(page), limit });
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