// publish-article — admin ke browser se site ke repo me likhne wala hissa
// (owner, 2026-11-26: "admin page par jo article publish kar de"; 2026-11-27: free MCQ set bhi,
// aur usi din Daily quiz bhi: "daily quiz wali function add karo lekin ek new section admin page par").
//
// Teen kaam:
//   * /admin/upload-article/ se aaya markdown notes/<slug>/index.md par, aur uski tasveerein assets/ me.
//   * /admin/upload-mcq/ se aayi FREE MCQ set ki file(s) assets/questions/<setId>-<level>.json par.
//   * /admin/upload-daily/ se aayi Daily quiz ki file assets/instant/<period>-<level>.json par —
//     sirf us file par jo pehle se maujood hai (naya bank page ka text bhi maangta hai, rule 8).
// Cloudflare Pages `main` ko dekhta hai, isliye likhne ke 2-3 minute baad page asli static page ban kar
// live ho jata hai — Google ke liye indexable. (MCQ ka LOGIN paper database se turant khulta hai: wo
// is page ka kaam nahi, uske sawal repo me kabhi nahi jate. CLAUDE.md rule 15, 17, 24.)
//
// Browser se POST aata hai, admin ka login token Authorization me. action:
//   "read"              ek published article ka text wapas (sudharne ke liye)
//   "publish"           article + uski tasveerein
//   "publish-questions" ek free MCQ set ki file(s)
//   "publish-daily"     ek chal rahe Daily quiz ki nayi file
// Asli jaanch YAHAN hoti hai (browser ka code bypass ho sakta hai):
//   1. token valid hai? (getUser)   2. us login ka row public.paper_admins me hai?
//   3. article: folder, slug, front matter, <script>, 400 KB; tasveer: /assets/....webp, 200 KB, 10 tak
//   4. free MCQ: set registry me PLAN hai aur FREE hai, har question ke 4 option, sahi jawab, explanation
//      aur asli topicId/periodId (master taxonomy repo se padhi jati hai)
//   5. Daily: file pehle se hai, bankId/period/level wahi, rev aage, ids jami hui (koi id gayab nahi,
//      prefix wahi), 4 ya 2 option (True/False), aur jo reasons site par hain wo kho na jaayein
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

/* ---------- FREE MCQ set (owner, 2026-11-27) ----------
   Ek free set ek PUBLIC file hai: assets/questions/<setId>-<level>.json (rule 15). Isliye use
   likhna article likhne jaisa hai. Par ek galat file se SITE KA BUILD ruk jata hai (check-topics
   gate: har topicId/periodId asli hona chahiye, rule 12), aur free matlab hamesha ke liye public —
   isliye jaanch yahan poori hoti hai, browser ke bharose nahi.

   Kaunsa set? Wahi jo registry me pehle se PLAN hai aur FREE hai. Registry (_data/mcqSpec.json) aur
   master taxonomy repo se padhi jati hai, taaki browser ka bheja koi bhi naam yahan chal na jaye:
   login/paid set ki file kabhi repo me nahi ja sakti. */
const SET_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*-set-[1-9][0-9]*$/;
const LEVELS = ["easy", "medium", "hard"];

async function repoText(path: string, token: string): Promise<string | null> {
  const got = await gh("/repos/" + REPO + "/contents/" + path + "?ref=" + BRANCH, token);
  if (!got.ok || typeof got.data.content !== "string") return null;
  return fromBase64(got.data.content as string);
}

type Slot = { setId: string; levels: string[]; count: number };

// Registry me ye set hai, free hai, aur plan kiya gaya hai?
function findSlot(specText: string, setId: string): Slot | string {
  let spec: { ages?: Record<string, unknown>[] };
  try { spec = JSON.parse(specText); } catch { return "The website's set list could not be read."; }
  for (const age of spec.ages || []) {
    const slug = String((age as Record<string, unknown>).slug ?? "");
    for (const set of ((age as Record<string, unknown>).sets ?? []) as Record<string, unknown>[]) {
      if (slug + "-set-" + set.n !== setId) continue;
      if (set.access) return "That set is a login set, so its questions may never be a public file.";
      const levels = Array.isArray(set.levels) ? set.levels.map(String) : [];
      return { setId, levels, count: Number(set.count) || 0 };
    }
  }
  return 'There is no planned set called "' + setId + '". Ask Claude to plan it first.';
}

// Taxonomy CSV se: har id, aur kaun si id `period` kind ki hai.
function readTags(csv: string): { ids: Set<string>; periods: Set<string> } {
  const ids = new Set<string>();
  const periods = new Set<string>();
  const lines = csv.split(/\r?\n/);
  lines.shift();
  for (const line of lines) {
    if (!line.trim()) continue;
    const f = line.split(",");
    const id = (f[0] || "").trim();
    if (!id) continue;
    ids.add(id);
    if ((f[2] || "").trim() === "period") periods.add(id);
  }
  return { ids, periods };
}

/* Ek level ki file: dhancha, har question, aur tags. Pehli galti par hi ruk jate hain, poora
   sandesh saaf English me — wahi page par dikhta hai. */
function checkQuestions(
  body: Record<string, unknown>, slot: Slot, level: string,
  tags: { ids: Set<string>; periods: Set<string> },
): string | null {
  if (String(body.setId ?? "") !== slot.setId) return "The file says it belongs to another set.";
  if (String(body.level ?? "") !== level) return "The file says it is another level.";
  const rev = Number(body.rev);
  if (!Number.isInteger(rev) || rev < 1) return "The file has no revision number.";
  const qs = body.questions;
  if (!Array.isArray(qs) || !qs.length) return "The file has no questions.";
  if (slot.count && qs.length !== slot.count) {
    return "The plan says " + slot.count + " questions, but this file has " + qs.length + ".";
  }
  const seen = new Set<string>();
  for (let i = 0; i < qs.length; i++) {
    const q = (qs[i] || {}) as Record<string, unknown>;
    const where = "Question " + (i + 1) + ": ";
    const id = String(q.id ?? "");
    if (!id) return where + "it has no id.";
    if (!id.startsWith(slot.setId + "-")) return where + 'its id "' + id + '" does not belong to this set.';
    if (seen.has(id)) return where + 'the id "' + id + '" is in this file twice.';
    seen.add(id);
    if (!String(q.question ?? "").trim()) return where + "it has no question.";
    const opts = q.options;
    if (!Array.isArray(opts) || opts.length !== 4) return where + "a question must have exactly four options.";
    const clean = opts.map((o) => String(o ?? "").trim());
    if (clean.some((o) => !o)) return where + "one of its options is empty.";
    if (new Set(clean).size !== 4) return where + "two of its options are the same.";
    const right = Number(q.correct_option_id);
    if (!Number.isInteger(right) || right < 0 || right > 3) return where + "the right option is not marked 0 to 3.";
    if (!String(q.explanation ?? "").trim()) return where + "it has no explanation.";
    const topic = String(q.topicId ?? "");
    if (!topic) return where + "it has no topicId.";
    if (!tags.ids.has(topic)) return where + 'its topicId "' + topic + '" is not in the topic list.';
    const period = String(q.periodId ?? "");
    if (period && !tags.periods.has(period)) return where + 'its periodId "' + period + '" is not a period.';
  }
  return null;
}

/* ---------- Daily (Quick) quiz (owner, 2026-11-27) ----------
   Daily quiz ki file bhi PUBLIC hai: assets/instant/<period>-<level>.json (rule 8).
   Yahan ka kaam **naya bank banana nahi** — site par 40 bank pehle se hain, aur naya bank apne page
   ka text aur buttons bhi maangta hai (Claude ka kaam). Isliye sirf us file par likha jata hai jo
   pehle se maujood hai, aur uska bankId/period/level badla nahi ja sakta.

   Sabse badi baat: **ids jami hui hain** (rule 8 aur 12). Student ka saved progress question ki id
   par tika hai, isliye koi purani id gayab nahi ho sakti aur prefix wahi rehta hai. Prefix file ki
   apni ids se padha jata hai, likha nahi gaya — taaki ye code rule 8 ki table se kabhi na bhatke. */
const DAILY_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*-(easy|hard)\.json$/;

// "ac-e-01" -> "ac-e-"
function idPrefix(ids: string[]): string {
  if (!ids.length) return "";
  const m = ids[0].match(/^(.*-)\d+$/);
  if (!m) return "";
  const p = m[1];
  return ids.every((id) => id.startsWith(p)) ? p : "";
}

function checkDaily(
  next: Record<string, unknown>, now: Record<string, unknown>,
  tags: { ids: Set<string>; periods: Set<string> },
): string | null {
  for (const key of ["bankId", "period", "level"]) {
    if (String(next[key] ?? "") !== String(now[key] ?? "")) {
      return "the file says it is another quiz (" + key + ").";
    }
  }
  const rev = Number(next.rev);
  const revNow = Number(now.rev) || 1;
  if (!Number.isInteger(rev) || rev <= revNow) {
    return "its revision number must be above " + revNow + ", so readers' browsers pick up the new questions.";
  }
  const qs = next.questions;
  if (!Array.isArray(qs) || !qs.length) return "it has no questions.";

  const oldQs = (Array.isArray(now.questions) ? now.questions : []) as Record<string, unknown>[];
  const oldIds = oldQs.map((q) => String((q || {}).id ?? "")).filter(Boolean);
  const prefix = idPrefix(oldIds);
  const everyReason = oldQs.length > 0 && oldQs.every((q) => String((q || {}).explanation ?? "").trim());

  const seen = new Set<string>();
  let noReason = 0;
  for (let i = 0; i < qs.length; i++) {
    const q = (qs[i] || {}) as Record<string, unknown>;
    const where = "question " + (i + 1) + ": ";
    const id = String(q.id ?? "");
    if (!id) return where + "it has no id.";
    if (prefix && !id.startsWith(prefix)) return where + 'its id "' + id + '" does not belong to this quiz.';
    if (seen.has(id)) return where + 'the id "' + id + '" is in this file twice.';
    seen.add(id);
    if (!String(q.question ?? "").trim()) return where + "it has no question.";
    const opts = q.options;
    if (!Array.isArray(opts) || (opts.length !== 4 && opts.length !== 2)) {
      return where + "a question needs four options, or two for a True / False question.";
    }
    const clean = opts.map((o) => String(o ?? "").trim());
    if (clean.some((o) => !o)) return where + "one of its options is empty.";
    if (new Set(clean).size !== clean.length) return where + "two of its options are the same.";
    const right = Number(q.correct_option_id);
    if (!Number.isInteger(right) || right < 0 || right >= clean.length) {
      return where + "the right option is not marked 0 to " + (clean.length - 1) + ".";
    }
    if (!String(q.explanation ?? "").trim()) noReason++;
    const topic = String(q.topicId ?? "");
    if (!topic) return where + "it has no topicId.";
    if (!tags.ids.has(topic)) return where + 'its topicId "' + topic + '" is not in the topic list.';
    const period = String(q.periodId ?? "");
    if (period && !tags.periods.has(period)) return where + 'its periodId "' + period + '" is not a period.';
  }

  const missing = oldIds.filter((id) => !seen.has(id));
  if (missing.length) {
    return missing.length + " question" + (missing.length === 1 ? "" : "s") + " on the website " +
      (missing.length === 1 ? "is" : "are") + " not in this file (" + missing.slice(0, 5).join(", ") +
      (missing.length > 5 ? ", and more" : "") + "). Ids are never taken away: students' saved answers hang on them.";
  }
  if (everyReason && noReason > 0) {
    return noReason + " question" + (noReason === 1 ? " has" : "s have") +
      " no reason, but every question on this quiz has one today. Readers would stop seeing it.";
  }
  return null;
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

  // PUBLISH-QUESTIONS: ek FREE MCQ set ki file(s) assets/questions/ me (owner, 2026-11-27).
  // Article wala hi raasta, par jaanch zyada: galat file build rok deti hai, aur free hamesha ke liye public hai.
  if (action === "publish-questions") {
    const setId = String(body.setId ?? "").trim().toLowerCase();
    if (!SET_ID.test(setId)) return json({ error: "That is not a set name this page can use." }, 400, origin);

    const rawFiles = Array.isArray(body.files) ? body.files : [];
    if (!rawFiles.length || rawFiles.length > 3) {
      return json({ error: "Send one file for each level of the set (up to three)." }, 400, origin);
    }

    const specText = await repoText("_data/mcqSpec.json", repoToken);
    if (specText === null) return json({ error: "The website's set list could not be read. Please try again." }, 502, origin);
    const slot = findSlot(specText, setId);
    if (typeof slot === "string") return json({ error: slot }, 400, origin);

    const csv = await repoText("supabase/data/taxonomy-master-reference.csv", repoToken);
    if (csv === null) return json({ error: "The topic list could not be read. Please try again." }, 502, origin);
    const tags = readTags(csv);

    // Har file jaanch lo (likhne se pehle saari, taaki aadha set kabhi na chadhe).
    const ready: { path: string; level: string; text: string }[] = [];
    const levelsSent = new Set<string>();
    for (const raw of rawFiles) {
      const one = (raw || {}) as Record<string, unknown>;
      const level = String(one.level ?? "").trim().toLowerCase();
      const text = String(one.text ?? "");
      if (!LEVELS.includes(level)) return json({ error: 'There is no level called "' + level + '".' }, 400, origin);
      if (!slot.levels.includes(level)) {
        return json({ error: "This set does not have a " + level + " level, so that file cannot go here." }, 400, origin);
      }
      if (levelsSent.has(level)) return json({ error: "Two files were sent for the " + level + " level." }, 400, origin);
      levelsSent.add(level);
      if (new TextEncoder().encode(text).length > MAX_BYTES) {
        return json({ error: "The " + level + " file is too big. The limit is 400 KB." }, 400, origin);
      }
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(text); } catch { return json({ error: "The " + level + " file is not a question file this page can read." }, 400, origin); }
      const problem = checkQuestions(parsed, slot, level, tags);
      if (problem) return json({ error: "The " + level + " file — " + problem }, 400, origin);
      ready.push({ path: "assets/questions/" + setId + "-" + level + ".json", level, text });
    }

    // Pehle se hai? (replace ke bina kuch nahi badla jata)
    const shas: Record<string, string> = {};
    for (const f of ready) {
      const has = await gh("/repos/" + REPO + "/contents/" + f.path + "?ref=" + BRANCH, repoToken);
      if (has.ok && typeof has.data.sha === "string") {
        if (!replace) {
          return json({
            error: "This set already has its " + f.level + " questions on the website. Tick the replace box to put these in their place.",
            exists: true,
          }, 409, origin);
        }
        shas[f.path] = has.data.sha as string;
      } else if (has.status !== 404) {
        return json({ error: "Could not check the website's files (" + has.status + "). Nothing was saved." }, 502, origin);
      }
    }

    const written: string[] = [];
    for (const f of ready) {
      const sent = await gh("/repos/" + REPO + "/contents/" + f.path, repoToken, {
        method: "PUT",
        body: JSON.stringify({
          message: (shas[f.path] ? "Update free MCQ set: " : "Publish free MCQ set: ") + setId + " (" + f.level + ", from /admin/upload-mcq/)",
          content: toBase64(f.text),
          branch: BRANCH,
          ...(shas[f.path] ? { sha: shas[f.path] } : {}),
        }),
      });
      if (!sent.ok) {
        const msg = typeof sent.data.message === "string" ? sent.data.message : "";
        return json({
          error: "The " + f.level + " file could not be saved (" + sent.status + "). " + msg +
            (written.length ? " The " + written.join(" and ") + " file was saved before this, so please try again." : " Nothing was saved."),
        }, 502, origin);
      }
      written.push(f.level);
    }

    return json({
      ok: true,
      setId,
      levels: written,
      replaced: Object.keys(shas).length > 0,
      url: "/quizzes/mcq/" + setId.replace(/-set-\d+$/, "") + "/set-" + setId.split("-set-")[1] + "/",
    }, 200, origin);
  }

  // PUBLISH-DAILY: ek chal rahe Daily quiz ki nayi file assets/instant/ me (owner, 2026-11-27).
  // Sirf us file par likha ja sakta hai jo pehle se hai — isliye "file nahi mili" ka matlab hai
  // naya bank, jo page ka text bhi maangta hai (rule 8), aur wo yahan se nahi hota.
  if (action === "publish-daily") {
    const file = String(body.file ?? "").trim().toLowerCase();
    if (!DAILY_FILE.test(file)) return json({ error: "That is not a Daily quiz file this page can use." }, 400, origin);
    const text = String(body.text ?? "");
    if (new TextEncoder().encode(text).length > MAX_BYTES) {
      return json({ error: "This file is too big. The limit is 400 KB." }, 400, origin);
    }
    let next: Record<string, unknown>;
    try { next = JSON.parse(text); } catch { return json({ error: "This is not a question file this page can read." }, 400, origin); }

    const path = "assets/instant/" + file;
    const has = await gh("/repos/" + REPO + "/contents/" + path + "?ref=" + BRANCH, repoToken);
    if (has.status === 404) {
      return json({
        error: "There is no Daily quiz with that file on the website. This page can only correct a quiz that is already there; a new one needs its page written first.",
      }, 404, origin);
    }
    if (!has.ok || typeof has.data.content !== "string" || typeof has.data.sha !== "string") {
      const msg = typeof has.data.message === "string" ? has.data.message : "";
      return json({ error: "Could not read the quiz on the website (" + has.status + "). " + msg + " Nothing was saved." }, 502, origin);
    }
    let now: Record<string, unknown>;
    try { now = JSON.parse(fromBase64(has.data.content as string)); } catch {
      return json({ error: "The quiz on the website could not be read. Nothing was saved." }, 502, origin);
    }

    const csvDaily = await repoText("supabase/data/taxonomy-master-reference.csv", repoToken);
    if (csvDaily === null) return json({ error: "The topic list could not be read. Please try again." }, 502, origin);
    const problemDaily = checkDaily(next, now, readTags(csvDaily));
    if (problemDaily) return json({ error: "This file cannot go on the website — " + problemDaily }, 400, origin);

    const sent = await gh("/repos/" + REPO + "/contents/" + path, repoToken, {
      method: "PUT",
      body: JSON.stringify({
        message: "Update Daily quiz: " + String(now.period ?? file) + " (" + String(now.level ?? "") +
          ", rev " + Number(next.rev) + ", from /admin/upload-daily/)",
        content: toBase64(text),
        branch: BRANCH,
        sha: has.data.sha as string,
      }),
    });
    if (!sent.ok) {
      const msg = typeof sent.data.message === "string" ? sent.data.message : "";
      return json({ error: "The quiz could not be saved (" + sent.status + "). " + msg + " Nothing was saved." }, 502, origin);
    }

    return json({
      ok: true,
      file,
      rev: Number(next.rev),
      count: (next.questions as unknown[]).length,
      url: "/quizzes/daily/" + String(now.bankId ?? "") + "/",
    }, 200, origin);
  }

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
