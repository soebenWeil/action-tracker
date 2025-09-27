'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { storage } from '@/lib/storage'

export default function NewGoal() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetSteps, setTargetSteps] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !targetSteps || parseInt(targetSteps) <= 0) return

    setIsSubmitting(true)
    
    try {
      storage.addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        targetSteps: parseInt(targetSteps),
        completedSteps: 0
      })
      
      router.push('/')
    } catch (error) {
      console.error('Failed to create goal:', error)
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
          <h1 className="text-xl font-semibold text-gray-900">Create New Goal</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
              placeholder="e.g., Read 12 books this year"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-600"
              rows={3}
              placeholder="Add more details about your goal..."
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="targetSteps" className="block text-sm font-medium text-gray-700 mb-2">
              Target Steps *
            </label>
            <input
              type="number"
              id="targetSteps"
              value={targetSteps}
              onChange={(e) => setTargetSteps(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
              placeholder="e.g., 12"
              required
              min="1"
              max="1000"
            />
            <p className="text-sm text-gray-700 mt-1">
              How many actions do you need to complete this goal?
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
              disabled={!title.trim() || !targetSteps || parseInt(targetSteps) <= 0 || isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}