
import { test, expect, type Page } from '@playwright/test'

async function openEmeraldApe(page: Page) {
  await page.goto('/')

  const nft = page.getByText('Emerald Ape', {
    exact: false,
  }).first()

  await expect(nft).toBeVisible()
  await nft.click()

  await expect(page).toHaveURL(/\/nft\//)
}

async function prepareCart(page: Page) {
  await openEmeraldApe(page)

  await page.getByRole('button', {
    name: 'COMPRAR',
  }).click()

  await expect(page).toHaveURL(/\/carrinho/)

  await expect(
    page.getByRole('region', {
      name: 'Itens do carrinho',
    }),
  ).toContainText('Emerald Ape')
}

async function registerForCheckout(page: Page) {
  await page.getByRole('button', {
    name: 'Conectar e finalizar',
  }).click()

  await expect(page).toHaveURL(/\/entrar/)

  await page.getByRole('dialog').getByRole('link', {
    name: 'Criar conta',
  }).click()

  const dialog = page.getByRole('dialog')

  const unique = crypto.randomUUID().slice(0, 8)
  const username = `visual_${unique}`
  const email = `visual-${unique}@example.test`

  await dialog.getByRole('textbox', {
    name: 'Nome de usuário',
  }).fill(username)

  await dialog.getByRole('textbox', {
    name: 'E-mail',
  }).fill(email)

  await dialog.getByLabel('Senha', {
    exact: true,
  }).fill('KurioTest123!')

  await dialog.getByLabel('Confirmar senha')
    .fill('KurioTest123!')

  await dialog.getByRole('button', {
    name: 'Criar conta',
  }).click()

  await expect(page).toHaveURL(/\/checkout/)

  await expect(
    page.getByRole('heading', {
      name: 'Perfil do colecionador',
    }),
  ).toBeVisible()
}

test('visual: página inicial', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByText('Emerald Ape', {
      exact: false,
    }).first(),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('home.png', {
    animations: 'disabled',
    caret: 'hide',
  })
})

test('visual: detalhe do NFT', async ({ page }) => {
  await openEmeraldApe(page)

  await expect(page).toHaveScreenshot('nft-detail.png', {
    animations: 'disabled',
    caret: 'hide',
  })
})

test('visual: carrinho', async ({ page }) => {
  await prepareCart(page)

  await expect(page).toHaveScreenshot('cart.png', {
    animations: 'disabled',
    caret: 'hide',
  })
})



test('visual: checkout', async ({ page }) => {
  await prepareCart(page)
  await registerForCheckout(page)

  await expect(page).toHaveScreenshot('checkout.png', {
    animations: 'disabled',
    caret: 'hide',
    mask: [
      page.locator('#collector-display'),
      page.locator('#collector-username'),
      page.locator('#collector-email'),
    ],
    maskColor: '#FF00FF',
  })
})


