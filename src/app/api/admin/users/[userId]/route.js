import { NextResponse } from 'next/server'
import { withAuth } from '../../../../../lib/middleware/auth'
import { getServerClient, serverConfigError } from '../../../../../lib/api/common'

async function getUser(_request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { userId } = await params

  const { data: user, error: userError } = await client
    .from('user_profiles')
    .select('id, user_id, full_name, phone, company_name, role, is_active, created_at, updated_at')
    .eq('user_id', userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: devices } = await client
    .from('devices')
    .select('device_id, mac_address, status, mode, rain_threshold, system_health_status')
    .eq('user_id', user.id)

  return NextResponse.json(
    {
      ...user,
      devices: devices ?? [],
    },
    { status: 200 },
  )
}

export const GET = withAuth(getUser)
