# CLAUDE.md

Instrucoes do projeto para **Claude Code** (code.claude.com). Este repo e um **demo coerente e estavel** (sem backend real) para apresentar um sistema de SST escolar baseado em **NR-1**.

## Objetivo do Produto

`nr1-school` e uma SPA (React + Vite) com **mock API no browser** (MSW) e **multi-tenant**. O foco e parecer "full real": dados normalizados, contratos em `snake_case`, e UX consistente em tema claro/escuro.

Nao e objetivo deste repo:
- Migrar completamente o Metronic para ser o layout ativo (ele fica como inventario/reference).
- Implementar backend real (o handoff para API deve ser plugavel).
- Adicionar frameworks novos sem necessidade (mantenha a base simples para demo).

## Comandos (dev/build)

```bash
npm run dev        # Vite + HMR
npm run build      # tsc && vite build
npm run lint       # eslint src --fix
npm run format     # prettier --write .
npm run preview    # preview da build
```

Sem testes automatizados (sem vitest/jest). Garanta pelo menos `npm run lint` e `npm run build` antes de commits que mexem em runtime.

## Stack (verdade do runtime)

- React 19 + TypeScript (strict) + Vite 7
- React Router (rotas lazy)
- Tailwind 4 + tokens em `src/styles/globals.css`
- `next-themes` (dark/light) e toggle no header
- MSW 2 (Mock Service Worker) para `/api/*` no browser

Alias: `@` aponta para `src/`.

## Regras de Estrutura (nao crie bagunca)

O runtime real vive em:
- `src/pages/`, `src/services/`, `src/mocks/`, `src/layouts/`, `src/lib/`, `src/routing/`, `src/styles/`

O inventario Metronic vive em `src/vendor/metronic/*`:
- Evite acoplar o runtime ao vendor. Se precisar copiar UI/UX, copie de forma deliberada (nao importe layout vendor no fluxo principal sem plano).

Regra de crescimento de telas:
- `page.tsx` deve orquestrar e chamar componentes.
- Quando crescer, split em `components.tsx` + `helpers.ts` dentro da pasta da feature.

## Multi-tenant (obrigatorio no demo)

- Toda request para `/api/*` recebe `x-tenant-id` automaticamente via patch em `window.fetch` (ver `src/main.tsx`).
- Tenant ativo em `localStorage`: `nr1-school.active-tenant-id`.
- A camada `apiJson<T>()` aplica cache local por tenant (TTL default 60s) e invalida cache em mutacoes.

Contratos/mock devem continuar em **snake_case** para ficar compatível com Adonis v6 (backend plugavel).

## Mocks (MSW)

- Mocks estao **ligados por default**.
- Para desligar: `VITE_ENABLE_MOCKS=false`.
- Estado do mock DB persiste em `localStorage`: `nr1-school.mock-session`.

Se voce estiver integrando backend real, o caminho esperado e:
1. Desligar MSW com `VITE_ENABLE_MOCKS=false`.
2. Manter contratos e tipos (snake_case) e trocar apenas a implementacao dos services.

## Routing e GitHub Pages (nao quebre o publicado)

Este projeto deve funcionar local e no GitHub Pages. Algumas regras:
- O build usa `VITE_BASE_URL` para ajustar base path no Pages (configurado no workflow de deploy).
- O Pages usa fallback `dist/404.html` para redirecionar para `/#/...` (SPA em subpath).
- Se estiver mexendo em rotas, valide no publicado que links gerados consideram `VITE_BASE_URL`.

## Como Adicionar Coisas (fluxo padrao)

Novo service:
- Crie em `src/services/` e use `apiJson<T>()`/`apiFetch()` (mantenha contratos `snake_case`).

Novo endpoint mock:
- Crie handler em `src/mocks/handlers/` respeitando `x-tenant-id`.
- Registre no `src/mocks/handlers/index.ts`.

Nova pagina:
- Crie em `src/pages/<feature>/`.
- Adicione rota em `src/routing/app-routing-setup.tsx` (lazy).
- Adicione item no menu em `src/config/menu.config.ts` (se aplicavel).

## Problema Classico: "Unexpected token '<' ... is not valid JSON"

Quase sempre significa: **o frontend esperava JSON**, mas recebeu **HTML** (geralmente `index.html`).

Checklist rapido:
1. Confirme se o MSW esta ativo (sem ele, `/api/*` pode retornar HTML/404 dependendo do host).
2. Confirme se a URL chamada e `/api/...` (e nao um path relativo ao router).
3. No Pages, confirme se o `VITE_BASE_URL` esta correto e se a navegacao esta em `/#/...`.

## Dados Demo (para apresentar)

- Tenants demo (seeded e reprodutiveis) ficam em `src/mocks/data/factory.ts`.
- Senha demo (quando aparecer login/session): `demo123`.

## Checklist de Mudancas

- Nao commitar `node_modules/` nem `dist/` (ambos ignorados).
- Alterou services/handlers? Garanta `snake_case` e tenant scoping.
- Alterou UI? Confirme claro e escuro + contraste minimamente razoavel (WCAG).
- Alterou rotas/base path? Abra o Pages e clique no fluxo principal.

## Referencias (carregar quando precisar)

@ARCHITECTURE.md
@README.md
