'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import EventCard from '@/components/events/EventCard'
import QuestionRow from '@/components/forum/QuestionRow'
import { eventsApi, questionsApi, adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Event, Question, Analytics } from '@/lib/types'

function AskButton() {
  const router = useRouter()
  const { user } = useAuth()
  return (
    <button
      onClick={() => user ? router.push('/forum/ask') : router.push('/login')}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-coral text-white hover:opacity-90 transition-opacity">
      ✏️ Poser une question
    </button>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [events,    setEvents]    = useState<Event[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats,     setStats]     = useState<Analytics | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      eventsApi.list({ status: 'published' }),
      questionsApi.list({ limit: 3 }),
      adminApi.analytics(),
    ]).then(([evs, qs, analytics]) => {
      setEvents(evs.slice(0, 3))
      setQuestions(qs.slice(0, 3))
      setStats(analytics)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden text-white py-20 px-16"
        style={{
          backgroundImage: 'linear-gradient(rgba(14,38,64,0.78), rgba(27,61,95,0.72)), url(/mautoulouse.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'rgba(224,92,58,.14)' }} />
        <div className="absolute -bottom-20 left-48 w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: 'rgba(244,163,35,.11)' }} />
        <div className="max-w-[700px] relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[13px] font-semibold mb-7">
            🌴 La communauté mauricienne de Toulouse
          </div>
          <h1 className="font-display text-[58px] leading-[1.08] font-bold mb-5 tracking-tight">
            Ensemble à<br /><span className="text-gold">Toulouse</span>
          </h1>
          <p className="text-lg leading-[1.7] text-white/72 mb-9 max-w-[540px]">
            Posez vos questions, participez aux événements et retrouvez chez vous — à Toulouse.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 font-bold text-base px-7 py-3.5 rounded-xl bg-coral text-white hover:opacity-90 transition-opacity no-underline">
              Rejoindre la communauté
            </Link>
            <Link href="/events" className="inline-flex items-center gap-2 font-bold text-base px-7 py-3.5 rounded-xl bg-white/12 border border-white/30 text-white hover:bg-white/20 transition-colors no-underline">
              Explorer les événements
            </Link>
          </div>
          <div className="flex gap-11 mt-12 pt-9 border-t border-white/14">
            {[
              [stats ? String(stats.total_users)     : '…', 'Membres actifs'],
              [stats ? String(stats.total_events)    : '…', 'Événements organisés'],
              [stats ? String(stats.total_questions) : '…', 'Questions répondues'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-[30px] font-bold leading-none">{n}</div>
                <div className="text-[13px] text-white/48 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="px-14 py-14">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display text-[28px] font-bold">Événements à venir</h2>
            <p className="text-[#71717A] mt-1.5">Retrouvez la communauté lors de nos prochains événements</p>
          </div>
          <Link href="/events" className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50 transition-colors no-underline">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-[320px] rounded-card bg-[#EAE7E2] animate-pulse"/>)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-[#A1A1AA]">Aucun événement à venir pour le moment.</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {events.map(e => <EventCard key={e.id} event={e}/>)}
          </div>
        )}
      </section>

      {/* Q&A */}
      <section className="px-14 pb-14">
        <div className="flex justify-between items-end mb-7">
          <div>
            <h2 className="font-display text-[28px] font-bold">Questions récentes</h2>
            <p className="text-[#71717A] mt-1.5">La communauté répond à vos questions</p>
          </div>
          <AskButton />
        </div>
        {loading ? (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
            {[1,2,3].map(i => <div key={i} className="h-[100px] border-b border-[#EAE7E2] animate-pulse"/>)}
          </div>
        ) : (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
            {questions.map((q,i) => <QuestionRow key={q.id} question={q} showDivider={i < questions.length - 1}/>)}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-sidebar text-white/45 px-14 py-7 flex justify-between items-center text-[13px]">
        <span className="font-display text-white/80 font-semibold text-base">Mautoulouse © 2026</span>
        <span>Association des Mauriciens de Toulouse</span>
        <div className="flex gap-4">
          <Link href="/about"   className="cursor-pointer hover:text-white/70 transition-colors no-underline text-white/45">À propos</Link>
          <Link href="/contact" className="cursor-pointer hover:text-white/70 transition-colors no-underline text-white/45">Contact</Link>
          <Link href="/privacy" className="cursor-pointer hover:text-white/70 transition-colors no-underline text-white/45">Confidentialité</Link>
        </div>
      </footer>
    </div>
  )
}