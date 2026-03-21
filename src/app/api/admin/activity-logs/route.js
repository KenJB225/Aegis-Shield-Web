import { NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/middleware/auth'
import {
  getServerClient,
  serverConfigError,
  toBoundedInt,
  toPositiveInt,
} from '../../../../lib/api/common'

async function getActivityLogs(request) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { searchParams } = new URL(request.url)
  const page = toPositiveInt(searchParams.get('page'), 1)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 200, 50)
  const actor = searchParams.get('actor')
  const resource = searchParams.get('resource')

  let query = client
    .from('activity_logs')
    .select('id, actor_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })

  if (actor) {
    query = query.eq('actor_id', actor)
  }

  if (resource) {
    query = query.eq('resource_type', resource)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }

  return NextResponse.json(
    {
      logs: data ?? [],
      total: count ?? 0,
      page,
      limit,
    },
    { status: 200 },
  )
}

export const GET = withAuth(getActivityLogs)
