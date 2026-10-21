
import type { ArtworkVariant } from "@/data/mock-nfts"

export type JournalArticle = {
  id: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  artwork: ArtworkVariant
  href: string
}

export const journalArticles: JournalArticle[] = [
  {
    id: "nft-ownership",
    title: "Como funciona a propriedade de NFTs",
    description:
      "Aprenda a colecionar, negociar e verificar ativos digitais.",
    publishedAt: "2026-09-12",
    readingMinutes: 6,
    artwork: "emerald",
    href: "#diario",
  },
  {
    id: "digital-artists",
    title: "10 artistas digitais para acompanhar",
    description:
      "Conheça criadores que moldam a cultura digital.",
    publishedAt: "2026-09-13",
    readingMinutes: 2,
    artwork: "emerald",
    href: "#diario",
  },
  {
    id: "rarity",
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    publishedAt: "2026-09-15",
    readingMinutes: 3,
    artwork: "violet",
    href: "#diario",
  },
  {
    id: "wallet-security",
    title: "Como proteger sua carteira",
    description:
      "Proteja sua carteira, seus ativos e sua identidade.",
    publishedAt: "2026-09-15",
    readingMinutes: 2,
    artwork: "gold",
    href: "#diario",
  },
]
