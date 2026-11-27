// /admin/upload-daily/ ke liye: har Daily (Quick) quiz bank jo site par hai, aur tags ki asli list.
// (owner, 2026-11-27: "daily quiz wali function add karo lekin ek new section admin page par")
//
// Daily quiz ki file bhi ek PUBLIC file hai: assets/instant/<period>-<level>.json (rule 8).
// Isliye use likhna article ya free MCQ set likhne jaisa hai.
//
// Ek baat jo MCQ set se alag hai: **saare 40 bank pehle se site par hain** (20 period x easy/hard),
// isliye is page ka kaam NAYA bank banana nahi, **pehle se chal rahe bank ko sudharna** hai — ek
// question theek karna, ya reasons jodna (rule 8: "verify it with a reliable source ... change as
// little as possible, keep the id"). Naya bank (jaise planned "The Literature" wala doosra bank)
// page ke apne text aur buttons bhi maangta hai, wo Claude ka kaam hai.
//
// Har bank ki asli baatein uski apni file se padhi jati hain — ginti, rev, ids ka prefix, reasons
// hain ya nahi — taaki page kuch maan kar na chale (rule 2).

const fs = require("fs");
const path = require("path");

const taxonomyIds = require("../tools/taxonomy-ids.js");

const DIR = path.join(__dirname, "..", "assets", "instant");
const HUBS = path.join(__dirname, "..", "quizzes", "daily");

// id ka shuruaati hissa: "ac-e-01" -> "ac-e-" (rule 8 ka prefix, file se padha, likha nahi gaya)
function prefixOf(ids) {
  if (!ids.length) return "";
  const m = String(ids[0]).match(/^(.*-)\d+$/);
  if (!m) return "";
  const p = m[1];
  return ids.every((id) => String(id).indexOf(p) === 0) ? p : "";
}

module.exports = function () {
  const banks = [];
  // Quiz ka apna page: /quizzes/daily/<bankId>/ — folder dekh kar, maan kar nahi (rule 2).
  let hubs = [];
  try { hubs = fs.readdirSync(HUBS); } catch { hubs = []; }
  let names = [];
  try { names = fs.readdirSync(DIR); } catch { names = []; }
  for (const name of names.sort()) {
    if (!name.endsWith(".json")) continue;
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(DIR, name), "utf8")); } catch { continue; }
    const qs = Array.isArray(d.questions) ? d.questions : [];
    const ids = qs.map((q) => String((q && q.id) || ""));
    banks.push({
      file: name,
      bankId: String(d.bankId || ""),
      period: String(d.period || ""),          // jo naam page par dikhta hai
      level: String(d.level || ""),
      rev: Number(d.rev) || 1,
      count: qs.length,
      prefix: prefixOf(ids),
      reasons: qs.length > 0 && qs.every((q) => String((q && q.explanation) || "").trim()),
      hub: hubs.indexOf(String(d.bankId || "")) === -1 ? "/quizzes/daily/" : "/quizzes/daily/" + d.bankId + "/",
      ids: ids,
    });
  }

  const t = taxonomyIds();
  // Page ko ids ki poori list nahi chahiye (bahut badi ho jati), sirf ginti aur prefix —
  // purani ids se milan page khud us bank ki file padh kar karta hai.
  const forPage = banks.map((b) => ({
    file: b.file, bankId: b.bankId, period: b.period, level: b.level,
    rev: b.rev, count: b.count, prefix: b.prefix, reasons: b.reasons, hub: b.hub,
  }));

  return {
    banks,
    count: banks.length,
    json: JSON.stringify({ banks: forPage, topicIds: t.ids, periodIds: t.periods }),
  };
};
