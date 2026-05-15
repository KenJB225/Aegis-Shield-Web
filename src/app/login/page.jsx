'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import '../../App.css'

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

const AUTH_COOKIE_NAME = 'aegis_admin_token'

const setAuthCookie = (token, expiresAtSeconds) => {
  if (!token) {
    return
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const maxAge = Math.max(0, (expiresAtSeconds || nowSeconds + 3600) - nowSeconds)
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = secure ? '; secure' : ''

  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; samesite=lax; max-age=${maxAge}${secureFlag}`
}

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ identifier: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value)
    if (loginError) {
      setLoginError('')
    }
    if (fieldErrors.identifier) {
      setFieldErrors((prev) => ({ ...prev, identifier: '' }))
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    if (loginError) {
      setLoginError('')
    }
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')

    if (!supabaseClient) {
      setLoginError(supabaseEnvErrorMessage)
      return
    }

    const trimmedIdentifier = identifier.trim()
    const nextErrors = {
      identifier: trimmedIdentifier ? '' : 'Enter your admin email address.',
      password: password ? '' : 'Enter your password.',
    }

    if (nextErrors.identifier || nextErrors.password) {
      setFieldErrors(nextErrors)
      return
    }

    if (fieldErrors.identifier || fieldErrors.password) {
      setFieldErrors({ identifier: '', password: '' })
    }

    setIsSubmitting(true)

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: identifier.trim(),
      password: password,
    })

    if (!error && data?.session?.access_token) {
      setAuthCookie(data.session.access_token, data.session.expires_at)
      router.push('/dashboard')
      return
    }

    const normalizedMessage = error?.message?.toLowerCase() || ''
    if (normalizedMessage.includes('invalid') && normalizedMessage.includes('credentials')) {
      setFieldErrors({
        identifier: 'Check the email address for your admin account.',
        password: 'Check the password for your admin account.',
      })
      setLoginError('Email or password is incorrect.')
    } else {
      setLoginError(error?.message || 'Sign in failed. Please try again.')
    }
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
            onChange={handleIdentifierChange}
            placeholder="admin@yourdomain.com"
            autoComplete="username"
            aria-invalid={Boolean(fieldErrors.identifier)}
            aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
            className={fieldErrors.identifier ? 'input-error' : undefined}
          />
          {fieldErrors.identifier ? (
            <p id="identifier-error" className="field-error">
              {fieldErrors.identifier}
            </p>
          ) : null}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className={fieldErrors.password ? 'input-error' : undefined}
          />
          {fieldErrors.password ? (
            <p id="password-error" className="field-error">
              {fieldErrors.password}
            </p>
          ) : null}

          {loginError ? (
            <p className="error-text" role="alert">
              {loginError}
            </p>
          ) : null}

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
