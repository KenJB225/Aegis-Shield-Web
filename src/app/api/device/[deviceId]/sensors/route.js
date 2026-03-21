import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError, toBoundedInt } from '../../../../../lib/api/common'

export async function GET(request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params
  const { searchParams } = new URL(request.url)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 200, 50)

  const { data, error } = await client
    .from('sensor_readings')
    .select('reading_id, sensor_type, value, unit, battery_level, signal_strength, status, timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sensor readings' }, { status: 500 })
  }

  return NextResponse.json(data ?? [], { status: 200 })
}
