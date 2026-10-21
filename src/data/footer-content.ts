
export type FooterBenefit = {
  id: string
  iconLetter: string
  title: string
  description: string
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterLinkGroup = {
  title: string
  links: FooterLink[]
}

export const footerBenefits: FooterBenefit[] = [
  {
    id: "wallet-security",
    iconLetter: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    id: "creators",
    iconLetter: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    id: "launches",
    iconLetter: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
]

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Meu perfil",
    links: [
      { label: "Meu perfil", href: "/perfil" },
      { label: "Minha coleção", href: "/perfil/colecao" },
      { label: "Atividade", href: "/perfil/atividade" },
      { label: "Estúdio do criador", href: "/criadores" },
      { label: "Lista de interesse", href: "/perfil/favoritos" },
    ],
  },
  {
    title: "Central de ajuda",
    links: [
      { label: "Central de ajuda", href: "/ajuda" },
      { label: "Como comprar NFTs", href: "/ajuda/comprar" },
      { label: "Carteira e segurança", href: "/ajuda/carteira" },
      { label: "Política do mercado", href: "/politicas" },
      { label: "Denunciar item", href: "/ajuda/denunciar" },
    ],
  },
  {
    title: "Coleções",
    links: [
      { label: "Arte digital", href: "/mercado?colecao=arte-digital" },
      { label: "Fotografia", href: "/mercado?colecao=fotografia" },
      { label: "Música", href: "/mercado?colecao=musica" },
      { label: "Arte 3D", href: "/mercado?colecao=arte-3d" },
      { label: "Utilidade", href: "/mercado?colecao=utilidade" },
    ],
  },
]

export const footerContact = {
  email: "contato@email.com",
  phoneDisplay: "+55 11 4002 8922",
  phoneHref: "+551140028922",
}

export const supportedWallets = [
  "METAMASK",
  "WALLETCONNECT",
  "COINBASE",
]
