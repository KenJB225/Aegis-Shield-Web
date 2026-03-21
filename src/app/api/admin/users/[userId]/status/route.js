import { NextResponse } from 'next/server'
import { withAuth } from '../../../../../../lib/middleware/auth'
import { getServerClient, serverConfigError } from '../../../../../../lib/api/common'

async function updateUserStatus(request, { params }) {
  const client = getServerClient()
  if (!client) {
    return serverConfigError()
  }

  const { userId } = await params
  const body = await request.json().catch(() => null)

  if (typeof body?.is_active !== 'boolean') {
    return NextResponse.json(
      { error: 'is_active must be a boolean.' },
      { status: 400 },
    )
  }

  const { data, error } = await client
    .from('user_profiles')
    .update({ is_active: body.is_active, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('user_id, is_active, updated_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      user_id: data.user_id,
      is_active: data.is_active,
      updated_at: data.updated_at,
    },
    { status: 200 },
  )
}

export const PUT = withAuth(updateUserStatus)
