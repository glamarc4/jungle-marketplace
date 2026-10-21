import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRoute, createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router'

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}
globalThis.localStorage = new MemoryStorage()
globalThis.location = new URL('http://localhost')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
const { handlers } = await vite.ssrLoadModule('/src/mocks/handlers/index.ts')
const { cartSignature } = await vite.ssrLoadModule('/src/domain/api.ts')
const { client } = await vite.ssrLoadModule('/src/api/client.ts')
const { nftsApi } = await vite.ssrLoadModule('/src/api/nfts.ts')
const { cartApi } = await vite.ssrLoadModule('/src/api/cart.ts')
const { authApi } = await vite.ssrLoadModule('/src/api/auth.ts')
const { profileApi } = await vite.ssrLoadModule('/src/api/profile.ts')
const { walletsApi } = await vite.ssrLoadModule('/src/api/wallets.ts')
const { ordersApi } = await vite.ssrLoadModule('/src/api/orders.ts')
client.defaults.baseURL = 'http://localhost/api'
const server = setupServer(...handlers)
server.listen({ onUnhandledFrame: 'error' })
const fails = (promise, status) => assert.rejects(promise, error => error.response?.status === status)
const wallet = { displayName: 'Colecionador', nickname: 'Principal', network: 'ethereum', profileName: 'Coleção', address: '0x' + '1'.repeat(40), secondaryAddress: '', walletType: 'coinbase', referralCode: 'DEMO', email: 'teste@example.test', ens: 'colecionador', primary: true }
const credentials = { email: 'teste@example.test', username: 'colecionador', password: 'TesteDemo123!' }
let confirmedOrder
let confirmedInput
const collector = { displayName: 'Colecionador', username: 'colecionador', network: 'ethereum', profileName: 'Coleção', walletAddress: wallet.address, secondaryWallet: '', walletType: 'coinbase', referralCode: 'DEMO', email: credentials.email, ensName: '', ensExtension: '.eth', useAnotherWallet: false, notes: '' }
try {
  await test('catálogo: preserva 24 NFTs, paginação, busca, filtros, ordenação e detalhes', async () => {
    const all = await nftsApi.list({ pageSize: 100 })
    assert.equal(all.total, 24)
    assert.equal((await nftsApi.list({ page: 2 })).items.length, 9)
    assert.equal((await nftsApi.list({ search: 'Emerald Ape' })).items[0].id, '042')
    const filtered = await nftsApi.list({ network: 'Polygon', collection: 'Arte digital', minPrice: 100, maxPrice: 220, sort: 'price-desc' })
    assert.deepEqual(filtered.items.map(nft => nft.priceCents), [215, 169])
    assert.equal(filtered.facets.networks.Polygon, 8)
    for (const nft of all.items) assert.equal((await nftsApi.detail(nft.id)).title, nft.name)
    assert.equal((await nftsApi.detail('42')).id, '042')
    assert.equal((await nftsApi.detail('160')).id, '166')
    await fails(nftsApi.detail('missing'), 404)
    await fails(nftsApi.list({ page: 0 }), 400)
  })
  await test('carrinho: aliases não duplicam linhas, quantidade, remoção e limites', async () => {
    const before = await cartApi.get()
    const added = await cartApi.add({ nftId: '42', edition: '1/50', quantity: 1 })
    assert.equal(added.items.length, before.items.length)
    assert.equal(added.items[0].quantity, 3)
    const updated = await cartApi.update({ key: '042:1/50', quantity: 4 })
    assert.equal(updated.items[0].quantity, 4)
    for (const quantity of [0, -1, 1.5, 100]) await fails(cartApi.update({ key: '042:1/50', quantity }), 400)
    await fails(cartApi.add({ nftId: '042', edition: '1/50', quantity: 99 }), 400)
    await fails(cartApi.add({ nftId: 'missing', edition: '1/50', quantity: 1 }), 400)
    await fails(cartApi.add({ nftId: '042', edition: 'invalid', quantity: 1 }), 400)
    await fails(cartApi.remove('missing'), 404)
    await cartApi.remove('088:1/50')
    assert.equal((await cartApi.get()).items.length, 2)
  })
  await test('totais exatos e cupom persistem: subtotal 13.10, desconto 1.31, taxa 0.016, total 11.806 ETH', async () => {
    const cart = await cartApi.coupon('kurio10')
    assert.equal(cart.subtotalMicroEth, 13_100_000)
    assert.equal(cart.discountMicroEth, 1_310_000)
    assert.equal(cart.networkFeeMicroEth, 16_000)
    assert.equal(cart.totalMicroEth, 11_806_000)
    await fails(cartApi.coupon('bad'), 400)
    assert.deepEqual(await cartApi.get(), cart)
    const persisted = localStorage.getItem('kurio:api:v1')
    globalThis.localStorage = new MemoryStorage()
    localStorage.setItem('kurio:api:v1', persisted)
    assert.deepEqual(await cartApi.get(), cart)
  })
  await test('checkout exige sessão válida na API, sem alterar carrinho, pedidos ou idempotência', async () => {
    const cart = await cartApi.get()
    const input = { collector, selectedWallet: 'coinbase', cartSignature: cartSignature(cart), key: 'unauthorized' }
    const before = localStorage.getItem('kurio:api:v1')
    await fails(ordersApi.create(input), 401)
    await fails(client.post('/orders', {}), 401)
    await fails(ordersApi.list(), 401)
    await fails(ordersApi.get('DEMO-missing'), 401)
    assert.equal(localStorage.getItem('kurio:api:v1'), before)
    assert.deepEqual(await cartApi.get(), cart)
    const forged = JSON.parse(before)
    forged.session = { userId: 'missing', email: 'missing@example.test' }
    localStorage.setItem('kurio:api:v1', JSON.stringify(forged))
    assert.equal(await authApi.me(), null)
    await fails(ordersApi.create(input), 401)
    assert.deepEqual(await cartApi.get(), cart)
    localStorage.setItem('kurio:api:v1', before)
  })
  await test('rota de checkout redireciona ao login mesmo com sessão antiga em cache', async () => {
    const { router: appRouter } = await vite.ssrLoadModule('/src/router/index.tsx')
    const { queryClient, keys } = await vite.ssrLoadModule('/src/api/query-client.ts')
    queryClient.setQueryData(keys.session, { userId: 'expired', email: 'expired@example.test' })
    // Exercise the actual route's guard. SSR redirects are not exposed as router.state.redirect.
    const guard = appRouter.routesByPath['/checkout'].options.beforeLoad
    await assert.rejects(guard({ location: { pathname: '/checkout', search: {} } }), error => {
      assert.equal(error.options.to, '/entrar')
      assert.deepEqual(error.options.search, { redirect: '/checkout' })
      return true
    })
    assert.equal(queryClient.getQueryData(keys.session), null)
    const { afterAuthDestination, validateAuthSearch } = await vite.ssrLoadModule('/src/router/auth.ts')
    assert.deepEqual(afterAuthDestination(validateAuthSearch({ redirect: '/checkout' })), { to: '/checkout' })
    assert.deepEqual(afterAuthDestination(validateAuthSearch({ redirect: 'https://example.com' })), { to: '/perfil' })
    queryClient.clear()
  })
  await test('cadastro, login válido/inválido, sessão persistente e logout sem senha em texto puro', async () => {
    const cartBeforeAuth = await cartApi.get()
    await fails(authApi.register({ ...credentials, password: 'short' }), 400)
    const session = await authApi.register(credentials)
    assert.equal(session.email, credentials.email)
    assert.deepEqual(await authApi.me(), session)
    assert.equal(localStorage.getItem('kurio:api:v1').includes(credentials.password), false)
    await fails(authApi.register(credentials), 409)
    await authApi.logout()
    assert.equal(await authApi.me(), null)
    await fails(authApi.login({ ...credentials, password: 'wrongpass' }), 401)
    assert.equal(await authApi.me(), null)
    assert.deepEqual(await authApi.login(credentials), session)
    assert.deepEqual(await cartApi.get(), cartBeforeAuth)
    const { router: appRouter } = await vite.ssrLoadModule('/src/router/index.tsx')
    const route = createRouter({ routeTree: appRouter.options.routeTree, history: createMemoryHistory({ initialEntries: ['/checkout'] }), isServer: true })
    await route.load()
    assert.equal(route.state.redirect, undefined)
    assert.ok(route.state.matches.some(match => match.routeId === '/checkout' && match.status === 'success'))
  })
  await test('perfil e troca de senha validada; dados persistidos, conflitos de e-mail', async () => {
    const profile = { displayName: 'Teste salvo', username: 'colecionador', email: credentials.email, ens: 'teste', ensSuffix: '.eth', walletNickname: 'Principal', avatar: '' }
    await profileApi.update(profile)
    assert.deepEqual(await profileApi.get(), profile)
    await fails(profileApi.update({ email: 'bad' }), 400)
    assert.deepEqual(await profileApi.get(), profile)
    await fails(profileApi.update({ currentPassword: 'wrongpass', newPassword: 'SenhaNova123!' }), 401)
    await profileApi.update({ currentPassword: credentials.password, newPassword: 'SenhaNova123!' })
    await authApi.logout()
    await fails(authApi.login(credentials), 401)
    await authApi.login({ ...credentials, password: 'SenhaNova123!' })
    assert.deepEqual(await profileApi.get(), profile)
  })
  await test('carteiras EVM/Solana: criar, editar, promover principal, remover e rejeitar inválidas', async () => {
    await fails(walletsApi.create({ ...wallet, address: '0x123' }), 400)
    const primary = await walletsApi.create(wallet)
    await fails(walletsApi.create(wallet), 409)
    const solana = await walletsApi.create({ ...wallet, primary: false, nickname: 'Solana', network: 'solana', address: '11111111111111111111111111111111' })
    await fails(walletsApi.create({ ...wallet, network: 'solana' }), 400)
    await fails(walletsApi.create({ ...wallet, network: 'solana', address: '1'.repeat(33) }), 400)
    assert.equal((await walletsApi.list()).length, 2)
    await walletsApi.update({ id: solana.id, primary: true })
    assert.equal((await walletsApi.list()).find(item => item.primary).id, solana.id)
    await walletsApi.remove(solana.id)
    assert.equal((await walletsApi.list()).find(item => item.primary).id, primary.id)
    await fails(walletsApi.remove('missing'), 404)
  })
  await test('checkout: rejeita carteira inválida, carrinho alterado e campos ausentes', async () => {
    const cart = await cartApi.get()
    const input = { collector, selectedWallet: 'coinbase', cartSignature: cartSignature(cart), key: 'invalid' }
    await fails(ordersApi.create({ ...input, collector: { ...collector, walletAddress: 'bad' } }), 400)
    await fails(ordersApi.create({ ...input, collector: { ...collector, email: '' } }), 400)
    await fails(ordersApi.create({ ...input, cartSignature: 'stale' }), 409)
    await fails(client.post('/orders', input), 400)
    assert.equal((await ordersApi.list()).length, 0)
    assert.deepEqual(await cartApi.get(), cart)
    const originalWrite = localStorage.setItem
    const persisted = localStorage.getItem('kurio:api:v1')
    try {
      localStorage.setItem = () => { throw new Error('QuotaExceededError') }
      await fails(ordersApi.create({ ...input, key: 'quota-order' }), 503)
    } finally { localStorage.setItem = originalWrite }
    assert.equal(localStorage.getItem('kurio:api:v1'), persisted)
    assert.deepEqual(await cartApi.get(), cart)
  })

  await test('checkout: bloqueia edição indisponível sem criar pedido ou limpar carrinho', async () => {
    const cartBefore = await cartApi.get()
    const ordersBefore = await ordersApi.list()
    const savedDatabase = localStorage.getItem('kurio:api:v1')

    assert.ok(
      cartBefore.items.some(item => item.nftId === '042' && item.edition === '1/50'),
      'O cenário precisa conter Emerald Ape #042, edição 1/50, no carrinho',
    )

    const database = JSON.parse(savedDatabase)

    const unavailableEvent = {
      protocol: 1,
      eventId: crypto.randomUUID(),
      type: 'nft:availability-changed',
      entityId: '042',
      version: (database.realtime?.nfts?.['042']?.version ?? 0) + 1,
      occurredAt: new Date().toISOString(),
      payload: {
        availability: {
          '1/1': true,
          '1/10': true,
          '1/50': false,
          ABERTA: true,
        },
      },
    }

    database.realtime ??= {
      nfts: {},
      capabilities: {},
      orderVersions: {},
      outbox: [],
    }

    database.realtime.nfts['042'] = unavailableEvent

    try {
      localStorage.setItem('kurio:api:v1', JSON.stringify(database))

      const currentCart = await cartApi.get()

      const input = {
        collector,
        selectedWallet: 'coinbase',
        cartSignature: cartSignature(currentCart),
        key: 'unavailable-edition-test',
      }

      await fails(ordersApi.create(input), 409)

      assert.deepEqual(
        await cartApi.get(),
        currentCart,
        'O carrinho não pode ser limpo após checkout rejeitado',
      )

      assert.deepEqual(
        await ordersApi.list(),
        ordersBefore,
        'Nenhum pedido deve ser criado',
      )
    } finally {
      // Restaura o estado anterior para não afetar os testes seguintes.
      localStorage.setItem('kurio:api:v1', savedDatabase)
    }

    assert.deepEqual(await cartApi.get(), cartBefore)
  })

  await test('pedido: snapshot financeiro correto, idempotência concorrente, conflito e limpeza atômica', async () => {
    const cart = await cartApi.get()
    const input = { collector, selectedWallet: 'coinbase', cartSignature: cartSignature(cart), key: 'test-order' }
    const [first, repeated] = await Promise.all([ordersApi.create(input), ordersApi.create(input)])
    confirmedOrder = first
    confirmedInput = input
    assert.deepEqual(first, repeated)
    assert.match(first.orderId, /^DEMO-/)
    assert.equal(first.status, 'demo-confirmed')
    assert.equal(first.totalMicroEth, 11_806_000)
    assert.equal(first.discountMicroEth, cart.discountMicroEth)
    assert.deepEqual(first.items, cart.items)
    assert.equal(first.walletAddress, wallet.address)
    assert.ok(!Number.isNaN(Date.parse(first.createdAt)))
    assert.deepEqual(await ordersApi.get(first.orderId), first)
    assert.equal((await ordersApi.list()).length, 1)
    assert.equal((await cartApi.get()).items.length, 0)
    assert.equal((await cartApi.get()).coupon, null)
    await fails(ordersApi.create({ ...input, collector: { ...collector, walletAddress: '0x' + '2'.repeat(40) } }), 409)
    await fails(ordersApi.create({ ...input, key: 'another' }), 400)
    assert.deepEqual(await ordersApi.create(input), first)
    await fails(ordersApi.get('missing'), 404)
  })
  await test('pedido e idempotência sobrevivem a uma reinicialização em outro processo, sem caches', () => {
    const result = spawnSync(process.execPath, ['tests/restart-orders.mjs'], {
      input: JSON.stringify({ database: localStorage.getItem('kurio:api:v1'), expected: confirmedOrder, input: confirmedInput }),
      encoding: 'utf8', timeout: 30_000,
    })
    assert.equal(result.status, 0, `${result.error ?? ''}\n${result.stdout}\n${result.stderr}`)
    assert.ok(result.stdout.includes('RESTART_ORDERS_OK'))
  })
  await test('logout impede replay e leitura do pedido; novo login recupera a confirmação por ID', async () => {
    await authApi.logout()
    const persisted = localStorage.getItem('kurio:api:v1')
    await fails(ordersApi.create(confirmedInput), 401)
    await fails(ordersApi.get(confirmedOrder.orderId), 401)
    assert.equal(localStorage.getItem('kurio:api:v1'), persisted)
    const { router: appRouter } = await vite.ssrLoadModule('/src/router/index.tsx')
    const guard = appRouter.routesByPath['/pedido/confirmacao'].options.beforeLoad
    const { afterAuthDestination } = await vite.ssrLoadModule('/src/router/auth.ts')
    await assert.rejects(guard({ location: { pathname: '/pedido/confirmacao', search: { orderId: confirmedOrder.orderId } } }), error => {
      assert.deepEqual(error.options.search, { redirect: '/pedido/confirmacao', orderId: confirmedOrder.orderId })
      assert.deepEqual(afterAuthDestination(error.options.search), { to: '/pedido/confirmacao', search: { orderId: confirmedOrder.orderId } })
      return true
    })
    await authApi.login({ ...credentials, password: 'SenhaNova123!' })
    assert.deepEqual(await ordersApi.get(confirmedOrder.orderId), confirmedOrder)
    assert.equal((await ordersApi.list()).length, 1)
  })
  await test('modal renderiza o pedido retornado: total, desconto, itens, endereço e aviso demo', async () => {
    const { OrderConfirmationModal } = await vite.ssrLoadModule('/src/components/checkout/OrderConfirmationModal.tsx')
    const html = renderToStaticMarkup(createElement(OrderConfirmationModal, { order: confirmedOrder, onClose() {} }))
    for (const text of [confirmedOrder.orderId, '11.806 ETH', '1.31 ETH', '13.10 ETH', '0.016 ETH', wallet.address, 'Emerald Ape #042', 'Violet Nomad #314', 'Pedido de demonstração confirmado']) assert.ok(html.includes(text), text)
  })
  await test('Header renderiza contador e sessão do cache compartilhado, inclusive após logout', async () => {
    const { Header } = await vite.ssrLoadModule('/src/components/layout/Header.tsx')
    const { keys } = await vite.ssrLoadModule('/src/api/query-client.ts')
    const query = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
    const root = createRootRoute({ component: Header })
    const home = createRoute({ getParentRoute: () => root, path: '/' })
    const router = createRouter({ routeTree: root.addChildren([home]), history: createMemoryHistory({ initialEntries: ['/'] }), isServer: true })
    query.setQueryData(keys.cart, { items: [{ quantity: 3 }, { quantity: 4 }] })
    query.setQueryData(keys.session, await authApi.me())
    await router.load()
    const render = () => renderToStaticMarkup(createElement(QueryClientProvider, { client: query }, createElement(RouterProvider, { router })))
    const signedIn = render()
    assert.ok(signedIn.includes('Abrir carrinho (7 itens)'))
    assert.ok(signedIn.includes('Perfil'))
    query.setQueryData(keys.session, null)
    const signedOut = render()
    assert.ok(signedOut.includes('Entrar'))
    assert.ok(!signedOut.includes('>Perfil<'))
    query.clear()
  })
  await test('isolamento de perfil, carteiras e pedidos entre contas; carrinho do navegador', async () => {
    await authApi.logout()
    await fails(ordersApi.list(), 401)
    await authApi.register({ email: 'outra@example.test', username: 'outro', password: 'TesteDemo123!' })
    assert.equal((await walletsApi.list()).length, 0)
    assert.equal((await profileApi.get()).username, 'outro')
    assert.equal((await ordersApi.list()).length, 0)
    await fails(ordersApi.get(confirmedOrder.orderId), 404)
    await authApi.login({ ...credentials, password: 'SenhaNova123!' })
    assert.equal((await ordersApi.list()).length, 1)
  })
  await test('quota: falha 503 sem sucesso falso nem perda dos dados já salvos', async () => {
    const before = await cartApi.get()
    const original = localStorage.setItem
    localStorage.setItem = () => { throw new Error('QuotaExceededError') }
    await fails(cartApi.add({ nftId: '042', edition: '1/50', quantity: 1 }), 503)
    localStorage.setItem = original
    assert.deepEqual(await cartApi.get(), before)
  })
  await test('migração: sessão demo, perfil e carrinho canônico preservados', async () => {
    localStorage.clear()
    localStorage.setItem('kurio:demo-session', JSON.stringify({ userId: 'legacy@example.test', email: 'legacy@example.test' }))
    localStorage.setItem('kurio:demo-profile:legacy@example.test', JSON.stringify({ displayName: 'Legado' }))
    localStorage.setItem('kurio:cart:v1', JSON.stringify([{ nftId: '42', edition: '1/50', quantity: 2 }, { nftId: '042', edition: '1/50', quantity: 3 }]))
    assert.equal((await authApi.me()).email, 'legacy@example.test')
    assert.equal((await profileApi.get()).displayName, 'Legado')
    const cart = await cartApi.get()
    assert.equal(cart.items.length, 1)
    assert.equal(cart.items[0].quantity, 5)
    assert.equal(cart.items[0].unitPriceMicroEth, 1_190_000)
    assert.equal(localStorage.getItem('kurio:demo-session'), null)
    await authApi.register({ email: 'legacy@example.test', username: 'legacy', password: 'SenhaLegado123!' })
    await authApi.logout()
    await authApi.login({ email: 'legacy@example.test', password: 'SenhaLegado123!' })
  })
  await test('aritmética rejeita preços imprecisos, overflow e quantidades inválidas', async () => {
    const { ethToMicroEth, formatMicroEth, calculateTotals } = await vite.ssrLoadModule('/src/domain/money.ts')
    assert.equal(ethToMicroEth('0.000001'), 1)
    assert.equal(formatMicroEth(16_000), '0.016 ETH')
    for (const value of ['1.2.3', '0.0000001', '-1', '9007199255']) assert.throws(() => ethToMicroEth(value))
    assert.throws(() => calculateTotals([{ unitPriceMicroEth: 10, quantity: 0 }]))
    assert.throws(() => calculateTotals([{ unitPriceMicroEth: Number.MAX_SAFE_INTEGER, quantity: 99 }]))
    assert.throws(() => calculateTotals([{ unitPriceMicroEth: 1, quantity: 1 }], 'KURIO10'))
  })
  await test('senha com espaços é preservada e migração permite definir credenciais após logout', async () => {
    await authApi.register({ email: 'espacos@example.test', username: 'espacos', password: ' SenhaTeste123! ' })
    await authApi.logout()
    await fails(authApi.login({ email: 'espacos@example.test', password: 'SenhaTeste123!' }), 401)
    await authApi.login({ email: 'espacos@example.test', password: ' SenhaTeste123! ' })
    localStorage.clear()
    localStorage.setItem('kurio:demo-session', JSON.stringify({ userId: 'migra@example.test', email: 'migra@example.test' }))
    await authApi.me()
    await authApi.logout()
    await authApi.register({ email: 'migra@example.test', username: 'migra', password: 'SenhaDemo123!' })
    assert.equal((await authApi.me()).userId, 'migra@example.test')
  })
  await test('JSON malformado e endpoint inexistente retornam erros REST', async () => {
    await fails(client.post('/auth/login', '{', { headers: { 'Content-Type': 'application/json' } }), 400)
    await fails(client.get('/unknown'), 404)
  })
} finally {
  server.close()
  await vite.close()
}
