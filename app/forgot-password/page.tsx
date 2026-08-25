'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'linear-gradient(135deg,#0E2640 0%,#1B3D5F 100%)' }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Mautoulouse" className="rounded-[10px] object-cover flex-shrink-0 w-[54px] h-[54px] rounded-[14px] bg-gradient-to-br  mx-auto mb-3 flex items-center justify-center" />
          <div className="font-display text-2xl font-bold text-white">Mautoulouse</div>
        </div>

        <div className="bg-white rounded-[20px] p-9 shadow-xl">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="font-display text-2xl font-bold mb-3">Email envoyé!</h2>
              <p className="text-sm text-[#71717A] leading-relaxed mb-6">
                Si <strong>{email}</strong> est associé à un compte, vous recevrez un lien pour réinitialiser votre mot de passe dans quelques minutes.
              </p>
              <p className="text-xs text-[#A1A1AA] mb-6">Vérifiez aussi vos spams.</p>
              <Link href="/login" className="inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 no-underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-[26px] font-bold mb-2">Mot de passe oublié ?</h2>
              <p className="text-sm text-[#71717A] mb-7 leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl bg-coral text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
                </button>
              </form>
              <p className="text-center mt-6 text-sm text-[#71717A]">
                <Link href="/login" className="text-coral font-bold no-underline hover:underline">← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}