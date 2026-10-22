
import { Outlet, useLocation } from "@tanstack/react-router"

import { Header } from "./Header"
import { Footer } from "./Footer"
import { MobileBottomNav } from "./MobileBottomNav"

export function RootLayout() {
  const location = useLocation()

  const isNftDetail =
    location.pathname.startsWith("/nft/")

  const isCart =
    location.pathname === "/carrinho"

  const hasMobilePurchaseSheet =
    isNftDetail || isCart

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header oculto no mobile do detalhe e carrinho */}
      <div
        className={
          hasMobilePurchaseSheet
            ? "hidden md:block"
            : ""
        }
      >
        <Header />
      </div>

      <main
        id="main-content"
        className={
          isCart
            ? "w-full flex-1 pb-[420px] md:pb-0"
            : isNftDetail
              ? "w-full flex-1 pb-[190px] md:pb-0"
              : "w-full flex-1 pb-[135px] md:pb-0"
        }
      >
        <Outlet />
      </main>

      {/* Footer oculto no mobile do detalhe e carrinho */}
      <div
        className={
          hasMobilePurchaseSheet
            ? "hidden md:block"
            : ""
        }
      >
        <Footer />
      </div>

      {/* Menu inferior apenas nas páginas sem bottom sheet */}
      {!hasMobilePurchaseSheet && (
        <MobileBottomNav />
      )}
    </div>
  )
}
