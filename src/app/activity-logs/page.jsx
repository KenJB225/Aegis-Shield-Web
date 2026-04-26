'use client'

import Link from 'next/link'
import styles from './activity-logs.module.css'

const initialLogs = [
  {
    id: 1,
    actor: 'Admin',
    event: 'Opened dashboard',
    timestamp: '3/20/2026, 8:10:00 AM',
    type: 'System',
  },
  {
    id: 2,
    actor: 'Sarah Johnson',
    event: 'User login',
    timestamp: '3/17/2026, 2:30:00 PM',
    type: 'User',
  },
  {
    id: 3,
    actor: 'David Kim',
    event: 'Profile updated',
    timestamp: '3/17/2026, 2:15:00 PM',
    type: 'User',
  },
  {
    id: 4,
    actor: 'Admin',
    event: 'Viewed inactive users',
    timestamp: '3/20/2026, 8:15:00 AM',
    type: 'Admin',
  },
  {
    id: 5,
    actor: 'Robert Martinez',
    event: 'Failed login attempt',
    timestamp: '3/17/2026, 1:30:00 PM',
    type: 'Security',
  },
]

export default function ActivityLogsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Activity Logs</h1>
          <p>Track system and user actions in chronological order</p>
        </div>
        <nav className={styles.links}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/settings">Settings</Link>
        </nav>
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
            {initialLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.actor}</td>
                <td>{log.event}</td>
                <td>{log.type}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </main>
  )
}
