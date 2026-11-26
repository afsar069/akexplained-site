// Har notes article ki ek list, seedha folder padh kar (owner, 2026-11-26).
//
// Kyun: /admin/upload-article/ se naya article publish hone par do cheezein khud ban jani
// chahiye — sitemap ki line aur home page ke search me uski row. Pehle dono haath se likhi
// jati thi (sitemap me 43 lines, assets/home.js me 26 rows), aur ek bhi bhool jane par naya
// article Google aur site ke search se bahar reh jata tha.
//
// Collection kyun nahi: notes/ages/<slug>/index.md ke articles jaan-boojh kar
// `eleventyExcludeFromCollections` rakhte hain, isliye collection unhe nahi deta. Folder
// padhne se dono tarah ke article aate hain.
//
// Front matter ka poora YAML parse nahi karte: sirf title, description, eyebrow aur
// crumb_label chahiye. Baaki sab Eleventy khud padhta hai.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "notes");
// Jahan article rehte hain: notes/<slug>/ aur notes/ages/<slug>/
const FOLDERS = ["", "ages"];

function field(front, name) {
  const m = front.match(new RegExp("^" + name + ":[ \\t]*(.*)$", "m"));
  if (!m) return "";
  let v = m[1].trim();
  // YAML ki quote hata do; andar ka escaped quote waapas
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).replace(/\\"/g, '"');
  }
  return v;
}

function read(folder) {
  const dir = folder ? path.join(ROOT, folder) : ROOT;
  let names = [];
  try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const entry of names) {
    if (!entry.isDirectory()) continue;
    if (!folder && FOLDERS.includes(entry.name)) continue;   // notes/ages/ khud article nahi hai
    const file = path.join(dir, entry.name, "index.md");
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    let front = "";
    if (text.startsWith("---")) {
      const end = text.indexOf("\n---", 3);
      if (end !== -1) front = text.slice(3, end);
    }
    out.push({
      slug: entry.name,
      folder: folder,
      url: "/notes/" + (folder ? folder + "/" : "") + entry.name + "/",
      title: field(front, "title"),
      description: field(front, "description"),
      eyebrow: field(front, "eyebrow"),
      crumbLabel: field(front, "crumb_label"),
    });
  }
  return out;
}

module.exports = function () {
  const all = FOLDERS.flatMap(read);
  all.sort((a, b) => a.url.localeCompare(b.url));
  return all;
};
