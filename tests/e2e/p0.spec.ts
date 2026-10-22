
import { test, expect, type Page } from '@playwright/test'

const email = 'p0@example.test'
const password = 'JungleTest123!'

function favoriteButton(page: Page) {
  return page
    .getByRole('button', {
      name: /^(Favoritar|Favoritado|Adicionar NFT aos favoritos|Remover NFT dos favoritos)$/,
    })
    .filter({ visible: true })
}

function catalogSearch(page: Page) {
  return page
    .getByRole('searchbox', {
      name: /^(Buscar no catálogo|Explorar coleções)$/,
    })
    .filter({ visible: true })
}

async function openCatalogFilters(page: Page) {
  const button = page.getByRole('button', {
    name: 'Abrir filtros do catálogo',
    exact: true,
  })

  if (await button.isVisible()) {
    await button.click()

    await expect(
      page.getByRole('button', {
        name: 'Fechar filtros do catálogo',
        exact: true,
      }),
    ).toBeVisible()
  }
}

function catalogFilterButton(page: Page, name: RegExp) {
  return page
    .getByRole('button', { name })
    .filter({ visible: true })
}

async function register(page: Page) {
  await page.goto('/cadastro')

  const dialog = page.getByRole('dialog')

  await dialog
    .getByLabel('Nome de usuário')
    .fill('p0_user')

  await dialog
    .getByLabel('E-mail', { exact: true })
    .fill(email)

  await dialog
    .getByLabel('Senha', { exact: true })
    .fill(password)

  await dialog
    .getByLabel('Confirmar senha', { exact: true })
    .fill(password)

  await dialog
    .getByRole('button', {
      name: 'Criar conta',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL(/\/perfil$/)
}

// G02 — Sessão expirada e retomada após autenticação.
//
// Usamos navegação direta para a rota protegida após
// avançar o relógio. Isso evita depender de um link
// que pode ser recriado quando a sessão expira.

for (const route of ['/perfil', '/carteiras']) {
  test(
    `G02 sessão expirada protege ${route} e retoma após login`,
    async ({ page }) => {
      await page.clock.setFixedTime(
        new Date('2026-10-22T12:00:00Z'),
      )

      await register(page)

      if (route === '/perfil') {
        await page
          .getByRole('link', {
            name: 'Carteiras',
            exact: true,
          })
          .click()

        await expect(page).toHaveURL(/\/carteiras$/)
      }

      await page.clock.setFixedTime(
        new Date('2026-10-22T12:31:00Z'),
      )

      // Recarrega a rota protegida para validar a
      // sessão expirada sem depender de um link instável.
      await page.goto(route)

      await expect(page).toHaveURL(/\/entrar/)

      expect(
        new URL(page.url()).searchParams.get('redirect'),
      ).toBe(route)

      const dialog = page.getByRole('dialog')

      await dialog
        .getByLabel('E-mail', { exact: true })
        .fill(email)

      await dialog
        .getByLabel('Senha', { exact: true })
        .fill(password)

      await dialog
        .getByRole('button', {
          name: 'Entrar',
          exact: true,
        })
        .click()

      await expect(page).toHaveURL(
        new RegExp(`${route}$`),
      )
    },
  )
}

// G03 — Falha de persistência, rollback otimista
// e nova tentativa após recuperação.
//
// A falha é produzida pelo armazenamento real usado
// pelo MSW, sem interceptar a rota da API.

test(
  'G03 favorito falho faz rollback e nova tentativa persiste via MSW',
  async ({ page }) => {
    await register(page)

    await page.goto('/nft/042')

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const raw = localStorage.getItem(
            'kurio:api:v1',
          )

          if (!raw) return null

          return JSON.parse(raw).session?.userId
        }),
      )
      .toBeTruthy()

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'false')

    // Simula falha de quota na persistência do MSW.
    await page.evaluate(() => {
      const original = Storage.prototype.setItem

      Storage.prototype.setItem = function (
        key,
        value,
      ) {
        if (key === 'kurio:api:v1') {
          throw new DOMException(
            'Quota test',
            'QuotaExceededError',
          )
        }

        original.call(this, key, value)
      }
    })

    const failed = page.waitForResponse(
      (response) =>
        response.url().endsWith(
          '/api/favorites/042',
        ) &&
        response.request().method() === 'PUT',
    )

    await favoriteButton(page).click()

    const response = await failed

    expect(response.fromServiceWorker()).toBe(true)
    expect(response.status()).toBe(503)

    // A interface deve desfazer o favorito otimista.
    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'false')

    await expect(
      page.getByRole('alert'),
    ).toBeVisible()

    // Recarregar restaura o Storage.prototype.setItem
    // e permite testar a recuperação real.
    await page.reload()

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'false')

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(
          '/api/favorites/042',
        ) &&
        response.request().method() === 'PUT',
    )

    await favoriteButton(page).click()

    const savedResponse = await saved

    expect(savedResponse.fromServiceWorker()).toBe(true)
    expect(savedResponse.status()).toBe(200)

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'true')

    await page.reload()

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'true')
  },
)

// G01 — URL como fonte da verdade para busca,
// filtros, ordenação, paginação e histórico.

test(
  'G01 parâmetros completos restauram UI e resultados em voltar e avançar',
  async ({ page }) => {
    await page.goto('/')

    const results = page.locator(
      '[aria-label="Resultados do catálogo"]',
    )

    await expect(
      results.getByRole('link'),
    ).toHaveCount(9)

    await page
      .getByRole('button', {
        name: 'Próxima página',
        exact: true,
      })
      .click()

    await expect(
      page.getByRole('button', {
        name: 'Ir para página 2',
        exact: true,
      }),
    ).toHaveAttribute('aria-current', 'page')

    const pageTwo = page.url()

    const names = await results
      .getByRole('link')
      .allTextContents()

    // No mobile, os filtros ficam em um painel.
    // No desktop, já estão disponíveis na sidebar.
    await openCatalogFilters(page)

    await catalogFilterButton(
      page,
      /^Arte digital \(/,
    ).click()

    await catalogFilterButton(
      page,
      /^Ethereum \(/,
    ).click()

    await page
      .getByRole('combobox', {
        name: /Ordenar/,
      })
      .selectOption('price-desc')

    await catalogSearch(page).fill('Emerald')

    await expect(
      results.getByRole('link'),
    ).toHaveCount(1)

    const selected = page.url()
    const params = new URL(selected).searchParams

    expect(params.get('collection')).toBe(
      'Arte digital',
    )

    expect(params.get('network')).toBe(
      'Ethereum',
    )

    expect(params.get('sort')).toBe(
      'price-desc',
    )

    expect(params.get('search')).toBe(
      'Emerald',
    )

    expect(params.get('page') ?? '1').toBe('1')

    await page.reload()

    await expect(
      catalogSearch(page),
    ).toHaveValue('Emerald')

    await expect(
      page.getByRole('combobox', {
        name: /Ordenar/,
      }),
    ).toHaveValue('price-desc')

    // Retorna pelas quatro mudanças de URL:
    // coleção, rede, ordenação e busca.
    for (let i = 0; i < 4; i++) {
      await page.goBack()
    }

    await expect(page).toHaveURL(pageTwo)

    await expect(
      page.getByRole('button', {
        name: 'Ir para página 2',
        exact: true,
      }),
    ).toHaveAttribute('aria-current', 'page')

    await expect
      .poll(() =>
        results.getByRole('link').allTextContents(),
      )
      .toEqual(names)

    // Refaz as quatro mudanças pelo histórico.
    for (let i = 0; i < 4; i++) {
      await page.goForward()
    }

    await expect(page).toHaveURL(selected)

    await expect(
      catalogSearch(page),
    ).toHaveValue('Emerald')

    await expect(
      results.getByRole('link'),
    ).toHaveCount(1)
  },
)
