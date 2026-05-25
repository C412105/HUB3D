const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/equipmentController");

// All available printers/filaments (for the Add collapse)
router.get("/printers",          controller.getAllPrinters);
router.get("/filaments",         controller.getAllFilaments);

// User's own equipment
router.get("/user-printers",     controller.getUserPrinters);
router.post("/user-printers",    controller.addUserPrinters);
router.delete("/user-printers/:printerId", controller.removeUserPrinter);

router.get("/user-filaments",    controller.getUserFilaments);
router.post("/user-filaments",   controller.addUserFilaments);
router.delete("/user-filaments/:filamentId", controller.removeUserFilament);

module.exports = router;