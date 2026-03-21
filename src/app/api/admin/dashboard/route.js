import { NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/middleware/auth'
import { getServerClient, serverConfigError } from '../../../../lib/api/common'

async function getDashboardStats() {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

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

  return NextResponse.json(
    {
      totalUsers: totalUsers ?? 0,
      activeUsers: activeUsers ?? 0,
      inactiveUsers: inactiveUsers ?? 0,
      totalDevices: totalDevices ?? 0,
      criticalAlerts: criticalAlerts ?? 0,
    },
    { status: 200 },
  )
}

export const GET = withAuth(getDashboardStats)
