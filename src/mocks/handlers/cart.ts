import { unavailableItems, editionAvailable } from '../data/realtime'
import { http } from 'msw'
import { makeCartItem, type Database } from '../data/database'
import { calculateTotals } from '../../domain/money'
import type { NftEdition } from '../../data/nft-details'
import { body, requireValue, respond, textField } from './http'

export function cartResponse(db: Database) { return { ...db.cart, unavailableItems: unavailableItems(db), ...calculateTotals(db.cart.items, db.cart.coupon) } }
export const cartHandlers = [
  http.get('/api/cart', () => respond(false, cartResponse)),
  http.patch('/api/cart', ({ request }) => respond(true, async db => {
    const input = await body(request)
    requireValue(input.coupon === null || (typeof input.coupon === 'string' && input.coupon.trim().toUpperCase() === 'KURIO10'), 'Cupom inválido. Experimente KURIO10.')
    db.cart.coupon = input.coupon === null ? null : 'KURIO10'
    return cartResponse(db)
  })),
  http.post('/api/cart/items', ({ request }) => respond(true, async db => {
    const input = await body(request)
    const nftId = textField(input.nftId, 'NFT')
    const edition = textField(input.edition, 'Edição') as NftEdition
    const item = makeCartItem(nftId, edition, Number(input.quantity))
    requireValue(typeof input.quantity === 'number' && item, 'NFT, edição ou quantidade inválidos (1 a 99).')
    requireValue(editionAvailable(db, item.nftId, item.edition), 'Esta edição está indisponível. Revise seu carrinho.', 409)
    const existing = db.cart.items.find(current => current.key === item.key)
    if (existing) {
      requireValue(existing.quantity + item.quantity <= 99, 'O limite é de 99 unidades por edição.')
      existing.quantity += item.quantity
    } else db.cart.items.push(item)
    return cartResponse(db)
  }, 201)),
  http.patch('/api/cart/items/:id', ({ request, params }) => respond(true, async db => {
    const input = await body(request)
    const item = db.cart.items.find(current => current.key === params.id)
    requireValue(item, 'Item não encontrado.', 404)
    requireValue(typeof input.quantity === 'number' && Number.isInteger(input.quantity) && input.quantity >= 1 && input.quantity <= 99, 'Quantidade deve ser inteira entre 1 e 99.')
    if (input.quantity > item.quantity) requireValue(editionAvailable(db, item.nftId, item.edition), 'Esta edição está indisponível.', 409)
    item.quantity = input.quantity
    return cartResponse(db)
  })),
  http.delete('/api/cart/items/:id', ({ params }) => respond(true, db => {
    requireValue(db.cart.items.some(item => item.key === params.id), 'Item não encontrado.', 404)
    db.cart.items = db.cart.items.filter(item => item.key !== params.id)
    return cartResponse(db)
  })),
]
