// controllers/feedbackController.js
const supabase = require("../db/supabaseClient");

/**
 * submitFeedback — POST /api/feedback
 * Saves an anonymous feedback message to the `feedback` table.
 * No authentication required — no user data is attached to the submission.
 * Server-side length validation mirrors the client-side cooldown guard.
 * @body   {string} message - Feedback text, 5–1000 characters
 * @returns {200} { message: "Feedback received — thank you!" }
 */
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
