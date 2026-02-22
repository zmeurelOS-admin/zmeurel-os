'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Users,
  UserCheck,
  PackageOpen,
  ShoppingCart,
  TrendingUp,
  Sprout,
  Receipt,
  LayoutDashboard,
  Menu,
  X,
  Leaf,
  ShoppingBag,
} from 'lucide-react';

import LogoutButton from '@/components/LogoutButton'; // ✅ IMPORT ADĂUGAT

const navGroups = [
  {
    label: 'OPERAȚIUNI',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/parcele', label: 'Parcele', icon: MapPin },
      { href: '/recoltari', label: 'Recoltări', icon: PackageOpen },
      { href: '/activitati-agricole', label: 'Activități Agricole', icon: Sprout },
    ],
  },
  {
    label: 'RELAȚII',
    items: [
      { href: '/culegatori', label: 'Culegători', icon: Users },
      { href: '/clienti', label: 'Clienți', icon: UserCheck },
    ],
  },
  {
    label: 'FINANCIAR',
    items: [
      { href: '/vanzari', label: 'Vânzări Fructe', icon: ShoppingCart },
      { href: '/vanzari-butasi', label: 'Vânzări Butași', icon: ShoppingBag },
      { href: '/investitii', label: 'Investiții', icon: TrendingUp },
      { href: '/cheltuieli', label: 'Cheltuieli', icon: Receipt },
    ],
  },
];

type SidebarContentProps = {
  isActive: (href: string) => boolean;
  onNavigate: () => void;
};

function SidebarContent({ isActive, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F16B6B] flex items-center justify-center shadow-lg shadow-[#F16B6B]/30">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span
              className="text-xl font-bold text-white tracking-wide"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: '0.03em' }}
            >
              Zmeurel
            </span>
            <span className="text-xs text-slate-400 block -mt-0.5 font-medium tracking-widest uppercase">
              OS
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-slate-500 tracking-widest px-3 mb-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${
                          active
                            ? 'bg-[#F16B6B]/15 text-[#F16B6B]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${
                          active ? 'bg-[#F16B6B]/20' : 'bg-transparent group-hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#F16B6B]' : ''}`} />
                      </div>
                      {label}
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F16B6B]" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        {/* 🔥 AICI ESTE FIXUL */}
        <LogoutButton />
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#312E3F] text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[#312E3F] transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent
          isActive={isActive}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#312E3F] fixed top-0 left-0 z-30">
        <SidebarContent
          isActive={isActive}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}