// controllers/feedbackController.js
const supabase = require("../db/supabaseClient");

// POST /api/feedback — anonymous, no auth required
exports.submitFeedback = async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim().length < 5)
        return res.status(400).json({ error: "Message must be at least 5 characters." });

    if (message.trim().length > 1000)
        return res.status(400).json({ error: "Message too long (max 1000 characters)." });

    const { error } = await supabase
        .from("feedback")
        .insert([{ message: message.trim() }]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Feedback received — thank you!" });
};
