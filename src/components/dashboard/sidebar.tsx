"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronLeft, LayoutDashboard, CheckSquare, Building, LineChart, User, Repeat, LogOut, Menu } from "lucide-react";

type SidebarProps = {
  user: any;
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
  const [expanded, setExpanded] = useState(true);

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
        "bg-white border-r border-purple-200 h-screen flex flex-col transition-all duration-300",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="p-4 border-b border-purple-100 flex items-center justify-between">
        {expanded ? (
          <h1 className="font-bold text-xl text-purple-800">TASK-O-HOLIC</h1>
        ) : (
          <h1 className="font-bold text-xl text-purple-800">📋</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setExpanded(!expanded)}
          className="text-purple-500 hover:text-purple-700"
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
                "w-full justify-start",
                pathname === item.href 
                  ? "bg-purple-100 text-purple-800 font-medium hover:bg-purple-100" 
                  : "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
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
              <h3 className="px-3 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                My Organizations
              </h3>
              <div className="mt-2 space-y-1">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700"
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
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          {expanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-purple-900 truncate">
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
      <SheetContent side="left" className="p-0 w-72">
        <div className="p-4 border-b border-purple-100">
          <h1 className="font-bold text-xl text-purple-800">TASK-O-HOLIC</h1>
        </div>
        <div className="py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start",
                  pathname === item.href 
                    ? "bg-purple-100 text-purple-800 font-medium hover:bg-purple-100" 
                    : "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
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
                <h3 className="px-3 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                  My Organizations
                </h3>
                <div className="mt-2 space-y-1">
                  {organizations.map((org) => (
                    <Button
                      key={org.id}
                      variant="ghost"
                      asChild
                      className="w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700"
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
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-purple-900 truncate">
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