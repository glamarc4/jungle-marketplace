import { COLLECTIONS, NETWORKS, MIN_PRICE, MAX_PRICE } from '../data/mock-nfts'

export function resolveCatalogSearch(input: Record<string, unknown>) {
  const integer = (value: unknown, fallback: number, min: number, max: number) => {
    const number = Number(value)
    return value !== undefined && Number.isSafeInteger(number) && number >= min && number <= max ? number : fallback
  }
  const minPrice = integer(input.minPrice, MIN_PRICE, MIN_PRICE, MAX_PRICE)
  return {
    search: typeof input.search === 'string' ? input.search.slice(0, 200) : '',
    collection: COLLECTIONS.find(value => value === input.collection) ?? null,
    network: NETWORKS.find(value => value === input.network) ?? null,
    minPrice,
    maxPrice: Math.max(minPrice, integer(input.maxPrice, MAX_PRICE, MIN_PRICE, MAX_PRICE)),
    page: integer(input.page, 1, 1, 100000),
    sort: ['recent', 'price-asc', 'price-desc', 'name'].includes(String(input.sort)) ? String(input.sort) : 'recent',
    tab: ['all', 'new', 'trending'].includes(String(input.tab)) ? String(input.tab) : 'all',
  }
}

export function validateCatalogSearch(input: Record<string, unknown>): Partial<ReturnType<typeof resolveCatalogSearch>> {
  const values = resolveCatalogSearch(input)
  const defaults = resolveCatalogSearch({})
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== defaults[key as keyof typeof defaults]))
}
