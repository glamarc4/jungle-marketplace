import { http } from 'msw'
import { account, validSession, hashPassword } from '../data/database'
import { validEmail } from '../../domain/validation'
import { body, requireValue, respond } from './http'

export const profileHandlers = [
  http.get('/api/profile', () => respond(false, db => { requireValue(validSession(db), 'Sessão expirada. Entre novamente.', 401); return account(db).profile })),
  http.patch('/api/profile', ({ request }) => respond(true, async db => {
    requireValue(validSession(db), 'Sessão expirada. Entre novamente.', 401)
    const input = await body(request)
    const profile = account(db).profile
    for (const key of Object.keys(profile) as (keyof typeof profile)[]) {
      if (key in input) {
        const value = input[key]
        requireValue(typeof value === 'string' && value.length <= (key === 'avatar' ? 700_000 : 200), `Campo ${key} inválido.`)
        profile[key] = value.trim()
      }
    }
    requireValue(profile.displayName && /^[A-Za-z0-9_-]{3,30}$/.test(profile.username) && validEmail(profile.email) && profile.ens && profile.walletNickname && profile.ensSuffix === '.eth', 'Preencha os campos obrigatórios do perfil com dados válidos.')
    requireValue(!profile.avatar || /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(profile.avatar), 'Avatar inválido. Use PNG, JPEG, GIF ou WebP.')
    const user = db.users.find(item => item.userId === db.session?.userId)
    if (input.newPassword || input.currentPassword) {
      requireValue(user && typeof input.currentPassword === 'string' && typeof input.newPassword === 'string' && input.newPassword.length >= 8 && input.newPassword.length <= 128, 'Informe a senha atual e uma nova senha de 8 a 128 caracteres.')
      requireValue(await hashPassword(input.currentPassword, user.salt) === user.passwordHash, 'Senha atual inválida.', 401)
      user.salt = crypto.randomUUID(); user.passwordHash = await hashPassword(input.newPassword, user.salt)
    }
    if (user) {
      const email = profile.email.toLowerCase()
      requireValue(!db.users.some(other => other.userId !== user.userId && other.email === email), 'E-mail já cadastrado.', 409)
      user.email = email; profile.email = email; db.session = { userId: user.userId, email }
    }
    return profile
  })),
]
