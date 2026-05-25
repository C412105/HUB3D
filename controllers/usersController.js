// controllers/usersController.js
const supabase = require("../db/supabaseClient");

// ── POST /api/users/register ────────────────────────────────
exports.register = async (req, res) => {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password)
        return res.status(400).json({ error: "All fields are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        return res.status(400).json({ error: "Invalid email format" });

    if (password.length < 8)
        return res.status(400).json({ error: "Password must be at least 8 characters" });

    // Step 1: create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) return res.status(500).json({ error: authError.message });

    // Step 2: insert into profiles table using the Auth-generated user_id
    const { data, error } = await supabase
        .from("profiles")
        .insert([{ user_id: authData.user.id, username }])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({
        message: "User created",
        user: { id: authData.user.id, username }
    });
};

// ── POST /api/users/login ───────────────────────────────────
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) return res.status(401).json({ error: "Invalid credentials" });

    // Fetch username from profiles
    const { data: profile } = await supabase
        .from("profiles")
        .select("username, created_at")
        .eq("user_id", data.user.id)
        .single();

    res.json({
        message: "Login successful",
        userId: data.user.id,
        username: profile?.username,
        joinedAt: profile?.created_at
    });
};

// ── POST /api/users/logout ──────────────────────────────────
exports.logout = async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Logged out" });
};