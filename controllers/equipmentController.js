const supabase = require("../db/supabaseClient");

// GET all printers from catalog
exports.getAllPrinters = async (req, res) => {
    const { data, error } = await supabase
        .from("printers")
        .select("*")
        .order("brand");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// GET all filaments from catalog
exports.getAllFilaments = async (req, res) => {
    const { data, error } = await supabase
        .from("filaments")
        .select("*")
        .order("type");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// GET printers from logged in user
exports.getUserPrinters = async (req, res) => {
    const userId = req.headers["x-user-id"]; // passed from frontend session
    const { data, error } = await supabase
        .from("user_printers")
        .select("printers(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.printers));
};

// POST add selected printers to user's setup
exports.addUserPrinters = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { printerIds } = req.body; // array of printer_id integers
    const rows = printerIds.map(id => ({ user_id: userId, printer_id: id }));
    const { error } = await supabase.from("user_printers").upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Printers saved" });
};

// DELETE remove one printer from user's setup
exports.removeUserPrinter = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { printerId } = req.params;
    const { error } = await supabase
        .from("user_printers")
        .delete()
        .eq("user_id", userId)
        .eq("printer_id", printerId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Printer removed" });
};

// Mirror the same 3 for filaments:
exports.getUserFilaments = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { data, error } = await supabase
        .from("user_filaments")
        .select("filaments(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.filaments));
};

exports.addUserFilaments = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { filamentIds } = req.body;
    const rows = filamentIds.map(id => ({ user_id: userId, filament_id: id }));
    const { error } = await supabase.from("user_filaments").upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Filaments saved" });
};

exports.removeUserFilament = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { filamentId } = req.params;
    const { error } = await supabase
        .from("user_filaments")
        .delete()
        .eq("user_id", userId)
        .eq("filament_id", filamentId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Filament removed" });
};