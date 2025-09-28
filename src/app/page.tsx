'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Plus } from 'lucide-react'
import { Goal } from '@/types'
import GoalCard from '@/components/GoalCard'
import ContributionGrid from '@/components/ContributionGrid'
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

export default function Home() {
  const supabase = useSupabase()
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGoals = useCallback(async () => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    setGoals((data ?? []).map(mapGoal))
    setIsLoading(false)
  }, [session, supabase])

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login')
    }
  }, [authLoading, session, router])

  useEffect(() => {
    if (!session) return
    loadGoals()

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${session.user.id}` },
        () => {
          loadGoals()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actions', filter: `user_id=eq.${session.user.id}` },
        () => {
          loadGoals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, supabase, loadGoals])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }, [supabase, router])

  const { currentGoal } = useMemo(() => {
    if (goals.length === 0) {
      return { currentGoal: null }
    }

    const incomplete = goals.filter((goal) => goal.completedSteps < goal.targetSteps)
    if (incomplete.length === 0) {
      return { currentGoal: goals[0] }
    }

    const sorted = [...incomplete].sort((a, b) => {
      const progressA = a.completedSteps / a.targetSteps
      const progressB = b.completedSteps / b.targetSteps
      return progressB - progressA
    })
    return { currentGoal: sorted[0] }
  }, [goals])

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-100">
        <div className="animate-pulse text-slate-400">Initializing matrix…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <div className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-white">Action Tracker</h1>
            <p className="text-sm text-slate-400">Track the moves that unlock your goals.</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading your goals…</div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-8 max-w-sm rounded-3xl border border-emerald-500/30 bg-neutral-900/70 p-6 shadow-lg">
              <ContributionGrid completed={0} total={1} size="large" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready to start?</h2>
            <p className="text-slate-400 mb-8">
              Create your first goal and begin charting progress across the matrix.
            </p>
            <Link
              href="/goals/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
            >
              <Plus size={18} />
              Create Goal
            </Link>
          </div>
        ) : (
          <>
            {currentGoal && (
              <div className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-4">{currentGoal.title}</h2>
                  <ContributionGrid
                    completed={currentGoal.completedSteps}
                    total={currentGoal.targetSteps}
                    size="large"
                  />
                  {currentGoal.completedSteps >= currentGoal.targetSteps && (
                    <p className="mt-2 text-sm font-medium text-emerald-300">Goal complete! 🎉</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Your Goals</h3>
                <Link
                  href="/goals/new"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
                >
                  <Plus size={16} />
                  New Goal
                </Link>
              </div>

              {goals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`} className="block">
                  <GoalCard goal={goal} />
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/action"
                className="block w-full rounded-xl bg-emerald-500/90 py-4 text-center text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400"
              >
                Quick Add Action
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
