import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { MENU_SIDEBAR_MAIN } from '@/vendor/metronic/config/layout-27.config';
import { useMenu } from '@/vendor/metronic/hooks/use-menu';
import { Wrapper } from './components/wrapper';
import { LayoutProvider } from './components/context';

export function Layout27() {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR_MAIN);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>

      <LayoutProvider
        style={{
          '--header-height': '60px',
          '--sidebar-width': '60px',
          '--sidebar-menu-width': '300px',
        } as React.CSSProperties}
      >
        <Wrapper />
      </LayoutProvider>
    </>
  );
}
