'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { edgeApi } from '../../lib/api/edgeClient'
import styles from './page.module.css'

const initialUsers = [
  {
    id: 'USR-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 2:30:00 PM',
  },
  {
    id: 'USR-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 1:45:00 PM',
  },
  {
    id: 'USR-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    status: 'Inactive',
    lastActive: '3/10/2026, 8:20:00 AM',
  },
  {
    id: 'USR-004',
    name: 'David Kim',
    email: 'david.kim@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 2:15:00 PM',
  },
  {
    id: 'USR-005',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 12:30:00 PM',
  },
  {
    id: 'USR-006',
    name: 'Robert Martinez',
    email: 'robert.martinez@example.com',
    status: 'Inactive',
    lastActive: '2/28/2026, 10:00:00 AM',
  },
  {
    id: 'USR-007',
    name: 'Amanda Wilson',
    email: 'amanda.wilson@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 2:00:00 PM',
  },
  {
    id: 'USR-008',
    name: 'James Anderson',
    email: 'james.anderson@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 11:20:00 AM',
  },
  {
    id: 'USR-009',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@example.com',
    status: 'Inactive',
    lastActive: '3/5/2026, 9:15:00 AM',
  },
  {
    id: 'USR-010',
    name: 'Noah Reyes',
    email: 'noah.reyes@example.com',
    status: 'Active',
    lastActive: '3/17/2026, 10:10:00 AM',
  },
]

const initialRecentActivity = [
  {
    id: 1,
    name: 'Sarah Johnson',
    action: 'Logged in',
    time: '3/17/2026, 2:30:00 PM',
    tone: 'success',
  },
  {
    id: 2,
    name: 'David Kim',
    action: 'Profile updated',
    time: '3/17/2026, 2:15:00 PM',
    tone: 'success',
  },
  {
    id: 3,
    name: 'Amanda Wilson',
    action: 'Logged in',
    time: '3/17/2026, 2:00:00 PM',
    tone: 'success',
  },
  {
    id: 4,
    name: 'Michael Chen',
    action: 'Password changed',
    time: '3/17/2026, 1:45:00 PM',
    tone: 'success',
  },
  {
    id: 5,
    name: 'Robert Martinez',
    action: 'Failed login attempt',
    time: '3/17/2026, 1:30:00 PM',
    tone: 'danger',
  },
]

const trend = [8, 10, 7, 9, 12, 6, 7]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  const [users, setUsers] = useState(initialUsers)
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loadingRemoteData, setLoadingRemoteData] = useState(false)
  const [dataError, setDataError] = useState('')

  const counts = useMemo(() => {
    if (dashboardStats) {
      return {
        total: dashboardStats.totalUsers,
        active: dashboardStats.activeUsers,
        inactive: dashboardStats.inactiveUsers,
      }
    }

    const total = users.length
    const active = users.filter((user) => user.status === 'Active').length
    return { total, active, inactive: total - active }
  }, [users, dashboardStats])

  const chartPath = useMemo(() => {
    const max = Math.max(...trend)
    const min = Math.min(...trend)
    const width = 560
    const height = 240
    const xStep = width / (trend.length - 1)

    return trend
      .map((value, index) => {
        const x = index * xStep
        const y =
          height -
          ((value - min) / Math.max(1, max - min)) * (height - 48) -
          24
        return `${index === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }, [])

  useEffect(() => {
    let isCancelled = false

    const loadRemoteAdminData = async (token) => {
      setLoadingRemoteData(true)
      setDataError('')

      try {
        const [stats, usersResponse, logsResponse] = await Promise.all([
          edgeApi.adminDashboard(token),
          edgeApi.adminUsers(token, { page: 1, limit: 200 }),
          edgeApi.adminActivityLogs(token, { page: 1, limit: 50 }),
        ])

        if (isCancelled) {
          return
        }

        setDashboardStats(stats)

        const mappedUsers = (usersResponse?.users || []).map((user, index) => ({
          id: user.user_id || user.id || `USR-${index + 1}`,
          name: user.full_name || 'Unknown User',
          email: user.user_id || 'N/A',
          status: user.is_active ? 'Active' : 'Inactive',
          lastActive: user.created_at
            ? new Date(user.created_at).toLocaleString()
            : 'N/A',
        }))

        if (mappedUsers.length > 0) {
          setUsers(mappedUsers)
        }

        const mappedLogs = (logsResponse?.logs || []).map((log, index) => ({
          id: log.id || index + 1,
          name: log.actor_id || 'System',
          action: log.action || 'Activity',
          time: log.created_at
            ? new Date(log.created_at).toLocaleString()
            : new Date().toLocaleString(),
          tone: log.resource_type === 'Security' ? 'danger' : 'success',
        }))

        if (mappedLogs.length > 0) {
          setRecentActivity(mappedLogs.slice(0, 8))
        }
      } catch (error) {
        if (!isCancelled) {
          setDataError(error?.message || 'Failed to load live admin data from Edge API.')
        }
      } finally {
        if (!isCancelled) {
          setLoadingRemoteData(false)
        }
      }
    }

    const loadDashboardData = async () => {
      if (!supabaseClient) {
        setDataError('Supabase client is not configured. Showing fallback dashboard data.')
        return
      }

      const { data, error } = await supabaseClient.auth.getSession()
      if (error) {
        setDataError(error.message)
        return
      }

      const token = data?.session?.access_token
      if (!token) {
        setDataError('No active admin session found. Showing fallback dashboard data.')
        return
      }

      await loadRemoteAdminData(token)
    }

    void loadDashboardData()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <main className={styles.pageView}>
      <section>
        <h1>Dashboard Overview</h1>
        <p className={styles.subtitle}>Monitor your Aegis-Dry system at a glance</p>

        {loadingRemoteData ? <p className={styles.subtitle}>Loading live data from Edge API...</p> : null}
        {dataError ? <p className={styles.errorText}>{dataError}</p> : null}

        <div className={styles.metricGrid}>
          <article className={`${styles.card} ${styles.metricCard}`}>
            <p>Total Users</p>
            <h3>{counts.total}</h3>
            <small>Registered accounts</small>
          </article>
          <article className={`${styles.card} ${styles.metricCard}`}>
            <p>Active Users</p>
            <h3>{counts.active}</h3>
            <small>Currently active</small>
          </article>
          <article className={`${styles.card} ${styles.metricCard}`}>
            <p>Inactive Users</p>
            <h3>{counts.inactive}</h3>
            <small>Disabled accounts</small>
          </article>
        </div>

        <div className={styles.dashboardGrid}>
          <article className={`${styles.card} ${styles.chartCard}`}>
            <p className={styles.cardTitle}>User Activity Trend</p>
            <svg viewBox="0 0 560 260" role="img" aria-label="User activity chart">
              <g className={styles.gridLines}>
                {[0, 1, 2, 3, 4].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2="560"
                    y1={24 + line * 48}
                    y2={24 + line * 48}
                  />
                ))}
              </g>
              <path d={chartPath} className={styles.linePath} />
            </svg>
            <div className={styles.dayRow}>
              {days.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </article>

          <article className={`${styles.card} ${styles.activityCard}`}>
            <p className={styles.cardTitle}>Recent Activity</p>
            <ul>
              {recentActivity.slice(0, 5).map((activity) => (
                <li key={activity.id}>
                  <span
                    className={`${styles.dot} ${
                      activity.tone === 'danger' ? styles.dotDanger : styles.dotSuccess
                    }`}
                  />
                  <div>
                    <strong>{activity.name}</strong>
                    <p>{activity.action}</p>
                    <small>{activity.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  )
}