
import { useEffect, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '../hooks/use-api'
import { startRealtime } from './connection'

export function RealtimeProvider({
  children,
}: {
  children: ReactNode
}) {
  const client = useQueryClient()
  const session = useSession()

  useEffect(() => {
    if (!session.isSuccess) return

    const realtimeUrl =
      import.meta.env.VITE_REALTIME_URL ||
      (import.meta.env.DEV
        ? 'http://127.0.0.1:3001'
        : window.location.origin)

    const connection = startRealtime(client, realtimeUrl)

    return () => connection.stop()
  }, [client, session.isSuccess, session.data?.userId])

  return children
}
