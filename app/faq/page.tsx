'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { faqsApi } from '@/lib/api'
import type { FAQ } from '@/lib/types'

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        faqsApi.list().then(setFaqs).catch(console.error).finally(() => setLoading(false))
    }, [])

    // Group by category
    const categories = Array.from(new Set(faqs.map(f => f.category)))

    const filtered = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    )

    const groupedFiltered = categories
        .map(cat => ({ cat, items: filtered.filter(f => f.category === cat) }))
        .filter(g => g.items.length > 0)

    return (
        <div>
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-br from-navy to-[#2C5F8A] text-white py-14 px-6 text-center">
                <h1 className="font-display text-[38px] font-bold mb-3">Questions fréquentes</h1>
                <p className="text-white/70 text-lg mb-8 max-w-[520px] mx-auto">
                    Tout ce que vous devez savoir pour profiter pleinement de la communauté Mautoulouse
                </p>
                {/* Search */}
                <div className="max-w-[540px] mx-auto relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]">🔍</span>
                    <input
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[#18181B] text-sm outline-none placeholder:text-[#A1A1AA] shadow-lg"
                        placeholder="Rechercher une question…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-[760px] mx-auto px-6 py-12">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-[64px] rounded-[12px] bg-[#EAE7E2] animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-[#A1A1AA]">
                        {search ? `Aucun résultat pour "${search}"` : 'Aucune FAQ disponible.'}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {groupedFiltered.map(({ cat, items }) => (
                            <div key={cat}>
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="font-display text-xl font-bold">{cat}</h2>
                                    <div className="flex-1 h-px bg-[#EAE7E2]" />
                                    <span className="text-[13px] text-[#A1A1AA]">{items.length} question{items.length > 1 ? 's' : ''}</span>
                                </div>
                                <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden">
                                    {items.map((faq, i) => (
                                        <div key={faq.id} className={i < items.length - 1 ? 'border-b border-[#EAE7E2]' : ''}>
                                            {/* Question row */}
                                            <button
                                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#FAFAFA] transition-colors"
                                                onClick={() => setExpanded(e => e === faq.id ? null : faq.id)}>
                                                <span className="font-semibold text-[15px] text-[#18181B] leading-snug">{faq.question}</span>
                                                <span className={`text-[#A1A1AA] text-lg flex-shrink-0 transition-transform duration-200 ${expanded === faq.id ? 'rotate-180' : ''
                                                    }`}>▾</span>
                                            </button>
                                            {/* Answer */}
                                            {expanded === faq.id && (
                                                <div className="px-6 pb-5 text-sm text-[#71717A] leading-[1.8] bg-[#FAFAFA] border-t border-[#EAE7E2]">
                                                    <div className="pt-4">{faq.answer}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-br from-navy to-[#2C5F8A] rounded-card p-8 text-center text-white">
                    <h3 className="font-display text-xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
                    <p className="text-white/70 text-sm mb-5">Posez votre question à la communauté — quelqu'un a sûrement la réponse !</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <a href="/forum/ask" className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 no-underline transition-opacity">
                            ✏️ Poser une question
                        </a>
                        <a href="/contact" className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-white/15 border border-white/30 text-white hover:bg-white/25 no-underline transition-colors">
                            📧 Nous contacter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}