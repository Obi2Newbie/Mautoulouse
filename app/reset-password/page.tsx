'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [token,     setToken]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  // Extract access_token from URL hash — Supabase puts it there
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash   = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const t      = params.get('access_token')
    const type   = params.get('type')
    if (t && type === 'recovery') {
      setToken(t)
    } else {
      setError('Lien invalide ou expiré. Demandez un nouveau lien.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6)  { setError('Le mot de passe doit contenir au moins 6 caractères'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Erreur')
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue')
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
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display text-2xl font-bold mb-3">Mot de passe mis à jour!</h2>
              <p className="text-sm text-[#71717A] mb-2">Vous allez être redirigé vers la page de connexion…</p>
              <Link href="/login" className="text-coral font-bold text-sm no-underline hover:underline">
                Cliquez ici si rien ne se passe
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-[26px] font-bold mb-2">Nouveau mot de passe</h2>
              <p className="text-sm text-[#71717A] mb-7">Choisissez un nouveau mot de passe pour votre compte.</p>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">
                  {error}
                  {!token && (
                    <div className="mt-2">
                      <Link href="/forgot-password" className="text-coral font-bold no-underline hover:underline">
                        Demander un nouveau lien →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={!token}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  disabled={!token}
                />
                <button type="submit" disabled={loading || !token || !password || !confirm}
                  className="w-full py-3.5 rounded-xl bg-coral text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}