import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { Header } from './components/header';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-transparent">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      <div 
        className={cn(
          "box-border flex min-h-screen min-w-0 w-full max-w-full grow flex-col transition-[padding] duration-300",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
