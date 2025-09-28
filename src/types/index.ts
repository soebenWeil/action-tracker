export interface Goal {
  id: string
  userId: string
  title: string
  description?: string | null
  targetSteps: number
  completedSteps: number
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Action {
  id: string
  goalId: string
  userId: string
  description: string
  completedAt: string
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  plan: string
  status: string
  providerId?: string | null
  renewsAt?: string | null
  createdAt: string
  updatedAt: string
}
