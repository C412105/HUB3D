const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/feedbackController");

// Submit an anonymous feedback message (no auth required)
router.post("/", ctrl.submitFeedback);

module.exports = router;
