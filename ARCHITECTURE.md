# Arquitetura do Kurio

Este documento descreve a implementação presente no repositório. A matriz local em `reports/acceptance-audit/matrix.json` foi usada como referência dos requisitos; seus resultados são históricos. Setup, cenários reproduzíveis, comandos e resultados informados da entrega estão no [README.md](README.md).

## Organização e fluxo de dados

O Kurio é uma SPA React/TypeScript. Componentes consomem hooks de TanStack Query, que chamam Axios; o MSW intercepta `/api/*` e executa os handlers sobre uma base local. O Socket.IO funciona em um processo Node separado e sinaliza alterações que o cliente reconcilia por REST.

Na entrega, o frontend está publicado na Netlify e o relay no Render. O endereço público e a configuração necessária estão em [Build e deploy](README.md#build-e-deploy). O Render hospeda o Socket.IO; a API REST continua simulada no navegador. A hospedagem não altera as restrições de desenvolvimento descritas abaixo.

```text
src/pages + src/components
          ↓
src/hooks → TanStack Query → src/api → Axios /api
                                          ↓
                              src/mocks/handlers (MSW)
                                          ↓
                              src/mocks/data + src/domain
                                          ↓
                              localStorage: kurio:api:v1

server/realtime.ts ↔ Socket.IO ↔ src/realtime
                                     ↓
                        ponte REST + invalidação de queries
```

- `src/router/`: rotas tipadas, validação do catálogo na URL e guards de sessão.
- `src/domain/`: tipos, validações, valores monetários e assinatura do carrinho.
- `src/data/`: catálogo e conteúdo editorial locais.
- `src/api/`: cliente Axios e serviços REST; favoritos usam Axios diretamente em seu hook.
- `src/hooks/`: consultas e mutações, incluindo favoritos otimistas.
- `src/mocks/`: handlers compartilhados pelos ambientes de demonstração e testes Node.
- `src/realtime/`: contrato, conexão única na raiz e adaptador de eventos.
- `server/` e `scripts/`: relay, inicialização conjunta e CLI de simulação.

`src/main.tsx` aguarda o MSW antes de montar o React. O mock também é incluído no build: não há backend REST externo nem chave para desativá-lo. Estado de formulário, seleção visual e abertura de modais fica nos componentes; estado remoto fica no Query; parâmetros aplicados do catálogo ficam na URL. O Router valida busca, coleção, rede, preço, aba, ordenação e página; alterações de filtro reiniciam a paginação.

## Contratos REST

Base `/api`, JSON e timeout Axios de 15 segundos. Erros retornam `{ "message": "mensagem em português" }`. Os handlers usam 400 para entrada inválida, 401 para sessão/credenciais inválidas, 404 para recurso ausente, 409 para conflito e 503 para falha de armazenamento. Não existe contrato específico de 403 implementado.

### Catálogo, autenticação e favoritos

- `GET /nfts`: aceita `page` (padrão 1), `pageSize` (9, máximo 100), `search`, `collection`, `network`, `minPriceEth`, `maxPriceEth`, `sort` (`recent`, `price-asc`, `price-desc`, `name`) e `tab` (`all`, `new`, `trending`). Retorna `{ items, total, page, totalPages, facets }`. As facetas contam o catálogo completo. Os filtros legados `minPrice`/`maxPrice` continuam aceitos em centésimos de ETH.
- `GET /nfts/:id`: detalhe, galeria, edições e disponibilidade; 404 se ausente. Aliases `42`, `88` e `160` resolvem para `042`, `088` e `166`.
- `POST /auth/register`: `{ email, username, password }` → sessão `{ userId, email }`, status 201.
- `POST /auth/login`: `{ email, password }` → sessão, status 200.
- `GET /auth/me`: sessão válida ou `null`.
- `POST /auth/logout`: encerra a sessão e retorna uma mensagem; o serviço converte o resultado em `null` para o Query.
- `GET /favorites`, `PUT /favorites/:id` e `DELETE /favorites/:id`: retornam `string[]` de IDs. Exigem sessão e `X-Account-Id` igual ao usuário ativo. PUT é idempotente para um NFT já favoritado.

### Carrinho

- `GET /cart`: `{ items, coupon, unavailableItems, subtotalEth, discountEth, networkFeeEth, totalEth }`.
- `POST /cart/items`: `{ nftId, edition, quantity }` → carrinho atualizado, status 201.
- `PATCH /cart/items/:id`: `{ quantity }` → carrinho atualizado.
- `DELETE /cart/items/:id`: remove a linha e retorna o carrinho atualizado.
- `PATCH /cart`: `{ coupon: "KURIO10" }` ou `{ coupon: null }` → carrinho atualizado.

O identificador da linha é `nftId:edition`, codificado na URL com `encodeURIComponent`, por exemplo `042:1/50`. As linhas contêm `key`, `nftId`, `name`, `tokenId`, `artwork`, `edition`, `quantity` e `unitPriceEth`. `unavailableItems` lista chaves de edições indisponíveis. Inclusão ou aumento de quantidade em edição indisponível retorna 409.

### Perfil, carteiras e pedidos

- `GET /profile` e `PATCH /profile`: perfil da conta ativa. Campos: `displayName`, `username`, `email`, `ens`, `ensSuffix`, `walletNickname` e `avatar`. PATCH aceita `currentPassword`/`newPassword`; avatar é uma data URL PNG/JPEG/GIF/WebP validada.
- `GET /wallets`: lista da conta. `POST /wallets`: cria carteira (201). `PATCH /wallets/:id`: edita ou altera a principal. `DELETE /wallets/:id`: remove e retorna mensagem.
- Carteiras usam `displayName`, `nickname`, `network`, `profileName`, `address`, `secondaryAddress`, `walletType`, `referralCode`, `email`, `ens`, `primary` e `id`. Redes: `ethereum`, `polygon`, `solana`; tipos: `metamask`, `coinbase`, `walletconnect`. A primeira é principal; remover a principal promove a primeira restante.
- `POST /orders`: `{ collector, selectedWallet, cartSignature }`, com header obrigatório `Idempotency-Key` → pedido com status `pending`, HTTP 201.
- `GET /orders`: lista da conta; `GET /orders/:id`: snapshot do pedido da conta ativa. Pedido inexistente ou de outra conta retorna 404.
- `PATCH /orders/:id/status`: somente em desenvolvimento; `{ status: "confirmed" | "declined" | "demo-completed" }` → pedido atualizado. `pending` pode ir para `confirmed` ou `declined`; `demo-confirmed` legado pode ir para `demo-completed`. Repetir o estado atual não reaplica efeitos; transição incompatível retorna 409.

Todas essas operações de perfil, carteiras e pedidos exigem sessão válida. O corpo `collector` segue `CollectorFormValues` em `src/domain/collector.ts`: identificação do colecionador, e-mail, rede, tipo/endereço da carteira, endereço alternativo, indicação, ENS e observações. A API valida os campos usados na compra; nem todos os campos do formulário integram o snapshot final.

O pedido retorna `orderId` (`DEMO-<UUID>`), `createdAt` ISO, `date` de exibição, `status`, `wallet`, `walletAddress`, `network`, `items`, `coupon` e os quatro totais ETH. Dados financeiros e itens são preservados como snapshot; consultas não recalculam o pedido pelo catálogo atual. O status pode mudar pelas transições previstas.

### Valores monetários

O transporte REST usa strings decimais em ETH: `priceEth`/`previousPriceEth` no catálogo, `unitPriceEth` nas linhas e `subtotalEth`, `discountEth`, `networkFeeEth`, `totalEth` em carrinho/pedidos. O detalhe usa `price`, também string ETH.

`src/domain/money-transport.ts` converte a resposta MSW e decodifica no interceptor Axios, antes do Query. O domínio e a persistência mantêm inteiros seguros: centésimos de ETH no catálogo e microETH nos itens/totais. As conversões e os cálculos usam `BigInt`; não há arredondamento silencioso. Valores fora da precisão suportada ou de `Number.MAX_SAFE_INTEGER` unidades internas são rejeitados.

O subtotal soma preço × quantidade; `KURIO10` aplica 10%; a taxa fixa é `"0.016"` ETH em carrinhos com itens e zero no vazio. Total = subtotal − desconto + taxa. O domínio suporta duas casas no catálogo/filtros e seis nos itens/totais, não valores arbitrários de 18 casas em wei.

## Autenticação e persistência

`kurio:api:v1` armazena usuários, hashes/salts, sessão, validade, contas, carrinhos, pedidos, idempotência e dados realtime. Uma base nova não possui usuários. Cadastros/logins definem validade de 30 minutos; sessões legadas sem prazo permanecem compatíveis até um novo login.

Senhas usam Web Crypto PBKDF2/SHA-256, salt por usuário e 100.000 iterações. Troca de senha verifica a atual; troca de e-mail atualiza login e sessão. Não há JWT, cookie HttpOnly, OAuth, recuperação de senha ou verificação de e-mail. Essa autenticação é demonstrativa: a base e a verificação estão sob controle do navegador.

Os guards de checkout, confirmação, perfil e carteiras consultam `/auth/me` ao acessar a rota, sem confiar apenas no cache. O destino permitido e o `orderId` são preservados no redirecionamento ao login. `useSession` reconsulta a sessão a cada 15 segundos; perfil/carteiras invalidam a rota ao perder a sessão. O checkout trata perda de sessão e 401 no envio. Rascunhos de formulário e chave de envio em memória não sobrevivem a um reload.

Cada operação lê a base atual. Uma fila serializa operações na aba e Web Locks coordena abas quando disponível. Escritas persistem antes da resposta; falha de armazenamento resulta em 503. Dados antigos de sessão, perfil, carteiras e carrinho são migrados; chaves globais de favoritos não são atribuídas a contas porque não identificam o proprietário. Sem Web Locks, a coordenação entre abas é limitada.

## Carrinho e consistência do pedido

`carts[userId]` e `carts.guest` separam carrinhos persistidos; `db.cart` é a referência de compatibilidade para o carrinho ativo. Login/cadastro salva o carrinho anterior e carrega o da conta. Ao entrar como visitante, mescla itens por NFT canônico + edição, limita a soma a 99, prioriza o cupom da conta e limpa o carrinho visitante para evitar nova mesclagem. Logout restaura o carrinho visitante.

As mutações de carrinho são serializadas pelo escopo `cart` do Query; a resposta REST fornece os totais exibidos. `cartSignature` serializa chaves, quantidades, preços unitários e cupom. O POST compara essa assinatura com o carrinho armazenado, valida disponibilidade e calcula o snapshot na API; não aceita totais enviados pelo cliente. Essa assinatura não é uma cotação completa versionada de taxas e estoque.

Idempotência é armazenada por usuário + chave e fingerprint do conteúdo. Mesma chave/conteúdo recupera o pedido atual; conteúdo diferente retorna 409. A autorização ocorre antes do replay. A interface bloqueia envio simultâneo e reutiliza a chave em tentativas com os mesmos dados enquanto o componente permanece montado.

Criar pedido pendente mantém o carrinho. A confirmação manual subtrai as quantidades compradas das linhas correspondentes; a recusa mantém os itens. O cupom é removido quando o carrinho fica vazio. Não há reserva/decremento de estoque real, processador de pagamento ou transição automática. Recuperar um pedido existente por GET após reload funciona; recuperar automaticamente uma resposta perdida do POST após reload não está implementado.

## Cache e sincronização entre abas

TanStack Query centraliza consultas com `staleTime` de 30 segundos, deduplicação e `AbortSignal`. Há uma tentativa adicional para erro de rede/5xx; 4xx e mutações não têm retry automático.

- Catálogo: `['nfts', filtros]`; detalhe: `['nfts', 'detail', id]`.
- Sessão: `['session']`; carrinho: `['cart']`.
- Perfil, carteiras e pedidos: prefixo `['account', recurso]`, com usuário e, quando necessário, tipo de consulta/ID.
- Favoritos: `['account', 'favorites', userId]`.

Carrinho recebe os dados da mutação e é invalidado ao terminar; perfil/carteiras invalidam suas consultas; criação de pedido preenche o detalhe e invalida carrinho/lista. Favoritos cancelam a consulta anterior, atualizam otimisticamente e restauram o snapshot em erro. Seus callbacks verificam se a conta original ainda está ativa antes de escrever no cache.

Logout e troca/expiração de sessão cancelam e removem consultas com prefixo `account`. O evento `storage` de `kurio:api:v1` invalida consultas em outras abas. A chave de cache do carrinho é global e não é explicitamente invalidada pelo hook de autenticação: o isolamento persistido não equivale a uma garantia de atualização imediata do carrinho em cache na troca de conta. Mutações privadas fora de favoritos também não possuem a mesma proteção explícita contra callbacks de uma conta anterior.

## Contrato Socket.IO e reconciliação

O servidor em `server/realtime.ts` é um relay Socket.IO real. O MSW simula REST e a ponte de persistência; não intercepta o protocolo Socket.IO. O provider na raiz mantém uma conexão por ciclo de sessão e remove listeners/desconecta ao desmontar ou trocar de usuário.

O transporte servidor → cliente usa o canal `event`. Seu envelope é:

```ts
type RealtimeEnvelope = {
  protocol: 1,
  eventId: string,       // UUID
  type: string,
  entityId: string,
  version: number,       // inteiro positivo por entidade
  occurredAt: string,    // data válida
  payload: object
}
```

Tipos aceitos:

- `nft:updated` e `nft:availability-changed`: `payload: { availability }`, com booleanos para `1/1`, `1/10`, `1/50` e `ABERTA`. Não transportam atualização de preço.
- `order:created` e `order:status-changed`: `payload: { status }`, aceitando `pending`, `confirmed`, `declined` e os legados `demo-confirmed`/`demo-completed`.

Cliente → servidor:

- `sync(callback)`: callback recebe os últimos eventos públicos por NFT, inclusive após reconexão.
- `private:publish(event, callback)`: publica evento de pedido na sala privada; callback retorna `{ ok: boolean }`.

`GET /api/realtime/session` fornece uma capability aleatória de 32 bytes, codificada em 64 caracteres hexadecimais, por conta; visitante recebe `null`. O handshake envia `{ capability }`, e o servidor deriva a sala pelo SHA-256 desse segredo. O relay valida o formato e restringe a publicação à sala, mas não autentica a conta contra um backend. A capability local não substitui autenticação segura.

Endpoints da ponte MSW:

- `POST /realtime/events`: valida e aplica disponibilidade pública por versão; para pedidos, verifica a existência na conta e sinaliza refetch, sem aceitar status remoto como verdade persistida. **Disponível apenas em desenvolvimento.**
- `GET /realtime/outbox`: eventos pendentes da conta autenticada.
- `DELETE /realtime/outbox/:id`: confirma entrega e remove o evento dessa conta.

Criação/transição de pedido grava uma outbox na mesma transação local. Após conexão ou escrita local, o cliente envia os eventos e só remove os confirmados pelo ACK. O relay não persiste histórico privado; persiste somente snapshots públicos de disponibilidade no arquivo configurado.

O adaptador serializa eventos, valida payloads e ignora IDs repetidos ou versões antigas. Só registra o evento como processado após a ponte confirmar aplicação. Eventos NFT invalidam catálogo, detalhe correspondente e carrinho; eventos de pedido invalidam consultas de pedidos. Ao reconectar, `sync` recupera disponibilidade, invalida catálogo/carrinho/pedidos/sessão via REST e reenvia a outbox. Socket.IO tenta reconectar com intervalo de 500 ms a 5 segundos; ACKs usam timeout de 3 segundos e falhas de sincronização agendam nova tentativa.

`POST /dev/command` é uma interface do relay para a CLI local, sem header Origin, apenas loopback e fora de produção. Aceita `set`, `duplicate`, `old` e `disconnect`; não é endpoint público da aplicação.

## Decisões, limitações e relação com o Figma

- **Demonstração independente:** MSW e `localStorage` permitem executar os fluxos REST sem backend. Dados não são compartilhados entre dispositivos/origens; a solução não representa autenticação ou armazenamento de produção.
- **Separação de responsabilidades:** Router controla navegação; Query controla estado remoto; Axios centraliza transporte e conversão monetária. Regras de validação e dinheiro ficam fora dos componentes.
- **Compatibilidade de dados:** aliases, migração da base e codecs preservam dados existentes, mantendo a precisão interna explicitamente limitada.
- **Pagamento e falhas:** existe estado pendente e transição manual de desenvolvimento, mas não simulador visual de conexão/recusa de carteira, timeout pós-criação recuperável após reload, cotação completa ou cupom expirável. Não há seletor MSW de latência/offline/5xx.
- **Realtime no build:** o cliente conecta também em produção, porém a ponte de eventos e a transição de pedido estão bloqueadas por `import.meta.env.DEV`. Novos pedidos do build permanecem pendentes; o fluxo realtime completo não está habilitado. Os nomes de eventos implementados usam `:` e diferem de `nft.updated`/`order.updated` citados na matriz.
- **Disponibilidade:** é booleana por edição, sem estoque quantitativo ou atualização de preço por evento. Quantidades são limitadas a 99. Todos os valores continuam expressos em ETH, inclusive nas simulações Polygon/Solana.
- **Carteiras:** a validação confere formato de endereço EVM/base58 Solana; não verifica propriedade, saldo ou checksum EIP-55. Não há bloqueio de carrinho com NFTs de redes diferentes da carteira selecionada.
- **Fidelidade visual:** não há arquivo/link Figma disponível para uma comparação direta nesta revisão; não se afirma equivalência pixel a pixel. O código implementa carrossel/arte específicos para mobile, navegação inferior e reorganização responsiva dos blocos. Os assets locais reutilizam quatro imagens de macacos entre variantes; a galeria simulada repete a arte, e detalhes sem conteúdo específico reutilizam metadados de referência.
- **Adaptações funcionais:** estados de carregamento/erro/vazio, controles de busca, carteira cadastrada e status pendente/recusado complementam a interface demonstrativa. O atalho mobile de favoritos leva ao catálogo porque não existe rota `/favoritos`. Ações sociais e alguns links auxiliares permanecem desabilitados ou demonstrativos.
- **Validação:** resultados anteriores de testes e prints Lighthouse estão no [README](README.md#testes-e-validação). A suíte E2E não inicia o relay e não comprova realtime no navegador. Baselines visuais próprias não comprovam fidelidade ao Figma, cobertura de tablet, zoom ou acessibilidade integral. Não houve nova execução de testes ou auditoria nesta revisão.

Essas limitações permanecem registradas para avaliação; a documentação não declara atendimento integral à matriz do desafio.
