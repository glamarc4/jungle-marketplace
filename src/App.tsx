import { useEffect } from 'react'
import { useSession } from './hooks/use-api'
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"

function App() {
  const session = useSession()
  useEffect(() => {
    if (session.isSuccess && !session.data && ['/perfil', '/carteiras'].includes(router.state.location.pathname)) {
      void router.invalidate()
    }
  }, [session.isSuccess, session.data])
  return <RouterProvider router={router} />
}

export default App