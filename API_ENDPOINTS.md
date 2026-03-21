# Aegis-Dry API Endpoints

This document describes the API endpoints currently implemented in the unified Next.js app (`src/app/api`).

## Base URL

- Development: `http://localhost:3000`

## Authentication

Admin endpoints require a Bearer token:

```http
Authorization: Bearer <jwt>
```

## Health

### GET `/api/health`

Returns API service health status.

Response example:

```json
{
  "status": "ok",
  "service": "aegis-dry-nextjs",
  "timestamp": "2026-03-20T08:00:00.000Z"
}
```

## Device Endpoints

### GET `/api/device/instructions?deviceId=<uuid>`

Gets command decision (`DOCK` or `EXTEND`) based on `rain_threshold`.

### GET `/api/device/:deviceId/status`

Returns current device status and health.

### GET `/api/device/:deviceId/sensors?limit=50`

Returns latest sensor readings for the device.

- `limit`: optional, `1` to `200`, default `50`

### GET `/api/device/:deviceId/logs?page=1&limit=50&filter=SENSOR_TRIGGER`

Returns paginated event logs.

- `page`: optional, default `1`
- `limit`: optional, `1` to `200`, default `50`
- `filter`: optional event type filter

### PUT `/api/device/:deviceId/threshold`

Updates rain threshold.

Request body:

```json
{
  "rain_threshold": 75
}
```

Rules:

- `rain_threshold` must be an integer between `0` and `100`

### POST `/api/device/:deviceId/manual-override`

Triggers manual command and writes an event log.

Request body:

```json
{
  "action": "DOCK",
  "reason": "Manual override from admin"
}
```

Rules:

- `action` must be `DOCK` or `EXTEND`

## Sensor Endpoints

### GET `/api/sensor/:deviceId/latest`

Returns latest values summarized by sensor type:

- `rain`
- `temperature`
- `humidity`
- `soilMoisture`
- `battery`
- `signal`

### GET `/api/sensor/:deviceId/history?sensorType=RAIN&days=7`

Returns historical data points for a sensor type.

- `sensorType`: optional, default `RAIN`
- `days`: optional, `1` to `30`, default `7`

## Admin Endpoints (Protected)

### GET `/api/admin/users?page=1&limit=20&status=ACTIVE&search=kim`

Returns paginated users list from `user_profiles`.

- `status`: optional (`ACTIVE`, `INACTIVE`)
- `search`: optional name search

### GET `/api/admin/users/:userId`

Returns user details and associated devices.

### PUT `/api/admin/users/:userId/status`

Updates active/inactive status.

Request body:

```json
{
  "is_active": true
}
```

### GET `/api/admin/activity-logs?page=1&limit=50&actor=<uuid>&resource=DEVICE`

Returns paginated activity logs.

- `actor`: optional `actor_id`
- `resource`: optional `resource_type`

### GET `/api/admin/dashboard`

Returns dashboard summary metrics:

- `totalUsers`
- `activeUsers`
- `inactiveUsers`
- `totalDevices`
- `criticalAlerts`

## Configuration Notes

These server endpoints depend on:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET` (for protected admin endpoints)

If server Supabase configuration is missing, endpoints return:

```json
{
  "error": "Supabase server configuration is missing."
}
```
