import { NextResponse } from 'next/server'
import {
  getServerClient,
  serverConfigError,
  toBoundedInt,
} from '../../../../../lib/api/common'

export async function GET(request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params
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
    return NextResponse.json({ error: 'Failed to fetch sensor history' }, { status: 500 })
  }

  return NextResponse.json(data ?? [], { status: 200 })
}
