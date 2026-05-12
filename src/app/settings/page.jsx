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

export default function SettingsPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const supabaseConfigError =
    'Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'

  const handleLogout = async () => {
    setLogoutError('')

    if (!supabaseClient) {
      setLogoutError(supabaseConfigError)
      return
    }

    setIsLoggingOut(true)

    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      setLogoutError(error.message || 'Unable to log out. Please try again.')
      setIsLoggingOut(false)
      return
    }

    router.replace('/login')
  }

  const handlePasswordUpdate = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!supabaseClient) {
      setPasswordError(supabaseConfigError)
      return
    }

    if (!newPassword || !confirmPassword) {
      setPasswordError('Enter and confirm your new password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please try again.')
      return
    }

    setIsUpdatingPassword(true)

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message || 'Unable to update password. Please try again.')
      setIsUpdatingPassword(false)
      return
    }

    setPasswordSuccess('Password updated successfully.')
    setNewPassword('')
    setConfirmPassword('')
    setIsUpdatingPassword(false)
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
          <p className={styles.cardTitle}>Password Update</p>
          <small>Change your administrator password</small>
        </header>
        <form className={styles.formGrid} onSubmit={handlePasswordUpdate}>
          <label className={styles.inputField} htmlFor="new-password">
            <span>New Password</span>
            <input
              id="new-password"
              className={styles.textInput}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              placeholder="Enter a new password"
            />
          </label>
          <label className={styles.inputField} htmlFor="confirm-password">
            <span>Confirm Password</span>
            <input
              id="confirm-password"
              className={styles.textInput}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              placeholder="Re-enter your new password"
            />
          </label>
          <p className={styles.formHint}>Passwords must be at least 8 characters.</p>
          {passwordError ? <p className={styles.errorText}>{passwordError}</p> : null}
          {passwordSuccess ? <p className={styles.successText}>{passwordSuccess}</p> : null}
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
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
