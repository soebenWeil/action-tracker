'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Goal, Action } from '@/types'
import ContributionGrid from '@/components/ContributionGrid'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAuth } from '@/components/providers/AuthProvider'

interface GoalDetailProps {
  params: { id: string }
}

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

interface ActionRow {
  id: string
  goal_id: string
  user_id: string
  description: string
  completed_at: string
  created_at: string
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

const mapAction = (row: ActionRow): Action => ({
  id: row.id,
  goalId: row.goal_id,
  userId: row.user_id,
  description: row.description,
  completedAt: row.completed_at,
  createdAt: row.created_at,
})

export default function GoalDetail({ params }: GoalDetailProps) {
  const { id } = params
  const supabase = useSupabase()
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [actions, setActions] = useState<Action[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoal = useCallback(async () => {
    if (!session) return
    setIsLoading(true)
    setError(null)

    const [{ data: goalData, error: goalError }, { data: actionData, error: actionError }] = await Promise.all([
      supabase
        .from('goals')
        .select('id, user_id, title, description, target_steps, completed_steps, completed_at, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('actions')
        .select('id, goal_id, user_id, description, completed_at, created_at')
        .eq('goal_id', id)
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false }),
    ])

    if (goalError) {
      setError(goalError.message)
      setGoal(null)
      setActions([])
      setIsLoading(false)
      return
    }

    if (!goalData) {
      setGoal(null)
      setActions([])
      setIsLoading(false)
      return
    }

    setGoal(mapGoal(goalData as GoalRow))

    if (actionError) {
      setError(actionError.message)
      setActions([])
    } else {
      setActions((actionData ?? []).map((row) => mapAction(row as ActionRow)))
    }

    setIsLoading(false)
  }, [id, session, supabase])

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace(`/login?next=/goals/${id}`)
    }
  }, [authLoading, session, router, id])

  useEffect(() => {
    if (!session) return
    fetchGoal()

    const channel = supabase
      .channel(`goal-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `id=eq.${id}` },
        fetchGoal
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actions', filter: `goal_id=eq.${id}` },
        fetchGoal
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, supabase, id, fetchGoal])

  const isComplete = useMemo(() => {
    if (!goal) return false
    return goal.completedSteps >= goal.targetSteps
  }, [goal])

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100">
        <div className="animate-pulse text-slate-400">Retrieving goal feed…</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100">
        <div className="animate-pulse text-slate-400">Decoding goal data…</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-neutral-950 text-slate-100">
        <div className="border-b border-neutral-800 bg-neutral-900/70">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
            <Link href="/" className="rounded-lg border border-neutral-700 p-2 text-slate-300 hover:border-slate-500">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-white">Goal Not Found</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-slate-400 mb-8">This goal doesn&apos;t exist or has been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-500/90 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
          >
            Back to Dashboard
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
          <h1 className="text-xl font-semibold text-white truncate">{goal.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white mb-4">{goal.title}</h2>
            {goal.description && (
              <p className="text-slate-300 mt-2 mb-4">{goal.description}</p>
            )}
            <ContributionGrid completed={goal.completedSteps} total={goal.targetSteps} size="large" />
            {isComplete && (
              <span className="mt-4 inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
                Complete!
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Actions</h3>
            {!isComplete && (
              <Link
                href="/action"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
              >
                <Plus size={16} />
                Add Action
              </Link>
            )}
          </div>

          {actions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 text-center">
              <p className="text-slate-300 mb-4">No actions recorded yet.</p>
              {!isComplete && (
                <Link
                  href="/action"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
                >
                  <Plus size={16} />
                  Add First Action
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow"
                >
                  <p className="text-slate-100 mb-2">{action.description}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(action.completedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isComplete && actions.length > 0 && (
          <div className="mt-8">
            <Link
              href="/action"
              className="block w-full rounded-xl bg-emerald-500/90 py-4 text-center text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
            >
              Add Another Action
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
