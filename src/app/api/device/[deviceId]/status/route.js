import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError } from '../../../../../lib/api/common'

export async function GET(_request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params

  const { data, error } = await client
    .from('devices')
    .select('device_id, status, system_health_status, mode, last_checked_at, updated_at')
    .eq('device_id', deviceId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  }

  return NextResponse.json(
    {
      deviceId: data.device_id,
      status: data.status,
      health: data.system_health_status,
      mode: data.mode,
      lastCheckedAt: data.last_checked_at,
      updatedAt: data.updated_at,
    },
    { status: 200 },
  )
}
