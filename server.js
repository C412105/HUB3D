/**
 * server.js — HUB3D Express entry point
 *
 * Middleware stack (applied in order):
 *   cors()           — allows cross-origin requests from the frontend dev server
 *   express.json()   — parses incoming JSON request bodies
 *   express.static() — serves HTML / CSS / JS directly from /public
 *
 * Route groups mounted:
 *   /api/users       → registration, login, logout          (routes/users.js)
 *   /api/designs     → paginated catalog + my-setup filter  (routes/designs.js)
 *   /api/equipment   → printer/filament catalog + user CRUD (routes/equipment.js)
 *   /api/favourites  → per-user favourites CRUD             (routes/favourites.js)
 *   /api/feedback    → anonymous feedback submissions        (routes/feedback.js)
 *
 * Static files are served from the /public directory.
 * Root path (/) redirects to homeHUB3Dv0.html.
 */

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
app.use("/api/feedback",  require("./routes/feedback"));

// ── Start ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ HUB3D server running at http://localhost:${PORT}`)
);
