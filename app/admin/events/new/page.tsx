'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { eventsApi, ApiError } from '@/lib/api'
import { Input, Textarea } from '@/components/ui/Input'

const TAGS = ['Famille', 'Musique', 'Danse', 'Gastronomie', 'Gratuit', 'Nouveaux arrivants', 'Culture', 'Sport']
const CATEGORIES = ['Gastronomie', 'Culture', 'Social', 'Sport', 'Musique', 'Famille']

export default function AdminCreateEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')   // present when editing
  const isEdit = !!editId

  const [form, setForm] = useState({
    title: '', date: '', time: '', location: '',
    description: '', price: '0', capacity: '50',
    category: 'Gastronomie', youtube_url: '',
  })
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Pre-fill form when editing
  useEffect(() => {
    if (!editId) return
    eventsApi.get(editId).then(ev => {
      setForm({
        title: ev.title,
        date: ev.date,
        time: ev.time.slice(0, 5),   // trim seconds if present
        location: ev.location,
        description: ev.description,
        price: String(ev.price_cents / 100),
        capacity: String(ev.capacity),
        category: ev.category,
        youtube_url: ev.youtube_url ?? '',
      })
      setTags(ev.tags ?? [])
    }).catch(e => setError('Impossible de charger l\'événement'))
      .finally(() => setFetching(false))
  }, [editId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const base = {
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time.length === 5 ? `${form.time}:00` : form.time,
        location: form.location,
        price_cents: Math.round(parseFloat(form.price || '0') * 100),
        capacity: parseInt(form.capacity),
        category: form.category,
        tags,
        youtube_url: form.youtube_url || undefined,
      }

      if (isEdit) {
        await eventsApi.update(editId!, base)
      } else {
        await eventsApi.create({ ...base, status: 'published' as const, created_by: '' })
      }
      router.push('/admin/events')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="p-10 max-w-[800px]">
      <div className="h-8 w-48 bg-[#EAE7E2] rounded animate-pulse mb-8" />
      <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-8 space-y-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-[#EAE7E2] rounded-[10px] animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="p-10 max-w-[800px]">
      <div className="flex items-center gap-4 mb-8">
        <button className="px-4 py-2 text-sm font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50"
          onClick={() => router.back()}>←</button>
        <div>
          <h1 className="font-display text-[28px] font-bold">
            {isEdit ? 'Modifier l\'événement' : 'Créer un événement'}
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            {isEdit ? 'Modifiez les détails de votre événement' : 'Remplissez les détails de votre événement'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>
        )}
        <div className="flex flex-col gap-5">
          <Input label="Titre *" placeholder="Ex: Dîner Mauricien 2025" className="text-[15px]"
            value={form.title} onChange={set('title')} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={form.date} onChange={set('date')} required />
            <Input label="Heure *" type="time" value={form.time} onChange={set('time')} required />
          </div>

          <Input label="Lieu *" placeholder="Adresse complète"
            value={form.location} onChange={set('location')} required />

          <Textarea label="Description *" className="min-h-[160px]"
            placeholder="Décrivez l'événement…"
            value={form.description} onChange={set('description')} required />

          <div className="grid grid-cols-3 gap-4">
            <Input label="Prix (€) — 0 si gratuit" type="number" placeholder="0"
              value={form.price} onChange={set('price')} />
            <Input label="Capacité max" type="number" placeholder="50"
              value={form.capacity} onChange={set('capacity')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#18181B]">Catégorie</label>
              <select className="w-full px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white outline-none focus:border-navy appearance-none cursor-pointer"
                value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <Input label="Lien YouTube (optionnel)" placeholder="https://youtube.com/watch?v=…"
            value={form.youtube_url} onChange={set('youtube_url')} />

          <div>
            <label className="text-[13px] font-bold text-[#18181B] mb-2.5 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button type="button" key={tag}
                  onClick={() => setTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${tags.includes(tag)
                    ? 'bg-navy text-white border-navy'
                    : 'bg-transparent text-[#71717A] border-[#EAE7E2] hover:border-navy hover:text-navy'
                    }`}>{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[#EAE7E2]">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-bold rounded-[10px] border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 disabled:opacity-50">
            {loading
              ? (isEdit ? 'Mise à jour…' : 'Publication…')
              : (isEdit ? 'Enregistrer les modifications ✅' : 'Publier l\'événement 🚀')}
          </button>
        </div>
      </form>
    </div>
  )
}