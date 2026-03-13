# AGENTS.md

Este arquivo define regras do projeto para **agentes de codigo** (ex.: Codex, OpenCode). Ele deve ficar alinhado com [`CLAUDE.md`](./CLAUDE.md) para evitar "drift" de arquitetura.

## Objetivo

Entregar um **demo coerente e estavel** de um sistema NR-1 para escolas:
- Multi-tenant realista.
- Mock API com contratos normalizados (snake_case) para plugar backend depois.
- UX consistente em claro/escuro e com acessibilidade minima (contraste razoavel, foco, labels).

## Onde Trabalhar (source of truth)

Runtime do produto (preferir sempre):
- `src/pages/` (telas e feature-local helpers)
- `src/services/` (contratos e orquestracao de requests)
- `src/mocks/` (MSW handlers + mock DB persistido)
- `src/layouts/` (shell do app em uso)
- `src/lib/` (utilitarios cross-feature)
- `src/routing/`, `src/styles/`, `src/config/`, `src/types/`

Vendor/inventario (mexer com cuidado):
- `src/vendor/metronic/*` e pasta `metronic-v9.4.6/`

Regra: nao transformar vendor em dependencia do runtime "sem querer". Se precisar, copie componentes/padroes para o runtime e adapte.

## Regras de Dados (para plugar Adonis v6 depois)

- Payloads e tipos de transporte devem ser **snake_case**.
- Toda entidade relevante deve ser scopped por tenant (mesmo em mock).
- Evite IDs "bonitinhos" e use UUIDs onde fizer sentido (o demo ja usa isso).
- Sempre que um service fizer mutacao (POST/PUT/DELETE), invalide cache (ja e feito pela camada `apiFetch`/`apiJson`).

## Multi-tenant (obrigatorio)

- Toda request para `/api/*` deve carregar `x-tenant-id`.
- Tenant atual fica em `localStorage` (`nr1-school.active-tenant-id`).
- Se voce criar um novo endpoint mock, respeite `x-tenant-id` no handler e persista os dados por tenant no mock DB.

## Mocks (MSW)

- Mocks ligados por default.
- Para desligar: `VITE_ENABLE_MOCKS=false`.
- Mock DB persiste em `localStorage` (`nr1-school.mock-session`).

Regra: handlers devem se comportar como HTTP "de verdade" (status codes coerentes, validações minimas, erros previsiveis).

## Routing e GitHub Pages

- O publicado no GitHub Pages roda em subpath e usa `VITE_BASE_URL`.
- O Pages faz fallback via `dist/404.html` para `/#/...`.

Se mexer em rotas/links, valide no publicado que o fluxo principal continua navegavel.

## Como Adicionar Features (padrao do repo)

- Nova pagina: `src/pages/<feature>/` + rota lazy em `src/routing/app-routing-setup.tsx` + menu em `src/config/menu.config.ts`.
- Novo service: `src/services/` usando `apiJson<T>()`/`apiFetch()` com payload `snake_case`.
- Novo endpoint mock: handler em `src/mocks/handlers/` + registrar em `src/mocks/handlers/index.ts` + respeitar `x-tenant-id`.

## Qualidade (nao quebrar demo)

- Nao commitar `node_modules/` nem `dist/`.
- Prefira mudancas pequenas e incrementais.
- Antes de entregar algo "final", rode `npm run lint` e `npm run build`.
- Se aparecer `"Unexpected token '<'"` ao fazer `response.json()`, trate como sinal de que voltou HTML (MSW desligado, URL errada, base path errado).
