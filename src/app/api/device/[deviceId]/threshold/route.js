import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError } from '../../../../../lib/api/common'

export async function PUT(request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params
  const body = await request.json().catch(() => null)
  const threshold = body?.rain_threshold

  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100) {
    return NextResponse.json(
      { error: 'rain_threshold must be an integer from 0 to 100.' },
      { status: 400 },
    )
  }

  const { data, error } = await client
    .from('devices')
    .update({ rain_threshold: threshold, updated_at: new Date().toISOString() })
    .eq('device_id', deviceId)
    .select('device_id, rain_threshold, updated_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update threshold' }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      deviceId: data.device_id,
      rain_threshold: data.rain_threshold,
      updated_at: data.updated_at,
    },
    { status: 200 },
  )
}
