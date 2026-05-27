const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/equipmentController");

// ── Catalog routes (no auth required) ──────────────────────────────────────
// Return the full printer catalog (used to populate the Add Printer collapse)
router.get("/printers",                          controller.getAllPrinters);

// Return the full filament catalog (used to populate the Add Filament collapse)
router.get("/filaments",                         controller.getAllFilaments);

// ── User equipment routes (require x-user-id header) ───────────────────────
// Return printers saved to the authenticated user's setup
router.get("/user-printers",                     controller.getUserPrinters);

// Save an array of selected printer IDs to the authenticated user's setup
router.post("/user-printers",                    controller.addUserPrinters);

// Remove one printer from the authenticated user's setup
router.delete("/user-printers/:printerId",       controller.removeUserPrinter);

// Return filaments saved to the authenticated user's setup
router.get("/user-filaments",                    controller.getUserFilaments);

// Save an array of selected filament IDs to the authenticated user's setup
router.post("/user-filaments",                   controller.addUserFilaments);

// Remove one filament from the authenticated user's setup
router.delete("/user-filaments/:filamentId",     controller.removeUserFilament);

module.exports = router;
