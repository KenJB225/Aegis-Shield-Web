'use client'

import { useMemo, useState } from 'react'
import '../../App.css'

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

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [users, setUsers] = useState(initialUsers)
  const [currentPage, setCurrentPage] = useState(1)

  const rowsPerPage = 8

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

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user
        }

        return {
          ...user,
          status: user.status === 'Active' ? 'Inactive' : 'Active',
          lastActive: new Date().toLocaleString(),
        }
      }),
    )
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
                      <span className={user.status === 'Active' ? 'pill active' : 'pill inactive'}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastActive}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button">Edit</button>
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
        </section>
      </main>
    </div>
  )
}
