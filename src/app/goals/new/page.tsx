'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAuth } from '@/components/providers/AuthProvider'

export default function NewGoal() {
  const supabase = useSupabase()
  const { session, loading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetSteps, setTargetSteps] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100">
        <div className="animate-pulse text-slate-400">Calibrating goal builder…</div>
      </div>
    )
  }

  if (!session) {
    router.replace('/login?next=/goals/new')
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsedSteps = parseInt(targetSteps, 10)
    if (!title.trim() || Number.isNaN(parsedSteps) || parsedSteps <= 0) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('goals').insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      target_steps: parsedSteps,
    })

    if (insertError) {
      setError(insertError.message)
      setIsSubmitting(false)
      return
    }

    setTitle('')
    setDescription('')
    setTargetSteps('')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <div className="border-b border-neutral-800 bg-neutral-900/70">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <Link href="/" className="rounded-lg border border-neutral-700 p-2 text-slate-300 hover:border-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-white">Create New Goal</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">
              Goal Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="e.g., Read 12 books this year"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-300">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              rows={3}
              placeholder="Add more details about your goal…"
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="targetSteps" className="mb-2 block text-sm font-medium text-slate-300">
              Target Steps
            </label>
            <input
              type="number"
              id="targetSteps"
              value={targetSteps}
              onChange={(event) => setTargetSteps(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="e.g., 12"
              required
              min="1"
              max="1000"
            />
            <p className="mt-1 text-sm text-slate-400">
              How many actions lead to completion?
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-neutral-700 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!title.trim() || !targetSteps || parseInt(targetSteps, 10) <= 0 || isSubmitting}
              className="flex-1 rounded-lg bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
