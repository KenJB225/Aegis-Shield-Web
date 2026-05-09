'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import '@styles/App.css'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
const missingSupabaseEnvVars = [
  !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
  !supabaseAnonKey
    ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    : null,
].filter(Boolean)
const supabaseEnvErrorMessage =
  missingSupabaseEnvVars.length > 0
    ? `Supabase client is not configured. Missing ${missingSupabaseEnvVars.join(', ')}. If you updated .env.local, restart the dev server.`
    : ''
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      })
    : null

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')

    if (!supabaseClient) {
      setLoginError(supabaseEnvErrorMessage)
      return
    }

    setIsSubmitting(true)

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    })

    if (!error && data?.session?.access_token) {
      router.push('/dashboard')
      return
    }

    setLoginError('Invalid credentials. Use a valid Supabase admin account.')
    setIsSubmitting(false)
  }

  return (
    <div className="login-shell">
      <div className="login-panel">
        <p className="eyebrow">Aegis-Dry</p>
        <h1>Super Admin Login</h1>
        <p className="subtext">
          Access the admin dashboard and manage users, activity logs, and system settings.
        </p>
        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="identifier">Username or Email</label>
          <input
            id="identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="admin@yourdomain.com"
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          {loginError ? <p className="error-text">{loginError}</p> : null}

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
