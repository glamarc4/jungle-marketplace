import { http } from 'msw'
import { account, validSession, type Database } from '../data/database'
import { getNft } from '../data/nfts'
import { requireValue, respond } from './http'

function favorites(db: Database, request: Request) {
  const session = validSession(db)
  requireValue(session && request.headers.get('X-Account-Id') === session.userId, 'Sessão inválida. Entre novamente.', 401)
  return account(db).favorites ??= []
}

export const favoriteHandlers = [
  http.get('/api/favorites', ({ request }) => respond(false, db => favorites(db, request))),
  http.put('/api/favorites/:id', ({ request, params }) => respond(true, db => {
    const items = favorites(db, request)
    const nft = getNft(String(params.id))
    requireValue(nft, 'NFT não encontrado.', 404)
    if (!items.includes(nft.id)) items.push(nft.id)
    return items
  })),
  http.delete('/api/favorites/:id', ({ request, params }) => respond(true, db => {
    const items = favorites(db, request)
    account(db).favorites = items.filter(id => id !== params.id)
    return account(db).favorites!
  })),
]
