'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Goal } from '@/types'
import { storage } from '@/lib/storage'

export default function AddAction() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const data = storage.getData()
    const incompleteGoals = data.goals.filter(goal => goal.completedSteps < goal.targetSteps)
    setGoals(incompleteGoals)
    
    if (incompleteGoals.length === 1) {
      setSelectedGoalId(incompleteGoals[0].id)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Add Action</h1>
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Goals</h2>
          <p className="text-gray-600 mb-8">Create a goal first before adding actions.</p>
          <Link
            href="/goals/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Goal
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || !description.trim()) return

    setIsSubmitting(true)
    
    try {
      storage.addAction({
        goalId: selectedGoalId,
        description: description.trim(),
        completedAt: new Date().toISOString()
      })
      
      router.push('/')
    } catch (error) {
      console.error('Failed to add action:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add Action</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Goal *
            </label>
            <select
              id="goal"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="" className="text-gray-600">Select a goal...</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title} ({goal.completedSteps}/{goal.targetSteps})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Action Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-600"
              rows={3}
              placeholder="What action did you take toward this goal?"
              required
              maxLength={200}
            />
            <p className="text-sm text-gray-700 mt-1">
              Describe the specific action you completed.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!selectedGoalId || !description.trim() || isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}