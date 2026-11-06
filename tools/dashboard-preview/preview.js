/* ==========================================================
   /dashboard/ ko logged-in haalat me dekhne ka tareeka.
   ----------------------------------------------------------
   Ye container se Supabase tak nahi jaata (rule 9: network band hai).
   Iske bajaye ek nakli session localStorage me daalta hai aur har REST
   call ka jawab banaayi hui pankti se deta hai, taaki PAGE KA ASLI CODE
   chale — dashboard.js, auth.js, site.css, sab.

   CHALANE KA TAREEKA
     npx @11ty/eleventy
     python3 -m http.server 8099 --directory _site &
     OUT_DIR=/tmp/shots node tools/dashboard-preview/preview.js

   Yahan ki har ginti NAKLI hai — sirf design dekhne ke liye. Isse koi
   number site par, chat me ya kisi doc me mat likhna (rule 2).
   ========================================================== */
const { chromium } = require('playwright');
const DIR = process.env.OUT_DIR || '.';
const REF = 'almlqoxcyzwieuwrgwry';
const UID = '11111111-2222-3333-4444-555555555555';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 36000;
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: UID, exp, role: 'authenticated' })}.sig`;

// --- made-up attempts -------------------------------------------------
const PREFIX = ['as','an','ac','fc','rn','et','el','jb','cr','cw','nc','rs','au','sn','rm','vc','ed','gr','md','pm'];
const PERIODS = ['anglo-saxon','anglo-norman','age-of-chaucer','elizabethan','romantic','victorian'];
const rows = [];
let id = 1;
const day = 86400000, now = Date.now();
// five ages well covered, the rest partly
PREFIX.forEach((px, pi) => {
  const n = pi < 5 ? 70 : pi < 10 ? 35 : 8;
  for (let i = 1; i <= n; i++) {
    const ageDays = (i % 21) + (pi % 3);           // spread over three weeks
    rows.push({
      id: id++,
      is_correct: (i % 10) < (pi < 5 ? 8 : 6),      // older ages answered better
      answered_at: new Date(now - ageDays * day + (i % 7) * 3600000).toISOString(),
      period_id: PERIODS[pi % PERIODS.length],
      topic_id: pi % 3 === 0 ? 'geoffrey-chaucer' : null,
      question_id: `${px}-e-${String(i).padStart(2, '0')}`
    });
  }
});
// a few from today, so the streak counts today
for (let i = 0; i < 12; i++) {
  rows.push({ id: id++, is_correct: i % 4 !== 0, answered_at: new Date(now - i * 600000).toISOString(),
    period_id: 'victorian', topic_id: null, question_id: `vc-h-${String(i + 40).padStart(2, '0')}` });
}
rows.sort((a, b2) => b2.id - a.id);

const TOPICS = [
  { id: 'anglo-saxon', name: 'Anglo-Saxon Period', kind: 'period' },
  { id: 'anglo-norman', name: 'Anglo-Norman Period', kind: 'period' },
  { id: 'age-of-chaucer', name: 'Age of Chaucer', kind: 'period' },
  { id: 'elizabethan', name: 'Elizabethan Age', kind: 'period' },
  { id: 'romantic', name: 'Romantic Period', kind: 'period' },
  { id: 'victorian', name: 'Victorian Period', kind: 'period' },
  { id: 'geoffrey-chaucer', name: 'Geoffrey Chaucer', kind: 'writer' }
];

(async () => {
  const browser = await chromium.launch();
  for (const [w, name] of [[1280, 'kpi-desktop'], [1680, 'kpi-big'], [900, 'kpi-tablet'], [390, 'kpi-phone']]) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 2 });
    await page.addInitScript(([ref, tok, uid]) => {
      localStorage.setItem('sb-' + ref + '-auth-token', JSON.stringify({
        access_token: tok, token_type: 'bearer', expires_in: 36000,
        expires_at: Math.floor(Date.now() / 1000) + 36000, refresh_token: 'fake',
        user: { id: uid, email: 'afsar@example.com', user_metadata: { full_name: 'Afsar Khan' }, app_metadata: {}, aud: 'authenticated' }
      }));
    }, [REF, jwt, UID]);

    await page.route('**/*.supabase.co/**', async (route) => {
      const url = route.request().url();
      const json = (body, headers) => route.fulfill({ status: 200, contentType: 'application/json', headers: headers || {}, body: JSON.stringify(body) });
      if (url.includes('/rest/v1/attempts')) {
        return json(rows, { 'content-range': `0-${rows.length - 1}/${rows.length}` });
      }
      if (url.includes('/rest/v1/topics')) return json(TOPICS);
      if (url.includes('/rest/v1/user_exams')) {
        return json([{ exam_id: 'ugc-net', is_primary: true, exams: { name: 'UGC NET English' } },
                     { exam_id: 'pgt', is_primary: false, exams: { name: 'PGT English' } }]);
      }
      if (url.includes('/rest/v1/profiles')) return json({ display_name: 'Afsar Khan' });
      if (url.includes('/rest/v1/rpc/leaderboard')) {
        return json({ min_questions: 100, total_ranked: 42,
          you: { eligible: true, rank: 7, accuracy: 76, questions: 480 },
          top: [{ name: 'Riya S.', accuracy: 91, questions: 900 }, { name: 'Imran K.', accuracy: 88, questions: 760 }] });
      }
      if (url.includes('/auth/v1/')) return json({});
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('http://localhost:8099/dashboard/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.dashkpirow', { timeout: 5000 });
    const r = await page.$('.dashbare[data-section="kpis"]');
    const box = await r.boundingBox();
    await page.screenshot({ path: `${DIR}/${name}.png`, clip: { x: box.x - 12, y: box.y - 12, width: box.width + 24, height: box.height + 24 } });
    await page.screenshot({ path: `${DIR}/${name}-full.png`, clip: { x: 0, y: 0, width: w, height: Math.min(1000, 1000) } });
    await page.close();
  }
  await browser.close();
  console.log('shots done');
})();
