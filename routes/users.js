const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/usersController");

// Register a new user account
router.post("/register", controller.register);

// Authenticate and return session data (userId, username, joinedAt)
router.post("/login",    controller.login);

// Terminate the server-side Supabase Auth session
router.post("/logout",   controller.logout);

module.exports = router;
