import { NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/middleware/auth'
import {
  getServerClient,
  serverConfigError,
  toBoundedInt,
  toPositiveInt,
} from '../../../../lib/api/common'

async function getUsers(request) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { searchParams } = new URL(request.url)
  const page = toPositiveInt(searchParams.get('page'), 1)
  const limit = toBoundedInt(searchParams.get('limit'), 1, 100, 20)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = client
    .from('user_profiles')
    .select('id, user_id, full_name, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status === 'ACTIVE') {
    query = query.eq('is_active', true)
  }

  if (status === 'INACTIVE') {
    query = query.eq('is_active', false)
  }

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json(
    {
      users: data ?? [],
      total: count ?? 0,
      page,
      limit,
    },
    { status: 200 },
  )
}

export const GET = withAuth(getUsers)
