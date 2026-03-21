import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError } from '../../../../../lib/api/common'

export async function GET(_request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params

  const { data, error } = await client
    .from('sensor_readings')
    .select('sensor_type, value, unit, battery_level, signal_strength, timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch latest sensor data' }, { status: 500 })
  }

  const latestByType = {}
  for (const row of data ?? []) {
    if (!latestByType[row.sensor_type]) {
      latestByType[row.sensor_type] = row
    }
  }

  return NextResponse.json(
    {
      rain: latestByType.RAIN?.value ?? null,
      temperature: latestByType.TEMPERATURE?.value ?? null,
      humidity: latestByType.HUMIDITY?.value ?? null,
      soilMoisture: latestByType.SOIL_MOISTURE?.value ?? null,
      battery: latestByType.RAIN?.battery_level ?? null,
      signal: latestByType.RAIN?.signal_strength ?? null,
      timestamp: latestByType.RAIN?.timestamp ?? null,
    },
    { status: 200 },
  )
}
