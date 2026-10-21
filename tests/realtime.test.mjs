
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { io as createClient } from 'socket.io-client'
import { QueryClient } from '@tanstack/react-query'
import { createEventAdapter } from '../src/realtime/adapter.ts'

import { createRealtimeServer } from '../server/realtime.ts'
import {
  initialAvailability,
  validEvent,
  eventKey,
} from '../src/realtime/contracts.ts'

let server
let directory
let dataFile
let socket

function waitForEvent(client, predicate = () => true, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.off('event', handler)
      reject(new Error('Tempo esgotado aguardando evento Socket.IO'))
    }, timeout)

    function handler(event) {
      if (!predicate(event)) return

      clearTimeout(timer)
      client.off('event', handler)
      resolve(event)
    }

    client.on('event', handler)
  })
}

async function command(body) {
  const response = await fetch(`${server.url}/dev/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const result = await response.json()

  assert.equal(
    response.status,
    200,
    `Comando falhou: ${JSON.stringify(result)}`,
  )

  return result
}

async function connectClient(auth = {}) {
  const client = createClient(server.url, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: false,
    timeout: 3000,
    auth,
  })

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout ao conectar Socket.IO'))
      }, 3000)

      client.once('connect', () => {
        clearTimeout(timer)
        resolve()
      })

      client.once('connect_error', error => {
        clearTimeout(timer)
        reject(error)
      })

      client.connect()
    })

    return client
  } catch (error) {
    client.disconnect()
    throw error
  }
}

function sync(client) {
  return client.timeout(3000).emitWithAck('sync')
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'kurio-realtime-'))
  dataFile = join(directory, 'availability.json')

  server = await createRealtimeServer({
    port: 0,
    file: dataFile,
    origins: ['http://localhost:5173'],
  })

  socket = await connectClient()
})

after(async () => {
  socket?.disconnect()

  if (server) {
    await server.close()
  }

  if (directory) {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Socket.IO estabelece conexão real', () => {
  assert.equal(socket.connected, true)
  assert.equal(socket.io.engine.transport.name, 'websocket')
})

test('sync retorna lista de eventos', async () => {
  const events = await sync(socket)

  assert.ok(Array.isArray(events))
})

test('contrato valida evento NFT correto', () => {
  const event = {
    protocol: 1,
    eventId: randomUUID(),
    type: 'nft:availability-changed',
    entityId: '042',
    version: 1,
    occurredAt: new Date().toISOString(),
    payload: {
      availability: initialAvailability(),
    },
  }

  assert.equal(validEvent(event), true)
  assert.equal(eventKey(event), 'nft:042')
})

test('contrato rejeita evento malformado', () => {
  const event = {
    protocol: 1,
    eventId: randomUUID(),
    type: 'nft:availability-changed',
    entityId: '042',
    version: 1,
    occurredAt: new Date().toISOString(),
    payload: {
      availability: {
        '1/50': 'false',
      },
    },
  }

  assert.equal(validEvent(event), false)
})

test('alteração de disponibilidade emite evento versionado', async () => {
  const received = waitForEvent(
    socket,
    event => event.entityId === '042' && event.version === 1,
  )

  const result = await command({
    action: 'set',
    nftId: '042',
    edition: '1/50',
    available: false,
  })

  const event = await received

  assert.equal(event.eventId, result.eventId)
  assert.equal(event.version, 1)
  assert.equal(event.payload.availability['1/50'], false)
  assert.equal(validEvent(event), true)
})

test('nova alteração incrementa a versão', async () => {
  const received = waitForEvent(
    socket,
    event => event.entityId === '042' && event.version === 2,
  )

  const result = await command({
    action: 'set',
    nftId: '042',
    edition: '1/50',
    available: true,
  })

  const event = await received

  assert.equal(event.version, 2)
  assert.equal(event.payload.availability['1/50'], true)
  assert.equal(event.eventId, result.eventId)
})

test('duplicate reenvia mesmo eventId e versão', async () => {
  const received = waitForEvent(
    socket,
    event => event.entityId === '042',
  )

  const duplicate = await command({
    action: 'duplicate',
    nftId: '042',
  })

  const event = await received

  assert.equal(event.eventId, duplicate.eventId)
  assert.equal(event.version, 2)
  assert.equal(event.payload.availability['1/50'], true)
})

test('old emite versão anterior à atual', async () => {
  const received = waitForEvent(
    socket,
    event => event.entityId === '042' && event.version === 1,
  )

  const old = await command({
    action: 'old',
    nftId: '042',
  })

  const event = await received

  assert.equal(event.version, 1)
  assert.equal(event.eventId, old.eventId)
})

test('sync preserva somente o evento mais recente', async () => {
  const events = await sync(socket)
  const nft = events.find(event => event.entityId === '042')

  assert.ok(nft)
  assert.equal(nft.version, 2)
  assert.equal(nft.payload.availability['1/50'], true)
})

test('disponibilidade é persistida em arquivo', async () => {
  const saved = JSON.parse(await readFile(dataFile, 'utf8'))
  const nft = saved.find(event => event.entityId === '042')

  assert.ok(nft)
  assert.equal(nft.version, 2)
  assert.equal(nft.payload.availability['1/50'], true)
})

test('cliente reconecta e recupera estado via sync', async () => {
  const secondClient = await connectClient()

  try {
    const events = await sync(secondClient)
    const nft = events.find(event => event.entityId === '042')

    assert.ok(nft)
    assert.equal(nft.version, 2)
  } finally {
    secondClient.disconnect()
  }
})

test('comando rejeita NFT inexistente', async () => {
  const response = await fetch(`${server.url}/dev/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'set',
      nftId: 'NFT-INEXISTENTE',
      edition: '1/50',
      available: false,
    }),
  })

  assert.equal(response.status, 400)
})

test('conexão sem credencial não pode publicar pedido privado', async () => {
  const event = {
    protocol: 1,
    eventId: randomUUID(),
    type: 'order:created',
    entityId: `DEMO-${randomUUID()}`,
    version: 1,
    occurredAt: new Date().toISOString(),
    payload: { status: 'demo-confirmed' },
  }

  const result = await socket
    .timeout(3000)
    .emitWithAck('private:publish', event)

  assert.deepEqual(result, { ok: false })
})

function makeNftEvent(version, available, eventId = randomUUID()) {
  return {
    protocol: 1,
    eventId,
    type: 'nft:availability-changed',
    entityId: '042',
    version,
    occurredAt: new Date().toISOString(),
    payload: {
      availability: {
        ...initialAvailability(),
        '1/50': available,
      },
    },
  }
}

test('adaptador ignora eventos duplicados', async () => {
  const client = new QueryClient()
  const persisted = []

  const adapter = createEventAdapter(client, async event => {
    persisted.push(event)
    return true
  })

  const event = makeNftEvent(1, false)

  assert.equal(await adapter.receive(event), true)
  assert.equal(await adapter.receive(event), false)
  assert.equal(persisted.length, 1)

  client.clear()
})

test('adaptador ignora versão antiga com estado contraditório', async () => {
  const client = new QueryClient()
  const persisted = []

  const adapter = createEventAdapter(client, async event => {
    persisted.push(event)
    return true
  })

  const current = makeNftEvent(2, true)
  const outdated = makeNftEvent(1, false)

  assert.equal(await adapter.receive(current), true)
  assert.equal(await adapter.receive(outdated), false)

  assert.equal(persisted.length, 1)
  assert.equal(persisted[0].version, 2)
  assert.equal(persisted[0].payload.availability['1/50'], true)

  client.clear()
})

test('adaptador permite repetir evento após persistência não aplicada', async () => {
  const client = new QueryClient()
  let attempts = 0

  const adapter = createEventAdapter(client, async () => {
    attempts += 1
    return attempts > 1
  })

  const event = makeNftEvent(1, false)

  assert.equal(await adapter.receive(event), false)
  assert.equal(await adapter.receive(event), true)
  assert.equal(attempts, 2)

  client.clear()
})

test('adaptador rejeita evento malformado antes de persistir', async () => {
  const client = new QueryClient()
  let attempts = 0

  const adapter = createEventAdapter(client, async () => {
    attempts += 1
    return true
  })

  assert.equal(await adapter.receive({ type: 'nft:updated' }), false)
  assert.equal(attempts, 0)

  client.clear()
})

test('adaptador invalida catálogo e carrinho após evento NFT', async () => {
  const client = new QueryClient()

  client.setQueryData(['nfts'], { items: [] })
  client.setQueryData(['cart'], { items: [] })

  const adapter = createEventAdapter(client, async () => true)

  const event = makeNftEvent(1, false)

  assert.equal(await adapter.receive(event), true)

  assert.equal(
    client.getQueryState(['nfts'])?.isInvalidated,
    true,
  )

  assert.equal(
    client.getQueryState(['cart'])?.isInvalidated,
    true,
  )

  client.clear()
})