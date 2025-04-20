// src/components/dashboard/sidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const [expanded, setExpanded] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/todo', label: 'My Tasks', icon: '✅' },
    { href: '/organizations', label: 'Organizations', icon: '🏢' },
    { href: '/statistics', label: 'Statistics', icon: '📈' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    { href: '/frequent-tasks', label: 'Frequent Tasks', icon: '🔄' }
  ];

  return (
    <div className={`bg-white border-r border-purple-200 ${expanded ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col h-screen`}>
      <div className="p-4 border-b border-purple-100 flex items-center justify-between">
        {expanded ? (
          <h1 className="font-bold text-xl text-purple-800">TASK-O-HOLIC</h1>
        ) : (
          <h1 className="font-bold text-xl text-purple-800">📋</h1>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-500 hover:text-purple-700 transition-colors"
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href 
                  ? 'bg-purple-100 text-purple-800 font-medium' 
                  : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </Link>
          ))}
          
          {expanded && organizations.length > 0 && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                My Organizations
              </h3>
              <div className="mt-2 space-y-1">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    <span className="text-xl mr-3">🏢</span>
                    <span className="truncate">{org.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-purple-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          {expanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-purple-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}