const OPEN_WEATHER_ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall'
const OPEN_WEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const WEATHER_REQUEST_TIMEOUT_MS = 8000

export class WeatherConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WeatherConfigError'
  }
}

export class WeatherRequestError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WeatherRequestError'
  }
}

export class WeatherResponseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WeatherResponseError'
  }
}

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isValidLatitude(value) {
  return Number.isFinite(value) && value >= -90 && value <= 90
}

function isValidLongitude(value) {
  return Number.isFinite(value) && value >= -180 && value <= 180
}

export function resolveWeatherCoordinates(searchParams) {
  const queryLat = parseCoordinate(searchParams.get('lat'))
  const queryLon = parseCoordinate(searchParams.get('lon'))
  const envLat = parseCoordinate(process.env.OPENWEATHER_DEFAULT_LAT)
  const envLon = parseCoordinate(process.env.OPENWEATHER_DEFAULT_LON)

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

export async function fetchRainProbability({ lat, lon }) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    throw new WeatherConfigError('OPENWEATHERMAP_API_KEY is missing.')
  }

  const requestJson = async (url) => {
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
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new WeatherRequestError('OpenWeather request timed out.')
      }

      throw new WeatherRequestError('Failed to reach OpenWeather API.')
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
      throw new WeatherResponseError('OpenWeather One Call response did not include hourly pop data.')
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

  // Fallback for keys without One Call subscription.
  const forecastEndpoint = new URL(OPEN_WEATHER_FORECAST_URL)
  forecastEndpoint.searchParams.set('lat', String(lat))
  forecastEndpoint.searchParams.set('lon', String(lon))
  forecastEndpoint.searchParams.set('appid', apiKey)

  const forecastResult = await requestJson(forecastEndpoint.toString())

  if (!forecastResult.ok) {
    const detail = oneCallResult.bodyText ? ` ${oneCallResult.bodyText.slice(0, 180)}` : ''
    throw new WeatherRequestError(`OpenWeather API returned ${oneCallResult.status}.${detail}`)
  }

  const firstForecast = Array.isArray(forecastResult.json?.list) ? forecastResult.json.list[0] : null
  const forecastPop = firstForecast?.pop

  if (!Number.isFinite(forecastPop)) {
    throw new WeatherResponseError('OpenWeather forecast response did not include pop data.')
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
