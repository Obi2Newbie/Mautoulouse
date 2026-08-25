'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { eventsApi, ApiError, eventGradient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Badge from '@/components/ui/Badge'
import type { Event } from '@/lib/types'

export default function AdminEventsPage() {
  const { isAdmin } = useAuth()
  const [events,  setEvents]  = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    eventsApi.list({}).then(setEvents).catch(console.error).finally(()=>setLoading(false))
  },[])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer "${title}" ?`)) return
    try { await eventsApi.delete(id); setEvents(ev=>ev.filter(e=>e.id!==id)) }
    catch(e){ if(e instanceof ApiError) alert(e.message) }
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-[28px] font-bold">Gestion des Événements</h1>
          <p className="text-[#71717A] mt-1.5">{events.length} événements enregistrés</p>
        </div>
        <Link href="/admin/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 no-underline">+ Créer un événement</Link>
      </div>

      <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_80px_100px_90px] px-5 py-3.5 border-b border-[#EAE7E2] bg-[#FAFAFA]">
          {['Événement','Date','Participants','Prix','Statut','Actions'].map(h=>(
            <div key={h} className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{h}</div>
          ))}
        </div>
        {loading ? (
          [...Array(4)].map((_,i)=><div key={i} className="h-[68px] border-b border-[#EAE7E2] animate-pulse"/>)
        ) : events.length===0 ? (
          <div className="py-14 text-center text-[#A1A1AA]">Aucun événement.</div>
        ) : events.map((e,i)=>(
          <div key={e.id} className={`grid grid-cols-[2fr_1fr_100px_80px_100px_90px] px-5 py-4 items-center ${i<events.length-1?'border-b border-[#EAE7E2]':''} hover:bg-[#FAFAFA] transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-lg flex-shrink-0" style={{background:e.gradient??eventGradient(e.id)}}/>
              <div>
                <div className="font-bold text-sm">{e.title}</div>
                <div className="text-xs text-[#71717A] mt-0.5">📍 {e.location.split(',')[0]}</div>
              </div>
            </div>
            <div className="text-[13px] text-[#71717A]">{new Date(e.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</div>
            <div className="text-[13px]">{e.going_count??0}/{e.capacity}</div>
            <div className="font-bold" style={{color:e.price_cents===0?'#09A572':'#E05C3A'}}>{e.price_cents===0?'Gratuit':`${e.price_cents/100}€`}</div>
            <div><Badge color={e.status==='published'?'teal':e.status==='past'?'navy':'gold'}>{e.status==='published'?'Publié':e.status==='past'?'Passé':'Brouillon'}</Badge></div>
            <div className="flex gap-1.5">
              <Link href={`/admin/events/new?edit=${e.id}`} className="p-2 rounded-lg border border-[#EAE7E2] bg-white hover:bg-gray-50 cursor-pointer text-sm no-underline">✏️</Link>
              <button onClick={()=>handleDelete(e.id, e.title)} className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer text-sm">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
