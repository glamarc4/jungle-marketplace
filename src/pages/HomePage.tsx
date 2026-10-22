
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { CatalogSection } from "@/components/marketplace/CatalogSection"
import { EditorialBanners } from "@/components/home/EditorialBanners"
import { MintJournal } from "@/components/home/MintJournal"

export function HomePage() {
  return (
    <>
      {/* Busca mobile antes do Hero */}
      <CatalogSection mode="mobile-toolbar" />

      {/* Banner */}
      <HeroCarousel />

      {/* Catálogo */}
      <CatalogSection mode="catalog" />

      {/* Conteúdo editorial */}
      <EditorialBanners />

      {/* Journal */}
      <MintJournal />
    </>
  )
}
