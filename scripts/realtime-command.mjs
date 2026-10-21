const [action, nftId, edition, availability, type] = process.argv.slice(2)
if (!['set', 'duplicate', 'old', 'disconnect'].includes(action) || (action === 'set' && !['true', 'false'].includes(availability))) {
  throw new Error('Uso: npm run realtime:simulate -- set 042 "1/50" false [nft:updated] | duplicate 042 | old 042 | disconnect')
}
const url = process.env.REALTIME_URL ?? `http://127.0.0.1:${process.env.REALTIME_PORT ?? 3001}`
const response = await fetch(`${url}/dev/command`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, nftId, edition, available: availability === 'true', type }) })
console.log(await response.text())
if (!response.ok) process.exitCode = 1
