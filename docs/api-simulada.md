# API REST simulada do Kurio

## Arquitetura e decisões

Componentes → hooks `src/hooks/use-api.ts` → serviços Axios `src/api/` → endpoints MSW `src/mocks/handlers/` → base local `src/mocks/data/database.ts`.

O MSW 3.0.3 intercepta as chamadas no navegador. `worker.start()` termina antes da montagem do React. A simulação permanece ativa no build/preview porque este repositório precisa funcionar sem backend. O worker em `public/mockServiceWorker.js` foi gerado pelo CLI da versão instalada; é código de fornecedor excluído do lint, sem desabilitar regras do código da aplicação. Para regenerar: `npx msw init public --save`.

TanStack Query é o único estado remoto no cliente. As fachadas antigas de carrinho e sessão apenas usam os novos hooks. As consultas têm chaves organizadas, `AbortSignal`, deduplicação e validade de 30 segundos. Mutações atualizam/invalidam os caches correspondentes; trocas de conta cancelam e removem dados privados do cache. Eventos `storage` invalidam dados entre abas. Falhas apresentam mensagens e, nas consultas principais, botão para tentar novamente.

Os 24 NFTs originais do catálogo mantêm nomes, preços e artworks. Os detalhes usam os dados existentes e agora cobrem todo o catálogo. IDs legados `42`, `88` e `160` são aliases de `042`, `088` e `166`, respectivamente; o catálogo define o nome canônico de Golden Signal #166. Os itens são deduplicados por ID canônico + edição. Quantidades são inteiras entre 1 e 99, como na interface original; não há controle de estoque real por edição.

As rotas, layout, cores, tipografia, artworks e Footer foram mantidos. Foram adicionados estados de requisição, busca no catálogo, contador funcional, seleção/remoção de carteiras salvas e seleção no checkout. O layout raiz foi apenas extraído do arquivo de rotas para corrigir Fast Refresh.

## Persistência e credenciais

A chave `kurio:api:v1` no localStorage contém a versão da base, contas, sessão, carrinho, cupom, carteiras, pedidos e registros de idempotência. Perfil e carteiras pertencem à conta atual ou ao visitante `guest`; novos pedidos exigem uma conta autenticada. O carrinho é compartilhado no navegador, inclusive ao entrar/sair. Dados de visitante não são automaticamente transferidos para uma nova conta.

A primeira leitura migra a sessão antiga, perfil/carteiras da sessão ativa e carrinho antigo. Itens inválidos são descartados e aliases duplicados são reunidos, respeitando o limite de 99. A antiga chave de sessão é removida após persistir a base nova; os demais dados legados permanecem disponíveis como cópia. Sem carrinho legado, são mantidas as três linhas iniciais da demonstração. Perfis de outras sessões legadas não são importados automaticamente.

Usuários legados não possuíam senha verificável. A sessão existente é mantida e um cadastro com o mesmo e-mail estabelece suas credenciais, preservando a conta. Novas senhas usam Web Crypto PBKDF2/SHA-256, salt aleatório por usuário e 100.000 iterações. A troca de senha verifica a senha atual. Senhas não são persistidas em texto puro.

Isso **não é autenticação segura para produção**: o usuário controla o código e o localStorage, pode alterar sessões/hashes, e não há servidor, cookies HttpOnly, verificação de e-mail, autorização real nem proteção contra ataques offline. Use somente dados e senhas fictícios. Não há OAuth, conexão real de carteira ou transferência de NFTs.

Cada operação lê uma cópia atual da base. Uma fila serializa acessos na aba; Web Locks serializa abas quando disponível. Escritas persistem antes de responder. Falha de quota retorna 503 sem informar sucesso nem aplicar parcialmente uma transação. Sem Web Locks, a proteção entre abas é limitada; navegadores modernos com contexto seguro são o alvo da demonstração.

## Dinheiro

Preços e valores JSON usam inteiros em **microETH**: 1 ETH = 1.000.000 microETH. Os centésimos de ETH dos mocks são convertidos exatamente. Reduções, desconto e total usam `bigint` internamente; a resposta só converte para `number` depois de verificar `Number.MAX_SAFE_INTEGER`.

- Subtotal: soma de preço unitário × quantidade.
- Cupom `KURIO10`: 10% exatos. Os preços existentes são múltiplos de 10.000 microETH; não é necessário arredondar. Valores que exigiriam arredondamento são rejeitados.
- Taxa demonstrativa fixa: 16.000 microETH quando há itens; zero no carrinho vazio.
- Total: subtotal − desconto + taxa.

Carrinho e resumo do checkout usam os totais calculados pela API. A confirmação usa o snapshot retornado pelo pedido. O cupom persiste ao navegar/recarregar. O endpoint de pedido ignora preços enviados pelo cliente e deriva tudo do carrinho armazenado.

## Endpoints

Todas as URLs abaixo começam com `/api`. Respostas de erro usam `{ "message": "mensagem em português" }`.

- `GET /nfts`: `page` (1), `pageSize` (9, máximo 100), `search`, `collection`, `network`, `minPrice`/`maxPrice` (centésimos de ETH), `sort` (`recent`, `price-asc`, `price-desc`, `name`), `tab` (`all`, `new`, `trending`). Retorna `items`, `total`, `page`, `totalPages` e contagens de facetas. A aba de novos preserva o corte original de 13/10/2026.
- `GET /nfts/:id`: detalhe, galeria, edições e informações; 404 quando ausente.
- `POST /auth/register`: `{ email, username, password }`; cria conta e sessão (201), 400 para campos inválidos e 409 para e-mail já cadastrado.
- `POST /auth/login`: `{ email, password }`; 401 para credenciais inválidas.
- `POST /auth/logout`: encerra a sessão.
- `GET /auth/me`: sessão `{ userId, email }`, ou `null` para visitante.
- `GET /cart`: itens, cupom e totais.
- `POST /cart/items`: `{ nftId, edition, quantity }`; 201 e carrinho atualizado. Uma linha existente recebe a quantidade adicional; excesso de 99 retorna 400.
- `PATCH /cart/items/:id`: `{ quantity }`; o identificador é a chave da linha codificada na URL, por exemplo `encodeURIComponent('042:1/50')`.
- `DELETE /cart/items/:id`: remove a linha e retorna o carrinho atualizado.
- `PATCH /cart`: `{ coupon: 'KURIO10' }` ou `{ coupon: null }`. Endpoint adicional necessário para manter o desconto entre telas.
- `GET /profile`: perfil da conta atual/visitante.
- `PATCH /profile`: alterações dos campos existentes; opcionais `currentPassword` e `newPassword`. E-mail autenticado também é atualizado na sessão e no login; conflitos retornam 409.
- `GET /wallets`: carteiras salvas.
- `POST /wallets`: dados do formulário e `primary`; retorna carteira com UUID (201).
- `PATCH /wallets/:id`: atualiza campos ou torna a carteira principal. Só uma carteira é principal.
- `DELETE /wallets/:id`: remove carteira; se necessário, promove a primeira restante.
- `POST /orders`: exige sessão válida (401 antes de validar o corpo ou consultar a idempotência); `{ collector, selectedWallet, cartSignature }` e header obrigatório `Idempotency-Key`. Retorna pedido de demonstração com UUID, data ISO/data de exibição, status `demo-confirmed`, carteira/endereço/rede, itens e valores. O contrato tipado está em `src/domain/api.ts`.
- `GET /orders`: pedidos da conta autenticada; 401 sem sessão válida.
- `GET /orders/:id`: pedido existente da conta autenticada; 401 sem sessão válida e 404 se ausente ou pertencente a outra conta.

Campos inválidos/JSON malformado retornam 400, login/senha atual inválida 401, recursos ausentes 404, conflitos 409, falha do armazenamento 503. Nenhuma chamada REST deve ser feita diretamente em componentes visuais.

## Carteiras e checkout

Ethereum e Polygon exigem `0x` + 40 dígitos hexadecimais. Solana exige base58 que decodifique para exatamente 32 bytes. A validação é de formato; não verifica propriedade, saldo, checksum EIP-55 ou existência na rede. Todas as quantias continuam em ETH, inclusive em simulações com outras redes.

O checkout pode usar carteira cadastrada ou endereço manual. O tipo selecionado deve corresponder ao formulário. A opção de outra carteira usa o endereço secundário. Catálogo, detalhes e carrinho continuam públicos. `/checkout` exige sessão validada pela API e redireciona visitantes para `/entrar?redirect=/checkout`. Login e cadastro preservam esse destino e o carrinho. A confirmação também exige autenticação e preserva o ID ao passar pelo login. Não há exigência de que os NFTs de um carrinho misto pertençam à rede da carteira: é um pedido demonstrativo, sem operação on-chain.

Na gestão de carteiras, os campos inferiores de carteira secundária usam a mesma rede da principal; carteiras de redes distintas podem ser cadastradas separadamente. Salvar principal e secundária usa duas mutações; se a segunda falhar, a interface informa que a primeira foi salva. Ambas podem ser editadas/removidas individualmente.

A criação do pedido registra o snapshot, a chave de idempotência e esvazia o carrinho/cupom em uma única escrita. Repetir a mesma chave e conteúdo retorna o mesmo pedido (201); reutilizar com outro conteúdo retorna 409. Requisições concorrentes com a mesma chave não geram outro pedido. A assinatura do carrinho rejeita confirmação com valores desatualizados. O botão fica desabilitado enquanto envia; o handler também possui trava síncrona e preserva a chave após erro para retry. O estado de envio da interface não sobrevive a um refresh, mas o registro de idempotência e os pedidos sobrevivem.

## Testes e resultados

Validação desta implementação em 21/10/2026:

- `npm run test:api`: 20 testes aprovados, zero falhas. Node Test Runner, Vite SSR e MSW Node exercitam os serviços Axios reais; nenhuma dependência de teste foi adicionada.
- `npm run lint`: aprovado, sem erros ou avisos.
- `npm run build`: aprovado com TypeScript estrito. Vite informa um chunk principal acima de 500 kB (aproximadamente 537 kB, 168 kB gzip); é uma oportunidade futura de divisão por rota.

Os testes cobrem todos os 24 detalhes; filtros/paginação/busca/ordenação; carrinho e aliases; quantidades inválidas; cupom e exemplo financeiro exato; cadastro/login/logout; atualização de perfil/senha; EVM/Solana e CRUD de carteiras; pedidos, snapshot e idempotência simultânea; persistência via reconstituição do storage; isolamento entre contas; migração; quota; overflow; JSON malformado e erros HTTP. A renderização estática do Header confere contador/sessão, e a do modal confere dados reais retornados pela API e aviso de demonstração.

Não houve teste visual nem E2E com cliques/reload real: o inventário de navegadores estava vazio e a abertura do navegador integrado retornou indisponível. Os testes de renderização não verificam layout, foco, responsividade, eventos React ou registro real do service worker. Esses pontos devem ser conferidos manualmente.

Antes das alterações, o build passou e o lint apresentou cinco erros: constantes exportadas com componentes em CollectorForm/CatalogFilters; setState síncrono em efeitos em ProfileForm/WalletsForm; RootLayout junto das rotas. Todos foram corrigidos como parte da integração, sem relaxar regras.

## Roteiro manual

1. Execute `npm run dev` e abra localhost. Confira a ativação do MSW e respostas `/api/*` no DevTools.
2. Filtre/busque no catálogo, navegue entre páginas e abra um NFT. Adicione uma edição; confira o contador do Header.
3. No carrinho, altere quantidades, remova itens e aplique `KURIO10`. Recarregue: itens/cupom devem permanecer.
4. Cadastre conta fictícia, saia, tente senha inválida e entre com a correta. Confira Entrar/Perfil no Header.
5. Salve perfil e carteiras. Teste EVM inválido e Solana; recarregue para conferir persistência.
6. Deslogado, avance do carrinho ao checkout e confira o redirecionamento ao login. Entre e verifique que o carrinho e o cupom permanecem. Escolha carteira, complete campos e confirme. Compare subtotal, desconto, taxa e total com o modal. Nenhuma blockchain é acessada.
7. Após confirmar, recarregue `/pedido/confirmacao?orderId=DEMO-...`: o mesmo modal deve ser recuperado por GET. Feche o modal e reabra o pedido na lista; o menu Perfil → Atividade também abre essa lista. Saia/entre novamente e confira o mesmo pedido. Consulte `/api/orders` no contexto da página para verificar persistência. Para idempotência concorrente e erros controlados, execute `npm run test:api`.
8. Execute `npm run build` e `npm run preview`; confira o mesmo fluxo no build.

A API só existe no contexto interceptado pelo MSW: `curl` contra o Vite não executa os handlers do navegador. Os testes Node inicializam seu próprio interceptador e storage em memória; não alteram dados do navegador.

## Arquivos desta entrega

As marcações consideram o conteúdo existente ao iniciar a tarefa, e não o status Git: várias telas já estavam sem rastreamento. Nenhum commit foi criado.

- **(NOVO)** `docs/api-simulada.md`
- **(NOVO)** `public/mockServiceWorker.js`
- **(NOVO)** `src/api/auth.ts`
- **(NOVO)** `src/api/cart.ts`
- **(NOVO)** `src/api/client.ts`
- **(NOVO)** `src/api/nfts.ts`
- **(NOVO)** `src/api/orders.ts`
- **(NOVO)** `src/api/profile.ts`
- **(NOVO)** `src/api/query-client.ts`
- **(NOVO)** `src/api/wallets.ts`
- **(NOVO)** `src/components/RequestState.tsx`
- **(NOVO)** `src/components/layout/RootLayout.tsx`
- **(NOVO)** `src/domain/api.ts`
- **(NOVO)** `src/domain/cart.ts`
- **(NOVO)** `src/domain/catalog.ts`
- **(NOVO)** `src/domain/collector.ts`
- **(NOVO)** `src/domain/money.ts`
- **(NOVO)** `src/domain/profile.ts`
- **(NOVO)** `src/domain/validation.ts`
- **(NOVO)** `src/domain/wallet.ts`
- **(NOVO)** `src/hooks/use-api.ts`
- **(NOVO)** `src/mocks/browser.ts`
- **(NOVO)** `src/mocks/data/database.ts`
- **(NOVO)** `src/mocks/data/nfts.ts`
- **(NOVO)** `src/mocks/handlers/auth.ts`
- **(NOVO)** `src/mocks/handlers/cart.ts`
- **(NOVO)** `src/mocks/handlers/http.ts`
- **(NOVO)** `src/mocks/handlers/index.ts`
- **(NOVO)** `src/mocks/handlers/nfts.ts`
- **(NOVO)** `src/mocks/handlers/orders.ts`
- **(NOVO)** `src/mocks/handlers/profile.ts`
- **(NOVO)** `src/mocks/handlers/wallets.ts`
- **(NOVO)** `tests/api.test.mjs`

- **(ALTERAR)** `README.md`
- **(ALTERAR)** `package.json`
- **(ALTERAR)** `package-lock.json`
- **(ALTERAR)** `eslint.config.js`
- **(ALTERAR)** `tsconfig.app.json`
- **(ALTERAR)** `src/main.tsx`
- **(ALTERAR)** `src/router/index.tsx`
- **(ALTERAR)** `src/data/nft-details.ts`
- **(ALTERAR)** `src/features/cart/cart-store.ts`
- **(ALTERAR)** `src/components/auth/demo-session.tsx`
- **(ALTERAR)** `src/components/auth/AuthModal.tsx`
- **(ALTERAR)** `src/components/layout/Header.tsx`
- **(ALTERAR)** `src/components/marketplace/CatalogSection.tsx`
- **(ALTERAR)** `src/components/marketplace/CatalogFilters.tsx`
- **(ALTERAR)** `src/components/nft/NftPurchasePanel.tsx`
- **(ALTERAR)** `src/components/nft/RelatedNfts.tsx`
- **(ALTERAR)** `src/pages/NftDetailPage.tsx`
- **(ALTERAR)** `src/pages/CartPage.tsx`
- **(ALTERAR)** `src/pages/CheckoutPage.tsx`
- **(ALTERAR)** `src/components/profile/ProfileForm.tsx`
- **(ALTERAR)** `src/components/profile/WalletsForm.tsx`
- **(ALTERAR)** `src/components/profile/ProfileSidebar.tsx`
- **(ALTERAR)** `src/components/checkout/CollectorForm.tsx`
- **(ALTERAR)** `src/components/checkout/CheckoutSummary.tsx`
- **(ALTERAR)** `src/components/checkout/OrderConfirmationModal.tsx`

## Referências consultadas

- [MSW: início do worker](https://mswjs.io/api/setup-worker/start). A opção usada segue os tipos da versão instalada (MSW 3: `onUnhandledFrame`).
- [TanStack Query: invalidação após mutações](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations).


## Correção de autorização e recuperação após recarregar

A persistência dos pedidos já existia em `accounts[userId].orders` dentro de `kurio:api:v1`, junto dos snapshots e da idempotência. O que desaparecia no F5 era o estado React `confirmedOrder`, usado para abrir o modal. A rota de confirmação ainda era um placeholder. Não foi necessário mudar o esquema da base nem recalcular pedidos históricos.

O checkout e o handler de criação antes admitiam `guest`, sem autorização. Agora o MSW verifica se a sessão corresponde a um usuário existente (ID e e-mail). `POST /api/orders` retorna 401 antes de ler o corpo ou reapresentar pedidos por idempotência quando não há sessão válida. As leituras de pedidos também exigem sessão e continuam isoladas por conta. `/auth/me` retorna `null` para sessão inválida, preservando sessões demo legadas válidas.

A proteção de rota usa `beforeLoad` e reconsulta a sessão mesmo quando o Header possui cache. Somente checkout e confirmação são destinos permitidos após autenticar; login/cadastro normais ainda levam ao perfil. Um 401 recebido durante a submissão também encaminha ao login, sem limpar o carrinho.

Após a criação, a aplicação navega para `/pedido/confirmacao?orderId=<ID retornado>`. O cache é preenchido com o pedido da resposta. Após F5, a página consulta `GET /api/orders/:id`, usando o snapshot persistido. Sem `orderId`, apresenta uma lista simples obtida de `GET /api/orders`; cada entrada reabre o modal existente. Nenhuma leitura ou montagem da página chama `POST /api/orders`. O componente e as dimensões responsivas do modal não foram alterados nesta correção.

A persistência vale enquanto o localStorage da mesma origem (protocolo, host e porta) e do mesmo perfil de navegador existir. Limpar dados, mudar a porta ou usar outro perfil não compartilha a base. Pedidos antigos criados como visitante permanecem armazenados em `guest`, mas não são atribuídos automaticamente a uma conta autenticada nem expostos pela lista autenticada.

Testes adicionais comprovam: 401 sem sessão e com sessão inválida; preservação integral do carrinho durante cadastro/login e falhas 400/401/409/503; autorização da rota com cache de sessão desatualizado; compra autenticada; bloqueio de replay após logout; retorno ao pedido correto após login; recuperação em um **processo Node novo**, com novos módulos MSW e cache Query vazio, transportando somente a base serializada. Nesse processo, GET não altera a base, todos os campos do snapshot são comparados, os totais permanecem 13.100.000 − 1.310.000 + 16.000 = 11.806.000 microETH e um replay mantém um carrinho posterior intacto.

A primeira rodada dos novos testes falhou ao procurar o redirecionamento SSR em `router.state.redirect`, que não o expõe na versão instalada; uma interrupção anterior ao novo login provocou também a falha subsequente do Header. A verificação foi corrigida para invocar o `beforeLoad` realmente registrado na rota e inspecionar o redirecionamento lançado. Nenhuma asserção de autorização foi removida. Resultado final: 20/20 testes, lint sem erros e build aprovado, mantendo apenas o aviso já conhecido de tamanho de bundle. Não houve validação visual/F5 em navegador real nesta etapa.

Arquivos desta correção (em relação ao início deste pedido):

- **(NOVO)** `src/router/auth.ts`
- **(NOVO)** `src/pages/OrderConfirmationPage.tsx`
- **(NOVO)** `tests/restart-orders.mjs`
- **(ALTERADO)** `src/mocks/data/database.ts`
- **(ALTERADO)** `src/mocks/handlers/auth.ts`
- **(ALTERADO)** `src/mocks/handlers/orders.ts`
- **(ALTERADO)** `src/api/client.ts`
- **(ALTERADO)** `src/router/index.tsx`
- **(ALTERADO)** `src/components/auth/AuthModal.tsx`
- **(ALTERADO)** `src/components/profile/ProfileSidebar.tsx`
- **(ALTERADO)** `src/pages/CheckoutPage.tsx`
- **(ALTERADO)** `src/hooks/use-api.ts`
- **(ALTERADO)** `tests/api.test.mjs`
- **(ALTERADO)** `docs/api-simulada.md`

Referência: [rotas autenticadas no TanStack Router](https://tanstack.com/router/latest/docs/guide/authenticated-routes).
