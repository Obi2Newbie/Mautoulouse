'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { useAuth } from '@/lib/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()

  useEffect(()=>{
    if (!loading && (!user || !isAdmin)) router.push('/')
  },[user, isAdmin, loading])

  if (loading || !user || !isAdmin) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-[#A1A1AA] text-sm">Vérification des droits…</div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar/>
      <main className="flex-1 bg-sand overflow-auto">{children}</main>
    </div>
  )
}
