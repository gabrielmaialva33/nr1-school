import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuConfig, systemMenuConfig } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
} from '@/components/ui/accordion-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export function SidebarMenu({ isCollapsed = false, onNavigate }: { isCollapsed?: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();

  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  const classNames: AccordionMenuClassNames = {
    root: 'space-y-4',
    group: 'gap-1',
    label: cn(
      'uppercase text-[11px] font-semibold tracking-wider text-[var(--sidebar-foreground)]/50 pt-3 pb-2 px-2 transition-all',
      isCollapsed && 'opacity-0 h-0 p-0 m-0 overflow-hidden'
    ),
    separator: 'bg-[var(--sidebar-muted)]/50',
    item: cn(
      'h-10 text-[var(--sidebar-foreground)]/80 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-muted)] data-[selected=true]:text-[var(--sidebar-accent)] data-[selected=true]:bg-[var(--sidebar-muted)] data-[selected=true]:font-medium transition-colors rounded-md',
      isCollapsed ? 'px-0 justify-center' : 'px-3'
    ),
  };

  return (
    <ScrollArea className="flex grow shrink-0 py-4 px-3 h-full">
      <TooltipProvider delayDuration={0}>
        <AccordionMenu
          selectedValue={pathname}
          matchPath={matchPath}
          type="single"
          collapsible
          classNames={classNames}
        >
          {menuConfig.map((group, groupIdx) => (
            <div key={`group-${groupIdx}`}>
              <AccordionMenuLabel>{group.title}</AccordionMenuLabel>
              <AccordionMenuGroup>
                {group.items.map((item, itemIdx) => {
                  const ItemContent = (
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center grow gap-3 h-full w-full",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon className={cn("size-5", isCollapsed && "shrink-0")} />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  );

                  return (
                    <AccordionMenuItem
                      key={`item-${groupIdx}-${itemIdx}`}
                      value={item.path}
                    >
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {ItemContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-[var(--sidebar-muted)] text-[var(--sidebar-foreground)] border-none">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        ItemContent
                      )}
                    </AccordionMenuItem>
                  );
                })}
              </AccordionMenuGroup>
            </div>
          ))}
        </AccordionMenu>
      </TooltipProvider>
    </ScrollArea>
  );
}

export function SystemSidebarMenu({ isCollapsed = false, onNavigate }: { isCollapsed?: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();

  if (systemMenuConfig.length === 0) {
    return null;
  }

  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  const classNames: AccordionMenuClassNames = {
    root: 'space-y-1',
    group: 'gap-1',
    item: cn(
      'h-10 text-[var(--sidebar-foreground)]/80 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-muted)] data-[selected=true]:text-[var(--sidebar-accent)] data-[selected=true]:bg-[var(--sidebar-muted)] data-[selected=true]:font-medium transition-colors rounded-md',
      isCollapsed ? 'px-0 justify-center' : 'px-3'
    ),
  };

  return (
    <div className="px-3 pb-4 pt-2 border-t border-[var(--sidebar-muted)]">
      <TooltipProvider delayDuration={0}>
        <AccordionMenu
          selectedValue={pathname}
          matchPath={matchPath}
          type="single"
          collapsible
          classNames={classNames}
        >
          <AccordionMenuGroup>
            {systemMenuConfig.map((item, itemIdx) => {
              const ItemContent = (
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center grow gap-3 h-full w-full",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("size-5", isCollapsed && "shrink-0")} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );

              return (
                <AccordionMenuItem
                  key={`system-${itemIdx}`}
                  value={item.path}
                >
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {ItemContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[var(--sidebar-muted)] text-[var(--sidebar-foreground)] border-none">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    ItemContent
                  )}
                </AccordionMenuItem>
              );
            })}
          </AccordionMenuGroup>
        </AccordionMenu>
      </TooltipProvider>
    </div>
  );
}
