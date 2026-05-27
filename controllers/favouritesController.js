// controllers/favouritesController.js
const supabase = require("../db/supabaseClient");

/**
 * getFavourites — GET /api/favourites
 * Returns all designs saved to the authenticated user's favourites list.
 * Joins favourites → designs so the full design object is returned.
 * @header  {string} x-user-id - Authenticated user's UUID
 * @returns {200} Design[]
 */
exports.getFavourites = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { data, error } = await supabase
        .from("favourites")
        .select("designs(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.designs));
};

/**
 * addFavourite — POST /api/favourites
 * Adds a design to the authenticated user's favourites.
 * Uses upsert to silently ignore duplicates.
 * @header {string} x-user-id - Authenticated user's UUID
 * @body   {number} designId  - design_id to favourite
 * @returns {200} { message: "Added to favourites" }
 */
exports.addFavourite = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { designId } = req.body;
    const { error } = await supabase
        .from("favourites")
        .upsert({ user_id: userId, design_id: designId });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Added to favourites" });
};

/**
 * removeFavourite — DELETE /api/favourites/:designId
 * Removes a specific design from the authenticated user's favourites.
 * @header {string} x-user-id - Authenticated user's UUID
 * @param  {number} designId  - design_id to remove
 * @returns {200} { message: "Removed from favourites" }
 */
exports.removeFavourite = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { designId } = req.params;
    const { error } = await supabase
        .from("favourites")
        .delete()
        .eq("user_id", userId)
        .eq("design_id", designId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Removed from favourites" });
};
