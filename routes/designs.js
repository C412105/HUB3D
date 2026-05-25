const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/designsController");

router.get("/",         ctrl.getDesigns);
router.get("/my-setup", ctrl.getMySetupDesigns);

module.exports = router;