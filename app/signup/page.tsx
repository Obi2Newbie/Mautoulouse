'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', originCity: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setError(''); setLoading(true)
    try {
      await signup({ email: form.email, password: form.password, first_name: form.firstName, last_name: form.lastName, origin_city: form.originCity || undefined })
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'linear-gradient(135deg,#0E2640 0%,#1B3D5F 100%)' }}>
      <div className="w-full max-w-[490px]">
        <div className="text-center mb-7">
          <img src="/logo.png" alt="Mautoulouse" className="rounded-[10px] object-cover flex-shrink-0 w-[54px] h-[54px] rounded-[14px] bg-gradient-to-br  mx-auto mb-3 flex items-center justify-center" />
          <div className="font-display text-2xl font-bold text-white">Rejoignez Mautoulouse</div>
          <div className="text-[13px] text-white/50 mt-1">Créez votre compte gratuitement</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-9 shadow-xl">
          <h2 className="font-display text-2xl font-bold mb-6">Créer un compte</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Prénom *" placeholder="Votre prénom" value={form.firstName} onChange={set('firstName')} required />
            <Input label="Nom *" placeholder="Votre nom" value={form.lastName} onChange={set('lastName')} required />
          </div>
          <div className="flex flex-col gap-5">
            <Input label="Adresse email *" type="email" placeholder="votre@email.com" value={form.email} onChange={set('email')} required />
            <Input label="Ville d'origine (Maurice)" placeholder="Port-Louis, Curepipe, Quatre Bornes…" value={form.originCity} onChange={set('originCity')} />
            <Input label="Mot de passe *" type="password" placeholder="Minimum 6 caractères" value={form.password} onChange={set('password')} required />
            <Input label="Confirmer le mot de passe *" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <p className="text-[13px] text-[#71717A] leading-relaxed mt-5 mb-6">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-coral font-semibold cursor-pointer hover:underline">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-coral font-semibold cursor-pointer hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-coral text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Création en cours…' : 'Créer mon compte 🎉'}
          </button>
          <p className="text-center mt-5 text-sm text-[#71717A]">
            Déjà membre ? <Link href="/login" className="text-coral font-bold no-underline hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
