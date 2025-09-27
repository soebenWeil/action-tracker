'use client'

import { Goal } from '@/types'
import ContributionGrid from './ContributionGrid'

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  const progress = goal.targetSteps > 0 ? (goal.completedSteps / goal.targetSteps) * 100 : 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
        <ContributionGrid 
          completed={goal.completedSteps} 
          total={goal.targetSteps} 
          size="small" 
        />
        <div className="text-center">
          {goal.completedSteps >= goal.targetSteps && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Complete!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}