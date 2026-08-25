'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import { eventsApi, eventGradient, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Event } from '@/lib/types'

export default function EventCard({ event }: { event: Event }) {
  const router   = useRouter()
  const { user } = useAuth()

  const gradient = event.gradient ?? eventGradient(event.id)
  const priceEur = event.price_cents / 100

  const [going,      setGoing]      = useState(event.going_count ?? 0)
  const [myStatus,   setMyStatus]   = useState<'going' | 'interested' | null>(null)
  const [attending,  setAttending]  = useState(false)

  async function handleAttend(e: React.MouseEvent, status: 'going' | 'interested') {
    e.stopPropagation()
    if (!user) { router.push('/login'); return }
    if (attending) return
    setAttending(true)
    try {
      if (myStatus === status) {
        // Toggle off — cancel attendance
        await eventsApi.cancelAttend(event.id)
        setMyStatus(null)
        if (status === 'going') setGoing(g => Math.max(0, g - 1))
      } else {
        await eventsApi.attend(event.id, status)
        if (myStatus === 'going') setGoing(g => Math.max(0, g - 1))
        if (status === 'going')   setGoing(g => g + 1)
        setMyStatus(status)
      }
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setAttending(false)
    }
  }

  const pct = Math.round((going / event.capacity) * 100)

  return (
    <div
      className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
      onClick={() => router.push(`/events/${event.id}`)}>

      {/* Image area */}
      <div className="h-[184px] relative flex-shrink-0" style={{ background: gradient }}>
        <div className="absolute top-3 left-3">
          <span className="bg-white/93 text-navy text-xs font-bold px-3 py-1 rounded-full">{event.category}</span>
        </div>
        <div className="absolute top-3 right-3">
          {event.price_cents === 0
            ? <span className="bg-teal text-white text-xs font-bold px-3 py-1 rounded-full">Gratuit</span>
            : <span className="bg-coral text-white text-[13px] font-extrabold px-3 py-1 rounded-full">{priceEur}€</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1">
        <h3 className="font-display font-bold text-[19px] mb-2.5 leading-snug">{event.title}</h3>
        <p className="text-[13px] text-[#71717A] leading-[1.9]">
          📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} · ⏰ {event.time}
        </p>
        <p className="text-[13px] text-[#71717A] mt-1 mb-3">📍 {event.location}</p>
        <p className="text-[13px] text-[#71717A] leading-[1.55] mb-4 line-clamp-2">{event.description}</p>
        <div className="flex gap-1.5 flex-wrap">
          {(event.tags ?? []).map(t => <Badge key={t} color="navy">{t}</Badge>)}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-[#EAE7E2] flex justify-between items-center">
        <div>
          <p className="text-[13px] text-[#71717A]">👥 {going}/{event.capacity}</p>
          <div className="w-[130px] h-1.5 bg-[#EAE7E2] rounded-full mt-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct > 80 ? '#E05C3A' : '#09A572' }}/>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            disabled={attending}
            onClick={e => handleAttend(e, 'interested')}
            className={`inline-flex items-center gap-1.5 font-bold px-3.5 py-1.5 text-[13px] rounded-lg border transition-all disabled:opacity-50 ${
              myStatus === 'interested'
                ? 'bg-gold/10 border-gold text-[#92540A]'
                : 'border-[#EAE7E2] text-[#71717A] hover:bg-gray-50 bg-transparent'
            }`}>
            ⭐ {myStatus === 'interested' ? 'Intéressé ✓' : 'Intéressé'}
          </button>
          <button
            disabled={attending || going >= event.capacity && myStatus !== 'going'}
            onClick={e => handleAttend(e, 'going')}
            className={`inline-flex items-center gap-1.5 font-bold px-3.5 py-1.5 text-[13px] rounded-lg transition-all disabled:opacity-50 ${
              myStatus === 'going'
                ? 'bg-teal text-white'
                : 'bg-coral text-white hover:opacity-90'
            }`}>
            ✅ {myStatus === 'going' ? 'Inscrit ✓' : 'Participer'}
          </button>
        </div>
      </div>
    </div>
  )
}