const supabase = require("../db/supabaseClient");

exports.getFavourites = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { data, error } = await supabase
        .from("favourites")
        .select("designs(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.designs));
};

exports.addFavourite = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { designId } = req.body;
    const { error } = await supabase
        .from("favourites")
        .upsert({ user_id: userId, design_id: designId });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Added to favourites" });
};

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