
import { client } from './client'
import type { Credentials, Session } from '../domain/api'

export const authApi = {
  async me(signal?: AbortSignal): Promise<Session | null> {
    const response = await client.get<Session | null>(
      '/auth/me',
      { signal },
    )

    return response.data
  },

  async login(credentials: Credentials): Promise<Session> {
    const response = await client.post<Session>(
      '/auth/login',
      credentials,
    )

    return response.data
  },

  async register(credentials: Credentials): Promise<Session> {
    const response = await client.post<Session>(
      '/auth/register',
      credentials,
    )

    return response.data
  },

  async logout(): Promise<null> {
    await client.post('/auth/logout')

    return null
  },
}
