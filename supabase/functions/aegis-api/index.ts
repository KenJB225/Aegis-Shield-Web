import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
}

const OPEN_WEATHER_ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall'
const OPEN_WEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const WEATHER_REQUEST_TIMEOUT_MS = 8000

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? ''
const supabaseAnonKey =
  Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request)
  if (!token) {
    return { user: null, error: 'Unauthorized', status: 401 }
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: 'Supabase auth configuration is missing.', status: 500 }
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) {
    return { user: null, error: 'Invalid token', status: 401 }
  }

  return { user: data.user, error: null, status: 200 }
}

async function requireSuperAdmin(request: Request, client: ReturnType<typeof getServiceClient>) {
  const auth = await getAuthenticatedUser(request)
  if (!auth.user) {
    return { errorResponse: jsonResponse({ error: auth.error }, auth.status), user: null }
  }

  const { data: profile, error } = await client
    .from('user_profiles')
    .select('role')
    .eq('user_id', auth.user.id)
    .single()

  if (error || !profile) {
    return { errorResponse: jsonResponse({ error: 'Forbidden' }, 403), user: null }
  }

  if (profile.role !== 'SUPER_ADMIN') {
    return { errorResponse: jsonResponse({ error: 'Forbidden' }, 403), user: null }
  }

  return { errorResponse: null, user: auth.user }
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed
}

function toBoundedInt(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, parsed))
}

function parseCoordinate(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isValidLatitude(value: number | null): value is number {
  return Number.isFinite(value) && value >= -90 && value <= 90
}

function isValidLongitude(value: number | null): value is number {
  return Number.isFinite(value) && value >= -180 && value <= 180
}

function resolveWeatherCoordinates(searchParams: URLSearchParams) {
  const queryLat = parseCoordinate(searchParams.get('lat'))
  const queryLon = parseCoordinate(searchParams.get('lon'))
  const envLat = parseCoordinate(Deno.env.get('OPENWEATHER_DEFAULT_LAT'))
  const envLon = parseCoordinate(Deno.env.get('OPENWEATHER_DEFAULT_LON'))

  const lat = queryLat ?? envLat
  const lon = queryLon ?? envLon

  if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
    return {
      error:
        'Valid weather coordinates are required. Provide lat/lon query parameters or set OPENWEATHER_DEFAULT_LAT and OPENWEATHER_DEFAULT_LON.',
    }
  }

  return {
    lat,
    lon,
    source: queryLat !== null && queryLon !== null ? 'query' : 'environment',
  }
}

async function fetchRainProbability(lat: number, lon: number) {
  const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY')

  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is missing.')
  }

  const requestJson = async (url: string) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEATHER_REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      })

      const bodyText = await response.text().catch(() => '')
      const json = bodyText ? JSON.parse(bodyText) : null

      return { ok: response.ok, status: response.status, json, bodyText }
    } finally {
      clearTimeout(timeout)
    }
  }

  const oneCallEndpoint = new URL(OPEN_WEATHER_ONE_CALL_URL)
  oneCallEndpoint.searchParams.set('lat', String(lat))
  oneCallEndpoint.searchParams.set('lon', String(lon))
  oneCallEndpoint.searchParams.set('exclude', 'minutely,daily,alerts')
  oneCallEndpoint.searchParams.set('appid', apiKey)

  const oneCallResult = await requestJson(oneCallEndpoint.toString())

  if (oneCallResult.ok) {
    const firstHourly = Array.isArray(oneCallResult.json?.hourly) ? oneCallResult.json.hourly[0] : null
    const pop = firstHourly?.pop

    if (!Number.isFinite(pop)) {
      throw new Error('OpenWeather One Call response did not include hourly pop data.')
    }

    return {
      rainProbability: Math.round(pop * 100),
      weatherSource: 'openweather_onecall_3.0',
      forecastAt:
        Number.isFinite(firstHourly?.dt) && firstHourly.dt > 0
          ? new Date(firstHourly.dt * 1000).toISOString()
          : null,
    }
  }

  const forecastEndpoint = new URL(OPEN_WEATHER_FORECAST_URL)
  forecastEndpoint.searchParams.set('lat', String(lat))
  forecastEndpoint.searchParams.set('lon', String(lon))
  forecastEndpoint.searchParams.set('appid', apiKey)

  const forecastResult = await requestJson(forecastEndpoint.toString())

  if (!forecastResult.ok) {
    const detail = oneCallResult.bodyText ? ` ${oneCallResult.bodyText.slice(0, 180)}` : ''
    throw new Error(`OpenWeather API returned ${oneCallResult.status}.${detail}`)
  }

  const firstForecast = Array.isArray(forecastResult.json?.list) ? forecastResult.json.list[0] : null
  const forecastPop = firstForecast?.pop

  if (!Number.isFinite(forecastPop)) {
    throw new Error('OpenWeather forecast response did not include pop data.')
  }

  return {
    rainProbability: Math.round(forecastPop * 100),
    weatherSource: 'openweather_forecast_2.5_fallback',
    forecastAt:
      Number.isFinite(firstForecast?.dt) && firstForecast.dt > 0
        ? new Date(firstForecast.dt * 1000).toISOString()
        : null,
  }
}

function extractRouteSegments(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) {
    return []
  }

  // First segment is the function name (e.g. /aegis-api/...).
  return segments.slice(1)
}

async function handleDeviceInstructions(request: Request, client: NonNullable<ReturnType<typeof getServiceClient>>) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get('deviceId')

  if (!deviceId) {
    return jsonResponse({ error: 'Device ID is required' }, 400)
  }

  const { data: device, error: deviceError } = await client
    .from('devices')
    .select('rain_threshold')
    .eq('device_id', deviceId)
    .single()

  if (deviceError || !device) {
    return jsonResponse({ error: 'Device not found' }, 404)
  }

  const weatherCoordinates = resolveWeatherCoordinates(searchParams)
  if ('error' in weatherCoordinates) {
    return jsonResponse({ error: weatherCoordinates.error }, 400)
  }

  const { rainProbability, weatherSource, forecastAt } = await fetchRainProbability(
    weatherCoordinates.lat,
    weatherCoordinates.lon,
  )

  const command = rainProbability >= device.rain_threshold ? 'DOCK' : 'EXTEND'

  const { error: logError } = await client.from('event_logs').insert({
    device_id: deviceId,
    event_type: 'API_TRIGGER',
    action_taken: command,
    details: {
      rainProbability,
      threshold: device.rain_threshold,
      weatherSource,
      forecastAt,
      coordinates: {
        lat: weatherCoordinates.lat,
        lon: weatherCoordinates.lon,
        source: weatherCoordinates.source,
      },
    },
  })

  if (logError) {
    console.error('Failed to record API_TRIGGER log:', logError)
  }

  return jsonResponse({
    command,
    reason: `Rain probability ${rainProbability}% vs threshold ${device.rain_threshold}%`,
    threshold: device.rain_threshold,
    rainProbability,
    weatherSource,
    forecastAt,
    coordinates: {
      lat: weatherCoordinates.lat,
      lon: weatherCoordinates.lon,
      source: weatherCoordinates.source,
    },
  })
}

async function handleDeviceStatus(
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { data, error } = await client
    .from('devices')
    .select('device_id, status, system_health_status, mode, last_checked_at, updated_at')
    .eq('device_id', deviceId)
    .single()

  if (error || !data) {
    return jsonResponse({ error: 'Device not found' }, 404)
  }

  return jsonResponse({
    deviceId: data.device_id,
    status: data.status,
    health: data.system_health_status,
    mode: data.mode,
    lastCheckedAt: data.last_checked_at,
    updatedAt: data.updated_at,
  })
}

async function handleDeviceSensors(
  request: Request,
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { searchParams } = new URL(request.url)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 200, 50)

  const { data, error } = await client
    .from('sensor_readings')
    .select('reading_id, sensor_type, value, unit, battery_level, signal_strength, status, timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    return jsonResponse({ error: 'Failed to fetch sensor readings' }, 500)
  }

  return jsonResponse(data ?? [])
}

async function handleDeviceThreshold(
  request: Request,
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const body = await request.json().catch(() => null)
  const threshold = body?.rain_threshold

  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100) {
    return jsonResponse({ error: 'rain_threshold must be an integer from 0 to 100.' }, 400)
  }

  const { data, error } = await client
    .from('devices')
    .update({ rain_threshold: threshold, updated_at: new Date().toISOString() })
    .eq('device_id', deviceId)
    .select('device_id, rain_threshold, updated_at')
    .single()

  if (error || !data) {
    return jsonResponse({ error: 'Failed to update threshold' }, 500)
  }

  return jsonResponse({
    success: true,
    deviceId: data.device_id,
    rain_threshold: data.rain_threshold,
    updated_at: data.updated_at,
  })
}

async function handleDeviceManualOverride(
  request: Request,
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const body = await request.json().catch(() => null)
  const action = body?.action
  const reason = body?.reason || 'Manual override requested from admin panel.'

  if (action !== 'DOCK' && action !== 'EXTEND') {
    return jsonResponse({ error: "action must be either 'DOCK' or 'EXTEND'." }, 400)
  }

  const nextStatus = action === 'DOCK' ? 'DOCKED' : 'EXTENDED'

  const { error: updateError } = await client
    .from('devices')
    .update({
      mode: 'MANUAL',
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('device_id', deviceId)

  if (updateError) {
    return jsonResponse({ error: 'Failed to update device status' }, 500)
  }

  const { data: logData, error: logError } = await client
    .from('event_logs')
    .insert({
      device_id: deviceId,
      event_type: 'MANUAL_OVERRIDE',
      action_taken: action,
      details: { reason, source: 'admin_api' },
    })
    .select('log_id')
    .single()

  if (logError) {
    return jsonResponse({ error: 'Override applied, but logging failed' }, 500)
  }

  return jsonResponse({
    success: true,
    action,
    status: nextStatus,
    command_id: logData.log_id,
  })
}

async function handleSensorLatest(
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { data, error } = await client
    .from('sensor_readings')
    .select('sensor_type, value, unit, battery_level, signal_strength, timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(200)

  if (error) {
    return jsonResponse({ error: 'Failed to fetch latest sensor data' }, 500)
  }

  const latestByType: Record<string, Record<string, unknown>> = {}
  for (const row of data ?? []) {
    if (!latestByType[row.sensor_type]) {
      latestByType[row.sensor_type] = row
    }
  }

  return jsonResponse({
    rain: latestByType.RAIN?.value ?? null,
    temperature: latestByType.TEMPERATURE?.value ?? null,
    humidity: latestByType.HUMIDITY?.value ?? null,
    soilMoisture: latestByType.SOIL_MOISTURE?.value ?? null,
    battery: latestByType.RAIN?.battery_level ?? null,
    signal: latestByType.RAIN?.signal_strength ?? null,
    timestamp: latestByType.RAIN?.timestamp ?? null,
  })
}

async function handleSensorHistory(
  request: Request,
  deviceId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { searchParams } = new URL(request.url)
  const sensorType = searchParams.get('sensorType') || 'RAIN'
  const days = toBoundedInt(searchParams.get('days'), 1, 30, 7)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await client
    .from('sensor_readings')
    .select('timestamp, value, unit')
    .eq('device_id', deviceId)
    .eq('sensor_type', sensorType)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true })

  if (error) {
    return jsonResponse({ error: 'Failed to fetch sensor history' }, 500)
  }

  return jsonResponse(data ?? [])
}

async function handleAdminDashboard(
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const [{ count: totalUsers }, { count: activeUsers }, { count: inactiveUsers }, { count: totalDevices }, { count: criticalAlerts }] =
    await Promise.all([
      client.from('user_profiles').select('*', { count: 'exact', head: true }),
      client.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      client.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', false),
      client.from('devices').select('*', { count: 'exact', head: true }),
      client
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .eq('system_health_status', 'Critical'),
    ])

  return jsonResponse({
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    inactiveUsers: inactiveUsers ?? 0,
    totalDevices: totalDevices ?? 0,
    criticalAlerts: criticalAlerts ?? 0,
  })
}

async function handleAdminUsers(
  request: Request,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { searchParams } = new URL(request.url)
  const page = toPositiveInt(searchParams.get('page'), 1)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 100, 20)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = client
    .from('user_profiles')
    .select('id, user_id, full_name, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status === 'ACTIVE') {
    query = query.eq('is_active', true)
  }

  if (status === 'INACTIVE') {
    query = query.eq('is_active', false)
  }

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return jsonResponse({ error: 'Failed to fetch users' }, 500)
  }

  return jsonResponse({
    users: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

async function handleAdminUserById(
  userId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { data: user, error: userError } = await client
    .from('user_profiles')
    .select('id, user_id, full_name, phone, company_name, role, is_active, created_at, updated_at')
    .eq('user_id', userId)
    .single()

  if (userError || !user) {
    return jsonResponse({ error: 'User not found' }, 404)
  }

  const { data: devices } = await client
    .from('devices')
    .select('device_id, mac_address, status, mode, rain_threshold, system_health_status')
    .eq('user_id', user.id)

  return jsonResponse({
    ...user,
    devices: devices ?? [],
  })
}

async function handleAdminUserStatus(
  request: Request,
  userId: string,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const body = await request.json().catch(() => null)

  if (typeof body?.is_active !== 'boolean') {
    return jsonResponse({ error: 'is_active must be a boolean.' }, 400)
  }

  const { data, error } = await client
    .from('user_profiles')
    .update({ is_active: body.is_active, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('user_id, is_active, updated_at')
    .single()

  if (error || !data) {
    return jsonResponse({ error: 'Failed to update user status' }, 500)
  }

  return jsonResponse({
    success: true,
    user_id: data.user_id,
    is_active: data.is_active,
    updated_at: data.updated_at,
  })
}

async function handleAdminActivityLogs(
  request: Request,
  client: NonNullable<ReturnType<typeof getServiceClient>>,
) {
  const { searchParams } = new URL(request.url)
  const page = toPositiveInt(searchParams.get('page'), 1)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 200, 50)
  const actor = searchParams.get('actor')
  const resource = searchParams.get('resource')

  let query = client
    .from('activity_logs')
    .select('id, actor_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })

  if (actor) {
    query = query.eq('actor_id', actor)
  }

  if (resource) {
    query = query.eq('resource_type', resource)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return jsonResponse({ error: 'Failed to fetch activity logs' }, 500)
  }

  return jsonResponse({
    logs: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const routeSegments = extractRouteSegments(new URL(request.url).pathname)

    if (routeSegments.length === 0) {
      return jsonResponse({ error: 'Route not found' }, 404)
    }

    if (routeSegments.length === 1 && routeSegments[0] === 'health' && request.method === 'GET') {
      return jsonResponse({
        status: 'ok',
        service: 'aegis-edge-functions',
        timestamp: new Date().toISOString(),
      })
    }

    const client = getServiceClient()
    if (!client) {
      return jsonResponse({ error: 'Supabase server configuration is missing.' }, 500)
    }

    if (
      routeSegments.length === 2 &&
      routeSegments[0] === 'device' &&
      routeSegments[1] === 'instructions' &&
      request.method === 'GET'
    ) {
      return await handleDeviceInstructions(request, client)
    }

    if (routeSegments.length === 3 && routeSegments[0] === 'device') {
      const deviceId = routeSegments[1]
      const action = routeSegments[2]

      if (action === 'status' && request.method === 'GET') {
        return await handleDeviceStatus(deviceId, client)
      }

      if (action === 'sensors' && request.method === 'GET') {
        return await handleDeviceSensors(request, deviceId, client)
      }

      if (action === 'threshold' && request.method === 'PUT') {
        return await handleDeviceThreshold(request, deviceId, client)
      }

      if (action === 'manual-override' && request.method === 'POST') {
        return await handleDeviceManualOverride(request, deviceId, client)
      }
    }

    if (routeSegments.length === 3 && routeSegments[0] === 'sensor') {
      const deviceId = routeSegments[1]
      const action = routeSegments[2]

      if (action === 'latest' && request.method === 'GET') {
        return await handleSensorLatest(deviceId, client)
      }

      if (action === 'history' && request.method === 'GET') {
        return await handleSensorHistory(request, deviceId, client)
      }
    }

    if (routeSegments[0] === 'admin') {
      const adminCheck = await requireSuperAdmin(request, client)
      if (adminCheck.errorResponse) {
        return adminCheck.errorResponse
      }

      if (routeSegments.length === 2 && routeSegments[1] === 'dashboard' && request.method === 'GET') {
        return await handleAdminDashboard(client)
      }

      if (routeSegments.length === 2 && routeSegments[1] === 'users' && request.method === 'GET') {
        return await handleAdminUsers(request, client)
      }

      if (routeSegments.length === 3 && routeSegments[1] === 'users' && request.method === 'GET') {
        return await handleAdminUserById(routeSegments[2], client)
      }

      if (
        routeSegments.length === 4 &&
        routeSegments[1] === 'users' &&
        routeSegments[3] === 'status' &&
        request.method === 'PUT'
      ) {
        return await handleAdminUserStatus(request, routeSegments[2], client)
      }

      if (routeSegments.length === 2 && routeSegments[1] === 'activity-logs' && request.method === 'GET') {
        return await handleAdminActivityLogs(request, client)
      }
    }

    return jsonResponse({ error: 'Route not found' }, 404)
  } catch (error) {
    console.error('Edge function error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})
