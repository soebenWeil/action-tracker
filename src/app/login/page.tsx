'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAuth } from '@/components/providers/AuthProvider'

export default function LoginPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const nextPath = searchParams.get('next') ?? '/'

  if (session) {
    router.replace(nextPath)
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.replace(nextPath)
  }

  const handleMagicLink = async () => {
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (magicError) {
      setError(magicError.message)
      setIsLoading(false)
      return
    }

    setMessage('Check your inbox for a magic link to sign in.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100 px-4">
      <div className="w-full max-w-md bg-neutral-900/70 border border-neutral-800 rounded-2xl p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in to continue tracking your actions.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              placeholder="••••••••"
            />
          </div>

          {(error || message) && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                error
                  ? 'border border-red-500/40 bg-red-500/10 text-red-300'
                  : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              }`}
            >
              {error ?? message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500/90 py-3 text-center text-sm font-semibold text-emerald-50 shadow hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleMagicLink}
          disabled={isLoading || !email}
          className="mt-3 w-full rounded-lg border border-emerald-500/40 bg-transparent py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send Magic Link
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link href="/signup" className="text-emerald-300 hover:text-emerald-200">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

