'use client'

import { useState } from 'react'
import styles from './settings.module.css'

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <main className={`${styles.page} ${isDarkMode ? styles.dark : ''}`}>
      <header className={styles.header}>
        <div>
          <h1>Settings</h1>
          <p>Manage your admin preferences and system configuration</p>
        </div>
      </header>

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
