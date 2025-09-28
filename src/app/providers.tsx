'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>{children}</AuthProvider>
    </SupabaseProvider>
  )
}
