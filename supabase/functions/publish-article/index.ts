// publish-article — admin ke browser se ek article (.md) site ke repo me likhne wala hissa
// (owner, 2026-11-26: "admin page par jo article publish kar de").
//
// Kaam ek hi hai: /admin/upload-article/ se aaya markdown file repo ke notes/<slug>/index.md
// par likh dena. Cloudflare Pages `main` ko dekhta hai, isliye likhne ke 2-3 minute baad
// article asli static page ban kar live ho jata hai — poora design, Google ke liye indexable.
// (MCQ paper database se turant khulta hai; article ko rebuild chahiye, kyunki Google ko
// asli HTML page chahiye. CLAUDE.md rule 24.)
//
// Browser se POST aata hai, body {folder, slug, content, replace}, admin ka login token
// Authorization me. Asli jaanch YAHAN hoti hai (browser ka code bypass ho sakta hai):
//   1. token valid hai? (getUser)
//   2. us login ka row public.paper_admins me hai? (rule 16 ki wahi ek allow list)
//   3. folder sirf "" ya "ages" — kahin aur nahi likha ja sakta
//   4. slug ka roop saaf (chhote akshar, hyphen), reserved naam nahi
//   5. front matter hai, usme title aur description hain, body khali nahi
//   6. file 400 KB se kam, koi <script> nahi
// In sab ke baad hi GitHub par likha jata hai, aur sirf notes/ ke andar .md — kahin aur nahi.
//
// Secret (Supabase -> Edge Functions -> Secrets me owner khud daalta hai, repo me kabhi nahi):
//   ARTICLE_REPO_TOKEN   = GitHub fine-grained token, sirf isi repo par, Contents: read & write
// SUPABASE_URL aur SUPABASE_SERVICE_ROLE_KEY Supabase khud deta hai.
// verify_jwt = false: token ki jaanch function khud karta hai (delete-account, pass-checkout jaisa).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://akexplained.com"];

// Kahan likhna hai. Ye code me hai, secret me nahi — isme chhupane jaisa kuch nahi.
const REPO = "afsar069/akexplained-site";
const BRANCH = "main";
const GITHUB_API = "https://api.github.com";
// GitHub ko User-Agent chahiye. Isme owner ka naam ya email kabhi nahi (privacy).
const USER_AGENT = "akexplained-article-publisher";

const MAX_BYTES = 400 * 1024;
const FOLDERS = ["", "ages"];
// Ye naam folder ke naam ban kar site ke doosre pages se takra sakte hain.
const RESERVED = ["index", "ages", "assets", "admin", "notes"];

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

// UTF-8 text ko base64 me (GitHub Contents API base64 hi leta hai).
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function slugOk(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
}

/* Front matter ki jaanch. Poora YAML parse nahi karte — sirf itna dekhte hain ki
   block maujood hai aur usme title aur description likhe hain, aur neeche body hai.
   Baaki sab Eleventy padhta hai; galat YAML se build rukega, site purani bani rahegi. */
function checkArticle(content: string): string | null {
  if (!content.trim()) return "The file is empty.";
  if (!content.startsWith("---")) {
    return "This file does not start with an article heading block (the three dashes and then title, description and so on).";
  }
  const end = content.indexOf("\n---", 3);
  if (end === -1) return "The heading block at the top is not closed with a line of three dashes.";
  const front = content.slice(3, end);
  const body = content.slice(end + 4);

  const field = (name: string): string => {
    const m = front.match(new RegExp("^" + name + ":[ \\t]*(.*)$", "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
  };
  if (!field("title")) return "The heading block has no title.";
  if (!field("description")) {
    return "The heading block has no description. Google shows this line under the heading, so an article needs one.";
  }
  if (!body.trim()) return "The file has a heading block but no article under it.";
  if (/<script\b/i.test(content)) return "This file has a <script> tag in it. An article page may not carry one.";
  return null;
}

async function gh(path: string, token: string, init?: RequestInit) {
  const res = await fetch(GITHUB_API + path, {
    ...init,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* khali jawab bhi theek hai */ }
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405, origin);

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Please log in first." }, 401, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const repoToken = Deno.env.get("ARTICLE_REPO_TOKEN");
  if (!url || !serviceKey) return json({ error: "Not set up yet." }, 500, origin);
  if (!repoToken) {
    return json({
      error: "This page is not set up yet: the website key is missing. Add ARTICLE_REPO_TOKEN in Supabase, then try again.",
    }, 500, origin);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Kaun hai?
  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who?.user) return json({ error: "Please log in again." }, 401, origin);

  // 2. Admin hai? (rule 16 ki wahi ek allow list)
  const { data: row, error: rowErr } = await admin
    .from("paper_admins").select("user_id").eq("user_id", who.user.id).maybeSingle();
  if (rowErr) return json({ error: "Could not check your account. Please try again." }, 500, origin);
  if (!row) return json({ error: "You are not allowed to use this page." }, 403, origin);

  // 3. Body
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "Nothing was sent." }, 400, origin); }

  const folder = String(body.folder ?? "").trim();
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const content = String(body.content ?? "");
  const replace = body.replace === true;

  if (!FOLDERS.includes(folder)) return json({ error: "That is not a folder an article can go in." }, 400, origin);
  if (!slugOk(slug)) {
    return json({
      error: "The web address part may use only small letters, numbers and hyphens, for example my-new-article.",
    }, 400, origin);
  }
  if (RESERVED.includes(slug)) return json({ error: 'The name "' + slug + '" is kept for the site itself. Please choose another.' }, 400, origin);

  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_BYTES) {
    return json({ error: "This file is too big (" + Math.round(bytes / 1024) + " KB). The limit is 400 KB." }, 400, origin);
  }
  const problem = checkArticle(content);
  if (problem) return json({ error: problem }, 400, origin);

  const repoPath = "notes/" + (folder ? folder + "/" : "") + slug + "/index.md";
  const pageUrl = "/notes/" + (folder ? folder + "/" : "") + slug + "/";

  // 4. Pehle se hai? (replace karne ke liye uska sha chahiye)
  const existing = await gh(
    "/repos/" + REPO + "/contents/" + repoPath + "?ref=" + BRANCH, repoToken,
  );
  let sha: string | undefined;
  if (existing.ok && typeof existing.data.sha === "string") sha = existing.data.sha as string;
  else if (existing.status !== 404) {
    const msg = typeof existing.data.message === "string" ? existing.data.message : "";
    return json({
      error: "Could not read the website's files (" + existing.status + "). " +
        (existing.status === 401 || existing.status === 403
          ? "The website key may be wrong or finished. Make a new one in GitHub and replace ARTICLE_REPO_TOKEN in Supabase."
          : msg),
    }, 502, origin);
  }

  if (sha && !replace) {
    return json({
      error: "An article already lives at " + pageUrl + ". Tick the replace box if you want to put this file in its place.",
      exists: true, url: pageUrl,
    }, 409, origin);
  }

  // 5. Likho
  const put = await gh("/repos/" + REPO + "/contents/" + repoPath, repoToken, {
    method: "PUT",
    body: JSON.stringify({
      message: (sha ? "Update article: " : "Publish article: ") + pageUrl + " (from /admin/upload-article/)",
      content: toBase64(content),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!put.ok) {
    const msg = typeof put.data.message === "string" ? put.data.message : "";
    return json({
      error: "The article could not be saved (" + put.status + "). " +
        (put.status === 401 || put.status === 403
          ? "The website key may be wrong, finished, or may not be allowed to write. Check it in GitHub and replace ARTICLE_REPO_TOKEN in Supabase."
          : put.status === 409
          ? "The website's files changed at the same moment. Please try once more."
          : msg),
    }, 502, origin);
  }

  const commit = (put.data.commit || {}) as Record<string, unknown>;
  return json({
    ok: true,
    url: pageUrl,
    path: repoPath,
    replaced: Boolean(sha),
    commit: typeof commit.sha === "string" ? (commit.sha as string).slice(0, 7) : "",
  }, 200, origin);
});
