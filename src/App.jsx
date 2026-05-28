import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/supabase/supabase-js'
import { edgeApi } from '@/api/edgeClient'
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

const trend = [8, 10, 7, 9, 12, 6, 7]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

    function App() {
      const [isDarkMode, setIsDarkMode] = useState(false);
    
      return (
        <Router>
          <div className={`app-shell ${isDarkMode ? 'theme-dark' : ''}`}>
            <aside className="sidebar">
              <div className="brand">
                <span className="shield">A</span>
                <div>
                    <strong>Sun-Dry</strong>
                  <small>Admin Panel</small>
                </div>
              </div>
    
              <nav className="menu">
                <a href="/" className="menu-item">
                  Dashboard
                </a>
                <a href="/users" className="menu-item">
                  Users
                </a>
              </nav>
    
              <button type="button" className="logout-btn">
                Logout
              </button>
            </aside>
    
            <div className="content-area">
              <header className="topbar">
                  <h2>Sun-Dry Admin Panel</h2>
                <div className="topbar-tools">
                  <div className="theme-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={() => setIsDarkMode((prev) => !prev)}
                      />
                      <span />
                    </label>
                  </div>
                </div>
              </header>
    
              <main className="page-view">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      );
    }

  const Dashboard = () => (
    <section>
      <h1>Dashboard Overview</h1>
        <p>Monitor your Sun-Dry system at a glance.</p>
    </section>
  );

  const Users = () => (
    <section>
      <h1>User Management</h1>
      <p>Manage all registered users and their accounts.</p>
    </section>
  );

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [users, setUsers] = useState(initialUsers)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity)
  const [, setActivityLogs] = useState(initialLogs)
  const [, setAuthToken] = useState('')
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loadingRemoteData, setLoadingRemoteData] = useState(false)
  const [dataError, setDataError] = useState('')

  const rowsPerPage = 8

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const statusMatch =
        statusFilter === 'All Status' ? true : user.status === statusFilter

      const query = searchQuery.trim().toLowerCase()
      const searchMatch =
        query.length === 0
          ? true
          : user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query)

      return statusMatch && searchMatch
    })
  }, [users, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))

  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredUsers.slice(start, start + rowsPerPage)
  }, [filteredUsers, currentPage])

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

  const addAuditLog = (actor, event, type = 'Admin') => {
    const timestamp = new Date().toLocaleString()

    setActivityLogs((prev) => [
      {
        id: prev.length + 1,
        actor,
        event,
        timestamp,
        type,
      },
      ...prev,
    ])

    setRecentActivity((prev) => [
      {
        id: prev.length + 1,
        name: actor,
        action: event,
        time: timestamp,
        tone: type === 'Security' ? 'danger' : 'success',
      },
      ...prev.slice(0, 7),
    ])
  }

  const loadRemoteAdminData = async (token) => {
    setLoadingRemoteData(true)
    setDataError('')
    setUsers([])
    setActivityLogs([])
    setRecentActivity([])

    try {
      const [stats, usersResponse, logsResponse] = await Promise.all([
        edgeApi.adminDashboard(token),
        edgeApi.adminUsers(token, {
          page: 1,
          limit: 200,
        }),
        edgeApi.adminActivityLogs(token, {
          page: 1,
          limit: 50,
        }),
      ])

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
        actor: log.actor_id || 'System',
        event: log.action || 'Activity',
        timestamp: log.created_at
          ? new Date(log.created_at).toLocaleString()
          : new Date().toLocaleString(),
        type: log.resource_type || 'System',
      }))

      if (mappedLogs.length > 0) {
        setActivityLogs(mappedLogs)
        setRecentActivity(
          mappedLogs.slice(0, 8).map((log) => ({
            id: log.id,
            name: log.actor,
            action: log.event,
            time: log.timestamp,
            tone: 'success',
          })),
        )
      }
    } catch (error) {
      setDataError(error?.message || 'Failed to load live admin data from Edge API.')
      setUsers([])
      setActivityLogs([])
      setRecentActivity([])
    } finally {
      setLoadingRemoteData(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const hydrateSession = async () => {
      if (!supabaseClient) {
        setDataError(supabaseEnvErrorMessage)
        return
      }

      const { data, error } = await supabaseClient.auth.getSession()
      const token = data?.session?.access_token

      if (!isMounted || error || !token) {
        return
      }

      setAuthToken(token)
      await loadRemoteAdminData(token)
    }

    hydrateSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleToggleStatus = (userId) => {
    let changedUserName = ''
    let changedStatus = ''

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user
        }

        const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
        changedUserName = user.name
        changedStatus = nextStatus

        return {
          ...user,
          status: nextStatus,
          lastActive: new Date().toLocaleString(),
        }
      }),
    )

    if (changedUserName) {
      addAuditLog(
        'Admin',
        `${changedStatus === 'Active' ? 'Enabled' : 'Disabled'} ${changedUserName}`,
      )
    }
  }

  const handleEditUser = (userName) => {
    addAuditLog('Admin', `Edited ${userName} profile`)
  }

  const handleLogout = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut().catch(() => null)
    }

    setAuthToken('')
    setSearchQuery('')
    setStatusFilter('All Status')
    setCurrentPage(1)
    setActivePage('Dashboard')
    setDashboardStats(null)
    setDataError('')
    setUsers(initialUsers)
    setActivityLogs(initialLogs)
    setRecentActivity(initialRecentActivity)
    window.location.assign('/login')
  }

  const selectPage = (page) => {
    setActivePage(page)
    setCurrentPage(1)
    addAuditLog('Admin', `Opened ${page}`)
  }

  const updatePage = (nextPage) => {
    setCurrentPage((prev) => {
      const safePage = Math.min(totalPages, Math.max(1, nextPage))
      return safePage === prev ? prev : safePage
    })
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="shield">A</span>
          <div>
            <strong>Aegis-Dry</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="menu">
          {['Dashboard', 'Users'].map((item) => (
            <button
              key={item}
              type="button"
              className={activePage === item ? 'menu-item active' : 'menu-item'}
              onClick={() => selectPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="quick-stats">
          <p className="title">Quick Stats</p>
          <p>
            Total Users <span>{counts.total}</span>
          </p>
          <p>
            Active <span>{counts.active}</span>
          </p>
        </div>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <h2>Aegis-Dry Admin Panel</h2>
          <div className="topbar-tools">
            <input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <div className="theme-toggle" title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <span className={`theme-label ${!isDarkMode ? 'active' : ''}`}>Light Mode</span>
              <label className="switch" htmlFor="theme-switch">
                <input
                  id="theme-switch"
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode((prev) => !prev)}
                  aria-label="Toggle dark mode"
                />
                <span />
              </label>
              <span className={`theme-label ${isDarkMode ? 'active' : ''}`}>Dark Mode</span>
            </div>
          </div>
        </header>

        <main className="page-view">
          {activePage === 'Dashboard' ? (
            <section>
              <h1>Dashboard Overview</h1>
              <p className="subtitle">Monitor your Aegis-Dry system at a glance</p>
              {loadingRemoteData ? <p className="subtitle">Loading live data from Edge API...</p> : null}
              {dataError ? <p className="error-text">{dataError}</p> : null}
              <div className="metric-grid">
                <article className="card metric-card">
                  <p>Total Users</p>
                  <h3>{counts.total}</h3>
                  <small>Registered accounts</small>
                </article>
                <article className="card metric-card">
                  <p>Active Users</p>
                  <h3>{counts.active}</h3>
                  <small>Currently active</small>
                </article>
                <article className="card metric-card">
                  <p>Inactive Users</p>
                  <h3>{counts.inactive}</h3>
                  <small>Disabled accounts</small>
                </article>
              </div>

              <div className="dashboard-grid">
                <article className="card chart-card">
                  <p className="card-title">User Activity Trend</p>
                  <svg viewBox="0 0 560 260" role="img" aria-label="User activity chart">
                    <g className="grid-lines">
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
                    <path d={chartPath} className="line-path" />
                  </svg>
                  <div className="day-row">
                    {days.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </article>

                <article className="card activity-card">
                  <p className="card-title">Recent Activity</p>
                  <ul>
                    {recentActivity.slice(0, 5).map((activity) => (
                      <li key={activity.id}>
                        <span className={`dot ${activity.tone}`} />
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
          ) : null}

          {activePage === 'Users' ? (
            <section>
              <h1>User Management</h1>
              <p className="subtitle">Manage all registered users and their accounts</p>
              <article className="card table-card">
                <header>
                  <p>All Users ({filteredUsers.length})</p>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </header>
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={
                              user.status === 'Active' ? 'pill active' : 'pill inactive'
                            }
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>{user.lastActive}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" onClick={() => handleEditUser(user.name)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className={user.status === 'Active' ? 'danger' : 'success'}
                              onClick={() => handleToggleStatus(user.id)}
                            >
                              {user.status === 'Active' ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <footer>
                  <p>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </p>
                  <div>
                    <button type="button" onClick={() => updatePage(currentPage - 1)}>
                      Previous
                    </button>
                    <button type="button" onClick={() => updatePage(currentPage + 1)}>
                      Next
                    </button>
                  </div>
                </footer>
              </article>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default App;

