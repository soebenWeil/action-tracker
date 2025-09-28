'use client'

interface ContributionGridProps {
  completed: number
  total: number
  size?: 'small' | 'medium' | 'large'
}

export default function ContributionGrid({ completed, total, size = 'medium' }: ContributionGridProps) {
  // Calculate grid dimensions based on total steps
  const getGridDimensions = (total: number) => {
    if (total <= 15) return { cols: Math.ceil(Math.sqrt(total)), rows: Math.ceil(total / Math.ceil(Math.sqrt(total))) }
    if (total <= 35) return { cols: 7, rows: Math.ceil(total / 7) }
    if (total <= 70) return { cols: 10, rows: Math.ceil(total / 10) }
    return { cols: 12, rows: Math.ceil(total / 12) }
  }

  const { cols, rows } = getGridDimensions(total)
  const totalCells = cols * rows
  
  // Size configurations
  const sizeConfig = {
    small: { cellSize: 'w-2 h-2', gap: 'gap-1', padding: 'p-2' },
    medium: { cellSize: 'w-3 h-3', gap: 'gap-1.5', padding: 'p-4' },
    large: { cellSize: 'w-4 h-4', gap: 'gap-2', padding: 'p-6' }
  }
  
  const config = sizeConfig[size]

  // Generate cells
  const cells = []
  for (let i = 0; i < totalCells; i++) {
    const isCompleted = i < completed
    const isTargetStep = i < total
    
    let cellClass = `${config.cellSize} rounded-sm border transition-colors duration-200 `

    if (isCompleted) {
      cellClass += 'bg-emerald-500 border-emerald-400 shadow-emerald-500/40 shadow'
    } else if (isTargetStep) {
      cellClass += 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
    } else {
      cellClass += 'bg-neutral-900 border-neutral-800 opacity-30'
    }
    
    cells.push(
      <div
        key={i}
        className={cellClass}
        title={isTargetStep ? (isCompleted ? 'Step completed' : 'Step remaining') : 'Extra space'}
      />
    )
  }

  return (
    <div className={`flex flex-col items-center ${config.padding}`}>
      <div 
        className={`grid ${config.gap}`}
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {cells}
      </div>
      {size !== 'small' && (
        <div className="mt-4 text-center">
          <div className="text-sm text-slate-300">
            {completed} of {total} steps completed
          </div>
          {completed === total && total > 0 && (
            <div className="text-xs text-emerald-300 font-medium mt-1">
              All steps complete! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  )
}
