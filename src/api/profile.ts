import { client } from './client'
import type { ProfileValues } from '../domain/profile'
export type ProfileUpdate = Partial<ProfileValues> & { currentPassword?: string; newPassword?: string }
export const profileApi = {
  get: (signal?: AbortSignal) => client.get<ProfileValues>('/profile', { signal }).then(r => r.data),
  update: (input: ProfileUpdate) => client.patch<ProfileValues>('/profile', input).then(r => r.data),
}
