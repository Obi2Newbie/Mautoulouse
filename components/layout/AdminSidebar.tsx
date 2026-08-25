'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Avatar from '@/components/ui/Avatar'

const NAV_ITEMS = [
  { id: '/admin',         icon: '📊', label: 'Analytics'    },
  { id: '/admin/events',  icon: '🗓️', label: 'Événements'   },
  { id: '/admin/users',   icon: '👥', label: 'Utilisateurs' },
  { id: '/admin/photos',  icon: '🖼️', label: 'Galerie'      },
  { id: '/admin/faqs',    icon: '❓', label: 'FAQs'         },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-[248px] bg-sidebar text-white flex flex-col flex-shrink-0 sticky top-0 h-screen">
      <div className="px-5 py-6 border-b border-white/[0.07] flex items-center gap-2.5">
        <img src="/logo.png" alt="Mautoulouse" className="w-[38px] h-[38px] rounded-[10px] object-cover flex-shrink-0"/>
        <div>
          <div className="font-display font-bold text-[16px]">Mautoulouse</div>
          <div className="text-[11px] text-white/30 mt-0.5">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 px-2.5 py-3.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const active = pathname === id || (id !== '/admin' && pathname.startsWith(id))
          return (
            <Link key={id} href={id}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] mb-1 text-sm no-underline transition-all border-l-[3px] ${
                active
                  ? 'bg-white/10 text-white font-bold border-l-coral'
                  : 'text-white/50 border-l-transparent hover:bg-white/[0.06] hover:text-white/80 font-medium'
              }`}>
              <span className="text-[17px]">{icon}</span>{label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/[0.07]">
        {user && (
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar firstName={user.first_name} lastName={user.last_name} id={user.id} size={32}/>
            <div>
              <div className="text-[13px] font-bold">{user.first_name} {user.last_name}</div>
              <div className="text-[11px] text-white/35 capitalize">{user.role}</div>
            </div>
          </div>
        )}
        <Link href="/" className="block text-[12px] text-white/40 hover:text-white/70 no-underline mb-1">← Retour au site</Link>
        <button onClick={logout} className="text-[12px] text-white/40 hover:text-red-400 bg-transparent border-none cursor-pointer">Déconnexion</button>
      </div>
    </aside>
  )
}
