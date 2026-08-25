'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import EventCard from '@/components/events/EventCard'
import { eventsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Event } from '@/lib/types'

const FILTERS = ['Tous', 'À venir', 'Ce mois-ci', 'Passés', 'Mes événements']

export default function EventsPage() {
  const { user } = useAuth()
  const [allEvents,  setAllEvents]  = useState<Event[]>([])
  const [myEvents,   setMyEvents]   = useState<Event[]>([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState(0)

  useEffect(() => {
    // Fetch all events (no status filter = all statuses)
    eventsApi.list({ status: '' })
      .then(setAllEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) {
      eventsApi.myEvents().then(setMyEvents).catch(console.error)
    }
  }, [user])

  function getFiltered(): Event[] {
    const now       = new Date()
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart= new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd  = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    switch (activeTab) {
      case 0: // Tous — published only
        return allEvents.filter(e => e.status === 'published')

      case 1: // À venir — future published events
        return allEvents.filter(e => {
          const d = new Date(e.date)
          return e.status === 'published' && d >= today
        })

      case 2: // Ce mois-ci — published events this calendar month
        return allEvents.filter(e => {
          const d = new Date(e.date)
          return e.status === 'published' && d >= monthStart && d <= monthEnd
        })

      case 3: // Passés
        return allEvents.filter(e => {
          const d = new Date(e.date)
          return e.status === 'past' || d < today
        })

      case 4: // Mes événements
        return myEvents

      default:
        return allEvents
    }
  }

  const filtered = getFiltered()

  return (
    <div>
      <Navbar/>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="mb-7">
          <h1 className="font-display text-[30px] font-bold">Événements</h1>
          <p className="text-[#71717A] mt-1.5">Participez aux prochains événements de la communauté</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap mb-7">
          {FILTERS.map((f, i) => (
            <button key={f} onClick={() => setActiveTab(i)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
                activeTab === i
                  ? 'bg-navy text-white border-navy'
                  : 'bg-transparent text-[#71717A] border-[#EAE7E2] hover:border-navy hover:text-navy'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-[380px] rounded-card bg-[#EAE7E2] animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#A1A1AA]">
            {activeTab === 4 && !user
              ? 'Connectez-vous pour voir vos événements.'
              : 'Aucun événement trouvé.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filtered.map(e => <EventCard key={e.id} event={e}/>)}
          </div>
        )}
      </div>
    </div>
  )
}