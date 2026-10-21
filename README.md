# Kurio — marketplace NFT demonstrativo

React, TypeScript estrito, Vite, TanStack Router, Tailwind e shadcn/ui. A API é simulada no navegador com MSW 3, Axios e TanStack Query. Não existe backend externo nem transação blockchain.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço localhost informado pelo Vite. O MSW inicia **antes** do React, tanto em desenvolvimento quanto no build demonstrativo (`npm run build` seguido de `npm run preview`). É necessário localhost ou HTTPS, service worker e armazenamento local habilitados.

```sh
npm run test:api
npm run lint
npm run build
```

Cadastre uma conta em `/cadastro` usando dados fictícios e senha de teste com pelo menos oito caracteres. O login exige as credenciais cadastradas. Google e Facebook são demonstrativos e ficam desabilitados.

Veja [a documentação completa da API](docs/api-simulada.md) para endpoints, contratos, persistência, testes, arquivos da implementação e limitações.
