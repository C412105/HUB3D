// controllers/designsController.js
const supabase = require("../db/supabaseClient");

/**
 * getDesigns — GET /api/designs
 * Returns a paginated list of designs with optional filters.
 * Results are ordered by fetched_at descending (newest first).
 * @query {number} [page=1]  - Page number (20 designs per page)
 * @query {number} [source]  - Filter by source_id (1=MMF, 2=Cults3D, 3=Thingiverse, 4=Printables)
 * @query {string} [q]       - Case-insensitive keyword search on the title field
 * @returns {200} { designs: Design[], total: number, page: number, limit: number }
 */
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

/**
 * getMySetupDesigns — GET /api/designs/my-setup
 * Returns a paginated list of designs where compat_check = true (API-backed sources).
 * Supports the same q / source / page params as getDesigns so the frontend can
 * paginate correctly without repeating results across pages.
 * NOTE: Full per-printer filtering requires a design↔equipment mapping table —
 *       this is deferred to the post-MVP React phase.
 * @query {number} [page=1]  - Page number (20 designs per page)
 * @query {string} [q]       - Case-insensitive keyword search on the title field
 * @query {number} [source]  - Filter by source_id
 * @returns {200} { designs: Design[], total: number, page: number, limit: number }
 */
exports.getMySetupDesigns = async (req, res) => {
    const { q, source, page = 1 } = req.query;
    const limit  = 20;
    const offset = (parseInt(page) - 1) * limit;

    let query = supabase
        .from("designs")
        .select("*", { count: "exact" })
        .eq("compat_check", true)
        .order("fetched_at", { ascending: false });

    if (source) query = query.eq("source_id", parseInt(source));
    if (q)      query = query.ilike("title", `%${q}%`);

    const { data, count, error } = await query.range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ designs: data, total: count, page: parseInt(page), limit });
};
