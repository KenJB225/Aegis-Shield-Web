// 1. Fix line 1 to import from the official installed package (no slash!)
import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''

export const serverClient =
  supabaseUrl && supabaseServiceKey
    ? supabaseCreateClient(supabaseUrl, supabaseServiceKey) // Updated function call
    : null

export const clientSide = (token) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are required.',
    )
  }

  const client = supabaseCreateClient(supabaseUrl, supabaseAnonKey) // Updated function call

  if (token) {
    client.auth.setSession({
      access_token: token,
      refresh_token: '',
    })
  }

  return client
}

// 2. Create a default client-side instance and export it as 'createClient' 
// so your login page finds exactly what it's looking for!
export const createClient = supabaseCreateClient(supabaseUrl, supabaseAnonKey)