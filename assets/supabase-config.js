/* ==========================================================
   AK Explained — Supabase connection details
   ----------------------------------------------------------
   The publishable key is MEANT to be public: it ships to the
   browser, exactly like the old anon key did. Row Level
   Security on the database is what protects the data, not the
   secrecy of this key.

   NEVER put the secret key (sb_secret_...) in this file.

   These two values are filled in by the owner (or by Claude
   once the owner confirms this location). Until then the auth
   features stay switched off and the site works as before.
   ========================================================== */
window.AK_SUPABASE = {
  url: "__SUPABASE_URL__",                      // e.g. https://xxxxxxxx.supabase.co
  publishableKey: "__SUPABASE_PUBLISHABLE_KEY__" // starts with sb_publishable_
};
