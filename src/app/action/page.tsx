'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Goal } from '@/types'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAuth } from '@/components/providers/AuthProvider'

interface GoalRow {
  id: string
  user_id: string
  title: string
  description: string | null
  target_steps: number
  completed_steps: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

const mapGoal = (row: GoalRow): Goal => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  targetSteps: row.target_steps,
  completedSteps: row.completed_steps,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export default function AddAction() {
  const supabase = useSupabase()
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    if (!session) return
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('id, user_id, title, description, target_steps, completed_steps, completed_at, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    const filteredGoals = (data ?? []).filter((goal) => goal.completed_steps < goal.target_steps)
    setGoals(filteredGoals.map(mapGoal))
    setIsLoading(false)
    if (filteredGoals.length === 1) {
      setSelectedGoalId(filteredGoals[0].id)
    }
  }, [session, supabase])

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login?next=/action')
    }
  }, [authLoading, session, router])

  useEffect(() => {
    if (!session) return
    fetchGoals()
  }, [session, fetchGoals])

  const hasActiveGoals = goals.length > 0

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!session || !selectedGoalId || !description.trim()) return

    setIsSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('actions').insert({
      goal_id: selectedGoalId,
      user_id: session.user.id,
      description: description.trim(),
    })

    if (insertError) {
      setError(insertError.message)
      setIsSubmitting(false)
      return
    }

    setDescription('')
    router.push('/')
  }

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100">
        <div className="animate-pulse text-slate-400">Loading interface…</div>
      </div>
    )
  }

  if (!isLoading && !hasActiveGoals) {
    return (
      <div className="min-h-screen bg-neutral-950 text-slate-100">
        <div className="border-b border-neutral-800 bg-neutral-900/70">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
            <Link href="/" className="rounded-lg border border-neutral-700 p-2 text-slate-300 hover:border-slate-500">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-white">Add Action</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Active Goals</h2>
          <p className="text-slate-400 mb-8">Create a goal first before logging actions.</p>
          <Link
            href="/goals/new"
            className="inline-flex items-center rounded-xl bg-emerald-500/90 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
          >
            Launch Goal Builder
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <div className="border-b border-neutral-800 bg-neutral-900/70">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <Link href="/" className="rounded-lg border border-neutral-700 p-2 text-slate-300 hover:border-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-white">Add Action</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-300">
                Choose Goal
              </label>
              <select
                id="goal"
                value={selectedGoalId}
                onChange={(event) => setSelectedGoalId(event.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                required
              >
                <option value="" className="bg-neutral-900 text-slate-500">
                  Select a goal…
                </option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id} className="bg-neutral-900">
                    {goal.title} ({goal.completedSteps}/{goal.targetSteps})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-300">
                Action Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                rows={3}
                placeholder="What action did you take toward this goal?"
                required
                maxLength={200}
              />
              <p className="mt-1 text-sm text-slate-400">Describe the precise move you completed.</p>
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
                disabled={!selectedGoalId || !description.trim() || isSubmitting}
                className="flex-1 rounded-lg bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Logging…' : 'Add Action'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
