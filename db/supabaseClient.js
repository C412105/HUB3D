// Supabase - Express connection
// Use of service role key instead of public one (server queries can bypass RLS).
// Public key NOT used here — auth.uid() is always NULL in backend and would block all user-row reads.
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;