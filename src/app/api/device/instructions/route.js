import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError } from '../../../../lib/api/common'
import {
  fetchRainProbability,
  resolveWeatherCoordinates,
  WeatherConfigError,
  WeatherRequestError,
  WeatherResponseError,
} from '../../../../lib/services/weatherService'

export async function GET(request) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 },
      )
    }

    const { data: device, error: deviceError } = await client
      .from('devices')
      .select('rain_threshold')
      .eq('device_id', deviceId)
      .single()

    if (deviceError || !device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    const weatherCoordinates = resolveWeatherCoordinates(searchParams)
    if (weatherCoordinates.error) {
      return NextResponse.json({ error: weatherCoordinates.error }, { status: 400 })
    }

    const { rainProbability, weatherSource, forecastAt } = await fetchRainProbability({
      lat: weatherCoordinates.lat,
      lon: weatherCoordinates.lon,
    })

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

    return NextResponse.json(
      {
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
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Instruction route error:', error)

    if (error instanceof WeatherConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (error instanceof WeatherRequestError || error instanceof WeatherResponseError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
