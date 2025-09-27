'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Goal } from '@/types'
import { storage } from '@/lib/storage'
import GoalCard from '@/components/GoalCard'
import ContributionGrid from '@/components/ContributionGrid'

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const data = storage.getData()
    setGoals(data.goals)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  // Find the most recently active goal (incomplete goal with highest progress)
  const incompleteGoals = goals.filter(goal => goal.completedSteps < goal.targetSteps)
  const currentGoal = incompleteGoals.length > 0 
    ? incompleteGoals.reduce((prev, curr) => 
        (curr.completedSteps / curr.targetSteps) > (prev.completedSteps / prev.targetSteps) ? curr : prev
      )
    : goals.length > 0 ? goals[0] : null

  const currentProgress = currentGoal ? (currentGoal.completedSteps / currentGoal.targetSteps) * 100 : 0
  const completedGoals = goals.filter(goal => goal.completedSteps >= goal.targetSteps).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Action Tracker</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <ContributionGrid completed={0} total={1} size="large" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start?</h2>
            <p className="text-gray-600 mb-8">Create your first goal and start tracking your actions.</p>
            <Link
              href="/goals/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Goal
            </Link>
          </div>
        ) : (
          <>
            {/* Current Goal Progress */}
            {currentGoal && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentGoal.title}</h2>
                  <ContributionGrid 
                    completed={currentGoal.completedSteps} 
                    total={currentGoal.targetSteps} 
                    size="large" 
                  />
                  {currentGoal.completedSteps >= currentGoal.targetSteps && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      Goal Complete! 🎉
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
                <Link
                  href="/goals/new"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </Link>
              </div>
              
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => window.location.href = `/goals/${goal.id}`}
                />
              ))}
            </div>

            {/* Quick Add Action */}
            {goals.length > 0 && (
              <div className="mt-8">
                <Link
                  href="/action"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-medium text-center block transition-colors"
                >
                  Quick Add Action
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
