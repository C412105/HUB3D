const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/usersController");

// GET  /api/users/:id       → get profile
// POST /api/users/register  → create account
// POST /api/users/login     → authenticate

router.get("/:id",        controller.getUser);
router.post("/register",  controller.register);
router.post("/login",     controller.login);

module.exports = router;