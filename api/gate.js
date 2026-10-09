/* Owner gate: the access code lives ONLY in the UNLOCK_CODE environment variable (Vercel settings). */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = [path.join(__dirname, '..', 'private'), path.join(process.cwd(), 'private')].find(p => fs.existsSync(p)) || path.join(process.cwd(), 'private');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const secret = () => process.env.UNLOCK_CODE || '';
const sha = v => crypto.createHash('sha256').update(String(v)).digest('hex');
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const token = () => crypto.createHmac('sha256', secret()).update('frl-owner-v1').digest('hex');
const cookieOf = (req, n) => { const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(n + '=')); return m ? m.slice(n.length + 1) : ''; };
const authed = req => !!secret() && eq(cookieOf(req, 'frl_auth'), token());
async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) { const c = []; for await (const ch of req) c.push(ch); raw = Buffer.concat(c).toString('utf8'); }
  try { return JSON.parse(raw || '{}'); } catch (e) { return {}; }
}
const LOCK = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Restricted</title><style>
@font-face{font-family:D;src:url(/fonts/MotoGP_Display_Bold.ttf)}@font-face{font-family:T;src:url(/fonts/MotoGPText-Regular.ttf)}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0d12;color:#f2f4f8;font:15px T,system-ui,sans-serif;padding:20px}
.b{width:100%;max-width:340px}h1{font:700 26px D,Impact,sans-serif;font-style:normal;margin:0 0 6px}h1 span{color:#e10600}p{color:#8b93a7;margin:0 0 18px}
input{width:100%;padding:13px;border-radius:10px;border:1px solid #262a36;background:#14161d;color:#fff;font:inherit}input:focus{outline:2px solid #e10600}
button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;background:#e10600;color:#fff;font:700 15px T,system-ui,sans-serif;cursor:pointer}#m{color:#ff6b6b;min-height:20px;margin-top:10px;font-size:14px}</style></head>
<body><div class="b"><h1>fRacing <span>LEGENDS</span></h1><p>Restricted area. Enter the access code.</p>
<form id="f"><input id="c" type="password" autocomplete="current-password" autofocus><button>Unlock</button></form><div id="m"></div></div>
<script>document.getElementById('f').onsubmit=function(e){e.preventDefault();var m=document.getElementById('m');m.textContent='';
fetch('/api/gate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:document.getElementById('c').value})})
.then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})}).then(function(x){if(x.j.ok){location.reload()}else{m.textContent=x.s==503?'Access is not configured yet.':'Wrong code.'}}).catch(function(){m.textContent='Connection problem.'})}</script></body></html>`;
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method === 'POST') {
    const b = await readBody(req);
    if (b.logout) { res.setHeader('Set-Cookie', 'frl_auth=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'); return res.status(200).json({ ok: true }); }
    if (!secret()) return res.status(503).json({ ok: false });
    await new Promise(r => setTimeout(r, 700));
    if (!eq(sha(b.code || ''), sha(secret()))) return res.status(401).json({ ok: false });
    res.setHeader('Set-Cookie', 'frl_auth=' + token() + '; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax');
    return res.status(200).json({ ok: true });
  }
  let p = req.query && req.query.p; if (Array.isArray(p)) p = p.join('/');
  try { p = decodeURIComponent(String(p || '')); } catch (e) { p = '\0'; }
  p = p.replace(/^\/+/, '');
  if (!authed(req)) {
    if (p === '') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.status(200).send(LOCK); }
    return res.status(404).send('Not found');
  }
  if (p === '') p = 'hub.html';
  if (p.includes('\0')) return res.status(404).send('Not found');
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT + path.sep)) return res.status(404).send('Not found');
  try {
    if (!fs.statSync(file).isFile()) throw 0;
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    return res.status(200).send(fs.readFileSync(file));
  } catch (e) { return res.status(404).send('Not found'); }
};
