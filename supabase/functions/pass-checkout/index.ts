// pass-checkout — All Access pass khareedne ka server wala hissa (owner, 2026-11-18).
//
// Browser se teen kaam aate hain (POST, body {action, ...}, student ka login token Authorization me):
//   quote   {plan, units, code}  -> price ka hisaab (promo ke saath). Kuch save nahi hota.
//   order   {plan, units, code}  -> pass_orders me order banta hai. Rakam 0 ho (100% promo) to pass
//                                    seedha mil jata hai; warna Razorpay order banta hai aur Checkout
//                                    kholne ke liye {key_id, rzp_order_id, amount} wapas jata hai.
//   verify  {rzp_order_id, rzp_payment_id, rzp_signature}
//                                 -> Razorpay ka signature yahan secret se jaancha jata hai, payment
//                                    Razorpay se dobara padha jata hai (authorized ho to capture), phir
//                                    pass_grant pass deta hai. Do baar chale to bhi ek hi pass.
//
// Price HAMESHA database (pass_quote) banata hai; browser ka bheja koi amount kabhi nahi mana jata.
// Secrets (Supabase -> Edge Functions -> Secrets me owner khud daalta hai, repo me kabhi nahi):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET   (Test Mode ki keys pehle, live baad me)
// SUPABASE_URL aur SUPABASE_SERVICE_ROLE_KEY Supabase khud deta hai.
// verify_jwt = false: token ki jaanch function khud karta hai (delete-account jaisa).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://akexplained.com"];
const RZP_API = "https://api.razorpay.com/v1";

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

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Dono string ki lambai barabar ho to har akshar dekho (timing se kuch na khule).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function rzpAuth(keyId: string, keySecret: string): string {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

async function rzp(method: string, path: string, auth: string, body?: unknown) {
  const res = await fetch(RZP_API + path, {
    method,
    headers: { "Authorization": auth, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* empty */ }
  return { ok: res.ok, status: res.status, data };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const action = str(body.action);

  const authz = req.headers.get("authorization") || "";
  const token = authz.toLowerCase().startsWith("bearer ") ? authz.slice(7).trim() : "";
  if (!token) return json({ error: "Please log in first." }, 401, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const keyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
  if (!url || !serviceKey) return json({ error: "Payments are not set up yet." }, 503, origin);

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const who = await db.auth.getUser(token);
  if (who.error || !who.data?.user) return json({ error: "Please log in again." }, 401, origin);
  const userId = who.data.user.id;

  const plan = str(body.plan) || "all-access";
  const units = Number.isInteger(body.units) ? body.units as number : parseInt(String(body.units), 10);
  const code = str(body.code).toUpperCase().slice(0, 30);

  // ---- quote: sirf hisaab -------------------------------------------------
  if (action === "quote") {
    const q = await db.rpc("pass_quote", { p_user: userId, p_plan: plan, p_units: units, p_code: code });
    if (q.error) return json({ error: "Could not work out the price. Please try again." }, 500, origin);
    return json(q.data, 200, origin);
  }

  // ---- order: order banao, zarurat ho to Razorpay order bhi -------------------
  if (action === "order") {
    const o = await db.rpc("pass_create_order", { p_user: userId, p_plan: plan, p_units: units, p_code: code });
    if (o.error) return json({ error: "Could not start the payment. Please try again." }, 500, origin);
    const quote = o.data as Record<string, unknown>;
    if (!quote || quote.ok !== true) return json(quote || { ok: false, error: "Could not start the payment." }, 200, origin);
    const orderId = String(quote.order_id);
    const amount = Number(quote.amount_paise);

    // 100% promo: Razorpay ki zarurat nahi, pass abhi.
    if (amount === 0) {
      const g = await db.rpc("pass_grant", { p_order: orderId, p_payment_id: null, p_amount_paise: 0 });
      if (g.error || !(g.data as Record<string, unknown>)?.ok) {
        return json({ ok: false, error: "Could not give the pass. Please contact us." }, 500, origin);
      }
      return json({ ok: true, granted: true, ...(g.data as Record<string, unknown>) }, 200, origin);
    }

    if (!keyId || !keySecret) return json({ ok: false, error: "Payments are not set up yet." }, 503, origin);
    const r = await rzp("POST", "/orders", rzpAuth(keyId, keySecret), {
      amount, currency: "INR", receipt: orderId, notes: { order_id: orderId, plan, units: String(units) },
    });
    const rzpId = str(r.data.id);
    if (!r.ok || !rzpId) {
      await db.from("pass_orders").update({ status: "failed", note: "Razorpay order was not created." }).eq("id", orderId);
      return json({ ok: false, error: "The payment service did not answer. Please try again." }, 502, origin);
    }
    await db.from("pass_orders").update({ rzp_order_id: rzpId }).eq("id", orderId);
    return json({
      ok: true, granted: false, key_id: keyId, rzp_order_id: rzpId, amount, currency: "INR",
      title: quote.title, units: quote.units, days: quote.days,
    }, 200, origin);
  }

  // ---- verify: payment ke baad -------------------------------------------------
  if (action === "verify") {
    const rzpOrder = str(body.rzp_order_id);
    const rzpPay = str(body.rzp_payment_id);
    const sig = str(body.rzp_signature);
    if (!rzpOrder || !rzpPay || !sig) return json({ ok: false, error: "Payment details are missing." }, 400, origin);
    if (!keyId || !keySecret) return json({ ok: false, error: "Payments are not set up yet." }, 503, origin);

    const want = await hmacHex(keySecret, rzpOrder + "|" + rzpPay);
    if (!safeEqual(want, sig.toLowerCase())) {
      return json({ ok: false, error: "This payment could not be confirmed." }, 400, origin);
    }

    const ord = await db.from("pass_orders").select("id, user_id, amount_paise, status")
      .eq("rzp_order_id", rzpOrder).maybeSingle();
    if (ord.error || !ord.data || ord.data.user_id !== userId) {
      return json({ ok: false, error: "This payment is not for your account." }, 400, origin);
    }

    // Razorpay se payment khud padho: paisa sach me aaya? (authorized ho to capture karo.)
    const auth = rzpAuth(keyId, keySecret);
    const p = await rzp("GET", "/payments/" + encodeURIComponent(rzpPay), auth);
    if (!p.ok || str(p.data.order_id) !== rzpOrder) {
      return json({ ok: false, error: "This payment could not be confirmed." }, 400, origin);
    }
    let status = str(p.data.status);
    const paid = Number(p.data.amount);
    if (status === "authorized") {
      const c = await rzp("POST", "/payments/" + encodeURIComponent(rzpPay) + "/capture", auth,
        { amount: paid, currency: "INR" });
      if (c.ok) status = str(c.data.status) || "captured";
    }
    if (status !== "captured") {
      return json({ ok: false, error: "The payment is not complete yet. If money was taken, it will be returned." }, 400, origin);
    }

    const g = await db.rpc("pass_grant", { p_order: ord.data.id, p_payment_id: rzpPay, p_amount_paise: paid });
    const gd = g.data as Record<string, unknown> | null;
    if (g.error || !gd?.ok) {
      return json({ ok: false, error: (gd && gd.error) || "Could not give the pass. Please contact us." }, 500, origin);
    }
    return json({ ok: true, ...gd }, 200, origin);
  }

  return json({ error: "Unknown action." }, 400, origin);
});
