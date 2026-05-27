// db/supabaseClient.js — Supabase connection for the Express backend.
//
// WHY the service role key (not the anon key):
//   The anon key enforces Row Level Security (RLS). In a backend context,
//   auth.uid() is always NULL, so RLS would block all user-row reads/writes.
//   The service role key bypasses RLS entirely, giving the backend full access.
//
// PRODUCTION NOTE:
//   In production, replace this with per-user JWT tokens issued by Supabase Auth
//   so RLS policies apply correctly per user. The service role key is intentional
//   for this MVP but must NEVER be exposed to the frontend or committed to a
//   public repository.
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;