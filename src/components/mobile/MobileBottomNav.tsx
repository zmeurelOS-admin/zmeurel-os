'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ClipboardList, ShoppingBasket, CircleDollarSign, Wallet } from "lucide-react"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: '#6366F1' },
    { name: 'Operațiuni', href: '/activitati-agricole', icon: ClipboardList, color: '#A855F7' },
    { name: 'Producție', href: '/recoltari', icon: ShoppingBasket, color: '#F16B6B' },
    { name: 'Venituri', href: '/vanzari', icon: CircleDollarSign, color: '#10B981' },
    { name: 'Costuri', href: '/cheltuieli', icon: Wallet, color: '#F43F5E' },
  ] // Aici era eroarea, probabil aveai un ] în plus sub această linie

  return (
    <div 
      className="lg:hidden"
      style={{ 
        position: 'fixed', 
        bottom: '0px', 
        left: '0px', 
        right: '0px', 
        zIndex: 99999999,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #eee',
        padding: '12px 10px 30px 10px',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href) || pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ 
                flex: 1, 
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div 
                style={{ 
                  width: '100%',
                  maxWidth: '60px',
                  height: '54px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: isActive ? '#F16B6B' : '#F8F9FB',
                  boxShadow: isActive ? '0 8px 15px rgba(241,107,107,0.3)' : 'none',
                }}
              >
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  color={isActive ? '#FFFFFF' : item.color} 
                />
              </div>
              
              <span 
                style={{ 
                  fontSize: '9px', 
                  fontWeight: 800, 
                  color: isActive ? '#312E3F' : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}