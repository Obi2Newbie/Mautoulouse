'use client'
import { useEffect, useState } from 'react'
import { adminApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import type { User } from '@/lib/types'

const ROLE_COLORS: Record<string, 'navy'|'gold'|'coral'> = { user:'navy', moderator:'gold', admin:'coral' }
const ROLE_LABELS: Record<string, string> = { user:'Utilisateur', moderator:'Modérateur', admin:'Admin' }

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const [users,      setUsers]      = useState<User[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalUser,  setModalUser]  = useState<User|null>(null)
  const [newRole,    setNewRole]    = useState('')

  useEffect(()=>{
    adminApi.users().then(setUsers).catch(console.error).finally(()=>setLoading(false))
  },[])

  async function handleRoleChange() {
    if (!modalUser) return
    try {
      const updated = await adminApi.updateRole(modalUser.id, newRole)
      setUsers(us=>us.map(u=>u.id===updated.id?updated:u))
      setModalUser(null)
    } catch(e){ if(e instanceof ApiError) alert(e.message) }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Supprimer le compte de ${u.first_name} ${u.last_name} ?`)) return
    try { await adminApi.deleteUser(u.id); setUsers(us=>us.filter(x=>x.id!==u.id)) }
    catch(e){ if(e instanceof ApiError) alert(e.message) }
  }

  const filtered = users.filter(u=>{
    const matchSearch = `${u.first_name} ${u.last_name} ${u.email??''}`.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter==='all' || u.role===roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-bold">Gestion des Utilisateurs</h1>
        <p className="text-[#71717A] mt-1.5">{users.length} membres inscrits</p>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
          <input className="w-full pl-10 pr-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none focus:border-navy placeholder:text-[#A1A1AA]"
            placeholder="Rechercher un membre…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none appearance-none pr-9 cursor-pointer"
          value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="all">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="moderator">Modérateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_80px_80px_90px] px-5 py-3.5 border-b border-[#EAE7E2] bg-[#FAFAFA]">
          {['Membre','Rôle','Inscrit','Ville','','Actions'].map(h=>(
            <div key={h} className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{h}</div>
          ))}
        </div>
        {loading ? (
          [...Array(5)].map((_,i)=><div key={i} className="h-[64px] border-b border-[#EAE7E2] animate-pulse"/>)
        ) : filtered.length===0 ? (
          <div className="py-14 text-center text-[#A1A1AA]">Aucun membre trouvé.</div>
        ) : filtered.map((u,i)=>(
          <div key={u.id} className={`grid grid-cols-[2fr_1fr_100px_80px_80px_90px] px-5 py-4 items-center ${i<filtered.length-1?'border-b border-[#EAE7E2]':''} hover:bg-[#FAFAFA] transition-colors`}>
            <div className="flex items-center gap-3">
              <Avatar firstName={u.first_name} lastName={u.last_name} id={u.id} size={36}/>
              <div>
                <div className="font-bold text-sm">{u.first_name} {u.last_name}</div>
                <div className="text-xs text-[#71717A] mt-0.5">{u.email}</div>
              </div>
            </div>
            <Badge color={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>
            <div className="text-[13px] text-[#71717A]">{u.created_at?new Date(u.created_at).toLocaleDateString('fr-FR',{month:'short',year:'numeric'}):'-'}</div>
            <div className="text-[13px] text-[#71717A]">{u.origin_city??'-'}</div>
            <div/>
            <div className="flex gap-1.5">
              <button onClick={()=>{setModalUser(u);setNewRole(u.role)}} className="p-2 rounded-lg border border-[#EAE7E2] bg-white hover:bg-gray-50 cursor-pointer text-sm">✏️</button>
              <button onClick={()=>handleDelete(u)} className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer text-sm">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {modalUser&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={()=>setModalUser(null)}>
          <div className="bg-white rounded-[18px] p-7 max-w-[440px] w-[92%] shadow-xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold mb-1.5">Changer le rôle</h3>
            <p className="text-sm text-[#71717A] mb-5">Modifier le rôle de <strong>{modalUser.first_name} {modalUser.last_name}</strong></p>
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-[13px] font-bold">Nouveau rôle</label>
              <select className="w-full px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none appearance-none cursor-pointer"
                value={newRole} onChange={e=>setNewRole(e.target.value)}>
                <option value="user">Utilisateur</option>
                <option value="moderator">Modérateur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2.5">
              <button onClick={()=>setModalUser(null)} className="px-5 py-2.5 text-sm font-bold rounded-[10px] border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50">Annuler</button>
              <button onClick={handleRoleChange} className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
