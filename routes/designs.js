const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/designsController");

// Return paginated designs with optional ?q=, ?source=, ?page= query filters
router.get("/",         ctrl.getDesigns);

// Return designs where compat_check = true (API-supported sources only)
router.get("/my-setup", ctrl.getMySetupDesigns);

module.exports = router;
