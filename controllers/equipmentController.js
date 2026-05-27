// controllers/equipmentController.js
const supabase = require("../db/supabaseClient");

/**
 * getAllPrinters — GET /api/equipment/printers
 * Returns the full printer catalog ordered by brand name.
 * Used to populate the "Add Printer" checkbox panel on the Profile page.
 * @returns {200} Printer[]
 */
exports.getAllPrinters = async (req, res) => {
    const { data, error } = await supabase
        .from("printers")
        .select("*")
        .order("brand");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

/**
 * getAllFilaments — GET /api/equipment/filaments
 * Returns the full filament catalog ordered by type name.
 * Used to populate the "Add Filament" checkbox panel on the Profile page.
 * @returns {200} Filament[]
 */
exports.getAllFilaments = async (req, res) => {
    const { data, error } = await supabase
        .from("filaments")
        .select("*")
        .order("type");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

/**
 * getUserPrinters — GET /api/equipment/user-printers
 * Returns all printers saved to the authenticated user's setup.
 * Reads user_id from the x-user-id request header (set by the frontend from sessionStorage).
 * @header {string} x-user-id - Authenticated user's UUID
 * @returns {200} Printer[] (joined from user_printers → printers)
 */
exports.getUserPrinters = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { data, error } = await supabase
        .from("user_printers")
        .select("printers(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.printers));
};

/**
 * addUserPrinters — POST /api/equipment/user-printers
 * Upserts an array of printer IDs into the authenticated user's setup.
 * Uses upsert to avoid duplicate rows if the printer was already added.
 * @header {string}   x-user-id   - Authenticated user's UUID
 * @body   {number[]} printerIds  - Array of printer_id integers to save
 * @returns {200} { message: "Printers saved" }
 */
exports.addUserPrinters = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { printerIds } = req.body;
    const rows = printerIds.map(id => ({ user_id: userId, printer_id: id }));
    const { error } = await supabase.from("user_printers").upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Printers saved" });
};

/**
 * removeUserPrinter — DELETE /api/equipment/user-printers/:printerId
 * Removes a single printer from the authenticated user's setup.
 * @header {string} x-user-id  - Authenticated user's UUID
 * @param  {number} printerId  - printer_id to remove
 * @returns {200} { message: "Printer removed" }
 */
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

/**
 * getUserFilaments — GET /api/equipment/user-filaments
 * Returns all filaments saved to the authenticated user's setup.
 * @header {string} x-user-id - Authenticated user's UUID
 * @returns {200} Filament[] (joined from user_filaments → filaments)
 */
exports.getUserFilaments = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { data, error } = await supabase
        .from("user_filaments")
        .select("filaments(*)")
        .eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.filaments));
};

/**
 * addUserFilaments — POST /api/equipment/user-filaments
 * Upserts an array of filament IDs into the authenticated user's setup.
 * @header {string}   x-user-id   - Authenticated user's UUID
 * @body   {number[]} filamentIds - Array of filament_id integers to save
 * @returns {200} { message: "Filaments saved" }
 */
exports.addUserFilaments = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { filamentIds } = req.body;
    const rows = filamentIds.map(id => ({ user_id: userId, filament_id: id }));
    const { error } = await supabase.from("user_filaments").upsert(rows);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Filaments saved" });
};

/**
 * removeUserFilament — DELETE /api/equipment/user-filaments/:filamentId
 * Removes a single filament from the authenticated user's setup.
 * @header {string} x-user-id  - Authenticated user's UUID
 * @param  {number} filamentId - filament_id to remove
 * @returns {200} { message: "Filament removed" }
 */
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
