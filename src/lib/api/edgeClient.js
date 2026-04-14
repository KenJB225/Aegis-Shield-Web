const rawBaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL ||
  process.env.SUPABASE_FUNCTIONS_BASE_URL ||
  ''

function getBaseUrl() {
  return rawBaseUrl.trim().replace(/\/+$/, '')
}

function requireBaseUrl() {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL is required to call Edge Function APIs.',
    )
  }

  return baseUrl
}

export function buildEdgeUrl(path, query = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${requireBaseUrl()}${normalizedPath}`)

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

export async function edgeRequest(path, options = {}) {
  const { query, token, headers, ...rest } = options
  const url = buildEdgeUrl(path, query)

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    cache: 'no-store',
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (!response.ok) {
    const message = body?.error || `Edge request failed with status ${response.status}.`
    throw new Error(message)
  }

  return body
}

export const edgeApi = {
  health() {
    return edgeRequest('/health')
  },

  deviceInstructions({ deviceId, lat, lon }) {
    return edgeRequest('/device/instructions', {
      query: { deviceId, lat, lon },
    })
  },

  deviceStatus(deviceId) {
    return edgeRequest(`/device/${deviceId}/status`)
  },

  deviceSensors(deviceId, limit = 50) {
    return edgeRequest(`/device/${deviceId}/sensors`, {
      query: { limit },
    })
  },

  deviceThreshold(deviceId, rainThreshold) {
    return edgeRequest(`/device/${deviceId}/threshold`, {
      method: 'PUT',
      body: JSON.stringify({ rain_threshold: rainThreshold }),
    })
  },

  manualOverride(deviceId, action, reason) {
    return edgeRequest(`/device/${deviceId}/manual-override`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    })
  },

  sensorLatest(deviceId) {
    return edgeRequest(`/sensor/${deviceId}/latest`)
  },

  sensorHistory(deviceId, sensorType = 'RAIN', days = 7) {
    return edgeRequest(`/sensor/${deviceId}/history`, {
      query: { sensorType, days },
    })
  },

  adminDashboard(token) {
    return edgeRequest('/admin/dashboard', { token })
  },

  adminUsers(token, query) {
    return edgeRequest('/admin/users', { token, query })
  },

  adminUserById(token, userId) {
    return edgeRequest(`/admin/users/${userId}`, { token })
  },

  adminUserStatus(token, userId, isActive) {
    return edgeRequest(`/admin/users/${userId}/status`, {
      token,
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    })
  },

  adminActivityLogs(token, query) {
    return edgeRequest('/admin/activity-logs', { token, query })
  },
}
