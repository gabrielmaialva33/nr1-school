import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarMenu, SystemSidebarMenu } from './sidebar-menu';

export function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 left-0 z-20 flex-col items-stretch shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#091225_52%,#050d1c_100%)] text-[var(--sidebar-foreground)] shadow-[0_20px_60px_rgba(2,6,23,0.35)] transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        'hidden lg:flex'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10 bg-white/[0.02] px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Shield className="size-8 text-[var(--sidebar-accent)] shrink-0" />
          {!isCollapsed && <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">NR1 School</span>}
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarMenu isCollapsed={isCollapsed} />
        <div className="mt-auto shrink-0">
          <SystemSidebarMenu isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
