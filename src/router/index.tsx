import { requireCheckoutSession, validateAuthSearch, validateOrderSearch } from "./auth"
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage"
import { RequestState } from "@/components/RequestState"

import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { CartPage } from "@/pages/CartPage"
import { RootLayout } from "@/components/layout/RootLayout"
import { NftDetailPage } from "@/pages/NftDetailPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { WalletsPage } from "@/pages/WalletsPage"
import { CheckoutPage } from "@/pages/CheckoutPage"
import { HomePage } from "@/pages/HomePage"
import { RoutePlaceholderPage } from "@/pages/RoutePlaceholderPage"
import { AuthRoutePage } from "@/pages/AuthRoutePage"

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <RoutePlaceholderPage
      title="Página não encontrada"
      description="Não encontramos a página que você tentou acessar."
    />
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mercado",
  component: HomePage,
})


const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: NftDetailPage,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/carrinho",
  component: CartPage,
})


const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
  beforeLoad: requireCheckoutSession,
  pendingComponent: () => <RequestState pending />,
})


const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pedido/confirmacao",
  component: OrderConfirmationPage,
  validateSearch: validateOrderSearch,
  beforeLoad: requireCheckoutSession,
  pendingComponent: () => <RequestState pending />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/entrar",
  validateSearch: validateAuthSearch,
  component: () => <AuthRoutePage mode="login" />,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cadastro",
  validateSearch: validateAuthSearch,
  component: () => <AuthRoutePage mode="register" />,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/perfil",
  component: ProfilePage,
})

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/carteiras",
  component: WalletsPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  marketplaceRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
