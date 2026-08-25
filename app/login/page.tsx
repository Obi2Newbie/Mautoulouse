'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de connexion')
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
          <div className="text-[13px] text-white/50 mt-1">Connectez-vous à votre espace</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-9 shadow-xl">
          <h2 className="font-display text-[26px] font-bold mb-7">Connexion</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-[10px] px-4 py-3 text-sm mb-5">{error}</div>
          )}
          <div className="flex flex-col gap-5">
            <Input label="Adresse email" type="email" placeholder="votre@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required/>
            <div>
              <Input label="Mot de passe" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required/>
              <div className="text-right mt-2">
                <Link href="/forgot-password"
                  className="text-[13px] text-coral font-semibold no-underline hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3.5 rounded-xl bg-coral text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
          <p className="text-center mt-6 text-sm text-[#71717A]">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-coral font-bold no-underline hover:underline">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  )
}