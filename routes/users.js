const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/usersController");

// POST /api/users/register  → create account
// POST /api/users/login     → authenticate

router.post("/register",  controller.register);
router.post("/login",     controller.login);

module.exports = router;