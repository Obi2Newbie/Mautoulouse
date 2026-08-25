'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Input, Textarea } from '@/components/ui/Input'
import { questionsApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const TAGS = ['Logement','Administratif','Gastronomie','Emploi','Études','Social','Transport','Santé','CAF','Visa','Banque']

export default function AskQuestionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [tags,     setTags]     = useState<string[]>([])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function toggleTag(tag: string) {
    setTags(p=>p.includes(tag)?p.filter(t=>t!==tag):[...p,tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    setError(''); setLoading(true)
    try {
      const q = await questionsApi.create({ title, body, tags })
      router.push(`/forum/${q.id}`)
    } catch(err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la publication')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <Navbar/>
      <div className="max-w-[800px] mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <button className="px-4 py-2 text-sm font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50" onClick={()=>router.back()}>← Retour</button>
          <div>
            <h1 className="font-display text-[28px] font-bold">Poser une question</h1>
            <p className="text-sm text-[#71717A] mt-1">La communauté est là pour vous aider</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-8">
          <div className="bg-coral-light border-l-[3px] border-coral rounded-[10px] px-4 py-3.5 mb-7 text-sm text-coral font-medium">
            💡 Avant de poster, <strong>vérifiez</strong> si votre question a déjà été posée via la barre de recherche.
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>}
          <div className="flex flex-col gap-6">
            <Input label="Titre de votre question *" placeholder="Ex: Comment trouver un logement étudiant à Toulouse?"
              className="text-[15px]" value={title} onChange={e=>setTitle(e.target.value)}
              hint="Soyez précis et clair dans votre formulation." required/>
            <Textarea label="Description détaillée *" className="min-h-[180px]"
              placeholder="Décrivez votre situation, ce que vous avez déjà essayé…"
              value={body} onChange={e=>setBody(e.target.value)} required/>
            <div>
              <label className="text-[13px] font-bold text-[#18181B] mb-3 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag=>(
                  <button type="button" key={tag} onClick={()=>toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${tags.includes(tag)?'bg-navy text-white border-navy':'bg-transparent text-[#71717A] border-[#EAE7E2] hover:border-navy hover:text-navy'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#EAE7E2]">
            <button type="button" onClick={()=>router.back()} className="px-5 py-2.5 text-sm font-bold rounded-[10px] border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading||!title||!body}
              className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 disabled:opacity-50">
              {loading?'Publication…':'Publier la question 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
