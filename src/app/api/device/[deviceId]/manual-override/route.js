import { NextResponse } from 'next/server'
import { getServerClient, serverConfigError } from '../../../../../lib/api/common'

const allowedActions = new Set(['DOCK', 'EXTEND'])

export async function POST(request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { deviceId } = await params
  const body = await request.json().catch(() => null)
  const action = body?.action
  const reason = body?.reason || 'Manual override requested from admin panel.'

  if (!allowedActions.has(action)) {
    return NextResponse.json(
      { error: "action must be either 'DOCK' or 'EXTEND'." },
      { status: 400 },
    )
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
    return NextResponse.json({ error: 'Failed to update device status' }, { status: 500 })
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
    return NextResponse.json({ error: 'Override applied, but logging failed' }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      action,
      status: nextStatus,
      command_id: logData.log_id,
    },
    { status: 200 },
  )
}
