const crypto = require('crypto');
const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = async (cmds) => (await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmds) })).json();
function verify(initData) {
  if (!initData) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash'); p.delete('hash');
  const str = [...p.entries()].map(([a, b]) => a + '=' + b).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
  if (crypto.createHmac('sha256', secret).update(str).digest('hex') !== hash) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 86400) return null;
  try { return JSON.parse(p.get('user')); } catch (e) { return null; }
}
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { initData, score } = req.body || {};
  const u = verify(initData);
  if (!u) return res.status(401).json({ error: 'auth' });
  const s = Math.floor(Number(score));
  if (!(s > 0 && s < 100000)) return res.status(400).json({ error: 'score' });
  await redis([
    ['ZADD', 'scores', 'GT', String(s), String(u.id)],
    ['HSET', 'names', String(u.id), String(u.first_name || 'Ninja').slice(0, 12)]
  ]);
  res.status(200).json({ ok: true });
};
