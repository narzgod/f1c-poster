const L = require('./_lib');
const wa = v => { const d = String(v || '').replace(/[^\d+]/g, ''); const n = d.replace(/\D/g, ''); return n.length >= 8 && n.length <= 15 ? d : ''; };
const hex = v => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v).toLowerCase() : '';
const uid = () => Math.random().toString(36).slice(2, 8);
const t = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n || 80);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ err: 'Method not allowed.' });
  if (!L.hasDb()) return res.status(503).json({ err: 'Database is not connected yet.' });
  try {
    const b = await L.body(req), s = L.norm(await L.getState() || {}), it = b.item || {}, now = Date.now();
    const fail = m => res.status(400).json({ err: m });
    if (b.kind === 'driver') {
      const name = t(it.name, 60), did = t(it.did, 4), w = wa(it.wa), k = name.split(' ').length;
      if (!name || k < 2 || k > 3) return fail('Name must be 2 to 3 words.');
      if (!/^\d{4}$/.test(did)) return fail('DID must be exactly 4 digits.');
      if (s.dr.some(x => x.did == did)) return fail('This DID is already taken.');
      if (!w) return fail('Enter a valid WhatsApp number.');
      s.dr.push({ did, name, wa: w, at: now }); await L.putState(s); return res.status(200).json({ ok: true });
    }
    if (b.kind === 'team') {
      const e = s.ev.find(x => x.id == it.ev); if (!e) return fail('Event not found.');
      if (e.reg === false) return fail('Registration is closed.');
      const teams = s.tm.filter(x => x.ev == e.id);
      if (teams.length >= e.quota) return fail('Team slots are full.');
      const name = t(it.name), tp = t(it.tp), ow = t(it.ow), w1 = wa(it.tpw), w2 = wa(it.oww), c1 = hex(it.col), c2 = hex(it.col2);
      if (!name || !tp || !ow) return fail('Fill in team name, Team Principal and Team Owner.');
      if (!w1 || !w2) return fail('Enter valid WhatsApp numbers for Team Principal and Team Owner.');
      if (!c1 || !c2) return fail('Enter valid hex colors.');
      const d = Array.isArray(it.d) ? it.d.slice(0, 4).map(x => String(x || '')) : [];
      while (d.length < 4) d.push('');
      if (!d[0] || !d[1]) return fail('Driver 1 and Driver 2 are required.');
      const f = d.filter(Boolean);
      if (new Set(f).size < f.length) return fail('A driver cannot be selected twice.');
      if (f.some(x => !s.dr.some(y => y.did == x))) return fail('Unknown driver selected.');
      if (f.some(x => teams.some(y => y.d.includes(x)))) return fail('Some drivers are already in another team.');
      if (teams.some(y => y.name.toLowerCase() == name.toLowerCase())) return fail('Team name is already taken.');
      const used = new Set(teams.flatMap(y => Object.values(y.num || {}))), num = {};
      for (const x of f) {
        const v = String(it.num && it.num[x] || '').trim();
        if (!/^\d{1,2}$/.test(v) || +v < 1) return fail('Race number (1-99) is required for every driver.');
        if (used.has(String(+v))) return fail('Race number ' + (+v) + ' is already taken.');
        used.add(String(+v)); num[x] = String(+v);
      }
      s.tm.push({ id: uid(), ev: e.id, name, soc: e.soc ? t(it.soc, 80) : '', tp, tpw: w1, ow, oww: w2, col: c1, col2: c2, d, num, at: now });
      await L.putState(s); return res.status(200).json({ ok: true });
    }
    return fail('Bad request.');
  } catch (e) { return res.status(500).json({ err: 'Could not save. Try again.' }); }
};
