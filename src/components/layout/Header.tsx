
import { useEffect, useState } from "react"
import {
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router"
import {
  LogIn,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react"

import { useCartQuery } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { useDemoSession } from "@/components/auth/demo-session"

const navigation = [
  { label: "Início", to: "/", hash: "inicio" },
  { label: "Mercado", to: "/", hash: "mercado" },
  { label: "Criadores", to: "/", hash: "criadores" },
  { label: "Aprenda", to: "/", hash: "diario" },
] as const

export function Header() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const session = useDemoSession()
  const cart = useCartQuery()

  const count =
    cart.data?.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ) ?? 0

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const hash = useRouterState({
    select: (state) => state.location.hash,
  })

  useEffect(() => {
    if (pathname !== "/" || !hash) return

    let frame = 0
    let attempts = 0

    function scrollToSection() {
      const target = document.getElementById(hash)

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        return
      }

      // Aguarda a montagem de seções carregadas pela Home.
      if (attempts < 30) {
        attempts += 1
        frame = window.requestAnimationFrame(scrollToSection)
      }
    }

    frame = window.requestAnimationFrame(scrollToSection)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [pathname, hash])

  function isActive(to: string, itemHash: string) {
    if (pathname !== to) return false

    if (itemHash === "inicio") {
      return !hash || hash === "inicio"
    }

    return hash === itemHash
  }

  function handleNavigation(hashTarget: string) {
    setMenuOpen(false)

    // Clicar novamente no item ativo também deve rolar.
    if (pathname === "/" && hash === hashTarget) {
      document.getElementById(hashTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full",
        "border-b border-kurio-border/60",
        "bg-background/75",
        "backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/65",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          to="/"
          hash="inicio"
          aria-label="Kurio — página inicial"
          className="shrink-0 font-mono text-sm font-bold tracking-[0.1em] text-foreground"
          onClick={() => handleNavigation("inicio")}
        >
          KURIO
        </Link>

        {/* Navegação desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden h-full items-center gap-7 md:flex"
        >
          {navigation.map((item) => {
            const active = isActive(item.to, item.hash)

            return (
              <Link
                key={item.label}
                to={item.to}
                hash={item.hash}
                onClick={() => handleNavigation(item.hash)}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-full items-center",
                  "font-mono text-sm",
                  "transition-colors duration-200",
                  active
                    ? "font-bold text-kurio-primary"
                    : "text-foreground/75 hover:text-kurio-primary",
                ].join(" ")}
              >
                {item.label}

                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-kurio-primary"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Ações desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Buscar NFTs"
            onClick={() => {
              setMenuOpen(false)
              void navigate({
                to: "/",
                hash: "mercado",
              })
            }}
            className="hover:text-kurio-primary"
          >
            <Search
              className="size-[21px]"
              strokeWidth={1.8}
            />
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative hover:text-kurio-primary"
          >
            <Link
              to="/carrinho"
              aria-label={`Abrir carrinho (${count} itens)`}
            >
              <ShoppingCart
                className="size-[22px]"
                strokeWidth={1.8}
              />

              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-kurio-primary text-[10px] font-bold text-kurio-ink">
                {count}
              </span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="gap-1.5 font-mono font-semibold"
          >
            {session ? (
              <Link to="/perfil">
                <UserRound className="size-4" />
                Perfil
              </Link>
            ) : (
              <Link to="/entrar">
                <LogIn className="size-4" />
                Entrar
              </Link>
            )}
          </Button>
        </div>

        {/* Botão do menu mobile */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="kurio-mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </div>

      {/* Navegação mobile */}
      {menuOpen && (
        <nav
          id="kurio-mobile-navigation"
          aria-label="Navegação mobile"
          className="border-b border-kurio-border/60 bg-background/90 px-6 py-5 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-5">
            {navigation.map((item) => {
              const active = isActive(item.to, item.hash)

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  hash={item.hash}
                  onClick={() => handleNavigation(item.hash)}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-mono font-bold text-kurio-primary"
                      : "font-mono text-foreground/80"
                  }
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="flex items-center gap-3 border-t border-kurio-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Buscar NFTs"
                onClick={() => {
                  setMenuOpen(false)
                  void navigate({
                    to: "/",
                    hash: "mercado",
                  })
                }}
              >
                <Search
                  className="size-5"
                  strokeWidth={1.8}
                />
              </Button>

              <Button
                asChild
                variant="outline"
                size="icon"
              >
                <Link
                  to="/carrinho"
                  aria-label={`Abrir carrinho (${count} itens)`}
                  onClick={() => setMenuOpen(false)}
                >
                  <ShoppingCart
                    className="size-5"
                    strokeWidth={1.8}
                  />
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="ml-auto"
              >
                {session ? (
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserRound className="size-4" />
                    Perfil
                  </Link>
                ) : (
                  <Link
                    to="/entrar"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn className="size-4" />
                    Entrar
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
