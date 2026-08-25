'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { Input, Textarea } from '@/components/ui/Input'
import { questionsApi, eventsApi, authApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Question, Event, User } from '@/lib/types'

const TABS = ['Mes Questions','Mes Événements','Paramètres','⚠️ Zone Danger']

export default function ProfilePage() {
  const { user } = useAuth()
  const router   = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  if (!user) return null

  return <ProfileContent key={user.id} user={user} />
}

function ProfileContent({ user }: { user: User }) {
  const router               = useRouter()
  const { logout, updateUser } = useAuth()
  const [activeTab,    setActiveTab]    = useState(0)
  const [myQuestions,  setMyQuestions]  = useState<Question[]>([])
  const [myEvents,     setMyEvents]     = useState<Event[]>([])
  const [confirmText,  setConfirmText]  = useState('')
  const [saving,       setSaving]       = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [form, setForm] = useState({
    first_name:  user.first_name,
    last_name:   user.last_name,
    origin_city: user.origin_city ?? '',
    bio:         user.bio ?? '',
  })

  useEffect(() => {
    questionsApi.list({ limit: 100 })
      .then(qs => setMyQuestions(qs.filter(q => q.author_id === user.id)))
      .catch(console.error)
    eventsApi.myEvents()
      .then(setMyEvents)
      .catch(console.error)
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const updated = await authApi.updateMe({
        first_name:  form.first_name,
        last_name:   form.last_name,
        origin_city: form.origin_city || undefined,
        bio:         form.bio || undefined,
      })
      updateUser({ ...updated, email: user.email })
      alert('Profil mis à jour!')
    } catch(err) { if(err instanceof ApiError) alert(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (confirmText !== 'SUPPRIMER') return
    if (!confirm('Cette action est irréversible. Confirmer?')) return
    setDeleting(true)
    try { await authApi.deleteMe(); logout(); router.push('/') }
    catch(err) { if(err instanceof ApiError) alert(err.message) }
    finally { setDeleting(false) }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Supprimer cette question?')) return
    try { await questionsApi.delete(id); setMyQuestions(qs => qs.filter(q => q.id !== id)) }
    catch(err) { if(err instanceof ApiError) alert(err.message) }
  }

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div>
      <Navbar/>
      <div className="max-w-[920px] mx-auto px-6 py-10">

        {/* Profile card */}
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7 mb-6 flex gap-6 items-start">
          <Avatar firstName={user.first_name} lastName={user.last_name} id={user.id} size={80}/>
          <div className="flex-1">
            <h1 className="font-display text-[26px] font-bold mb-1">{user.first_name} {user.last_name}</h1>
            <p className="text-sm text-[#71717A] mb-2.5">
              📧 {user.email ?? '—'}{joined && ` · Membre depuis ${joined}`}
            </p>
            {user.origin_city && (
              <p className="text-sm text-[#71717A] mb-2">
                🌴 Originaire de {user.origin_city}, Maurice &nbsp;·&nbsp; 📍 Toulouse, France
              </p>
            )}
            {user.bio && <p className="text-sm text-[#71717A] mb-4 italic">{user.bio}</p>}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="font-extrabold text-[22px] text-navy">{myQuestions.length}</div>
                <div className="text-xs text-[#71717A]">Questions</div>
              </div>
              <div className="text-center">
                <div className="font-extrabold text-[22px] text-navy">{myEvents.length}</div>
                <div className="text-xs text-[#71717A]">Événements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EAE7E2] mb-6">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === i ? 'text-navy border-coral' : 'text-[#71717A] border-transparent hover:text-navy'
              } ${i === 3 ? 'text-red-500 hover:text-red-600' : ''}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Questions tab */}
        {activeTab === 0 && (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card">
            {myQuestions.length === 0
              ? <div className="py-14 text-center text-[#A1A1AA]">Vous n'avez pas encore posé de question.</div>
              : myQuestions.map((q, i) => (
                <div key={q.id} className={`p-6 flex justify-between items-start gap-4 ${i < myQuestions.length - 1 ? 'border-b border-[#EAE7E2]' : ''}`}>
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 cursor-pointer hover:text-navy"
                      onClick={() => router.push(`/forum/${q.id}`)}>{q.title}</h3>
                    <div className="flex gap-1.5 mb-2">{(q.tags ?? []).map(t => <Badge key={t} color="navy">{t}</Badge>)}</div>
                    <p className="text-[13px] text-[#71717A]">{q.answers_count ?? 0} réponses · {q.views} vues</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3.5 py-1.5 text-[13px] font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50"
                      onClick={() => router.push(`/forum/${q.id}`)}>✏️ Voir</button>
                    <button className="px-3.5 py-1.5 text-[13px] font-bold rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteQuestion(q.id)}>🗑️</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Events tab */}
        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {myEvents.length === 0
              ? <div className="col-span-2 py-14 text-center text-[#A1A1AA]">Aucun événement rejoint pour le moment.</div>
              : myEvents.map(e => (
                <div key={e.id}
                  className="bg-white rounded-card border border-[#EAE7E2] shadow-card overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/events/${e.id}`)}>
                  <div className="h-[110px]" style={{ background: e.gradient ?? 'linear-gradient(135deg,#667eea,#764ba2)' }}/>
                  <div className="p-4">
                    <h4 className="font-display font-bold text-base mb-1.5">{e.title}</h4>
                    <p className="text-[13px] text-[#71717A] mb-3">
                      📅 {new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </p>
                    <Badge color="teal">✅ Participant</Badge>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 2 && (
          <form onSubmit={handleSave} className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7">
            <h3 className="font-display text-xl font-bold mb-6">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <Input label="Prénom" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}/>
              <Input label="Nom"    value={form.last_name}  onChange={e => setForm(f => ({ ...f, last_name:  e.target.value }))}/>
            </div>
            <div className="flex flex-col gap-5">
              <Input label="Ville d'origine" placeholder="Port-Louis, Curepipe…"
                value={form.origin_city} onChange={e => setForm(f => ({ ...f, origin_city: e.target.value }))}/>
              <Textarea label="Biographie" placeholder="Parlez-vous en quelques mots…"
                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="min-h-[90px]"/>
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 disabled:opacity-50">
                {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        )}

        {/* Danger Zone tab */}
        {activeTab === 3 && (
          <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7">
            <div className="border-2 border-red-400 rounded-[14px] p-6">
              <h3 className="text-red-500 font-display text-xl font-bold mb-3">⚠️ Zone Danger</h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-5">
                La suppression de votre compte est <strong>permanente et irréversible</strong>.
                Toutes vos données, questions, réponses et inscriptions seront définitivement supprimées.
              </p>
              <div className="bg-red-50 border-l-[3px] border-red-400 rounded-[10px] p-4 mb-5 text-sm text-red-700 leading-relaxed">
                ⚠️ Cette action <strong>ne peut pas être annulée</strong>.
              </div>
              <p className="text-sm font-bold text-[#18181B] mb-2">
                Pour confirmer, saisissez{' '}
                <span className="text-red-500 font-mono tracking-widest bg-red-50 px-2 py-0.5 rounded">SUPPRIMER</span>
              </p>
              <Input
                type="text"
                placeholder="SUPPRIMER"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="mb-5"
              />
              <button
                disabled={confirmText !== 'SUPPRIMER' || deleting}
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Suppression…' : 'Supprimer définitivement mon compte'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}