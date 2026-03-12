import { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetBody, SheetTitle } from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SystemSidebarMenu } from './sidebar-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';

export function Header({
  isSidebarCollapsed,
  toggleSidebar,
}: {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-64 p-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r-0">
            <SheetHeader className="h-16 flex items-center justify-center border-b border-[var(--sidebar-muted)] px-4">
              <SheetTitle className="flex items-center gap-3">
                <Shield className="size-8 text-[var(--sidebar-accent)] shrink-0" />
                <span className="text-xl font-bold tracking-tight text-white">NR1 School</span>
              </SheetTitle>
            </SheetHeader>
            <SheetBody className="flex flex-col flex-1 p-0 overflow-y-auto overflow-x-hidden">
              <SidebarMenu />
              <div className="mt-auto">
                <SystemSidebarMenu />
              </div>
            </SheetBody>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2 ml-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block">NR1 School</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex shrink-0 -ml-2 mr-2"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="hidden sm:flex flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathnames.length > 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {pathnames[pathnames.length - 1].replace('-', ' ')}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex flex-1 sm:hidden"></div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/media/avatars/300-1.png" alt="@user" />
                <AvatarFallback>NR</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Usuário Demo</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@nr1school.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
