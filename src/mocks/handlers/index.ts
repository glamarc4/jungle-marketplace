import { realtimeHandlers } from './realtime'
import { http, HttpResponse } from 'msw'
import { nftHandlers } from './nfts'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { profileHandlers } from './profile'
import { walletHandlers } from './wallets'
import { orderHandlers } from './orders'
export const handlers = [...realtimeHandlers, ...nftHandlers, ...authHandlers, ...cartHandlers, ...profileHandlers, ...walletHandlers, ...orderHandlers, http.all('/api/*', () => HttpResponse.json({ message: 'Endpoint não encontrado.' }, { status: 404 }))]
