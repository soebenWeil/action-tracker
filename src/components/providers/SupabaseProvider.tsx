'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/createClient'

const SupabaseContext = createContext<SupabaseClient | null>(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

