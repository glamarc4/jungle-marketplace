
import { Link, useLocation, useNavigate } from "@tanstack/react-router"

const BG = "#241612"
const ACCENT = "#D28A4C"
const MUTED = "#C8A981"

const navItemClass =
  "flex h-14 items-center justify-center rounded-xl transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5D5AA]"

type NavIconProps = {
  color: string
}

/* Casinha preenchida */
function HomeIcon({ color }: NavIconProps) {
  return (
    <svg
      width="26"
      height="28"
      viewBox="0 0 26 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 11.1 11.1 3.8a3 3 0 0 1 3.8 0l8.6 7.3a3 3 0 0 1 1 2.3V24a3 3 0 0 1-3 3h-5.1v-7.4a3.4 3.4 0 0 0-6.8 0V27H4.5a3 3 0 0 1-3-3V13.4a3 3 0 0 1 1-2.3Z"
        fill={color}
      />
    </svg>
  )
}

/* Coração preenchido */
function HeartIcon({ color }: NavIconProps) {
  return (
    <svg
      width="29"
      height="28"
      viewBox="0 0 29 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 26.2 3.3 15.5C-3.4 9.1 5.5-1.2 12.7 5.2l1.8 1.6 1.8-1.6c7.2-6.4 16.1 3.9 9.4 10.3L14.5 26.2Z"
        fill={color}
      />
    </svg>
  )
}

/* Carrinho preenchido */
function CartIcon({ color }: NavIconProps) {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4.5h3.2l2.5 13.1a2.8 2.8 0 0 0 2.8 2.3h12.1a2.8 2.8 0 0 0 2.7-2.2l1.8-8.2a2.3 2.3 0 0 0-2.3-2.8H6.2"
        fill={color}
      />
      <path
        d="M2 4.5h3.2l2.5 13.1a2.8 2.8 0 0 0 2.8 2.3h12.1"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.2" cy="24.5" r="2" fill={color} />
      <circle cx="22" cy="24.5" r="2" fill={color} />
    </svg>
  )
}

/* Perfil preenchido */
function ProfileIcon({ color }: NavIconProps) {
  return (
    <svg
      width="27"
      height="29"
      viewBox="0 0 27 29"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="8" r="6.4" fill={color} />
      <path
        d="M2.1 23.3c0-5.5 5.1-9.2 11.4-9.2s11.4 3.7 11.4 9.2v1.1a2.9 2.9 0 0 1-2.9 2.9H5a2.9 2.9 0 0 1-2.9-2.9v-1.1Z"
        fill={color}
      />
    </svg>
  )
}

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === "/"
  const isMarket = location.pathname === "/mercado"
  const isCart = location.pathname === "/carrinho"
  const isProfile = location.pathname === "/perfil"

  function goToMarket() {
    void navigate({ to: "/mercado" })
  }

  function goToFavorites() {
    // Temporário: ainda não existe uma rota /favoritos.
    void navigate({
      to: "/",
      hash: "mercado",
    })
  }

  return (
    <nav
      aria-label="Navegação principal mobile"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      <div
        className="relative mx-auto h-[125px] w-full max-w-[480px]"
        style={{
          filter: "drop-shadow(0px -10px 15px #0A060473)",
        }}
      >
        {/* Barra com recorte central */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 414 125"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="
              M 0 125
              V 70
              Q 0 31 39 31
              H 143
              C 160 31 162 49 173 65
              C 189 88 225 88 241 65
              C 252 49 254 31 271 31
              H 375
              Q 414 31 414 70
              V 125
              Z
            "
            fill={BG}
          />
        </svg>

        {/* Botão central com gradiente do Figma */}
        <button
          type="button"
          aria-label="Explorar NFTs"
          aria-current={isMarket ? "page" : undefined}
          onClick={goToMarket}
          className="absolute left-1/2 top-0 z-20 flex size-[68px] -translate-x-1/2 items-center justify-center rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5D5AA]"
          style={{
            background:
              "linear-gradient(180deg, rgba(210, 138, 76, 0.4) -16.92%, #D28A4C 109.23%)",
          }}
        >
          {/* Ícone central preservado */}
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 7.5C11 5.5 23 5.5 25 7.5M9 26.5C11 28.5 23 28.5 25 26.5M7 11C5 13 5 21 7 23M27 11C29 13 29 21 27 23"
              stroke="#FFF6E8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M5.5 17H28.5"
              stroke="#FFF6E8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Navegação lateral */}
        <div className="absolute inset-x-0 bottom-0 z-10 grid h-[83px] grid-cols-[1fr_1fr_88px_1fr_1fr] items-center px-3 pb-[env(safe-area-inset-bottom)]">
          {/* Início */}
          <Link
            to="/"
            aria-label="Início"
            aria-current={isHome ? "page" : undefined}
            className={navItemClass}
          >
            <HomeIcon color={isHome ? ACCENT : MUTED} />
          </Link>

          {/* Favoritos */}
          <button
            type="button"
            aria-label="Favoritos — abrir catálogo"
            onClick={goToFavorites}
            className={navItemClass}
          >
            <HeartIcon color={MUTED} />
          </button>

          {/* Espaço do botão central */}
          <div aria-hidden="true" />

          {/* Carrinho */}
          <Link
            to="/carrinho"
            aria-label="Carrinho"
            aria-current={isCart ? "page" : undefined}
            className={navItemClass}
          >
            <CartIcon color={isCart ? ACCENT : MUTED} />
          </Link>

          {/* Perfil */}
          <Link
            to="/perfil"
            aria-label="Perfil"
            aria-current={isProfile ? "page" : undefined}
            className={navItemClass}
          >
            <ProfileIcon color={isProfile ? ACCENT : MUTED} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
