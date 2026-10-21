import type { Availability } from "../realtime/contracts.ts"

export const COLLECTIONS = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
] as const

export const NETWORKS = [
  "Ethereum",
  "Polygon",
  "Solana",
] as const

export type Collection = (typeof COLLECTIONS)[number]
export type Network = (typeof NETWORKS)[number]
export type ArtworkVariant = "emerald" | "violet" | "gold"

export type Nft = {
  availability?: Availability
  id: string
  name: string
  collection: Collection
  network: Network
  priceCents: number
  previousPriceCents?: number
  artwork: ArtworkVariant
  createdAt: string
  popularity: number
  featured?: boolean
}

export const MIN_PRICE = 2
export const MAX_PRICE = 1230
export const PAGE_SIZE = 9

export function formatEth(priceCents: number): string {
  const whole = Math.floor(priceCents / 100)
  const fractional = String(priceCents % 100).padStart(2, "0")

  return `${whole}.${fractional} ETH`
}

type NftSeed = Omit<Nft, "createdAt" | "popularity">

const seeds: NftSeed[] = [
  { id: "042", name: "Emerald Ape #042", collection: "Arte digital", network: "Ethereum", priceCents: 119, artwork: "emerald", featured: true },
  { id: "009", name: "Sage Nomad #009", collection: "Arte digital", network: "Polygon", priceCents: 169, artwork: "violet" },
  { id: "552", name: "Neon Vessel #552", collection: "Arte 3D", network: "Ethereum", priceCents: 199, previousPriceCents: 229, artwork: "emerald" },
  { id: "118", name: "Cosmic Bloom #118", collection: "Generativa", network: "Solana", priceCents: 129, artwork: "violet" },
  { id: "314", name: "Violet Nomad #314", collection: "Fotografia", network: "Polygon", priceCents: 139, artwork: "violet" },
  { id: "088", name: "Ivory Baron #088", collection: "Colecionáveis", network: "Ethereum", priceCents: 179, artwork: "emerald" },
  { id: "207", name: "Golden Beat #207", collection: "Música", network: "Solana", priceCents: 99, artwork: "gold" },
  { id: "166", name: "Golden Signal #166", collection: "Música", network: "Polygon", priceCents: 39, artwork: "gold" },
  { id: "301", name: "Golden Echo #301", collection: "Arte digital", network: "Ethereum", priceCents: 149, artwork: "gold" },
  { id: "410", name: "Forest Keeper #410", collection: "Arte digital", network: "Polygon", priceCents: 215, artwork: "emerald" },
  { id: "221", name: "Purple Orbit #221", collection: "Arte 3D", network: "Solana", priceCents: 87, artwork: "violet" },
  { id: "510", name: "Solar Rhythm #510", collection: "Música", network: "Ethereum", priceCents: 259, artwork: "gold" },
  { id: "076", name: "Jungle Genesis #076", collection: "Colecionáveis", network: "Ethereum", priceCents: 319, artwork: "emerald" },
  { id: "612", name: "Nomad Dreams #612", collection: "Fotografia", network: "Polygon", priceCents: 72, artwork: "violet" },
  { id: "443", name: "Golden Horizon #443", collection: "Generativa", network: "Solana", priceCents: 189, artwork: "gold" },
  { id: "150", name: "Emerald Quest #150", collection: "Jogos", network: "Polygon", priceCents: 59, artwork: "emerald" },
  { id: "808", name: "Violet Access #808", collection: "Assinaturas", network: "Ethereum", priceCents: 49, artwork: "violet" },
  { id: "909", name: "Golden Utility #909", collection: "Utilidade", network: "Solana", priceCents: 109, artwork: "gold" },
  { id: "724", name: "Jungle Pulse #724", collection: "Arte digital", network: "Ethereum", priceCents: 229, artwork: "emerald" },
  { id: "633", name: "Nomad Frequency #633", collection: "Música", network: "Polygon", priceCents: 79, artwork: "violet" },
  { id: "534", name: "Amber Legacy #534", collection: "Colecionáveis", network: "Solana", priceCents: 349, artwork: "gold" },
  { id: "425", name: "Green Protocol #425", collection: "Utilidade", network: "Ethereum", priceCents: 65, artwork: "emerald" },
  { id: "316", name: "Violet Arena #316", collection: "Jogos", network: "Polygon", priceCents: 159, artwork: "violet" },
  { id: "207b", name: "Golden Membership #207", collection: "Assinaturas", network: "Solana", priceCents: 29, artwork: "gold" },
]

export const mockNfts: Nft[] = seeds.map((nft, index) => ({
  ...nft,
  createdAt: new Date(
    Date.UTC(2026, 9, 20 - index)
  ).toISOString(),
  popularity: 1000 - ((index * 137) % 997),
}))
