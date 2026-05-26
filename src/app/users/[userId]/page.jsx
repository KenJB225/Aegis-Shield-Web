'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { edgeApi } from '../../../lib/api/edgeClient'
import '../../../App.css'

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

const formatTimestamp = (value) => {
  if (!value) {
    return 'N/A'
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString()
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rawUserId = params?.userId
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId

  const [authToken, setAuthToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [profileMeta, setProfileMeta] = useState({
    userId: '',
    profileId: '',
  })
  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    companyName: '',
    role: 'USER',
    isActive: false,
    createdAt: '',
    updatedAt: '',
  })

  useEffect(() => {
    let isCancelled = false

    const loadUser = async () => {
      setIsLoading(true)
      setLoadError('')
      setSaveError('')
      setSaveSuccess('')

      if (!userId) {
        setLoadError('User ID is missing.')
        setIsLoading(false)
        return
      }

      if (!supabaseClient) {
        setLoadError('Supabase client is not configured.')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabaseClient.auth.getSession()
      const token = data?.session?.access_token

      if (isCancelled) {
        return
      }

      if (error || !token) {
        setLoadError('Sign in again to load user details.')
        setIsLoading(false)
        return
      }

      setAuthToken(token)

      try {
        const response = await edgeApi.adminUserById(token, userId)

        if (isCancelled) {
          return
        }

        setProfileMeta({
          userId: response?.user_id || userId,
          profileId: response?.id || '',
        })

        setFormState({
          fullName: response?.full_name || '',
          phone: response?.phone || '',
          companyName: response?.company_name || '',
          role: response?.role || 'USER',
          isActive: Boolean(response?.is_active),
          createdAt: response?.created_at || '',
          updatedAt: response?.updated_at || '',
        })
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error?.message || 'Failed to load user details.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      isCancelled = true
    }
  }, [userId])

  const formMeta = useMemo(
    () => [
      { label: 'Status', value: formState.isActive ? 'Active' : 'Inactive', isStatus: true },
      { label: 'Created', value: formatTimestamp(formState.createdAt), isStatus: false },
      { label: 'Last Updated', value: formatTimestamp(formState.updatedAt), isStatus: false },
    ],
    [formState.createdAt, formState.isActive, formState.updatedAt],
  )

  const handleFieldChange = (field) => (event) => {
    const nextValue = event.target.value
    setFormState((prev) => ({
      ...prev,
      [field]: nextValue,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaveError('')
    setSaveSuccess('')

    if (!authToken) {
      setSaveError('Sign in again to update this user profile.')
      return
    }

    const trimmedName = formState.fullName.trim()
    if (!trimmedName) {
      setSaveError('Full name is required.')
      return
    }

    setIsSaving(true)

    try {
      const response = await edgeApi.adminUserUpdate(authToken, userId, {
        full_name: trimmedName,
        phone: formState.phone.trim() || null,
        company_name: formState.companyName.trim() || null,
        role: formState.role,
      })

      setFormState((prev) => ({
        ...prev,
        fullName: response?.full_name || prev.fullName,
        phone: response?.phone || '',
        companyName: response?.company_name || '',
        role: response?.role || prev.role,
        isActive: Boolean(response?.is_active),
        createdAt: response?.created_at || prev.createdAt,
        updatedAt: response?.updated_at || prev.updatedAt,
      }))

      setProfileMeta((prev) => ({
        ...prev,
        userId: response?.user_id || prev.userId,
      }))

      setSaveSuccess('Profile updated successfully.')
    } catch (error) {
      setSaveError(error?.message || 'Failed to update user profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-root users-route-root">
      <main className="page-view users-route-page">
        <section>
          <div className="users-route-header">
            <div>
              <h1>User Profile</h1>
              <p className="subtitle">Review and edit the selected user profile</p>
            </div>
            <button type="button" className="secondary-btn" onClick={() => router.push('/users')}>
              Back to Users
            </button>
          </div>

          <article className="card user-detail-card">
            <header>
              <div>
                <p>Profile Details</p>
                <small>Supabase User ID: {profileMeta.userId || userId || 'N/A'}</small>
              </div>
              {profileMeta.profileId ? <small>Profile ID: {profileMeta.profileId}</small> : null}
            </header>

            {isLoading ? (
              <p className="subtitle">Loading user profile...</p>
            ) : loadError ? (
              <p className="error-text">{loadError}</p>
            ) : (
              <form className="user-detail-form" onSubmit={handleSave}>
                <label className="user-detail-field" htmlFor="user-full-name">
                  <span>Full Name</span>
                  <input
                    id="user-full-name"
                    className="user-detail-input"
                    value={formState.fullName}
                    onChange={handleFieldChange('fullName')}
                    placeholder="Enter full name"
                  />
                </label>

                <label className="user-detail-field" htmlFor="user-phone">
                  <span>Phone</span>
                  <input
                    id="user-phone"
                    className="user-detail-input"
                    value={formState.phone}
                    onChange={handleFieldChange('phone')}
                    placeholder="Optional phone number"
                  />
                </label>

                <label className="user-detail-field" htmlFor="user-company">
                  <span>Company</span>
                  <input
                    id="user-company"
                    className="user-detail-input"
                    value={formState.companyName}
                    onChange={handleFieldChange('companyName')}
                    placeholder="Optional company name"
                  />
                </label>

                <label className="user-detail-field" htmlFor="user-role">
                  <span>Role</span>
                  <select
                    id="user-role"
                    className="user-detail-select"
                    value={formState.role}
                    onChange={handleFieldChange('role')}
                  >
                    <option value="USER">User</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </label>

                <div className="user-detail-meta">
                  {formMeta.map((item) => (
                    <div key={item.label}>
                      <p>{item.label}</p>
                      {item.isStatus ? (
                        <span
                          className={
                            formState.isActive ? 'pill active' : 'pill inactive'
                          }
                        >
                          {item.value}
                        </span>
                      ) : (
                        <strong>{item.value}</strong>
                      )}
                    </div>
                  ))}
                </div>

                {saveError ? <p className="error-text">{saveError}</p> : null}
                {saveSuccess ? <p className="success-text">{saveSuccess}</p> : null}

                <div className="user-detail-actions">
                  <button type="button" className="secondary-btn" onClick={() => router.push('/users')}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}
