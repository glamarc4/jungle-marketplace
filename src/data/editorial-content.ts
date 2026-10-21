
import type { ArtworkVariant } from "@/data/mock-nfts"

export type EditorialBanner = {
  id: string
  title: string
  description: string
  buttonLabel: string
  href: string
  artwork: ArtworkVariant
}

export const editorialBanners: EditorialBanner[] = [
  {
    id: "genesis",
    title: "Lançamentos gênesis\nde edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    buttonLabel: "Explorar",
    href: "#mercado",
    artwork: "emerald",
  },
  {
    id: "curated",
    title: "Arte digital selecionada\ne muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    buttonLabel: "Explorar",
    href: "#mercado",
    artwork: "violet",
  },
]
