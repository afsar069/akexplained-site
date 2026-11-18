// razorpay-webhook — Razorpay seedha yahan batata hai ki payment hua, fail hua ya refund hua.
//
// Kyon: student payment ke beech browser band kar de to pass-checkout ka "verify" nahi chalta.
// Ye webhook tab bhi pass de deta hai (pass_grant do baar chale to bhi ek hi pass).
// Refund: owner Razorpay dashboard se refund kare to "refund.processed" aata hai; poora refund ho
// to order 'refunded' hota hai aur trigger pass ko turant band kar deta hai.
//
// Har request ka X-Razorpay-Signature, poore raw body par RAZORPAY_WEBHOOK_SECRET se jaancha jata hai.
// Galat signature = kuch nahi hota. Secret owner Supabase -> Edge Functions -> Secrets me daalta hai.
// Login token nahi hota (Razorpay bhejta hai), isliye verify_jwt = false.
//
// Events jo Razorpay dashboard -> Webhooks me chalu karne hain:
//   payment.captured, order.paid, payment.failed, refund.processed

import { createClient } from "jsr:@supabase/supabase-js@2";

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function reply(status: number, text: string): Response {
  return new Response(text, { status, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
}

// deno-lint-ignore no-explicit-any
type Any = any;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return reply(405, "Method not allowed");

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || !url || !serviceKey) return reply(503, "Not set up");

  const raw = await req.text();
  const sig = (req.headers.get("x-razorpay-signature") || "").trim().toLowerCase();
  const want = await hmacHex(secret, raw);
  if (!sig || !safeEqual(want, sig)) return reply(400, "Bad signature");

  let ev: Any = {};
  try { ev = JSON.parse(raw); } catch { return reply(400, "Bad body"); }
  const event = String(ev.event || "");
  const payment: Any = ev?.payload?.payment?.entity || null;
  const refund: Any = ev?.payload?.refund?.entity || null;

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Paisa aa gaya: pass do (verify pehle de chuka ho to kuch naya nahi hota).
  if ((event === "payment.captured" || event === "order.paid") && payment) {
    const rzpOrder = String(payment.order_id || "");
    if (!rzpOrder) return reply(200, "No order");
    const ord = await db.from("pass_orders").select("id").eq("rzp_order_id", rzpOrder).maybeSingle();
    if (ord.error) return reply(500, "Read failed");          // Razorpay dobara bhejega
    if (!ord.data) return reply(200, "Not our order");
    const g = await db.rpc("pass_grant", {
      p_order: ord.data.id, p_payment_id: String(payment.id || ""), p_amount_paise: Number(payment.amount),
    });
    if (g.error) return reply(500, "Grant failed");
    if (!(g.data as Any)?.ok) {
      await db.from("pass_orders").update({ note: "Webhook: " + String((g.data as Any)?.error || "not granted") })
        .eq("id", ord.data.id);
    }
    return reply(200, "OK");
  }

  // Payment fail: order 'failed' (sirf jab abhi tak paid nahi hua).
  if (event === "payment.failed" && payment) {
    const rzpOrder = String(payment.order_id || "");
    if (rzpOrder) {
      await db.from("pass_orders").update({ status: "failed" })
        .eq("rzp_order_id", rzpOrder).eq("status", "created");
    }
    return reply(200, "OK");
  }

  // Refund: poora refund ho to order 'refunded' (pass turant band); adhoora ho to sirf note.
  if (event === "refund.processed" && refund) {
    const payId = String(refund.payment_id || "");
    if (!payId) return reply(200, "No payment");
    const ord = await db.from("pass_orders").select("id, amount_paise, status").eq("rzp_payment_id", payId).maybeSingle();
    if (ord.error) return reply(500, "Read failed");
    if (!ord.data) return reply(200, "Not our payment");
    const refunded = Number(refund.amount);
    if (ord.data.status === "paid" && refunded >= ord.data.amount_paise) {
      await db.from("pass_orders").update({ status: "refunded", note: "Refunded in Razorpay." }).eq("id", ord.data.id);
    } else if (ord.data.status === "paid") {
      await db.from("pass_orders").update({ note: "Part refund in Razorpay: " + refunded + " paise." }).eq("id", ord.data.id);
    }
    return reply(200, "OK");
  }

  return reply(200, "Ignored");
});
