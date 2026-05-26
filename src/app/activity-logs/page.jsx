'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/supabase-js'
import { edgeApi } from '@/api/edgeClient'
import styles from '@/styles/activity-logs.module.css'

export default function ActivityLogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [logs, setLogs] = useState([])

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

  useEffect(() => {
    let isCancelled = false

    const loadLogs = async () => {
      setIsLoading(true)
      setDataError('')

      if (!supabaseClient) {
        if (!isCancelled) {
          setDataError('Supabase client is not configured.')
          setIsLoading(false)
        }
        return
      }

      const { data, error } = await supabaseClient.auth.getSession()
      const token = data?.session?.access_token

      if (isCancelled) {
        return
      }

      if (error || !token) {
        setDataError('Sign in again to load activity logs from Supabase.')
        setIsLoading(false)
        return
      }

      try {
        const response = await edgeApi.adminActivityLogs(token, {
          page: 1,
          limit: 200,
        })

        if (!isCancelled) {
          const mappedLogs = (response?.logs || []).map((log, index) => ({
            id: log.id || index + 1,
            actor: log.actor_id || 'System',
            event: log.action || 'Activity',
            timestamp: log.created_at
              ? new Date(log.created_at).toLocaleString()
              : new Date().toLocaleString(),
            type: log.resource_type || 'System',
          }))

          setLogs(mappedLogs)
        }
      } catch (error) {
        if (!isCancelled) {
          setDataError(error?.message || 'Failed to load activity logs from Supabase.')
          setLogs([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadLogs()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Activity Logs</h1>
          <p>Track system and user actions in chronological order</p>
        </div>
      </header>

      <article className={styles.card}>
        <table>
          <thead>
            <tr>
              <th>Actor</th>
              <th>Event</th>
              <th>Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>Loading activity logs from Supabase...</td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.actor}</td>
                  <td>{log.event}</td>
                  <td>{log.type}</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No activity logs found in Supabase.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
      {dataError ? <p className={styles.error}>{dataError}</p> : null}
    </main>
  )
}
