import { Goal, Action, AppData } from '@/types'

const STORAGE_KEY = 'action-tracker-data'

export const storage = {
  getData: (): AppData => {
    if (typeof window === 'undefined') return { goals: [], actions: [] }
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : { goals: [], actions: [] }
    } catch {
      return { goals: [], actions: [] }
    }
  },

  saveData: (data: AppData): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  },

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal => {
    const data = storage.getData()
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    data.goals.push(newGoal)
    storage.saveData(data)
    return newGoal
  },

  updateGoal: (id: string, updates: Partial<Goal>): void => {
    const data = storage.getData()
    const goalIndex = data.goals.findIndex(g => g.id === id)
    
    if (goalIndex !== -1) {
      data.goals[goalIndex] = {
        ...data.goals[goalIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      storage.saveData(data)
    }
  },

  addAction: (action: Omit<Action, 'id' | 'createdAt'>): Action => {
    const data = storage.getData()
    const newAction: Action = {
      ...action,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    data.actions.push(newAction)
    
    // Update goal's completed steps
    const goal = data.goals.find(g => g.id === action.goalId)
    if (goal) {
      goal.completedSteps = Math.min(goal.completedSteps + 1, goal.targetSteps)
      goal.updatedAt = new Date().toISOString()
    }
    
    storage.saveData(data)
    return newAction
  },

  getGoalActions: (goalId: string): Action[] => {
    const data = storage.getData()
    return data.actions.filter(action => action.goalId === goalId)
  }
}