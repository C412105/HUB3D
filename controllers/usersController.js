const supabase = require("../db/supabaseClient");

// ── GET /api/users/:id (get profile) ──────────────────────────────
exports.getUser = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("user_id, username, created_at")
    .eq("user_id", id)
    .single();

  if (error) return res.status(404).json({ error: "User not found" });
  res.json(data);
};

// ── POST /api/users/register (create account) ────────────────────────
exports.register = async (req, res) => {
  const { email, username, password } = req.body;

  // Basic validation
  if (!email || !username || !password)
    return res.status(400).json({ error: "All fields are required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email format" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  // TO DO: Use Supabase Auth when deployed.
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, username }])  // Storing passwords for MVP
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "User created", user: data });
};

// ── POST /api/users/login (authenticate) ───────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  // Supabase Auth sign-in (automatic password hashing)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ message: "Login successful", session: data.session });
};