// delete-account — student apna account khud delete kare (My Account page).
//
// Kaise chalta hai:
//  1. Browser student ka login token (Authorization: Bearer ...) bhejta hai, body me {"confirm":"DELETE"}.
//  2. Yahan token Supabase se verify hota hai (getUser). Bina valid token ke kuch nahi hota.
//  3. Sirf USI token wale user ka auth.users row delete hota hai (kisi aur ka id kabhi input se nahi aata).
//  4. profiles, attempts, quiz_runs, reading_progress, user_exams, notify_requests aur reviews
//     sab `on delete cascade` se apne-aap hat jaate hain (migrations dekho).
//
// Secret key (service role) Supabase khud is function ko deta hai (SUPABASE_SERVICE_ROLE_KEY).
// Wo repo me kahin nahi hai aur browser tak kabhi nahi pahunchti.
//
// verify_jwt = false isliye hai ki token ki jaanch upar step 2 me function khud karta hai
// (gateway wali jaanch naye signing keys ke saath bharosemand nahi hoti).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://akexplained.com"];

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);

  // Body: confirm word must be exactly DELETE.
  let body: { confirm?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  if (body.confirm !== "DELETE") return json({ error: "Confirmation missing." }, 400, origin);

  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return json({ error: "Please log in first." }, 401, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server is not set up." }, 500, origin);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return json({ error: "Please log in again." }, 401, origin);

  // Hard delete (shouldSoftDelete = false): row hat jaati hai, cascade baaki sab saaf karta hai.
  const del = await admin.auth.admin.deleteUser(data.user.id, false);
  if (del.error) return json({ error: "Could not delete the account. Please try again." }, 500, origin);

  return json({ ok: true }, 200, origin);
});
