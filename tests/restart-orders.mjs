// Run in a fresh process: only the serialized localStorage survives.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { setupServer } from 'msw/node'
import { QueryClient } from '@tanstack/react-query'

let source = ''
for await (const chunk of process.stdin) source += chunk
const { database, expected, input } = JSON.parse(source)
const storage = new Map([['kurio:api:v1', database]])
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => { storage.set(key, String(value)) },
  removeItem: key => { storage.delete(key) },
}
globalThis.location = new URL('http://localhost')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
const { handlers } = await vite.ssrLoadModule('/src/mocks/handlers/index.ts')
const { client } = await vite.ssrLoadModule('/src/api/client.ts')
const { ordersApi } = await vite.ssrLoadModule('/src/api/orders.ts')
const { cartApi } = await vite.ssrLoadModule('/src/api/cart.ts')
client.defaults.baseURL = 'http://localhost/api'
const server = setupServer(...handlers)
server.listen({ onUnhandledFrame: 'error' })
const query = new QueryClient()
try {
  assert.equal(query.getQueryCache().getAll().length, 0)
  const recovered = await query.fetchQuery({ queryKey: ['recovered-order', expected.orderId], queryFn: () => ordersApi.get(expected.orderId) })
  assert.deepEqual(recovered, expected)
  assert.deepEqual(await ordersApi.list(), [expected])
  // Recovery performs GET only and does not write/recreate any order.
  assert.equal(localStorage.getItem('kurio:api:v1'), database)
  assert.equal((await cartApi.get()).items.length, 0)
  assert.equal(recovered.subtotalMicroEth, 13_100_000)
  assert.equal(recovered.discountMicroEth, 1_310_000)
  assert.equal(recovered.networkFeeMicroEth, 16_000)
  assert.equal(recovered.totalMicroEth, 11_806_000)
  // Replaying a historical submission must also preserve a new cart.
  const nextCart = await cartApi.add({ nftId: '042', edition: '1/50', quantity: 1 })
  assert.deepEqual(await ordersApi.create(input), expected)
  assert.deepEqual(await ordersApi.list(), [expected])
  assert.deepEqual(await cartApi.get(), nextCart)
  process.stdout.write('RESTART_ORDERS_OK\n')
} finally {
  query.clear()
  server.close()
  await vite.close()
}
