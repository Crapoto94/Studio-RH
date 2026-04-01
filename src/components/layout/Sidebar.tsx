'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, RefreshCw, GitBranch,
  AlignLeft, UserCheck, Settings, Database,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',             label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/agents',       label: 'Agents',         icon: Users },
  { href: '/synchro',      label: 'Synchro',        icon: RefreshCw },
  { href: '/hierarchie',   label: 'Hiérarchie',     icon: GitBranch },
  { href: '/alignements',  label: 'Alignements',    icon: AlignLeft },
  { href: '/onboarding',   label: 'Onboarding',     icon: UserCheck },
  { href: '/parametres',   label: 'Paramètres',     icon: Settings },
  { href: '/sql',          label: 'Explorateur SQL', icon: Database },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={cn(
      'relative flex flex-col h-screen transition-all duration-300 ease-in-out',
      'bg-black border-r border-white/[0.04]',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 h-16">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#6063ee] to-[#a3a6ff] flex items-center justify-center">
          <span className="text-white font-black text-xs">RH</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-[#dee5ff] text-sm tracking-tight whitespace-nowrap">
            RH Studio
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'nav-active text-[#a3a6ff]'
                  : 'text-[#a3aac4] hover:text-[#dee5ff] hover:bg-white/[0.04]'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Version */}
      {!collapsed && (
        <div className="px-4 py-3 text-xs text-[#6d758c]">DSI Ivry-sur-Seine v1.0</div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[4.5rem] w-6 h-6 rounded-full bg-[#141f38] border border-[#40485d]/40 flex items-center justify-center text-[#a3aac4] hover:text-[#dee5ff] transition-colors z-10"
        aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
