'use client'

import { Goal } from '@/types'
import ContributionGrid from './ContributionGrid'

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-lg transition hover:border-emerald-500/40 hover:shadow-emerald-500/10"
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-slate-300 mb-3 line-clamp-2">
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
            <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-full font-medium">
              Complete!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
