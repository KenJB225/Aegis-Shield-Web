'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/supabase-js'
import { edgeApi } from '@/api/edgeClient'
import '@/styles/App.css'

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

export default function UsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [actionError, setActionError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [authToken, setAuthToken] = useState('')
  const [statusUpdates, setStatusUpdates] = useState({})

  const rowsPerPage = 8

  useEffect(() => {
    let isCancelled = false

    const loadUsers = async () => {
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
        setDataError('Sign in again to load users from Supabase.')
        setIsLoading(false)
        return
      }

      setAuthToken(token)

      try {
        const response = await edgeApi.adminUsers(token, {
          page: 1,
          limit: 200,
        })

        if (!isCancelled) {
          const mappedUsers = (response?.users || []).map((user, index) => ({
            id: user.user_id || user.id || `USR-${index + 1}`,
            name: user.full_name || 'Unnamed User',
            email: user.email || 'N/A',
            status: user.is_active ? 'Active' : 'Inactive',
            lastActive: user.updated_at
              ? new Date(user.updated_at).toLocaleString()
              : user.created_at
                ? new Date(user.created_at).toLocaleString()
                : 'N/A',
          }))

          setUsers(mappedUsers)
        }
      } catch (error) {
        if (!isCancelled) {
          setDataError(error?.message || 'Failed to load users from Supabase.')
          setUsers([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      isCancelled = true
    }
  }, [])

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

  const updatePage = (nextPage) => {
    setCurrentPage((prev) => {
      const safePage = Math.min(totalPages, Math.max(1, nextPage))
      return safePage === prev ? prev : safePage
    })
  }

  const handleToggleStatus = async (userId) => {
    setActionError('')

    if (!authToken) {
      setActionError('Sign in again to update user status.')
      return
    }

    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) {
      setActionError('User not found for status update.')
      return
    }

    setStatusUpdates((prev) => ({ ...prev, [userId]: true }))

    const nextIsActive = targetUser.status !== 'Active'

    try {
      const response = await edgeApi.adminUserStatus(authToken, userId, nextIsActive)
      const updatedAt = response?.updated_at
      const resolvedActive =
        typeof response?.is_active === 'boolean' ? response.is_active : nextIsActive

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) {
            return user
          }

          return {
            ...user,
            status: resolvedActive ? 'Active' : 'Inactive',
            lastActive: updatedAt ? new Date(updatedAt).toLocaleString() : user.lastActive,
          }
        }),
      )
    } catch (error) {
      setActionError(error?.message || 'Failed to update user status.')
    } finally {
      setStatusUpdates((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    }
  }

  const handleEditUser = (userId) => {
    if (!userId) {
      setActionError('User ID is missing for edit action.')
      return
    }

    router.push(`/users/${userId}`)
  }

  const firstVisible =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const lastVisible = Math.min(currentPage * rowsPerPage, filteredUsers.length)

  return (
    <div className="app-root users-route-root">
      <main className="page-view users-route-page">
        <section>
          <div className="users-route-header">
            <div>
              <h1>User Management</h1>
              <p className="subtitle">Manage all registered users and their accounts</p>
            </div>
            <input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

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

            <div className="table-scroll" role="region" aria-label="Users table" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>Loading users from Supabase...</td>
                    </tr>
                  ) : visibleUsers.length > 0 ? (
                    visibleUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={user.status === 'Active' ? 'pill active' : 'pill inactive'}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.lastActive}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" onClick={() => handleEditUser(user.id)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className={user.status === 'Active' ? 'danger' : 'success'}
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={Boolean(statusUpdates[user.id])}
                            >
                              {statusUpdates[user.id]
                                ? 'Updating...'
                                : user.status === 'Active'
                                  ? 'Disable'
                                  : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No users found in Supabase.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer>
              <p>
                Showing {firstVisible} to {lastVisible} of {filteredUsers.length} users
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
          {actionError ? <p className="error-text">{actionError}</p> : null}
          {dataError ? <p className="error-text">{dataError}</p> : null}
        </section>
      </main>
    </div>
  )
}
