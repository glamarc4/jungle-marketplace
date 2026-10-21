
import { test, expect } from '@playwright/test'

test('colecionador compra um NFT e recebe a confirmação', async ({ page }) => {
  // Usuário novo para evitar conflito com cadastros anteriores.
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

  // 7. Confirmação do pedido.
  await page.getByRole('button', {
    name: 'Confirmar compra',
  }).click()

  await expect(page).toHaveURL(
    /\/pedido\/confirmacao.*orderId=DEMO-/,
    { timeout: 15_000 },
  )

  // A confirmação deve apresentar o identificador do pedido.
  await expect(page.locator('body')).toContainText(/DEMO-/)
})
