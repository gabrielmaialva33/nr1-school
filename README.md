<h1 align="center">
  <br>
  <img src="public/favicon.svg" alt="NR1 School" width="110">
  <br>
  NR1 School
  <br>
</h1>

<p align="center">
  <strong>Demo NR-1 para gestao de riscos psicossociais em escolas (multi-tenant), com mock API (MSW) e dossie de compliance.</strong>
</p>

<p align="center">
  <a href="https://gabrielmaialva33.github.io/nr1-school/">Live Demo (GitHub Pages)</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#sparkles-features">Features</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#rocket-quickstart">Quickstart</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#triangular_ruler-architecture">Architecture</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61dafb?style=flat&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.x-646cff?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/MSW-mock%20api-ff6a00?style=flat" alt="MSW" />
  <img src="https://github.com/gabrielmaialva33/nr1-school/actions/workflows/deploy-pages.yml/badge.svg" alt="Deploy to GitHub Pages" />
</p>

<br>

## :sparkles: Features

- **Multi-tenant (escolas)**: unidade ativa via `x-tenant-id` com dados isolados por escola no mock
- **Dossie de colaborador (360)**: treinamentos, entregas de EPI e documentos anexados
- **Upload de evidencias**: certificado de treinamento ou comprovante de EPI (PDF/JPG/PNG)
- **Kanban**: planos de acao com arrastar e soltar
- **Tema claro/escuro**: toggle no header + tokens consistentes
- **Deploy automatico**: GitHub Pages via workflow

## :rocket: Quickstart

```bash
npm ci
npm run dev
```

Abrir `http://localhost:5174`.

## :wrench: Mocks (MSW)

- Requests em `/api/*` sao respondidas por handlers em `src/mocks/handlers`.
- O estado do mock e persistido no browser (localStorage) e respeita `tenant_id`.
- A unidade demo ativa injeta `x-tenant-id` nas requests.

## :triangular_ruler: Architecture

- Runtime do produto: `src/pages`, `src/services`, `src/mocks`, `src/layouts`, `src/lib`
- Vendor inventory (Metronic): `src/vendor/metronic`
- Diretrizes: `ARCHITECTURE.md`

```mermaid
flowchart LR
  UI[React Pages] --> S[Services /api]
  S --> MSW[MSW Handlers]
  MSW --> DB[Mock DB (browser)]
  UI --> Theme[Theme Tokens]
```

## :package: Releases

Releases sao publicadas via GitHub Releases (tag `v0.1.0+`).

