'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Avatar from '@/components/ui/Avatar'

const NAV_LINKS = [
  { label: 'Accueil',    href: '/' },
  { label: 'Événements', href: '/events' },
  { label: 'Forum Q&R',  href: '/forum' },
  { label: 'Galerie',    href: '/galerie' },
  { label: 'FAQ',        href: '/faq' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout, isAdmin } = useAuth()

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <nav className="h-[66px] flex items-center justify-between px-8 bg-sand/95 backdrop-blur-md border-b border-[#EAE7E2] sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <img src="/logo.png" alt="Mautoulouse" className="w-[38px] h-[38px] rounded-[10px] object-cover flex-shrink-0"/>
          <span className="font-display font-bold text-[22px] text-navy">Mautoulouse</span>
        </Link>
        <div className="flex gap-0.5">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href}
              className={`px-[13px] py-[7px] rounded-lg text-sm font-semibold transition-colors no-underline ${
                pathname === href ? 'bg-navy/10 text-navy' : 'text-[#71717A] hover:text-navy hover:bg-navy/5'
              }`}>{label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin"
              className={`px-[13px] py-[7px] rounded-lg text-sm font-semibold transition-colors no-underline ${
                pathname.startsWith('/admin') ? 'bg-coral/10 text-coral' : 'text-[#71717A] hover:text-coral hover:bg-coral/5'
              }`}>Admin
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {user ? (
          <>
            <Link href="/profile"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold rounded-lg text-[#71717A] hover:text-navy hover:bg-navy/5 transition-colors no-underline">
              Mon profil
            </Link>
            <button onClick={handleLogout}
              className="inline-flex items-center px-3.5 py-1.5 text-[13px] font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50 transition-colors">
              Déconnexion
            </button>
            <Link href="/profile">
              <Avatar firstName={user.first_name} lastName={user.last_name} id={user.id} size={34}/>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login"
              className="inline-flex items-center px-3.5 py-1.5 text-[13px] font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50 transition-colors no-underline">
              Connexion
            </Link>
            <Link href="/signup"
              className="inline-flex items-center px-3.5 py-1.5 text-[13px] font-bold rounded-lg bg-coral text-white hover:opacity-90 transition-opacity no-underline">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}