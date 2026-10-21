import { availability } from '../data/realtime'
import { respond, ApiError } from './http'
import { http } from 'msw'
import { nfts, getNft } from '../data/nfts'
import { COLLECTIONS, NETWORKS } from '../../data/mock-nfts'

export const nftHandlers = [
  http.get('/api/nfts', ({ request }) => respond(false, db => {
    const params = new URL(request.url).searchParams
    const page = Number(params.get('page') ?? 1)
    const size = Number(params.get('pageSize') ?? 9)
    const min = Number(params.get('minPrice') ?? 0)
    const max = Number(params.get('maxPrice') ?? Number.MAX_SAFE_INTEGER)
    const sort = params.get('sort') ?? 'recent'
    const tab = params.get('tab') ?? 'all'
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1 || size > 100 || !Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || min > max || !['recent', 'price-asc', 'price-desc', 'name'].includes(sort) || !['all', 'new', 'trending'].includes(tab)) throw new ApiError(400, 'Filtros ou paginação inválidos.')
    const search = (params.get('search') ?? '').toLocaleLowerCase('pt-BR')
    const filtered = nfts.filter(nft =>
      (!params.get('collection') || nft.collection === params.get('collection')) &&
      (!params.get('network') || nft.network === params.get('network')) &&
      nft.name.toLocaleLowerCase('pt-BR').includes(search) && nft.priceCents >= min && nft.priceCents <= max &&
      (tab !== 'new' || new Date(nft.createdAt).getTime() >= Date.UTC(2026, 9, 13)) &&
      (tab !== 'trending' || nft.popularity >= 500))
    filtered.sort((a, b) => sort === 'price-asc' ? a.priceCents - b.priceCents : sort === 'price-desc' ? b.priceCents - a.priceCents : sort === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : b.createdAt.localeCompare(a.createdAt))
    return { items: filtered.slice((page - 1) * size, page * size).map(nft => ({ ...nft, availability: availability(db, nft.id) })), total: filtered.length, page, totalPages: Math.max(1, Math.ceil(filtered.length / size)), facets: {
      collections: Object.fromEntries(COLLECTIONS.map(value => [value, nfts.filter(nft => nft.collection === value).length])),
      networks: Object.fromEntries(NETWORKS.map(value => [value, nfts.filter(nft => nft.network === value).length])),
    } }
  })),
  http.get('/api/nfts/:id', ({ params }) => respond(false, db => {
    const nft = getNft(String(params.id))
    if (!nft) throw new ApiError(404, 'NFT não encontrado.')
    return { ...nft, availability: availability(db, nft.id) }
  })),
]
