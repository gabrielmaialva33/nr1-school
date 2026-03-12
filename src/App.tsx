import { AppRouting } from '@/routing/app-routing';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';

const { BASE_URL } = import.meta.env;
const routerBaseName = BASE_URL === '/' ? '/' : BASE_URL.replace(/\/$/, '')
const shouldUseHashRouter =
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') && BASE_URL !== '/'

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <LoadingBarContainer>
          {shouldUseHashRouter ? (
            <HashRouter>
              <Toaster />
              <AppRouting />
            </HashRouter>
          ) : (
            <BrowserRouter basename={routerBaseName}>
              <Toaster />
              <AppRouting />
            </BrowserRouter>
          )}
        </LoadingBarContainer>
      </HelmetProvider>
    </ThemeProvider>
  );
}
