'use client'

import { useState } from 'react'
import Link from "next/link"
import { 
  Search, Clock, ShoppingBasket, CircleDollarSign, 
  Map, Users, Contact, TrendingUp, Settings, Sprout, Edit2 
} from "lucide-react"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Modulele care NU sunt în navigația de jos
  const extraModules = [
    { name: 'Parcele', href: '/parcele', icon: Map, color: '#3B82F6' },
    { name: 'Culegători', href: '/culegatori', icon: Users, color: '#F59E0B' },
    { name: 'Clienți', href: '/clienti', icon: Contact, color: '#10B981' },
    { name: 'Investiții', href: '/investitii', icon: TrendingUp, color: '#6366F1' },
  ]

  const filteredModules = extraModules.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
 <div style={{ 
  backgroundColor: '#F8F9FB', 
  minHeight: '100vh', 
  // Calculăm lățimea: 100% din ecran + cele două margini de 16px
  width: 'calc(100% + 32px)', 
  margin: '-16px', 
  paddingBottom: '120px', 
  fontFamily: 'sans-serif',
  overflowX: 'hidden', // Esențial pentru a nu lăsa pagina să joace
  display: 'block'
}}>
      
      {/* 1. HEADER VERDE PREMIUM */}
      <div style={{ 
        // Un gradient de la verde închis (Forest) spre un verde mai vibrant (Emerald)
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #059669 100%)',
        padding: '60px 24px 80px 24px',
        borderBottomLeftRadius: '45px',
        borderBottomRightRadius: '45px',
        boxShadow: '0 10px 30px rgba(5, 150, 105, 0.2)' // Umbră cu tentă verzuie
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-1px' }}>
              {/* Zmeurel rămâne cu roșu (ca fructul), dar restul e alb pe fundal verde */}
              <span style={{ color: '#F16B6B' }}>Zmeurel</span> OS
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px', margin: '4px 0 0 0', color: '#ECFDF5', fontWeight: 500 }}>
              Sistemul tău de producție.
            </p>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '8px', 
            borderRadius: '15px', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Sprout color="#34D399" size={24} />
          </div>
        </div>
      </div>

      {/* 2. CĂUTARE FUNCȚIONALĂ */}
      <div style={{ padding: '0 20px', marginTop: '-30px' }}>
        <div style={{ 
          backgroundColor: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', 
          padding: '12px 16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eee'
        }}>
          <Search size={18} color="#94a3b8" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută un modul..." 
            style={{ border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '16px', color: '#312E3F' }}
          />
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        
        {/* 3. GRILA DE MODULE EXTRA (Iconițe Mari) */}
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#312E3F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Module Suplimentare</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {filteredModules.map((mod) => (
            <Link key={mod.href} href={mod.href} style={{ textDecoration: 'none' }}>
              <div style={{ 
                backgroundColor: 'white', padding: '20px', borderRadius: '24px', textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  width: '56px', height: '56px', backgroundColor: `${mod.color}15`, 
                  borderRadius: '18px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', margin: '0 auto 12px auto' 
                }}>
                  <mod.icon size={28} color={mod.color} />
                </div>
                <span style={{ color: '#312E3F', fontWeight: 'bold', fontSize: '14px' }}>{mod.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 4. TOTAL AZI */}
        <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '24px', marginBottom: '32px', border: '1px solid #f0f0f0' }}>
          <h2 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Total Azi</h2>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ color: '#F16B6B', fontSize: '48px', fontWeight: 900 }}>245</span>
            <span style={{ color: '#F16B6B', fontSize: '20px', fontWeight: 'bold', marginLeft: '4px' }}>kg</span>
          </div>
          <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
            <Clock size={14} style={{ marginRight: '6px' }} /> Ultima actualizare: acum 15 min
          </div>
        </div>

        {/* 5. ACTIVITATE RECENTĂ (Editabilă) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#312E3F', margin: 0 }}>Activitate Recentă</h2>
          <button style={{ color: '#F16B6B', fontSize: '13px', fontWeight: 'bold', background: 'none', border: 'none' }}>Vezi tot</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Recoltare', sub: 'Ion M. — 32 kg', val: '245 kg', time: '11:15', bg: '#F16B6B' },
            { title: 'Vânzare', sub: 'Client X — 540 lei', val: '10:45', time: 'Azi', bg: '#2A253A' }
          ].map((act, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: act.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <ShoppingBasket size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#312E3F' }}>{act.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{act.sub}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: act.bg === '#F16B6B' ? '#F16B6B' : '#312E3F', fontWeight: 900, fontSize: '16px' }}>{act.val}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{act.time}</span>
                </div>
                <Link href={`/edit/${i}`} style={{ color: '#CBD5E1' }}><Edit2 size={16} /></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}