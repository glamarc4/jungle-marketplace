
import { unavailableItems, queueOrderEvent } from '../data/realtime'
import { http } from 'msw'
import {
  account,
  validSession,
  type Database,
} from '../data/database'
import { cartSignature, type Order } from '../../domain/api'
import { validEmail, validWalletAddress } from '../../domain/validation'
import { cartResponse } from './cart'
import { body, requireValue, respond, textField } from './http'

function requireSession(db: Database) {
  const session = validSession(db)

  requireValue(
    session,
    'Entre na sua conta para acessar ou confirmar pedidos.',
    401,
  )

  return session
}

function removePurchasedItems(db: Database, order: Order) {
  for (const purchased of order.items) {
    const current = db.cart.items.find(
      item => item.key === purchased.key,
    )

    if (!current) continue

    current.quantity -= purchased.quantity
  }

  db.cart.items = db.cart.items.filter(
    item => item.quantity > 0,
  )

  if (db.cart.items.length === 0) {
    db.cart.coupon = null
  }
}

export const orderHandlers = [
  http.patch('/api/orders/:id/status', ({ request, params }) =>
    respond(true, async db => {
      requireValue(
        import.meta.env.DEV,
        'Recurso disponível apenas em desenvolvimento.',
        404,
      )

      const session = requireSession(db)
      const input = await body(request)

      const order = account(db).orders.find(
        item => item.orderId === params.id,
      )

      requireValue(order, 'Pedido não encontrado.', 404)

      const status = input.status

      requireValue(
        status === 'confirmed' ||
          status === 'declined' ||
          status === 'demo-completed',
        'Transição de status inválida.',
      )

      // Repetir a mesma transição não pode gerar outro evento
      // nem remover itens do carrinho novamente.
      if (order.status === status) {
        return order
      }

      if (status === 'demo-completed') {
        requireValue(
          order.status === 'demo-confirmed',
          'Transição de status inválida.',
          409,
        )
      } else {
        requireValue(
          order.status === 'pending',
          'Somente pedidos pendentes podem ser confirmados ou recusados.',
          409,
        )
      }

      if (status === 'confirmed') {
        removePurchasedItems(db, order)
      }

      order.status = status

      queueOrderEvent(
        db,
        session.userId,
        order,
        'order:status-changed',
      )

      return order
    }),
  ),

  http.get('/api/orders', () =>
    respond(false, db => {
      requireSession(db)
      return account(db).orders
    }),
  ),

  http.get('/api/orders/:id', ({ params }) =>
    respond(false, db => {
      requireSession(db)

      const order = account(db).orders.find(
        item => item.orderId === params.id,
      )

      requireValue(order, 'Pedido não encontrado.', 404)

      return order
    }),
  ),

  http.post('/api/orders', ({ request }) =>
    respond(true, async db => {
      // Autoriza antes de analisar o corpo ou a idempotência.
      const session = requireSession(db)

      const key = textField(
        request.headers.get('Idempotency-Key'),
        'Chave de idempotência',
        128,
      )

      const input = await body(request)

      requireValue(
        typeof input.collector === 'object' &&
          input.collector !== null &&
          !Array.isArray(input.collector),
        'Dados do colecionador ausentes.',
      )

      const collector = input.collector as Record<string, unknown>

      const walletType = textField(
        input.selectedWallet,
        'Carteira',
      )

      const network = textField(
        collector.network,
        'Rede',
      )

      const walletAddress = textField(
        collector.useAnotherWallet
          ? collector.secondaryWallet
          : collector.walletAddress,
        'Endereço da carteira',
      )

      const signature = textField(
        input.cartSignature,
        'Identificação do carrinho',
        100_000,
      )

      const fingerprint = JSON.stringify([
        signature,
        walletType,
        Object.keys(collector)
          .sort()
          .map(key => [key, collector[key]]),
      ])

      const ownerKey = `${session.userId}:${key}`
      const previous = db.idempotency[ownerKey]

      if (previous) {
        requireValue(
          previous.fingerprint === fingerprint,
          'Chave de idempotência já usada com outros dados.',
          409,
        )

        // Recupera sempre o pedido atualizado.
        const current = account(db).orders.find(
          item => item.orderId === previous.order.orderId,
        )

        return current ?? previous.order
      }

      requireValue(
        ['metamask', 'coinbase', 'walletconnect'].includes(walletType) &&
          collector.walletType === walletType,
        'O tipo da carteira deve corresponder à carteira selecionada.',
      )

      requireValue(
        validWalletAddress(network, walletAddress),
        'Endereço inválido para a rede selecionada.',
      )

      requireValue(
        !collector.secondaryWallet ||
          (
            typeof collector.secondaryWallet === 'string' &&
            validWalletAddress(network, collector.secondaryWallet)
          ),
        'Carteira secundária inválida.',
      )

      for (const field of [
        'displayName',
        'profileName',
        'referralCode',
      ]) {
        textField(collector[field], field, 80)
      }

      requireValue(
        typeof collector.username === 'string' &&
          /^[A-Za-z0-9_-]{3,30}$/.test(collector.username),
        'Nome de usuário inválido.',
      )

      requireValue(
        typeof collector.email === 'string' &&
          validEmail(collector.email),
        'E-mail inválido.',
      )

      requireValue(
        db.cart.items.length > 0,
        'O carrinho está vazio.',
      )

      requireValue(
        unavailableItems(db).length === 0,
        'Há edições indisponíveis no carrinho. Revise os itens antes de confirmar.',
        409,
      )

      const cart = cartResponse(db)

      requireValue(
        signature === cartSignature(cart),
        'O carrinho mudou. Revise os valores e confirme novamente.',
        409,
      )

      const now = new Date()

      const order: Order = {
        ...cart,
        orderId: `DEMO-${crypto.randomUUID()}`,
        createdAt: now.toISOString(),
        date: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'America/Sao_Paulo',
        }).format(now),
        status: 'pending',
        wallet: (
          {
            metamask: 'MetaMask',
            coinbase: 'Coinbase Wallet',
            walletconnect: 'WalletConnect',
          } as Record<string, string>
        )[walletType],
        walletAddress,
        network,
      }

      account(db).orders.unshift(order)

      db.idempotency[ownerKey] = {
        fingerprint,
        order,
      }

      queueOrderEvent(
        db,
        session.userId,
        order,
        'order:created',
      )

      // Pedido pendente: preserva o carrinho.
      // Só remove os itens quando o pagamento é confirmado.
      return order
    }, 201),
  ),
]
