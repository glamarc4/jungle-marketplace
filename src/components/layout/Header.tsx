import { useCartQuery } from "@/hooks/use-api"

import { useState } from "react"
import { Link, useRouterState, useNavigate } from "@tanstack/react-router"
import {
  LogIn,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDemoSession } from "@/components/auth/demo-session"

const navigation = [
  { label: "Início", to: "/", hash: "" },
  { label: "Mercado", to: "/mercado", hash: "" },
  { label: "Criadores", to: "/", hash: "criadores" },
  { label: "Aprenda", to: "/", hash: "aprenda" },
] as const

export function Header() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const session = useDemoSession()
  const cart = useCartQuery()
  const count = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/"
    if (to === "/mercado") {
      return (
        pathname === "/mercado" ||
        pathname.startsWith("/nft/") ||
        pathname === "/carrinho" ||
        pathname === "/checkout"
      )
    }
    return false
  }

  return (
    <header className="relative z-50 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 border-b border-kurio-border px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Kurio — página inicial"
          className="shrink-0 font-mono text-sm font-bold tracking-[0.1em] text-foreground"
        >
          KURIO
        </Link>

        {/* Navegação desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden h-full items-center gap-7 md:flex"
        >
          {navigation.map((item) => {
            const active = isActive(item.to)

            return (
              <Link
                key={item.label}
                to={item.to}
                hash={item.hash}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-full items-center font-mono text-sm transition-colors duration-200",
                  active
                    ? "font-bold text-kurio-primary"
                    : "text-foreground/80 hover:text-kurio-primary",
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
        <div className="hidden items-center gap-4 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Buscar NFTs"
            onClick={() => { setMenuOpen(false); void navigate({ to: "/mercado", hash: "mercado" }) }}
            className="hover:text-kurio-primary"
          >
            <Search className="size-5" />
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative hover:text-kurio-primary"
          >
            <Link to="/carrinho" aria-label={`Abrir carrinho (${count} itens)`}>
              <ShoppingCart className="size-5" />

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
          className="border-b border-kurio-border bg-background px-6 py-5 md:hidden"
        >
          <div className="flex flex-col gap-5">
            {navigation.map((item) => {
              const active = isActive(item.to)

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-mono font-bold text-kurio-primary"
                      : "font-mono text-foreground"
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
            onClick={() => { setMenuOpen(false); void navigate({ to: "/mercado", hash: "mercado" }) }}
              >
                <Search className="size-4" />
              </Button>

              <Button asChild variant="outline" size="icon">
                <Link
                  to="/carrinho"
                  aria-label={`Abrir carrinho (${count} itens)`}
                  onClick={() => setMenuOpen(false)}
                >
                  <ShoppingCart className="size-4" />
                </Link>
              </Button>

              <Button asChild size="sm" className="ml-auto">
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
