const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/favouritesController");

router.get("/",          ctrl.getFavourites);
router.post("/",         ctrl.addFavourite);
router.delete("/:designId", ctrl.removeFavourite);

module.exports = router;