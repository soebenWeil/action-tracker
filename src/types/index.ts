export interface Goal {
  id: string
  title: string
  description?: string
  targetSteps: number
  completedSteps: number
  createdAt: string
  updatedAt: string
}

export interface Action {
  id: string
  goalId: string
  description: string
  completedAt: string
  createdAt: string
}

export interface AppData {
  goals: Goal[]
  actions: Action[]
}