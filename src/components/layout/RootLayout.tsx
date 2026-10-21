import { Outlet } from "@tanstack/react-router"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main id="main-content" className="w-full flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

