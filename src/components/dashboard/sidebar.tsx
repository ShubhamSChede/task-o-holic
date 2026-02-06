"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronLeft, LayoutDashboard, CheckSquare, Building, LineChart, User, Repeat, LogOut, Menu } from "lucide-react";
import { useSidebar } from '@/contexts/sidebar-context';

type SidebarUser = {
  id?: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type SidebarProps = {
  user: SidebarUser | null;
  organizations: {
    id: string;
    name: string;
    role: string;
  }[];
};

export default function Sidebar({ user, organizations }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { expanded, setExpanded } = useSidebar();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/todo', label: 'My Tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { href: '/organizations', label: 'Organizations', icon: <Building className="h-5 w-5" /> },
    { href: '/statistics', label: 'Statistics', icon: <LineChart className="h-5 w-5" /> },
    { href: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { href: '/frequent-tasks', label: 'Frequent Tasks', icon: <Repeat className="h-5 w-5" /> }
  ];

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div 
      className={cn(
        "h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-40 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl",
        expanded ? "w-64" : "w-20"
      )}
      style={{
        '--sidebar-width': expanded ? '16rem' : '5rem'
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center min-w-0 flex-1">
          <div className="relative h-5 w-5 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Task-o-holic logo"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          {expanded && (
            <h1 className="ml-2 truncate text-lg font-semibold tracking-tight text-slate-50">
              Task-o-holic
            </h1>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-100"
        >
          {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start rounded-xl px-2",
                pathname === item.href 
                  ? "bg-slate-900 text-cyan-300 font-medium hover:bg-slate-900" 
                  : "text-slate-300 hover:bg-slate-900/60 hover:text-cyan-200"
              )}
            >
              <Link href={item.href} className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                {expanded && <span>{item.label}</span>}
              </Link>
            </Button>
          ))}
          
          {expanded && organizations.length > 0 && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                My Organizations
              </h3>
              <div className="mt-2 space-y-1">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-slate-300 hover:bg-slate-900/60 hover:text-cyan-200 rounded-xl px-2"
                  >
                    <Link href={`/organizations/${org.id}`} className="flex items-center">
                      <Building className="h-5 w-5 mr-3" />
                      <span className="truncate">{org.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      <Separator className="my-2" />
      <div className="p-4">
        <div className="flex items-center">
          {user?.avatar_url ? (
            <div className="w-8 h-8 relative">
              <Image 
                src={user.avatar_url.startsWith('/') ? user.avatar_url : `/avatars/${user.avatar_url}`}
                alt="Avatar" 
                fill
                sizes="32px"
                className="rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            </div>
          ) : null}
          <div 
            className={`w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-sm font-semibold ${user?.avatar_url ? 'hidden' : ''}`}
          >
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          {expanded && (
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">
                {user?.full_name || 'User'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="p-0 h-auto text-xs text-slate-400 hover:text-red-400"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile sidebar using Sheet component
  const MobileSidebar = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-slate-950 text-slate-100 border-r border-slate-800">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex items-center border-b border-slate-800 px-4 py-3">
          <div className="relative h-7 w-7 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Task-O-Holic Logo" 
              fill
              sizes="28px"
              className="object-contain"
            />
          </div>
          <h1 className="ml-2 truncate text-base font-semibold tracking-tight text-slate-50">
            Task-o-holic
          </h1>
        </div>
        <div className="py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start rounded-xl px-2",
                  pathname === item.href 
                    ? "bg-slate-900 text-cyan-300 font-medium hover:bg-slate-900" 
                    : "text-slate-300 hover:bg-slate-900/60 hover:text-cyan-200"
                )}
              >
                <Link href={item.href} className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
            
            {organizations.length > 0 && (
              <div className="mt-6">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  My Organizations
                </h3>
                <div className="mt-2 space-y-1">
                  {organizations.map((org) => (
                    <Button
                      key={org.id}
                      variant="ghost"
                      asChild
                    className="w-full justify-start text-slate-300 hover:bg-slate-900/60 hover:text-cyan-200 rounded-xl px-2"
                    >
                      <Link href={`/organizations/${org.id}`} className="flex items-center">
                        <Building className="h-5 w-5 mr-3" />
                        <span className="truncate">{org.name}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
        <Separator />
        <div className="p-4">
          <div className="flex items-center">
            {user?.avatar_url ? (
              <div className="w-8 h-8 relative">
                <Image 
                  src={user.avatar_url.startsWith('/') ? user.avatar_url : `/avatars/${user.avatar_url}`}
                  alt="Avatar" 
                  fill
                  sizes="32px"
                  className="rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              </div>
            ) : null}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-slate-950 ${user?.avatar_url ? 'hidden' : ''}`}
            >
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">
                {user?.full_name || 'User'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700 p-0 h-auto"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>
      <div className="md:hidden">
        <MobileSidebar />
      </div>
    </>
  );
}