'use client';

import Link from 'next/link';
import {
  MapPin,
  Users,
  UserCheck,
  PackageOpen,
  ShoppingCart,
  TrendingUp,
  Sprout,
  Receipt,
  ShoppingBag,
} from 'lucide-react';

const modules = [
  {
    href: '/parcele',
    label: 'Parcele',
    description: 'Gestionează terenurile',
    icon: MapPin,
    color: '#F16B6B',
  },
  {
    href: '/culegatori',
    label: 'Culegători',
    description: 'Personal recoltare',
    icon: Users,
    color: '#F16B6B',
  },
  {
    href: '/clienti',
    label: 'Clienți',
    description: 'Baza de cumpărători',
    icon: UserCheck,
    color: '#F16B6B',
  },
  {
    href: '/recoltari',
    label: 'Recoltări',
    description: 'Producție zilnică',
    icon: PackageOpen,
    color: '#F16B6B',
  },
  {
    href: '/vanzari',
    label: 'Vânzări Fructe',
    description: 'Vânzări fructe proaspete',
    icon: ShoppingCart,
    color: '#F16B6B',
  },
  {
    href: '/vanzari-butasi',
    label: 'Vânzări Butași',
    description: 'Material săditor',
    icon: ShoppingBag,
    color: '#F16B6B',
  },
  {
    href: '/activitati-agricole',
    label: 'Activități Agricole',
    description: 'Tratamente & fertilizări',
    icon: Sprout,
    color: '#F16B6B',
  },
  {
    href: '/investitii',
    label: 'Investiții',
    description: 'Cheltuieli de capital',
    icon: TrendingUp,
    color: '#F16B6B',
  },
  {
    href: '/cheltuieli',
    label: 'Cheltuieli',
    description: 'Costuri operaționale',
    icon: Receipt,
    color: '#F16B6B',
  },
];

export function DashboardHome() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#312E3F]">
          Bun venit! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-base">
          Selectează un modul pentru a începe
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {modules.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center
              border border-gray-100 shadow-sm
              hover:shadow-xl hover:-translate-y-1.5 hover:border-[#F16B6B]/20
              transition-all duration-250 ease-out cursor-pointer"
          >
            {/* Icon bubble */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                bg-[#F16B6B]/10 group-hover:bg-[#F16B6B]/20 transition-colors duration-200"
            >
              <Icon
                className="w-7 h-7 text-[#F16B6B] group-hover:scale-110 transition-transform duration-200"
              />
            </div>

            {/* Text */}
            <p className="text-[#312E3F] font-semibold text-sm leading-tight mb-1">
              {label}
            </p>
            <p className="text-gray-400 text-xs leading-snug">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
