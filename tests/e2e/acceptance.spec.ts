
import { test, expect, type Page, type Response } from '@playwright/test'
import { wei } from './money'

// Source: complete Jungle Gaming challenge supplied by the user.
// Each test gets a fresh Playwright browser context.
// REST assertions observe real UI requests handled by MSW.
// No route.fulfill or direct mutation of application caches.

const password = 'JungleTest123!'
const runId = crypto.randomUUID().slice(0, 8)
const email = `audit-a-${runId}@example.test`

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

function favoriteButton(page: Page) {
  return page
    .getByRole('button', {
      name: /^(Favoritar|Favoritado|Adicionar NFT aos favoritos|Remover NFT dos favoritos)$/,
    })
    .filter({ visible: true })
}

function visibleQuantity(page: Page, quantity: number) {
  return page
    .getByLabel(`Quantidade: ${quantity}`, { exact: true })
    .filter({ visible: true })
}

function cartQuantity(page: Page, itemName: string) {
  return page
    .getByRole('region', { name: 'Itens do carrinho' })
    .getByLabel(`Quantidade de ${itemName}`, { exact: true })
    .locator('output')
    .filter({ visible: true })
}

function couponInput(page: Page) {
  return page
    .getByRole('textbox', {
      name: 'Código promocional',
      exact: true,
    })
    .filter({ visible: true })
}

function applyCouponButton(page: Page) {
  return page
    .getByRole('button', {
      name: 'Aplicar',
      exact: true,
    })
    .filter({ visible: true })
}

function visibleCartText(page: Page, text: string) {
  return page
    .getByText(text, { exact: false })
    .filter({ visible: true })
    .first()
}

function responseFor(page: Page, path: string, method = 'GET') {
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api${path}` &&
      response.request().method() === method,
  )
}

async function fromMsw(response: Response, status = 200) {
  expect(response.fromServiceWorker()).toBe(true)
  expect(response.status()).toBe(status)

  return response.json()
}

async function register(
  page: Page,
  address?: string,
  username?: string,
) {
  const unique = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

  address ??= `audit-a-${unique}@example.test`
  username ??= `audit_a_${unique}`
  await page.goto('/cadastro')

  const dialog = page.getByRole('dialog')

  await dialog.getByLabel('Nome de usuário').fill(username)
  await dialog.getByLabel('E-mail', { exact: true }).fill(address)
  await dialog.getByLabel('Senha', { exact: true }).fill(password)
  await dialog.getByLabel('Confirmar senha', { exact: true }).fill(password)

  const response = responseFor(page, '/auth/register', 'POST')

  await dialog
    .getByRole('button', { name: 'Criar conta', exact: true })
    .click()

  await fromMsw(await response, 201)

  await expect(page).toHaveURL(/\/perfil$/)

  await expect(
    page.getByLabel('E-mail', { exact: false }).first(),
  ).toHaveValue(address)
}

async function logout(page: Page) {
  await page.goto('/perfil')

  const response = responseFor(page, '/auth/logout', 'POST')

  await page
    .getByRole('button', { name: 'Sair', exact: true })
    .click()

  await fromMsw(await response)

  await expect(page).toHaveURL(/\/$/)
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(
    new Date('2026-10-21T12:00:00Z'),
  )
})

test(
  'A01 catálogo combina filtros, ordena, pagina e reinicia a página',
  async ({ page }) => {
    await page.goto('/')

    const results = page.locator(
      '[aria-label="Resultados do catálogo"]',
    )

    await expect(results.getByRole('link')).toHaveCount(9)


    const next = page.waitForResponse((response) => {
      const url = new URL(response.url())

      return (
        url.pathname === '/api/nfts' &&
        url.searchParams.get('page') === '2' &&
        response.request().method() === 'GET'
      )
    })

    await page
      .getByRole('button', {
        name: 'Próxima página',
        exact: true,
      })
      .click()

    expect((await fromMsw(await next)).page).toBe(2)


    await expect(
      page.getByRole('button', {
        name: 'Ir para página 2',
        exact: true,
      }),
    ).toHaveAttribute('aria-current', 'page')

    await openCatalogFilters(page)

    const collection = responseFor(page, '/nfts')

    await catalogFilterButton(
      page,
      /^Arte digital \(/,
    ).click()

    const collectionResponse = await collection

    expect(
      new URL(collectionResponse.url()).searchParams.get('page'),
    ).toBe('1')

    expect(
      (await fromMsw(collectionResponse)).total,
    ).toBe(5)

    const network = responseFor(page, '/nfts')

    await catalogFilterButton(
      page,
      /^Ethereum \(/,
    ).click()

    const networkResponse = await network
    const params = new URL(networkResponse.url()).searchParams

    expect(params.get('collection')).toBe('Arte digital')
    expect(params.get('network')).toBe('Ethereum')

    expect(
      (await fromMsw(networkResponse)).total,
    ).toBe(3)

    const sorted = responseFor(page, '/nfts')

    await page
      .getByRole('combobox', { name: /Ordenar/ })
      .selectOption('price-desc')

    const sortedResponse = await sorted

    expect(
      new URL(sortedResponse.url()).searchParams.get('sort'),
    ).toBe('price-desc')

    const data = await fromMsw(sortedResponse)

    expect(
      data.items.map((item: { name: string }) => item.name),
    ).toEqual([
      'Jungle Pulse #724',
      'Golden Echo #301',
      'Emerald Ape #042',
    ])

    await expect(
      results.getByRole('heading'),
    ).toHaveText([
      'Jungle Pulse #724',
      'Golden Echo #301',
      'Emerald Ape #042',
    ])
  },
)

test(
  'A02 busca retorna vazio e permite recuperar os resultados',
  async ({ page }) => {
    await page.goto('/')

    const results = page.locator(
      '[aria-label="Resultados do catálogo"]',
    )

    await expect(
      results.getByRole('link'),
    ).toHaveCount(9)

    const empty = page.waitForResponse(response => {
      const url = new URL(response.url())

      return (
        url.pathname === '/api/nfts' &&
        url.searchParams.get('search') === 'sem-resultado-audit' &&
        response.request().method() === 'GET'
      )
    })

    await catalogSearch(page).fill('sem-resultado-audit')

    expect(
      (await fromMsw(await empty)).total,
    ).toBe(0)

    await expect(
      page.getByRole('heading', {
        name: 'Nenhum NFT encontrado',
      }),
    ).toBeVisible()

    const found = page.waitForResponse(response => {
  const url = new URL(response.url())

  return (
    url.pathname === '/api/nfts' &&
    url.searchParams.get('search') === 'Emerald Ape' &&
    response.request().method() === 'GET'
  )
})

    await catalogSearch(page).fill('Emerald Ape')

    expect(
      (await fromMsw(await found)).total,
    ).toBe(1)

    await expect(
      results.getByRole('link'),
    ).toHaveCount(1)

    await expect(results).toContainText(
      'Emerald Ape #042',
    )
  },
)

test(
  'A03 detalhe direto, galeria, quantidade mínima e NFT inexistente via MSW',
  async ({ page }) => {
    const detail = responseFor(page, '/nfts/042')

    await page.goto('/nft/042')

    await fromMsw(await detail)

    await expect(
      page.getByRole('heading', { level: 1 }).filter({
        visible: true,
      }),
    ).toContainText('Emerald Ape')

    await expect(
      page
        .getByRole('button', {
          name: 'Diminuir quantidade',
          exact: true,
        })
        .filter({ visible: true }),
    ).toBeDisabled()

    await page
      .getByRole('button', {
        name: 'Aumentar quantidade',
        exact: true,
      })
      .filter({ visible: true })
      .click()

    await expect(
      visibleQuantity(page, 2),
    ).toHaveText('2')

    const secondImage = page.getByRole('button', {
      name: /^Visualizar imagem 2/,
    })

    if (await secondImage.isVisible()) {
      await secondImage.click()

      await expect(secondImage).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    } else {
      // A galeria mobile utiliza outra interação.
      // Ainda precisamos validar essa interação específica.
      test.info().annotations.push({
        type: 'pending-mobile-gallery',
        description:
          'Identificar e testar o controle de navegação da galeria mobile.',
      })
    }

    const missing = responseFor(
      page,
      '/nfts/nao-existe',
    )

    await page.goto('/nft/nao-existe')

    expect(
      (await fromMsw(await missing, 404)).message,
    ).toBe('NFT não encontrado.')

    await expect(
      page.getByRole('alert'),
    ).toContainText('NFT não encontrado.')

    await expect(
      page.getByRole('button', {
        name: 'COMPRAR',
        exact: true,
      }),
    ).toHaveCount(0)

    await expect(
      page.getByRole('button', {
        name: 'Tentar novamente',
      }),
    ).toBeVisible()
  },
)


test(
  'A04 carrinho altera quantidade, rejeita cupom, aplica/remove desconto e persiste no cadastro',
  async ({ page }) => {
    const initial = responseFor(page, '/cart')

    await page.goto('/carrinho')

    const cart = await fromMsw(await initial)
    const item = cart.items[0]

    const updated = responseFor(
      page,
      `/cart/items/${encodeURIComponent(item.key)}`,
      'PATCH',
    )

    await page
      .getByRole('button', {
        name: `Aumentar quantidade de ${item.name}`,
        exact: true,
      })
      .filter({ visible: true })
      .click()

    const changed = await fromMsw(await updated)

    expect(changed.items[0].quantity).toBe(
      item.quantity + 1,
    )

    await expect(
      cartQuantity(page, item.name),
    ).toHaveText(String(item.quantity + 1))

    const invalid = responseFor(
      page,
      '/cart',
      'PATCH',
    )

    await couponInput(page).fill('INVALIDO')
    await applyCouponButton(page).click()

    await fromMsw(await invalid, 400)

    await expect(
      page.getByRole('alert'),
    ).toContainText('Cupom inválido')

    const coupon = responseFor(
      page,
      '/cart',
      'PATCH',
    )

    await couponInput(page).fill('KURIO10')
    await applyCouponButton(page).click()

    const discounted = await fromMsw(await coupon)

    expect(
      wei(discounted.discountEth),
    ).toBe(wei(discounted.subtotalEth) / 10n)

    expect(
      wei(discounted.totalEth),
    ).toBe(
      wei(discounted.subtotalEth) -
      wei(discounted.discountEth) +
      wei(discounted.networkFeeEth),
    )

    // Confirma o total apresentado na interface.
    await expect(
      visibleCartText(
        page,
        `${discounted.totalEth} ETH`,
      ),
    ).toBeVisible()

    // Verifica que quantidade e cupom sobrevivem ao reload.
    await page.reload()

    await expect(
      visibleCartText(page, 'Cupom KURIO10 aplicado'),
    ).toBeVisible()

    await expect(
      cartQuantity(page, item.name),
    ).toHaveText(String(item.quantity + 1))

    // Cria uma conta com o carrinho de visitante preenchido.
    await register(page)

    // Volta ao carrinho já autenticado.
    // Não lê respostas antigas descartadas pela navegação.
    await page.goto('/carrinho')

    // Confirma que o cadastro preservou o cupom.
    await expect(
      visibleCartText(page, 'Cupom KURIO10 aplicado'),
    ).toBeVisible()

    // Confirma que a quantidade foi preservada.
    await expect(
      cartQuantity(page, item.name),
    ).toHaveText(String(item.quantity + 1))

    // Confirma que o total com desconto foi preservado.
    await expect(
      visibleCartText(
        page,
        `${discounted.totalEth} ETH`,
      ),
    ).toBeVisible()

    // Remove o cupom e valida a resposta REST.
    const removedCoupon = responseFor(
      page,
      '/cart',
      'PATCH',
    )

    await couponInput(page).fill('')
    await applyCouponButton(page).click()

    expect(
      (await fromMsw(await removedCoupon)).discountEth,
    ).toBe('0')

    // Remove o NFT e valida a resposta REST.
    const removed = responseFor(
      page,
      `/cart/items/${encodeURIComponent(item.key)}`,
      'DELETE',
    )

    await page
      .getByRole('button', {
        name: `Remover ${item.name} do carrinho`,
        exact: true,
      })
      .click()

    expect(
      (await fromMsw(await removed)).items.some(
        (entry: { key: string }) =>
          entry.key === item.key,
      ),
    ).toBe(false)

    // Confirma que o NFT desapareceu da interface.
    await expect(
      page
        .getByRole('region', {
          name: 'Itens do carrinho',
        })
        .getByRole('heading', {
          name: item.name,
          exact: true,
        }),
    ).toHaveCount(0)
  },
)


test(
  'A05 login inválido, conflito de cadastro, logout e recuperação da sessão',
  async ({ page }) => {
    await register(page, email, `audit_a_${runId}`)
    await logout(page)

    await page.goto('/cadastro')

    const dialog = page.getByRole('dialog')

    await dialog
      .getByLabel('Nome de usuário')
      .fill('audit_conflict')

    await dialog
      .getByLabel('E-mail', { exact: true })
      .fill(email)

    await dialog
      .getByLabel('Senha', { exact: true })
      .fill(password)

    await dialog
      .getByLabel('Confirmar senha', { exact: true })
      .fill('Different123!')

    await dialog
      .getByRole('button', {
        name: 'Criar conta',
        exact: true,
      })
      .click()

    await expect(
      dialog.getByRole('status'),
    ).toHaveText('As senhas não coincidem.')

    await dialog
      .getByLabel('Confirmar senha', { exact: true })
      .fill(password)

    const conflict = responseFor(
      page,
      '/auth/register',
      'POST',
    )

    await dialog
      .getByRole('button', {
        name: 'Criar conta',
        exact: true,
      })
      .click()

    await fromMsw(await conflict, 409)

    await expect(
      dialog.getByRole('status'),
    ).toHaveText('Este e-mail já está cadastrado.')

    await page.goto(
      '/entrar?redirect=%2Fcheckout',
    )

    await dialog
      .getByLabel('E-mail', { exact: true })
      .fill(email)

    await dialog
      .getByLabel('Senha', { exact: true })
      .fill('Errada123!')

    const invalid = responseFor(
      page,
      '/auth/login',
      'POST',
    )

    await dialog
      .getByRole('button', {
        name: 'Entrar',
        exact: true,
      })
      .click()

    await fromMsw(await invalid, 401)

    await expect(
      dialog.getByRole('status'),
    ).toHaveText('E-mail ou senha inválidos.')

    await dialog
      .getByLabel('Senha', { exact: true })
      .fill(password)

    const login = responseFor(
      page,
      '/auth/login',
      'POST',
    )

    await dialog
      .getByRole('button', {
        name: 'Entrar',
        exact: true,
      })
      .click()

    const session = await fromMsw(await login)

    await expect(page).toHaveURL(/\/checkout$/)

    const recovered = responseFor(
      page,
      '/auth/me',
    )

    await page.reload()

    expect(
      await fromMsw(await recovered),
    ).toEqual(session)

    await expect(
      page.getByRole('heading', {
        name: 'Perfil do colecionador',
      }),
    ).toBeVisible()
  },
)

test(
  'A06 diálogo de login mantém foco ao usar Tab e fecha com Escape',
  async ({ page }) => {
    await page.goto('/entrar')

    const dialog = page.getByRole('dialog')

    await expect(
      dialog.getByRole('button', {
        name: 'Fechar modal',
      }),
    ).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(
      dialog.getByRole('button', {
        name: 'Entrar',
        exact: true,
      }),
    ).toBeFocused()

    await page.keyboard.press('Tab')

    await expect(
      dialog.getByRole('button', {
        name: 'Fechar modal',
      }),
    ).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/$/)
  },
)

// Acceptance failures remain real failures.
// No skips, artificial success, or test.fail.

test(
  'G01 busca deve compor a URL e sobreviver a refresh e histórico',
  async ({ page }) => {
    await page.goto('/')

    const results = page.locator(
      '[aria-label="Resultados do catálogo"]',
    )

    await expect(
      results.getByRole('link'),
    ).toHaveCount(9)

    await catalogSearch(page).fill('Emerald Ape')

    await expect(
      results.getByRole('link'),
    ).toHaveCount(1)

    const filteredUrl = page.url()

    expect.soft(
      new URL(filteredUrl).search.length,
      'Busca precisa ser representada na URL',
    ).toBeGreaterThan(0)

    await page.reload()

    await expect.soft(
      catalogSearch(page),
    ).toHaveValue('Emerald Ape', {
      timeout: 1500,
    })

    await page.goto('/nft/042')
    await page.goBack()

    await expect.soft(
      catalogSearch(page),
    ).toHaveValue('Emerald Ape', {
      timeout: 1500,
    })
  },
)

for (const route of ['/perfil', '/carteiras']) {
  test(
    `G02 ${route} exige autenticação no acesso direto`,
    async ({ page }) => {
      await page.goto(route)

      await expect(page).toHaveURL(
        /\/entrar/,
        { timeout: 2000 },
      )
    },
  )
}

test(
  'G03 favoritos de uma conta não aparecem para outra conta',
  async ({ page }) => {
    await register(page)

    await page.goto('/nft/042')

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'false')

    await favoriteButton(page).click()

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'true')

    await page.reload()

    await expect(
      favoriteButton(page),
    ).toHaveAttribute('aria-pressed', 'true')

    await logout(page)

    await register(
      page,
      `audit-b-${runId}@example.test`,
      `audit_b_${runId}`,
    )

    await page.goto('/nft/042')

    await expect(
      favoriteButton(page),
    ).toHaveAttribute(
      'aria-pressed',
      'false',
      { timeout: 2000 },
    )
  },
)

test(
  'G04 valores monetários REST devem trafegar como strings decimais',
  async ({ page }) => {
    const response = responseFor(page, '/cart')

    await page.goto('/carrinho')

    const cart = await fromMsw(await response)

    // Check the actual decimal ETH wire contract,
    // including scale and exact arithmetic.

    const subtotal = cart.items.reduce(
      (
        sum: bigint,
        item: {
          unitPriceEth: string
          quantity: number
        },
      ) =>
        sum +
        wei(item.unitPriceEth) *
        BigInt(item.quantity),
      0n,
    )

    expect(
      wei(cart.subtotalEth),
    ).toBe(subtotal)

    expect(
      wei(cart.totalEth),
    ).toBe(
      subtotal -
      wei(cart.discountEth) +
      wei(cart.networkFeeEth),
    )

    expect(cart.networkFeeEth).toBe('0.016')

    expect(cart).not.toHaveProperty(
      'totalMicroEth',
    )

    for (const field of [
      'subtotalEth',
      'discountEth',
      'networkFeeEth',
      'totalEth',
    ]) {
      expect(
        typeof cart[field],
        `${field}: o enunciado exige string decimal em ETH`,
      ).toBe('string')

      wei(cart[field])
    }
  },
)
