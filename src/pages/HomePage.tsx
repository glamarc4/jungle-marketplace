
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { CatalogSection } from "@/components/marketplace/CatalogSection"
import { EditorialBanners } from "@/components/home/EditorialBanners"
import { MintJournal } from "@/components/home/MintJournal"

export function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CatalogSection />
      <EditorialBanners />
      <MintJournal />
    </>
  )
}
