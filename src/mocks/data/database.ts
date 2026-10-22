
import type { RealtimeData } from './realtime'
import type { CartItem } from '../../domain/cart'
import type { Order, Session, Wallet } from '../../domain/api'
import { emptyProfile, type ProfileValues } from '../../domain/profile'
import { emptyWallet } from '../../domain/wallet'
import { getNft } from './nfts'
import { ethToMicroEth } from '../../domain/money'
import { validWalletAddress } from '../../domain/validation'

export const DATABASE_KEY = 'kurio:api:v1'

export type User = Session & {
  salt: string
  passwordHash: string
}

export type StoredCart = {
  items: CartItem[]
  coupon: string | null
}

export const emptyCart = (): StoredCart => ({
  items: [],
  coupon: null,
})

type Account = {
  favorites?: string[]
  profile: ProfileValues
  wallets: Wallet[]
  orders: Order[]
}

export type Database = {
  sessionExpiresAt?: number
  realtime?: RealtimeData
  version: 1
  users: User[]
  session: Session | null
  accounts: Record<string, Account>

  // Mantido temporariamente para compatibilidade.
  cart: StoredCart

  // Carrinhos separados por usuário.
  carts?: Record<string, StoredCart>

  idempotency: Record<
    string,
    { fingerprint: string; order: Order }
  >
}

export function validSession(db: Database): Session | null {
  const session = db.session

  return session &&
    (db.sessionExpiresAt === undefined ||
      db.sessionExpiresAt > Date.now()) &&
    db.users.some(
      user =>
        user.userId === session.userId &&
        user.email === session.email,
    )
    ? session
    : null
}

export function cartOwner(db: Database): string {
  return validSession(db)?.userId ?? 'guest'
}

export function activeCart(db: Database): StoredCart {
  const owner = cartOwner(db)
  db.carts ??= {}

  return (db.carts[owner] ??= emptyCart())
}

export function switchCartOwner(
  db: Database,
  nextOwner: string,
  mergeGuest = false,
): void {
  db.carts ??= {}

  const previousOwner = cartOwner(db)

  // Salva o carrinho que estava ativo.
  db.carts[previousOwner] = {
    items: db.cart.items.map(item => ({ ...item })),
    coupon: db.cart.coupon,
  }

  const destination = db.carts[nextOwner] ?? emptyCart()

  if (mergeGuest && previousOwner === 'guest' && nextOwner !== 'guest') {
    const merged = destination.items.map(item => ({ ...item }))

    for (const item of db.carts.guest?.items ?? []) {
      const existing = merged.find(current => current.key === item.key)

      if (existing) {
        existing.quantity = Math.min(
          99,
          existing.quantity + item.quantity,
        )
      } else {
        merged.push({ ...item })
      }
    }

    db.carts[nextOwner] = {
      items: merged,
      coupon: destination.coupon ?? db.carts.guest?.coupon ?? null,
    }

    // Evita mesclar novamente o mesmo carrinho visitante.
    db.carts.guest = emptyCart()
  } else {
    db.carts[nextOwner] = destination
  }

  db.cart = db.carts[nextOwner]
}

export function makeCartItem(
  nftId: string,
  edition: CartItem['edition'],
  quantity: number,
): CartItem | undefined {
  const nft = getNft(nftId)

  if (
    !nft ||
    !nft.availableEditions.includes(edition) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    return undefined
  }

  return {
    key: `${nft.id}:${edition}`,
    nftId: nft.id,
    name: nft.title,
    tokenId: nft.tokenId,
    artwork: nft.artwork,
    edition,
    quantity,
    unitPriceMicroEth: ethToMicroEth(nft.price),
  }
}

function legacy(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function strings<T extends Record<string, string>>(
  defaults: T,
  value: unknown,
): T {
  const source = record(value)

  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      typeof source[key] === 'string' ? source[key] : fallback,
    ]),
  ) as T
}

function seed(): Database {
  const oldSession = record(legacy('kurio:demo-session'))

  const session =
    typeof oldSession.email === 'string' &&
      typeof oldSession.userId === 'string'
      ? {
        email: oldSession.email,
        userId: oldSession.userId,
      }
      : null

  const owner = session?.userId ?? 'guest'

  const oldCart = legacy('kurio:cart:v1')

  const candidates = Array.isArray(oldCart)
    ? oldCart
    : [
      { nftId: '042', edition: '1/50', quantity: 2 },
      { nftId: '314', edition: '1/50', quantity: 6 },
      { nftId: '088', edition: '1/50', quantity: 9 },
    ]

  const items: CartItem[] = []

  for (const candidate of candidates) {
    const item = record(candidate)

    if (
      typeof item.nftId !== 'string' ||
      typeof item.edition !== 'string' ||
      typeof item.quantity !== 'number'
    ) {
      continue
    }

    const next = makeCartItem(
      item.nftId,
      item.edition as CartItem['edition'],
      item.quantity,
    )

    if (!next) continue

    const existing = items.find(
      current => current.key === next.key,
    )

    if (existing) {
      existing.quantity = Math.min(
        99,
        existing.quantity + next.quantity,
      )
    } else {
      items.push(next)
    }
  }

  const profile = strings(
    {
      ...emptyProfile,
      email: session?.email ?? '',
    },
    legacy(`kurio:demo-profile:${owner}`),
  )

  const oldWallet = record(
    legacy(`kurio:demo-wallets:${owner}`),
  )

  const primary = strings(emptyWallet, oldWallet.primary)

  if (oldWallet.usePrimary) {
    primary.secondaryAddress = primary.address
  }

  const wallets: Wallet[] = validWalletAddress(
    primary.network,
    primary.address,
  )
    ? [
      {
        ...primary,
        id: crypto.randomUUID(),
        primary: true,
      },
    ]
    : []

  if (
    !oldWallet.usePrimary &&
    typeof oldWallet.secondaryAddress === 'string' &&
    validWalletAddress(
      primary.network,
      oldWallet.secondaryAddress,
    )
  ) {
    wallets.push({
      ...primary,
      id: crypto.randomUUID(),
      primary: false,
      address: oldWallet.secondaryAddress,
      nickname: String(
        oldWallet.secondaryNickname ?? 'Secundária',
      ),
    })
  }

  const initialCart: StoredCart = {
    items,
    coupon: null,
  }

  return {
    version: 1,
    users: session
      ? [
        {
          ...session,
          salt: '',
          passwordHash: '',
        },
      ]
      : [],
    session,
    accounts: {
      [owner]: {
        profile,
        wallets,
        orders: [],
      },
    },
    cart: initialCart,
    carts: {
      [owner]: {
        items: [...items],
        coupon: null,
      },
    },
    idempotency: {},
  }
}

export function account(db: Database) {
  const owner = db.session?.userId ?? 'guest'

  return (db.accounts[owner] ??= {
    profile: {
      ...emptyProfile,
      email: db.session?.email ?? '',
    },
    wallets: [],
    orders: [],
  })
}

let queue: Promise<unknown> = Promise.resolve()

export function transaction<T>(
  write: boolean,
  action: (db: Database) => T | Promise<T>,
): Promise<T> {
  const run = async () => {
    const raw = localStorage.getItem(DATABASE_KEY)

    const db: Database = raw
      ? JSON.parse(raw)
      : seed()

    if (
      db.version !== 1 ||
      !db.accounts ||
      !db.cart ||
      !Array.isArray(db.users)
    ) {
      throw new Error(
        'Base demonstrativa inválida. Exporte e redefina kurio:api:v1.',
      )
    }

    // Migra o carrinho legado para a estrutura por usuário.
    const needsMigration = !db.carts

    if (needsMigration) {
      const owner = cartOwner(db)

      db.carts = {
        [owner]: {
          items: db.cart.items.map(item => ({ ...item })),
          coupon: db.cart.coupon,
        },
      }
    }

    // Garante que o carrinho ativo corresponda ao dono da sessão
    // antes de executar a operação.
    db.cart = activeCart(db)

    const result = await action(db)

    // Persiste a migração mesmo em operações de leitura.
    // A escrita ocorre antes de retornar sucesso.
    if (write || !raw || needsMigration) {
      localStorage.setItem(
        DATABASE_KEY,
        JSON.stringify(db),
      )

      // A notificação local acorda o outbox durável.
      // A entrega remota continua usando Socket.IO.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new Event('kurio:database-written'),
        )
      }
    }

    if (!raw) {
      localStorage.removeItem('kurio:demo-session')
    }

    return result
  }

  const locked = () =>
    typeof navigator !== 'undefined' &&
      navigator.locks
      ? navigator.locks.request(
        'kurio-api-database',
        run,
      )
      : run()

  const result = queue.then(locked, locked)

  queue = result.catch(() => undefined)

  return result
}

export async function hashPassword(
  password: string,
  salt: string,
) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  return Array.from(
    new Uint8Array(bits),
    byte => byte.toString(16).padStart(2, '0'),
  ).join('')
}
