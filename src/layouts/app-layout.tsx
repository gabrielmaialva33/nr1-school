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
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      <div 
        className={cn(
          "flex flex-col grow transition-all duration-300 min-h-screen",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
