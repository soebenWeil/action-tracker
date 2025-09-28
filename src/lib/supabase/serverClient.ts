import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing')
  }

  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // cookies() is read-only in some server component contexts
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Ignore when we cannot mutate cookies in this context
        }
      },
    },
  })
}
