// routes/feedback.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/feedbackController");

// POST /api/feedback
router.post("/", ctrl.submitFeedback);

module.exports = router;
