
import { test, expect } from '@playwright/test'

test('página inicial carrega e apresenta o catálogo', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('body')).toBeVisible()

  await expect(
    page.getByText('Emerald Ape', { exact: false }).first(),
  ).toBeVisible()
})

test('página de NFT inexistente não quebra a aplicação', async ({ page }) => {
  await page.goto('/nft/nao-existe')

  await expect(page.locator('body')).toBeVisible()

  await expect(page.locator('body')).not.toContainText(
    'Internal Server Error',
  )
})

test('acesso direto ao checkout exige autenticação', async ({ page }) => {
  await page.goto('/checkout')

  await expect(page).toHaveURL(/\/entrar/)
})

test('recarregar a página inicial mantém a aplicação funcional', async ({ page }) => {
  await page.goto('/')
  await page.reload()

  await expect(page.locator('body')).toBeVisible()

  await expect(
    page.getByText('Emerald Ape', { exact: false }).first(),
  ).toBeVisible()
})
