'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionRow from '@/components/forum/QuestionRow'
import { questionsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Question } from '@/lib/types'

const TABS = ['Toutes', 'Tendance', 'Mes questions']

export default function ForumPage() {
  const router   = useRouter()
  const { user } = useAuth()
  const [questions,  setQuestions]  = useState<Question[]>([])
  const [search,     setSearch]     = useState('')
  const [searching,  setSearching]  = useState(false)
  const [activeTab,  setActiveTab]  = useState(0)
  const [loading,    setLoading]    = useState(true)

  // Load all questions once
  useEffect(() => {
    questionsApi.list({ limit: 100 })
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Debounced search — hits the search RPC
  useEffect(() => {
    if (!search.trim()) return
    setSearching(true)
    const t = setTimeout(() => {
      questionsApi.list({ search: search.trim() })
        .then(setQuestions)
        .catch(console.error)
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Clear search — reload all
  function clearSearch() {
    setSearch('')
    setLoading(true)
    questionsApi.list({ limit: 100 })
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // Filter + sort per tab
  const filtered = useMemo(() => {
    let list = [...questions]
    switch (activeTab) {
      case 1: // Tendance — sort by vote score desc
        return list.sort((a, b) => (b.vote_score ?? 0) - (a.vote_score ?? 0))
      case 2: // Mes questions — only mine
        if (!user) return []
        return list.filter(q => q.author_id === user.id)
      default: // Toutes — sort by date desc (already from API)
        return list
    }
  }, [questions, activeTab, user])

  const isLoading = loading || searching

  return (
    <div>
      <Navbar/>
      <div className="max-w-[920px] mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-7">
          <div>
            <h1 className="font-display text-[30px] font-bold">Forum Q&amp;R</h1>
            <p className="text-[#71717A] mt-1.5">Posez vos questions, partagez votre expérience</p>
          </div>
          <button
            onClick={() => user ? router.push('/forum/ask') : router.push('/login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 transition-opacity">
            ✏️ Poser une question
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px]">🔍</span>
            <input
              className="w-full pl-11 pr-10 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none focus:border-navy placeholder:text-[#A1A1AA]"
              placeholder="Rechercher une question…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] bg-transparent border-none cursor-pointer text-lg"
                onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EAE7E2] mb-6">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === i
                  ? 'text-navy border-coral'
                  : 'text-[#71717A] border-transparent hover:text-navy'
              }`}>
              {t}
              {i === 2 && user && (
                <span className="ml-1.5 bg-navy/10 text-navy text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {questions.filter(q => q.author_id === user.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
            {[1,2,3,4].map(i => <div key={i} className="h-[120px] border-b border-[#EAE7E2] animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#A1A1AA]">
            {activeTab === 2 && !user
              ? 'Connectez-vous pour voir vos questions.'
              : activeTab === 2
              ? 'Vous n\'avez pas encore posé de question.'
              : search
              ? `Aucun résultat pour "${search}"`
              : 'Aucune question pour le moment.'}
          </div>
        ) : (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
            {filtered.map((q, i) => (
              <QuestionRow key={q.id} question={q} showDivider={i < filtered.length - 1}/>
            ))}
          </div>
        )}

        {/* Pagination hint */}
        {filtered.length >= 20 && !search && (
          <p className="text-center text-sm text-[#A1A1AA] mt-6">
            Affichage des {filtered.length} premières questions
          </p>
        )}
      </div>
    </div>
  )
}