import { http } from 'msw'
import { account, hashPassword, validSession } from '../data/database'
import { validEmail } from '../../domain/validation'
import { body, requireValue, respond, textField } from './http'

export const authHandlers = [
  http.get('/api/auth/me', () => respond(false, validSession)),
  http.post('/api/auth/logout', () => respond(true, db => { db.session = null; return { message: 'Sessão encerrada.' } })),
  http.post('/api/auth/register', ({ request }) => respond(true, async db => {
    const input = await body(request)
    const email = textField(input.email, 'E-mail').toLowerCase()
    const username = textField(input.username, 'Nome de usuário', 30)
    requireValue(typeof input.password === 'string' && input.password.length > 0 && input.password.length <= 128, 'Senha inválida ou ausente.')
    const password = input.password
    requireValue(validEmail(email) && /^[A-Za-z0-9_-]{3,30}$/.test(username) && password.length >= 8, 'Informe e-mail válido, usuário de 3 a 30 caracteres e senha de pelo menos 8 caracteres.')
    const existing = db.users.find(user => user.email === email)
    requireValue(!existing || !existing.passwordHash, 'Este e-mail já está cadastrado.', 409)
    const user = existing ?? { userId: crypto.randomUUID(), email, salt: '', passwordHash: '' }
    user.salt = crypto.randomUUID()
    user.passwordHash = await hashPassword(password, user.salt)
    if (!existing) db.users.push(user)
    db.session = { userId: user.userId, email }
    const profile = account(db).profile
    profile.email = email; profile.username = username; profile.displayName ||= username
    return db.session
  }, 201)),
  http.post('/api/auth/login', ({ request }) => respond(true, async db => {
    const input = await body(request)
    const email = textField(input.email, 'E-mail').toLowerCase()
    requireValue(typeof input.password === 'string' && input.password.length > 0 && input.password.length <= 128, 'Senha inválida ou ausente.')
    const password = input.password
    const user = db.users.find(item => item.email === email)
    requireValue(user?.passwordHash && await hashPassword(password, user.salt) === user.passwordHash, 'E-mail ou senha inválidos.', 401)
    db.session = { userId: user.userId, email: user.email }
    return db.session
  })),
]
