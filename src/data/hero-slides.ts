
export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  description: string
  buttonLabel: string
  href: string
  artwork: "emerald" | "violet" | "gold"
}

export const heroSlides: HeroSlide[] = [
  {
    id: "future",
    eyebrow: "Bem-vindo à Kurio",
    title: "SEJA DONO DO FUTURO\nDA ARTE DIGITAL",
    description:
      "Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha um parte da cultura da internet.",
    buttonLabel: "EXPLORAR",
    href: "#mercado",
    artwork: "emerald",
  },
  {
    id: "collections",
    eyebrow: "Coleções exclusivas",
    title: "DESCUBRA NOVAS\nPOSSIBILIDADES",
    description:
      "Explore coleções especiais, conheça novos artistas e encontre a próxima peça da sua coleção digital.",
    buttonLabel: "VER COLEÇÕES",
    href: "#colecoes",
    artwork: "violet",
  },
  {
    id: "creators",
    eyebrow: "Criatividade sem limites",
    title: "A ARTE TEM\nNOVOS CRIADORES",
    description:
      "Conheça artistas independentes e descubra obras digitais que contam histórias únicas.",
    buttonLabel: "CONHECER",
    href: "#criadores",
    artwork: "gold",
  },
]
