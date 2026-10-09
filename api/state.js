const L = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!L.hasDb()) return res.status(503).json({ err: 'nodb' });
  try {
    const admin = L.authed(req);
    if (req.method === 'GET') {
      const s = await L.getState();
      return res.status(200).json({ s: s ? (admin ? L.norm(s) : L.strip(s)) : null, admin, ts: Date.now() });
    }
    if (req.method === 'POST') {
      if (!admin) return res.status(401).json({ err: 'auth' });
      const b = await L.body(req), c = L.norm(b.s), base = +b.base || 0;
      if (!b.s || typeof b.s !== 'object') return res.status(400).json({ err: 'bad' });
      /* keep registrations that visitors made after the admin last loaded the data */
      const cur = L.norm(await L.getState() || {}); let merged = 0;
      [['dr', x => x.did], ['tm', x => x.id]].forEach(([k, key]) => cur[k].forEach(x => {
        if ((x.at || 0) > base && !c[k].some(y => key(y) == key(x))) { c[k].push(x); merged++; }
      }));
      await L.putState(c);
      return res.status(200).json({ s: c, ts: Date.now(), merged });
    }
    return res.status(405).json({ err: 'method' });
  } catch (e) { return res.status(500).json({ err: 'db' }); }
};
