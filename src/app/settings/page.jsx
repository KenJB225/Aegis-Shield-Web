'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import styles from './settings.module.css'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
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

const clearAuthCookie = () => {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; samesite=lax; max-age=0`
}

export default function SettingsPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    setLogoutError('')

    if (!supabaseClient) {
      setLogoutError(
        'Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      )
      return
    }

    setIsLoggingOut(true)

    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      setLogoutError(error.message || 'Unable to log out. Please try again.')
      setIsLoggingOut(false)
      return
    }

    clearAuthCookie()
    router.replace('/login')
  }

  return (
    <main className={`${styles.page} ${isDarkMode ? styles.dark : ''}`}>
      <header className={styles.header}>
        <div>
          <h1>Settings</h1>
          <p>Manage your admin preferences and system configuration</p>
        </div>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </header>

      {logoutError ? <p className={styles.errorText}>{logoutError}</p> : null}

      <article className={styles.card}>
        <header>
          <p className={styles.cardTitle}>Appearance</p>
          <small>Customize the visual appearance of the admin panel</small>
        </header>
        <div className={styles.settingRow}>
          <div>
            <strong>Dark Mode</strong>
            <p>Switch between light and dark theme</p>
          </div>
          <label className={styles.switch} htmlFor="appearance-switch">
            <input
              id="appearance-switch"
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode((prev) => !prev)}
            />
            <span />
          </label>
        </div>
        <p className={styles.themeLine}>
          Current Theme: <strong>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</strong>
        </p>
      </article>

      <article className={styles.card}>
        <header>
          <p className={styles.cardTitle}>Admin Profile</p>
          <small>Your administrator account information</small>
        </header>
        <div className={styles.profileGrid}>
          <p>Role</p>
          <strong>Super Administrator</strong>
          <p>Email</p>
          <strong>admin@aegis-dry.com</strong>
          <p>Last Login</p>
          <strong>{new Date().toLocaleString()}</strong>
          <p>Access Level</p>
          <strong>Full Access</strong>
        </div>
      </article>

      <article className={styles.card}>
        <header>
          <p className={styles.cardTitle}>System Information</p>
          <small>Aegis-Dry admin panel details</small>
        </header>
        <div className={styles.profileGrid}>
          <p>System Name</p>
          <strong>Aegis-Dry Smart Laundry</strong>
          <p>Version</p>
          <strong>v1.0.0</strong>
        </div>
      </article>
    </main>
  )
}
