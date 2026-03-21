import { NextResponse } from 'next/server'
import { serverClient } from '../../../../lib/supabase/client'

export async function GET(request) {
  try {
    if (!serverClient) {
      return NextResponse.json(
        { error: 'Supabase server configuration is missing.' },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 },
      )
    }

    const { data: device, error: deviceError } = await serverClient
      .from('devices')
      .select('rain_threshold, user_id')
      .eq('device_id', deviceId)
      .single()

    if (deviceError || !device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    // Placeholder weather value until OpenWeatherMap integration is added.
    const rainProbability = 65
    const command = rainProbability >= device.rain_threshold ? 'DOCK' : 'EXTEND'

    return NextResponse.json(
      {
        command,
        reason: `Rain probability ${rainProbability}% vs threshold ${device.rain_threshold}%`,
        threshold: device.rain_threshold,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Instruction route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
