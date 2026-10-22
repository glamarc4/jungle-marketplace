
import { test, expect } from '@playwright/test'
import { wei, displayWei } from './money'

test('colecionador cria um pedido pendente e recupera a confirmação', async ({ page }) => {
  const unique = crypto.randomUUID().slice(0, 8)
  const email = `checkout-${unique}@example.test`
  const username = `collector_${unique}`
  const walletAddress = `0x${'a'.repeat(40)}`

  // 1. Catálogo → detalhe do NFT.
  await page.goto('/')

  await expect(
    page.getByText('Emerald Ape', { exact: false }).first(),
  ).toBeVisible()

  await page.getByText('Emerald Ape', { exact: false }).first().click()

  await expect(page).toHaveURL(/\/nft\//)

  // 2. Detalhe → carrinho.
  await page.getByRole('button', { name: 'COMPRAR' }).click()

  await expect(page).toHaveURL(/\/carrinho/)

  await expect(
    page.getByRole('region', { name: 'Itens do carrinho' }),
  ).toContainText('Emerald Ape')

  // 3. Carrinho → autenticação.
  await page.getByRole('button', {
    name: 'Conectar e finalizar',
  }).click()

  await expect(page).toHaveURL(/\/entrar/)

  // 4. Cadastro preservando o destino /checkout.
  await page.getByRole('dialog').getByRole('link', {
    name: 'Criar conta',
  }).click()

  await expect(page).toHaveURL(/\/cadastro/)

  const dialog = page.getByRole('dialog')

  await dialog.getByRole('textbox', {
    name: 'Nome de usuário',
  }).fill(username)

  await dialog.getByRole('textbox', {
    name: 'E-mail',
  }).fill(email)

  await dialog.getByLabel('Senha', { exact: true }).fill('KurioTest123!')
  await dialog.getByLabel('Confirmar senha').fill('KurioTest123!')

  await dialog.getByRole('button', {
    name: 'Criar conta',
  }).click()

  // 5. Cadastro → checkout.
  await expect(page).toHaveURL(/\/checkout/)

  await expect(
    page.getByRole('heading', { name: 'Perfil do colecionador' }),
  ).toBeVisible()

  // 6. Preenchimento do checkout.
  await page.locator('#collector-display').fill('Colecionador E2E')
  await page.locator('#collector-username').fill(username)
  await page.locator('#collector-network').selectOption('ethereum')
  await page.locator('#collector-profile').fill('Kurio E2E')
  await page.locator('#collector-wallet').fill(walletAddress)
  await page.locator('#collector-wallet-type').selectOption('metamask')
  await page.locator('#collector-referral').fill('E2ETEST')
  await page.locator('#collector-email').fill(email)

  await page.getByRole('radio', { name: 'MetaMask' }).check()

  // 7. Criação do pedido.
  let posts = 0

  page.on('request', (request) => {
    if (
      new URL(request.url()).pathname === '/api/orders' &&
      request.method() === 'POST'
    ) {
      posts++
    }
  })

  const createdResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/orders' &&
      response.request().method() === 'POST',
  )

  await page.getByRole('button', {
    name: 'Confirmar compra',
  }).click()

  const response = await createdResponse

  expect(response.fromServiceWorker()).toBe(true)
  expect(response.status()).toBe(201)

  const order = await response.json()

  // O pedido começa pendente. Não há confirmação automática.
  expect(order.status).toBe('pending')
  expect(order.items.length).toBeGreaterThan(0)

  expect(wei(order.totalEth)).toBe(
    wei(order.subtotalEth) -
      wei(order.discountEth) +
      wei(order.networkFeeEth),
  )

  await expect(page).toHaveURL(
    /\/pedido\/confirmacao.*orderId=DEMO-/,
    { timeout: 15_000 },
  )

  // 8. Modal mostra o estado real do pedido.
  const receipt = page.getByRole('dialog')

  await expect(receipt).toContainText(order.orderId)
  await expect(receipt).toContainText('Pagamento pendente')
  await expect(receipt).toContainText('aguarda a confirmação do pagamento')
  await expect(receipt).toContainText(walletAddress)

  const eth = (value: string, digits = 2) =>
    displayWei(wei(value), digits)

  for (const item of order.items) {
    await expect(receipt).toContainText(item.name)
    await expect(receipt).toContainText(`(x ${item.quantity})`)

    await expect(receipt).toContainText(
      displayWei(wei(item.unitPriceEth) * BigInt(item.quantity)),
    )
  }

  for (const amount of [
    eth(order.subtotalEth),
    eth(order.discountEth),
    eth(order.networkFeeEth, 3),
    eth(order.totalEth, 3),
  ]) {
    await expect(receipt).toContainText(amount)
  }

  // 9. Refresh recupera o mesmo pedido sem criar outro.
  const recoveredResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/orders/${order.orderId}` &&
      response.request().method() === 'GET',
  )

  await page.reload()

  const recovered = await recoveredResponse

  expect(recovered.fromServiceWorker()).toBe(true)
  expect(await recovered.json()).toEqual(order)

  await expect(receipt).toContainText(order.orderId)

  expect(
    posts,
    'Refresh da confirmação não pode criar outro pedido',
  ).toBe(1)

  // 10. Pedido pendente não deve esvaziar o carrinho.
  await page.getByRole('button', {
    name: 'Fechar confirmação',
  }).click()

  await page.goto('/carrinho')

  await expect(
    page.getByRole('region', { name: 'Itens do carrinho' }),
  ).toContainText('Emerald Ape')
})
