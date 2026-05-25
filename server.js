// Express entry point
const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors());                        // allow frontend calls
app.use(express.json());                // parse JSON request bodies
app.use(express.static("public"));      // serve HTML/CSS/JS files

// Redirect root → homepage
app.get("/", (req, res) => {
  res.redirect("/homeHUB3Dv0.html");
});

// ── Routes ─────────────────────────────────────────
app.use("/api/users",     require("./routes/users"));
app.use("/api/designs",   require("./routes/designs"));
app.use("/api/equipment", require("./routes/equipment"));
app.use("/api/favourites",require("./routes/favourites"));

// ── Start ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ HUB3D server running at http://localhost:${PORT}`)
);

// POST /api/feedback — anonymous, no auth required
app.post("/api/feedback", async (req, res) => {
    const { message } = req.body;
    if (!message || message.trim().length < 5)
        return res.status(400).json({ error: "Message too short" });
    const { error } = await supabase.from("feedback").insert([{ message }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Feedback received, thank you!" });
});