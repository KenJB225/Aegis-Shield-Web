import { NextResponse } from 'next/server'
import { serverClient } from '../supabase/client'

export function serverConfigError() {
  return NextResponse.json(
    { error: 'Supabase server configuration is missing.' },
    { status: 500 },
  )
}

export function getServerClient() {
  return serverClient
}

export function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed
}

export function toBoundedInt(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, parsed))
}
