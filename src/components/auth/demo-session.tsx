// Compatibility hook for existing consumers. There is no parallel local session.
import { useSession } from '@/hooks/use-api'
export function useDemoSession() { return useSession().data ?? null }
