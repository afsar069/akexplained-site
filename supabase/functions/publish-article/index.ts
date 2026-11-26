// publish-article — admin ke browser se ek article (.md) site ke repo me likhne wala hissa
// (owner, 2026-11-26: "admin page par jo article publish kar de").
//
// Kaam ek hi hai: /admin/upload-article/ se aaya markdown file repo ke notes/<slug>/index.md
// par likh dena. Cloudflare Pages `main` ko dekhta hai, isliye likhne ke 2-3 minute baad
// article asli static page ban kar live ho jata hai — poora design, Google ke liye indexable.
// (MCQ paper database se turant khulta hai; article ko rebuild chahiye, kyunki Google ko
// asli HTML page chahiye. CLAUDE.md rule 24.)
//
// Browser se POST aata hai, body {action, folder, slug, content, replace, images}, admin ka login
// token Authorization me. action "read" ek published article ka text wapas deta hai (sudharne ke
// liye); "publish" use likhta hai. Asli jaanch YAHAN hoti hai (browser ka code bypass ho sakta hai):
//   1. token valid hai? (getUser)
//   2. us login ka row public.paper_admins me hai? (rule 16 ki wahi ek allow list)
//   3. folder sirf "" ya "ages" — kahin aur nahi likha ja sakta
//   4. slug ka roop saaf (chhote akshar, hyphen), reserved naam nahi
//   5. front matter hai, usme title aur description hain, body khali nahi
//   6. file 400 KB se kam, koi <script> nahi
//   7. har tasveer: /assets/... .webp, 200 KB tak, ek baar me 10 tak
// In sab ke baad hi GitHub par likha jata hai, aur sirf notes/ ke andar .md aur assets/ ke andar
// .webp — kahin aur nahi.
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
// Tasveerein (owner, 2026-11-26): sirf WebP, 200 KB tak, sirf assets/ ke andar, ek baar me 10 tak.
// Browser pehle hi badal kar chhota kar deta hai; ye uska doosra darwaza hai.
const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 200 * 1024;
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

// GitHub se aaya base64 wapas UTF-8 text me (uske base64 me nayi lines hoti hain).
function fromBase64(b64: string): string {
  const bin = atob(String(b64).replace(/\s+/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function slugOk(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
}

// base64 me kitne bytes hain (decode kiye bina)
function b64Bytes(b64: string): number {
  const clean = b64.replace(/=+$/, "");
  return Math.floor(clean.length * 3 / 4);
}

/* Tasveer ka pata: site ka /assets/... hi ho, .webp hi ho, koi ".." na ho.
   Repo me rasta "assets/..." banta hai — kahin aur nahi likha ja sakta. */
function imagePath(site: string): string | null {
  if (typeof site !== "string") return null;
  if (!site.startsWith("/assets/")) return null;
  if (site.includes("..") || site.includes("//")) return null;
  if (!/\.webp$/i.test(site)) return null;
  if (!/^\/assets\/[A-Za-z0-9/_-]+\.webp$/.test(site)) return null;
  if (site.length > 200) return null;
  return site.slice(1);
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
  // Secret paste karte waqt aage/peeche space ya nayi line reh sakti hai — hata do,
  // warna Authorization header hi galat ban jata hai aur GitHub 401 deta hai.
  const repoToken = (Deno.env.get("ARTICLE_REPO_TOKEN") || "").trim();
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
  //
  // Ye jaanch CALLER ke apne login se hoti hai, service key se nahi. public.paper_admins
  // jaan-boojh kar aisi bani hai ki sirf `authenticated` ke paas SELECT hai aur policy
  // "paper_admins_read_own" har user ko sirf apna row deti hai — service_role ke paas
  // uspar SELECT hai hi nahi (migration 20261112130000). Isliye service key se padhne par
  // "permission denied" aata tha. Saari admin pages bhi yahi raasta lati hain: row mila =
  // admin, nahi mila = nahi. Table ka bulk-read kisi ko bhi nahi milta.
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || token;
  const asUser = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: "Bearer " + token } },
  });
  const { data: row, error: rowErr } = await asUser
    .from("paper_admins").select("user_id").maybeSingle();
  if (rowErr) {
    return json({
      error: "Could not check your account. Please try again. (" + (rowErr.message || "no reason given") + ")",
    }, 500, origin);
  }
  if (!row) return json({ error: "You are not allowed to use this page." }, 403, origin);

  // 3. Body
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "Nothing was sent." }, 400, origin); }

  const action = String(body.action ?? "publish");
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

  const repoPath = "notes/" + (folder ? folder + "/" : "") + slug + "/index.md";
  const pageUrl = "/notes/" + (folder ? folder + "/" : "") + slug + "/";

  // READ: ek published article ka text wapas, taaki admin page par use sudhara ja sake
  // (owner, 2026-11-26). Sirf padhna — kuch badalta nahi.
  if (action === "read") {
    const got = await gh("/repos/" + REPO + "/contents/" + repoPath + "?ref=" + BRANCH, repoToken);
    if (got.status === 404) return json({ error: "There is no article at " + pageUrl + " yet." }, 404, origin);
    if (!got.ok || typeof got.data.content !== "string") {
      const msg = typeof got.data.message === "string" ? got.data.message : "";
      return json({ error: "Could not read that article (" + got.status + "). " + msg }, 502, origin);
    }
    return json({ ok: true, url: pageUrl, path: repoPath, content: fromBase64(got.data.content as string) }, 200, origin);
  }
  if (action !== "publish") return json({ error: "That is not something this page can do." }, 400, origin);

  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_BYTES) {
    return json({ error: "This file is too big (" + Math.round(bytes / 1024) + " KB). The limit is 400 KB." }, 400, origin);
  }
  const problem = checkArticle(content);
  if (problem) return json({ error: problem }, 400, origin);

  // Tasveerein jaanch lo (likhne se pehle saari, taaki aadhi-adhuri na chadhein).
  const rawImages = Array.isArray(body.images) ? body.images : [];
  if (rawImages.length > MAX_IMAGES) {
    return json({ error: "Too many pictures at once (" + rawImages.length + "). Send up to " + MAX_IMAGES + "." }, 400, origin);
  }
  const images: { path: string; site: string; data: string }[] = [];
  for (const raw of rawImages) {
    const one = (raw || {}) as Record<string, unknown>;
    const site = String(one.path ?? "");
    const data = String(one.data ?? "").replace(/^data:[^,]*,/, "");
    const path = imagePath(site);
    if (!path) {
      return json({
        error: 'That picture cannot go at "' + site + '". A picture must sit inside /assets/ and be a .webp file.',
      }, 400, origin);
    }
    if (!data) return json({ error: "One of the pictures is empty." }, 400, origin);
    const size = b64Bytes(data);
    if (size > MAX_IMAGE_BYTES) {
      return json({
        error: "The picture " + site + " is " + Math.round(size / 1024) + " KB. A website picture must be 200 KB or less.",
      }, 400, origin);
    }
    images.push({ path, site, data });
  }

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

  // 5. Pehle tasveerein, phir article — taaki page kabhi khaali dabbon ke saath live na ho.
  //    Jo tasveer us pate par pehle se hai use haath nahi lagate.
  const addedImages: string[] = [];
  for (const img of images) {
    const has = await gh("/repos/" + REPO + "/contents/" + img.path + "?ref=" + BRANCH, repoToken);
    if (has.ok) continue;
    if (has.status !== 404) {
      return json({
        error: "Could not check whether " + img.site + " is already there (" + has.status + "). Nothing was saved.",
      }, 502, origin);
    }
    const sent = await gh("/repos/" + REPO + "/contents/" + img.path, repoToken, {
      method: "PUT",
      body: JSON.stringify({
        message: "Add picture: " + img.site + " (from /admin/upload-article/)",
        content: img.data,
        branch: BRANCH,
      }),
    });
    if (!sent.ok) {
      const msg = typeof sent.data.message === "string" ? sent.data.message : "";
      return json({
        error: "The picture " + img.site + " could not be saved (" + sent.status + "). " + msg +
          " The article was not saved either, so nothing is half done.",
      }, 502, origin);
    }
    addedImages.push(img.site);
  }

  // 6. Ab article
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
    images: addedImages,
    commit: typeof commit.sha === "string" ? (commit.sha as string).slice(0, 7) : "",
  }, 200, origin);
});
