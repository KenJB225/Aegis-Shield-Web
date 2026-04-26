'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import App from '../../App'
import '../../App.css'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      })
    : null

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      if (!supabaseClient) {
        router.replace('/login')
        return
      }

      const { data } = await supabaseClient.auth.getSession()

      if (!isMounted) {
        return
      }

      if (!data?.session?.access_token) {
        router.replace('/login')
        return
      }

      setIsAuthorized(true)
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  if (!isAuthorized) {
    return (
      <div className="login-shell">
        <div className="login-panel">
          <h1>Checking session...</h1>
          <p className="subtext">Redirecting to login if no valid session is found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root">
      <App />
    </div>
  )
}
