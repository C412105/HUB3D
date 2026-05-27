const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/favouritesController");

// Return all designs favourited by the authenticated user (x-user-id header required)
router.get("/",             ctrl.getFavourites);

// Add a design to the authenticated user's favourites
router.post("/",            ctrl.addFavourite);

// Remove a specific design from the authenticated user's favourites
router.delete("/:designId", ctrl.removeFavourite);

module.exports = router;
