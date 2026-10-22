import type { ImgHTMLAttributes } from "react"

export type MonkeyArtworkVariant =
  | "emerald"
  | "violet"
  | "gold"
  | "beige"
  | "gray"
  | "brown"
  | "black"

type MonkeyArtworkProps = {
  variant: MonkeyArtworkVariant
  className?: string
  alt?: string
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "className"
>

const artworkImages: Record<MonkeyArtworkVariant, string> = {
  emerald: "/images/nfts/macaco-bege.png",
  violet: "/images/nfts/macaco-cinza.png",
  gold: "/images/nfts/macaco-marrom.png",
  beige: "/images/nfts/macaco-bege.png",
  gray: "/images/nfts/macaco-cinza.png",
  brown: "/images/nfts/macaco-marrom.png",
  black: "/images/nfts/macaco-preto.png",
}

export function MonkeyArtwork({
  variant,
  className = "",
  alt,
  ...props
}: MonkeyArtworkProps) {
  return (
    <img
      src={artworkImages[variant]}
      alt={alt ?? `Arte digital de macaco — ${variant}`}
      className={`block h-full w-full object-cover object-center ${className}`}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}