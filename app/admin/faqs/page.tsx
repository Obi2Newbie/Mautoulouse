'use client'
import { useEffect, useState } from 'react'
import { faqsApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Input, Textarea } from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import type { FAQ } from '@/lib/types'

const CATEGORIES = ['Général','Compte','Événements','Forum','Administratif','Sécurité']

export default function AdminFAQsPage() {
  const { user, isAdmin } = useAuth()
  const [faqs,     setFaqs]     = useState<FAQ[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({ question:'', answer:'', category:'Général', published: true })
  const set = (k:string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[k]: k==='published' ? (e.target as HTMLInputElement).checked : e.target.value}))

  useEffect(()=>{
    faqsApi.listAll().then(setFaqs).catch(console.error).finally(()=>setLoading(false))
  },[])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question || !form.answer) return
    setError(''); setSaving(true)
    try {
      const faq = await faqsApi.create({
        question: form.question, answer: form.answer,
        category: form.category, published: form.published, display_order: faqs.length,
      })
      setFaqs(f=>[...f, faq])
      setForm({ question:'', answer:'', category:'Général', published: true })
      setShowForm(false)
    } catch(err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la création')
    } finally { setSaving(false) }
  }

  async function togglePublish(faq: FAQ) {
    try {
      const updated = await faqsApi.update(faq.id, { published: !faq.published })
      setFaqs(fs=>fs.map(f=>f.id===updated.id?updated:f))
    } catch(e){ if(e instanceof ApiError) alert(e.message) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette FAQ?')) return
    try {
      await faqsApi.delete(id)
      setFaqs(fs=>fs.filter(f=>f.id!==id))
    } catch(e){ if(e instanceof ApiError) alert(e.message) }
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-[28px] font-bold">Gestion des FAQs</h1>
          <p className="text-[#71717A] mt-1.5">{faqs.length} FAQs — {faqs.filter(f=>f.published).length} publiées</p>
        </div>
        <button onClick={()=>setShowForm(s=>!s)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90">
          {showForm ? '✕ Annuler' : '+ Nouvelle FAQ'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7 mb-6">
          <h3 className="font-display text-lg font-bold mb-5">Nouvelle FAQ</h3>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>}
          <div className="flex flex-col gap-4">
            <Input label="Question *" placeholder="Quelle est la question fréquente?"
              value={form.question} onChange={set('question')} required/>
            <Textarea label="Réponse *" className="min-h-[120px]"
              placeholder="Rédigez une réponse claire et utile…"
              value={form.answer} onChange={set('answer')} required/>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#18181B]">Catégorie</label>
                <select className="w-full px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none appearance-none cursor-pointer"
                  value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${form.published?'bg-teal':'bg-[#EAE7E2]'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published?'left-7':'left-1'}`}/>
                  </div>
                  <span className="text-sm font-semibold">{form.published?'Publié':'Brouillon'}</span>
                  <input type="checkbox" className="hidden" checked={form.published}
                    onChange={e=>setForm(f=>({...f,published:e.target.checked}))}/>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={()=>setShowForm(false)}
              className="px-5 py-2.5 text-sm font-bold rounded-[10px] border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving||!form.question||!form.answer}
              className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 disabled:opacity-50">
              {saving?'Création…':'Publier la FAQ'}
            </button>
          </div>
        </form>
      )}

      {/* FAQ list */}
      {loading ? (
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
          {[1,2,3,4].map(i=><div key={i} className="h-[60px] border-b border-[#EAE7E2] animate-pulse"/>)}
        </div>
      ) : faqs.length===0 ? (
        <div className="py-20 text-center text-[#A1A1AA]">Aucune FAQ créée. Ajoutez-en une ci-dessus.</div>
      ) : (
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden">
          {faqs.map((faq,i)=>(
            <div key={faq.id} className={i<faqs.length-1?'border-b border-[#EAE7E2]':''}>
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                onClick={()=>setExpanded(e=>e===faq.id?null:faq.id)}>
                <span className="text-[13px] text-[#71717A] flex-shrink-0 transition-transform duration-200 select-none"
                  style={{transform:expanded===faq.id?'rotate(90deg)':'none'}}>▶</span>
                <div className="flex-1 font-bold text-[15px] min-w-0">
                  <span className="line-clamp-1">{faq.question}</span>
                </div>
                <Badge color="navy">{faq.category}</Badge>
                {/* Published toggle */}
                <button onClick={e=>{e.stopPropagation();togglePublish(faq)}}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${faq.published?'bg-teal':'bg-[#EAE7E2]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${faq.published?'left-5':'left-0.5'}`}/>
                </button>
                <span className="text-xs text-[#A1A1AA] w-16 text-center flex-shrink-0">
                  {faq.published?'Publié':'Brouillon'}
                </span>
                <div className="flex gap-1.5" onClick={e=>e.stopPropagation()}>
                  <button className="p-2 rounded-lg border border-[#EAE7E2] bg-white hover:bg-gray-50 cursor-pointer text-sm">✏️</button>
                  <button onClick={()=>handleDelete(faq.id)}
                    className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer text-sm">🗑️</button>
                </div>
              </div>
              {/* Answer */}
              {expanded===faq.id && (
                <div className="px-5 pb-5 pl-12 text-sm text-[#71717A] leading-[1.75] bg-[#FAFAFA]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
