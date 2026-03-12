import './styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { toAbsoluteUrl } from './lib/helpers'
import { bootstrapTenantSession, getCurrentTenantId } from './lib/tenant'

function patchApiFetchBasePath() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = ((input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const headers = new Headers(init?.headers)
      const tenantId = getCurrentTenantId()

      if (tenantId && !headers.has('x-tenant-id')) {
        headers.set('x-tenant-id', tenantId)
      }

      return originalFetch(toAbsoluteUrl(input), {
        ...init,
        headers,
      })
    }

    return originalFetch(input, init)
  }) as typeof window.fetch
}

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: toAbsoluteUrl('/mockServiceWorker.js'),
      },
    })
  }
}

patchApiFetchBasePath()

enableMocking().then(async () => {
  await bootstrapTenantSession()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
