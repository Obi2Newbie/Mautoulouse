'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface AnalyticsData {
  total_users:          number
  total_events:         number
  total_questions:      number
  total_attendees:      number
  users_by_month?:      { month: string; count: number }[]
  events_by_month?:     { month: string; events: number }[]
  questions_by_month?:  { month: string; count: number }[]
}

const FALLBACK_MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun']

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.push('/'); return }

    adminApi.analytics()
      .then(d => setData(d as AnalyticsData))
      .catch(e => setError(e.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [user, isAdmin, authLoading])

  if (authLoading || loading) return (
    <div className="p-10 space-y-6">
      <div className="h-9 w-52 bg-[#EAE7E2] rounded-lg animate-pulse"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-card bg-[#EAE7E2] animate-pulse"/>)}
      </div>
      <div className="h-72 rounded-card bg-[#EAE7E2] animate-pulse"/>
    </div>
  )

  if (error) return (
    <div className="p-10">
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-card p-6">
        <p className="font-bold mb-1">Erreur de chargement des analytics</p>
        <p className="text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 text-sm font-bold rounded-lg bg-red-500 text-white hover:bg-red-600">Réessayer</button>
      </div>
    </div>
  )

  // ── KPI Cards ─────────────────────────────────────────────
  const KPI = [
    { label: 'Membres actifs',   value: data?.total_users     ?? 0, icon: '👥', color: '#1B3D5F', bg: '#EBF4FF', delta: null },
    { label: 'Événements',       value: data?.total_events    ?? 0, icon: '🗓️', color: '#E05C3A', bg: '#FEF0EB', delta: null },
    { label: 'Questions posées', value: data?.total_questions ?? 0, icon: '💬', color: '#09A572', bg: '#E8FAF3', delta: null },
    { label: 'Participants',     value: data?.total_attendees ?? 0, icon: '🎉', color: '#7C3AED', bg: '#F5F0FF', delta: null },
  ]

  // ── Charts data (real or fallback empty) ──────────────────
  const usersChart = data?.users_by_month?.length
    ? data.users_by_month
    : FALLBACK_MONTHS.map(m => ({ month: m, count: 0 }))

  const eventsChart = data?.events_by_month?.length
    ? data.events_by_month
    : FALLBACK_MONTHS.map(m => ({ month: m, events: 0 }))

  // ── Content breakdown ─────────────────────────────────────
  const maxUsers     = Math.max(data?.total_users     ?? 0, 1)
  const maxEvents    = Math.max(data?.total_events    ?? 0, 1)
  const maxQuestions = Math.max(data?.total_questions ?? 0, 1)
  const maxAttendees = Math.max(data?.total_attendees ?? 0, 1)
  const globalMax    = Math.max(maxUsers, maxEvents, maxQuestions, maxAttendees)

  const CONTENT = [
    { label: 'Membres',      value: data?.total_users     ?? 0, color: '#1B3D5F' },
    { label: 'Questions',    value: data?.total_questions ?? 0, color: '#09A572' },
    { label: 'Événements',   value: data?.total_events    ?? 0, color: '#E05C3A' },
    { label: 'Participants', value: data?.total_attendees ?? 0, color: '#7C3AED' },
  ]

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-bold">Analytics</h1>
        <p className="text-[#71717A] mt-1.5">Vue d'ensemble de la plateforme Mautoulouse</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {KPI.map(k => (
          <div key={k.label} className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-5">
            <div className="flex justify-between items-start mb-3.5">
              <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-[19px]"
                style={{ background: k.bg }}>{k.icon}</div>
            </div>
            <div className="font-display text-[36px] font-bold leading-none" style={{ color: k.color }}>
              {k.value.toLocaleString('fr-FR')}
            </div>
            <div className="text-[13px] text-[#71717A] mt-2">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 mb-6">
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-6">
          <h3 className="font-display text-lg font-bold mb-1">Croissance des membres</h3>
          <p className="text-[13px] text-[#71717A] mb-5">Inscriptions par mois</p>
          {(data?.total_users ?? 0) === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-[#A1A1AA] text-sm">Aucune donnée disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={usersChart}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1B3D5F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1B3D5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E2"/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A1A1AA' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: '#A1A1AA' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #EAE7E2', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                  formatter={(v: number) => [v, 'Membres']}/>
                <Area type="monotone" dataKey="count" stroke="#1B3D5F" strokeWidth={2.5} fill="url(#colorUsers)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-6">
          <h3 className="font-display text-lg font-bold mb-1">Événements / mois</h3>
          <p className="text-[13px] text-[#71717A] mb-5">Événements créés par mois</p>
          {(data?.total_events ?? 0) === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-[#A1A1AA] text-sm">Aucune donnée disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={eventsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E2"/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A1A1AA' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: '#A1A1AA' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #EAE7E2', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                  formatter={(v: number) => [v, 'Événements']}/>
                <Bar dataKey="events" fill="#E05C3A" radius={[5, 5, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Content breakdown */}
      <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-6">
        <h3 className="font-display text-lg font-bold mb-5">Répartition du contenu</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-5">
          {CONTENT.map(c => (
            <div key={c.label}>
              <div className="flex justify-between text-[13px] mb-2">
                <span className="font-semibold">{c.label}</span>
                <span className="font-bold" style={{ color: c.color }}>{c.value.toLocaleString('fr-FR')}</span>
              </div>
              <div className="h-2.5 bg-[#EAE7E2] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${globalMax > 0 ? Math.round((c.value / globalMax) * 100) : 0}%`,
                    background: c.color,
                  }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
