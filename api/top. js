const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = async (cmds) => (await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmds) })).json();
module.exports = async (req, res) => {
  const z = (await redis([['ZRANGE', 'scores', '0', '9', 'REV', 'WITHSCORES']]))[0].result || [];
  const ids = [], sc = [];
  for (let i = 0; i < z.length; i += 2) { ids.push(z[i]); sc.push(Number(z[i + 1])); }
  let names = [];
  if (ids.length) names = (await redis([['HMGET', 'names', ...ids]]))[0].result || [];
  res.setHeader('Cache-Control', 's-maxage=10');
  res.status(200).json(ids.map((id, i) => ({ name: names[i] || 'Ninja', score: sc[i] })));
};
