import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'
import { setupServer } from 'msw/node'
class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
}
globalThis.localStorage = new MemoryStorage()
globalThis.location = new URL('http://localhost')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
const { handlers } = await vite.ssrLoadModule('/src/mocks/handlers/index.ts')
const { integerToEth, ethToInteger, toMoneyTransport, fromMoneyTransport } = await vite.ssrLoadModule('/src/domain/money-transport.ts')
const server = setupServer(...handlers)
server.listen({ onUnhandledFrame: 'error' })
async function api(path, method = 'GET', body, owner) {
  const response = await fetch(`http://localhost/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(owner ? { 'X-Account-Id': owner } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
  return { status: response.status, data: await response.json() }
}
const credentials = email => ({ email, username: 'collector', password: 'JungleTest123!' })
try {
  await test('G03 favoritos: armazenamento por conta, logout, retorno e mutation da sessão antiga', async () => {
    localStorage.setItem('kurio:favorite:042', 'true')
    assert.equal((await api('/favorites')).status, 401)
    const a = (await api('/auth/register', 'POST', credentials('a@example.test'))).data
    assert.deepEqual((await api('/favorites', 'GET', undefined, a.userId)).data, [])
    assert.deepEqual((await api('/favorites/042', 'PUT', undefined, a.userId)).data, ['042'])
    await api('/auth/logout', 'POST')
    assert.equal((await api('/favorites', 'GET', undefined, a.userId)).status, 401)
    const b = (await api('/auth/register', 'POST', credentials('b@example.test'))).data
    assert.deepEqual((await api('/favorites', 'GET', undefined, b.userId)).data, [])
    assert.equal((await api('/favorites/042', 'PUT', undefined, a.userId)).status, 401)
    assert.equal((await api('/favorites/042', 'DELETE', undefined, a.userId)).status, 401)
    assert.deepEqual((await api('/favorites', 'GET', undefined, b.userId)).data, [])
    await api('/auth/login', 'POST', credentials('a@example.test'))
    assert.deepEqual((await api('/favorites', 'GET', undefined, a.userId)).data, ['042'])
    assert.deepEqual((await api('/favorites/042', 'DELETE', undefined, a.userId)).data, [])
    assert.deepEqual(JSON.parse(localStorage.getItem('kurio:api:v1')).accounts[a.userId].favorites, [])
  })
  await test('G02 API rejeita perfil e carteiras sem sessão e com sessão expirada', async () => {
    const savedNow = Date.now
    Date.now = () => savedNow() + 31 * 60 * 1000
    try {
      assert.equal((await api('/auth/me')).data, null)
      for (const [path, method] of [['/profile', 'GET'], ['/profile', 'PATCH'], ['/wallets', 'GET'], ['/wallets', 'POST'], ['/wallets/missing', 'PATCH'], ['/wallets/missing', 'DELETE']]) {
        assert.equal((await api(path, method, method === 'GET' ? undefined : {})).status, 401)
      }
    } finally { Date.now = savedNow }
    await api('/auth/logout', 'POST')
    assert.equal((await api('/profile')).status, 401)
    assert.equal((await api('/wallets')).status, 401)
  })
  await test('G04 REST usa ETH decimal em catálogo, filtros, itens e totais; escala exata', async () => {
    const catalog = await api('/nfts?minPriceEth=1&maxPriceEth=2.2&collection=Arte%20digital&network=Polygon&sort=price-desc')
    assert.equal(catalog.status, 200)
    assert.deepEqual(catalog.data.items.map(nft => nft.priceEth), ['2.15', '1.69'])
    assert.ok(catalog.data.items.every(nft => !('priceCents' in nft)))
    assert.equal((await api('/nfts?minPriceEth=0.001')).status, 400)
    const cart = (await api('/cart')).data
    assert.equal(cart.items[0].unitPriceEth, '1.19')
    assert.equal(cart.networkFeeEth, '0.016')
    assert.equal(cart.subtotalEth, '26.83')
    assert.equal(cart.totalEth, '26.846')
    assert.ok(!('totalMicroEth' in cart))
    assert.deepEqual(toMoneyTransport(fromMoneyTransport(cart)), cart)
  })
  await test('G04 codecs preservam limites e rejeitam perda de precisão ou floats', () => {
    for (const value of [0, 1, 10, 100000, 1190000, 16000, Number.MAX_SAFE_INTEGER]) {
      assert.equal(ethToInteger(integerToEth(value)), value)
    }
    assert.equal(integerToEth(1), '0.000001')
    assert.equal(ethToInteger('1.190000000000000000'), 1190000)
    for (const value of [1.19, '1e-6', '-1', 'NaN', '0.0000001', '9007199254.740992']) assert.throws(() => ethToInteger(value))
    assert.throws(() => integerToEth(0.1))
  })
} finally { server.close(); await vite.close() }
