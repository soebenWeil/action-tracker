'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Goal, Action } from '@/types'
import { storage } from '@/lib/storage'
import ContributionGrid from '@/components/ContributionGrid'

interface GoalDetailProps {
  params: Promise<{ id: string }>
}


export default function GoalDetail({ params }: GoalDetailProps) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [actions, setActions] = useState<Action[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initializeGoal = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setMounted(true)
      
      const data = storage.getData()
      const foundGoal = data.goals.find(g => g.id === id)
      
      if (foundGoal) {
        setGoal(foundGoal)
        const goalActions = storage.getGoalActions(id).sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        setActions(goalActions)
      }
    }
    
    initializeGoal()
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Goal Not Found</h1>
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-8">This goal doesn&apos;t exist or has been deleted.</p>
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const progress = goal.targetSteps > 0 ? (goal.completedSteps / goal.targetSteps) * 100 : 0
  const isComplete = goal.completedSteps >= goal.targetSteps

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 truncate">{goal.title}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Goal Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{goal.title}</h2>
            {goal.description && (
              <p className="text-gray-600 mt-2 mb-4">{goal.description}</p>
            )}
            <ContributionGrid 
              completed={goal.completedSteps} 
              total={goal.targetSteps} 
              size="large" 
            />
            {isComplete && (
              <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium mt-4">
                Complete!
              </span>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            {!isComplete && (
              <Link
                href="/action"
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </Link>
            )}
          </div>

          {actions.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600 mb-4">No actions recorded yet.</p>
              {!isComplete && (
                <Link
                  href="/action"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add First Action
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <p className="text-gray-900 mb-2">{action.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(action.completedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Action Button (Bottom) */}
        {!isComplete && actions.length > 0 && (
          <div className="mt-8">
            <Link
              href="/action"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-medium text-center block transition-colors"
            >
              Add Another Action
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}