import { http } from 'msw'
import { account } from '../data/database'
import { emptyWallet } from '../../domain/wallet'
import { validEmail, validWalletAddress } from '../../domain/validation'
import type { Wallet } from '../../domain/api'
import { body, requireValue, respond } from './http'

function validate(input: Record<string, unknown>, previous?: Wallet): Wallet {
  const wallet: Wallet = { ...emptyWallet, id: previous?.id ?? crypto.randomUUID(), primary: previous?.primary ?? false, ...previous }
  for (const key of Object.keys(emptyWallet) as (keyof typeof emptyWallet)[]) {
    if (key in input) {
      requireValue(typeof input[key] === 'string' && input[key].length <= 200, `Campo ${key} inválido.`)
      wallet[key] = input[key].trim()
    }
  }
  if ('primary' in input) { requireValue(typeof input.primary === 'boolean', 'Carteira principal inválida.'); wallet.primary = input.primary }
  requireValue(wallet.nickname && wallet.displayName && wallet.profileName && validEmail(wallet.email) && wallet.referralCode && wallet.ens, 'Preencha os campos obrigatórios da carteira.')
  requireValue(['metamask', 'coinbase', 'walletconnect'].includes(wallet.walletType), 'Tipo de carteira inválido.')
  requireValue(validWalletAddress(wallet.network, wallet.address), 'Endereço inválido para a rede selecionada.')
  requireValue(!wallet.secondaryAddress || validWalletAddress(wallet.network, wallet.secondaryAddress), 'Endereço secundário inválido para a rede selecionada.')
  return wallet
}
export const walletHandlers = [
  http.get('/api/wallets', () => respond(false, db => account(db).wallets)),
  http.post('/api/wallets', ({ request }) => respond(true, async db => {
    const wallet = validate(await body(request))
    const wallets = account(db).wallets
    requireValue(!wallets.some(item => item.network === wallet.network && (wallet.network === 'solana' ? item.address === wallet.address : item.address.toLowerCase() === wallet.address.toLowerCase())), 'Carteira já cadastrada.', 409)
    if (!wallets.length) wallet.primary = true
    if (wallet.primary) wallets.forEach(item => { item.primary = false })
    wallets.push(wallet)
    return wallet
  }, 201)),
  http.patch('/api/wallets/:id', ({ request, params }) => respond(true, async db => {
    const wallets = account(db).wallets
    const index = wallets.findIndex(item => item.id === params.id)
    requireValue(index >= 0, 'Carteira não encontrada.', 404)
    const wallet = validate(await body(request), wallets[index])
    requireValue(!wallets.some(item => item.id !== wallet.id && item.network === wallet.network && (wallet.network === 'solana' ? item.address === wallet.address : item.address.toLowerCase() === wallet.address.toLowerCase())), 'Carteira já cadastrada.', 409)
    requireValue(wallet.primary || wallets.some(item => item.id !== wallet.id && item.primary), 'Selecione outra carteira principal antes de desmarcar esta.')
    if (wallet.primary) wallets.forEach(item => { item.primary = false })
    wallets[index] = wallet
    return wallet
  })),
  http.delete('/api/wallets/:id', ({ params }) => respond(true, db => {
    const data = account(db)
    requireValue(data.wallets.some(item => item.id === params.id), 'Carteira não encontrada.', 404)
    data.wallets = data.wallets.filter(item => item.id !== params.id)
    if (data.wallets.length && !data.wallets.some(item => item.primary)) data.wallets[0].primary = true
    return { message: 'Carteira removida.' }
  })),
]
