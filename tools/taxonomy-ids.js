// Master taxonomy se do list: har topic id, aur kaun si id `period` kind ki hai.
// (owner, 2026-11-27 — pehle ye `_data/freeMcqSlots.js` ke andar thi; ab Daily wala page bhi
// yahi list maangta hai, isliye ek jagah.)
//
// Build gate (tools/check-topics.js, rule 12) yahi do cheezein maangta hai, isliye admin ke
// upload pages bhi file bhejne se PEHLE yahi jaanchte hain: galat tag se poori site ka build
// ruk jata hai.

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "supabase", "data", "taxonomy-master-reference.csv");

let cache = null;

module.exports = function taxonomyIds() {
  if (cache) return cache;
  const ids = [];
  const periods = [];
  let text = "";
  try { text = fs.readFileSync(FILE, "utf8"); } catch { return (cache = { ids, periods }); }
  const lines = text.split(/\r?\n/);
  lines.shift(); // header: id,name,kind,parent_id,area
  for (const line of lines) {
    if (!line.trim()) continue;
    const f = line.split(",");
    const id = (f[0] || "").trim();
    if (!id) continue;
    ids.push(id);
    if ((f[2] || "").trim() === "period") periods.push(id);
  }
  cache = { ids, periods };
  return cache;
};
