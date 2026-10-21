import { MAX_PRICE, MIN_PRICE, type Collection, type Network } from "../data/mock-nfts"
export type CatalogFilterValues = {
  collection: Collection | null
  network: Network | null
  minPrice: number
  maxPrice: number
}

export const defaultFilters: CatalogFilterValues = {
  collection: null,
  network: null,
  minPrice: MIN_PRICE,
  maxPrice: MAX_PRICE,
}

