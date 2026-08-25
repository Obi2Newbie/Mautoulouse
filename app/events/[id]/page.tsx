'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { eventsApi, eventGradient, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Event, EventAttendee } from '@/lib/types'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router   = useRouter()
  const { user } = useAuth()
  const [event,     setEvent]     = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [loading,   setLoading]   = useState(true)
  const [attending, setAttending] = useState(false)
  const [myStatus,  setMyStatus]  = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      eventsApi.get(params.id),
      user ? eventsApi.attendees(params.id) : Promise.resolve([]),
    ]).then(([ev, att]) => {
      setEvent(ev)
      setAttendees(att)
      if (user) {
        const mine = att.find((a: EventAttendee) => a.user_id === user.id)
        setMyStatus(mine?.status ?? null)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [params.id, user])

  async function handleAttend(status: 'going' | 'interested') {
    if (!user) { router.push('/login'); return }
    setAttending(true)
    try {
      if (myStatus === status) {
        await eventsApi.cancelAttend(params.id)
        setMyStatus(null)
      } else {
        await eventsApi.attend(params.id, status)
        setMyStatus(status)
      }
      const att = await eventsApi.attendees(params.id)
      setAttendees(att)
    } catch (e) { if (e instanceof ApiError) alert(e.message) }
    finally { setAttending(false) }
  }

  if (loading) return <div><Navbar/><div className="flex items-center justify-center h-64 text-[#A1A1AA]">Chargement…</div></div>
  if (!event)  return <div><Navbar/><div className="text-center py-20">Événement introuvable.</div></div>

  const gradient = event.gradient ?? eventGradient(event.id)
  const going    = event.going_count ?? attendees.filter(a => a.status === 'going').length
  const pct      = Math.round((going / event.capacity) * 100)
  const priceEur = event.price_cents / 100
  const isPast   = new Date(event.date) < new Date()

  function getEmbedUrl(url: string) {
    return url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/')
  }

  return (
    <div>
      <Navbar/>

      {/* Hero */}
      <div className="h-[320px] relative" style={{ background: gradient }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg,rgba(11,26,44,.72) 0%,rgba(11,26,44,0) 55%)' }}/>
        <div className="absolute bottom-8 left-14 text-white">
          <div className="flex gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{event.category}</span>
            {isPast && <span className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded-full">Événement passé</span>}
          </div>
          <h1 className="font-display text-[42px] font-bold" style={{ textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>{event.title}</h1>
        </div>
        <button className="absolute top-6 left-6 px-4 py-2 text-sm font-bold rounded-lg bg-white/15 border border-white/30 text-white backdrop-blur-md hover:bg-white/25"
          onClick={() => router.back()}>← Retour</button>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="grid grid-cols-[1fr_340px] gap-8">

          {/* Left column */}
          <div>
            {/* Description */}
            <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7 mb-5">
              <h2 className="font-display text-[22px] font-bold mb-4">À propos</h2>
              <p className="text-[15px] text-[#71717A] leading-[1.8]">{event.description}</p>
              {(event.tags ?? []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-5">
                  {event.tags!.map(t => <Badge key={t} color="navy">{t}</Badge>)}
                </div>
              )}
            </div>

            {/* YouTube */}
            {event.youtube_url && (
              <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7 mb-5">
                <h2 className="font-display text-[22px] font-bold mb-4">🎬 Vidéo</h2>
                <div className="relative w-full rounded-[12px] overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={getEmbedUrl(event.youtube_url)}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Attendees */}
            {attendees.length > 0 && (
              <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7">
                <h3 className="font-display text-lg font-bold mb-4">Participants ({going})</h3>
                <div className="flex flex-wrap gap-3">
                  {attendees.slice(0, 8).map(a => (
                    <div key={a.user_id} className="flex items-center gap-2">
                      <Avatar firstName={a.profiles?.first_name ?? '?'} lastName={a.profiles?.last_name ?? '?'} id={a.user_id} size={32}/>
                      <span className="text-[13px] font-semibold">{a.profiles?.first_name}</span>
                    </div>
                  ))}
                  {going > 8 && (
                    <div className="w-8 h-8 rounded-full bg-[#EAE7E2] flex items-center justify-center text-[11px] font-bold text-[#71717A]">+{going - 8}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right sticky card */}
          <div>
            <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-6 sticky top-20">
              <div className="pb-4 mb-4 border-b border-[#EAE7E2]">
                <p className="text-[11px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-1.5">DATE & HEURE</p>
                <p className="text-[15px] font-bold">
                  📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-[#71717A] mt-1">⏰ {event.time}</p>
              </div>

              <div className="pb-4 mb-4 border-b border-[#EAE7E2]">
                <p className="text-[11px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-1.5">LIEU</p>
                <p className="text-sm font-bold leading-snug">📍 {event.location}</p>
              </div>

              <div className="pb-4 mb-4 border-b border-[#EAE7E2]">
                <p className="text-[11px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-2">PLACES</p>
                <p className="text-sm font-bold mb-2">👥 {event.capacity - going} places restantes</p>
                <div className="h-2 bg-[#EAE7E2] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? '#E05C3A' : '#09A572' }}/>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">{going} inscrits sur {event.capacity}</p>
              </div>

              {event.price_cents > 0 && (
                <div className="pb-4 mb-4 border-b border-[#EAE7E2]">
                  <p className="text-[11px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-1.5">PRIX</p>
                  <p className="font-display text-[28px] font-bold text-coral">
                    {priceEur}€ <span className="text-sm text-[#71717A] font-normal">/ personne</span>
                  </p>
                </div>
              )}

              {/* Action buttons — hidden for past events */}
              {isPast ? (
                <div className="w-full py-3.5 rounded-xl bg-[#EAE7E2] text-[#A1A1AA] text-sm font-bold text-center">
                  Événement terminé
                </div>
              ) : (
                <>
                  <button
                    disabled={attending}
                    onClick={() => handleAttend('going')}
                    className={`w-full py-3.5 rounded-xl font-bold text-base mb-2.5 transition-all ${
                      myStatus === 'going' ? 'bg-teal text-white' : 'bg-coral text-white hover:opacity-90'
                    } disabled:opacity-50`}>
                    {myStatus === 'going' ? '✅ Inscrit — Annuler' : '✅ Je participe!'}
                  </button>
                  <button
                    disabled={attending}
                    onClick={() => handleAttend('interested')}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                      myStatus === 'interested' ? 'border-teal text-teal bg-teal/5' : 'border-navy text-navy hover:bg-navy/5'
                    } disabled:opacity-50`}>
                    {myStatus === 'interested' ? '⭐ Intéressé — Annuler' : '⭐ Je suis intéressé'}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}