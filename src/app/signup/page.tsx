'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAuth } from '@/components/providers/AuthProvider'

export default function SignupPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (session) {
    router.replace('/')
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    setMessage('Check your inbox to confirm your email and finish sign up.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100 px-4">
      <div className="w-full max-w-md bg-neutral-900/70 border border-neutral-800 rounded-2xl p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold text-white mb-2">Create Account</h1>
        <p className="text-sm text-slate-400 mb-6">
          Join the action matrix and start tracking your goals.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium text-slate-300">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              placeholder="Neo"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
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
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              placeholder="••••••••"
              minLength={8}
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
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

