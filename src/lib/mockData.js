// Lightweight mock data used as a fallback when Supabase returns no records
export const mockUsers = [
  {
    id: 'USR-1',
    name: 'Kim Benedict Sumilang',
    email: 'kimsumilang30@gmail.com',
    status: 'Active',
    lastActive: '5/26/2026, 3:03:58 PM',
  },
  {
    id: 'USR-2',
    name: 'Pauline',
    email: 'paulineponon05@gmail.com',
    status: 'Active',
    lastActive: '5/19/2026, 1:54:17 AM',
  },
  {
    id: 'USR-3',
    name: 'kimmys',
    email: 'kimbenedict6@gmail.com',
    status: 'Inactive',
    lastActive: '4/27/2026, 5:02:10 PM',
  },
  {
    id: 'USR-4',
    name: 'Super Admin',
    email: 'admin@aegis-dry.com',
    status: 'Inactive',
    lastActive: '4/22/2026, 3:07:03 PM',
  },
  {
    id: 'USR-5',
    name: 'Temporary Super Admin',
    email: 'tempadmin@aegis-dry.com',
    status: 'Active',
    lastActive: '3/26/2026, 5:05:49 PM',
  },
]

// Activity log rows for the Activity Logs table (actor/event/timestamp/type)
export const mockActivityLogs = [
  {
    id: 'LOG-1',
    actor: 'Kim Benedict Sumilang',
    event: 'Edited user profile',
    timestamp: '5/26/2026, 3:03:58 PM',
    type: 'User',
  },
  {
    id: 'LOG-2',
    actor: 'Pauline',
    event: 'Created device entry',
    timestamp: '5/19/2026, 1:54:17 AM',
    type: 'Device',
  },
  {
    id: 'LOG-3',
    actor: 'kimmys',
    event: 'Attempted sign-in (disabled account)',
    timestamp: '4/27/2026, 5:02:10 PM',
    type: 'Auth',
  },
  {
    id: 'LOG-4',
    actor: 'Super Admin',
    event: 'Changed system settings',
    timestamp: '4/22/2026, 3:07:03 PM',
    type: 'System',
  },
  {
    id: 'LOG-5',
    actor: 'Temporary Super Admin',
    event: 'Enabled maintenance mode',
    timestamp: '3/26/2026, 5:05:49 PM',
    type: 'System',
  },
]

// Recent activity shape used by dashboard (name/action/time/tone)
export const mockRecentActivity = mockActivityLogs.map((l) => ({
  id: l.id,
  name: l.actor,
  action: l.event,
  time: l.timestamp,
  tone: l.type === 'Auth' || l.type === 'System' ? 'danger' : 'success',
}))

// 7-day user activity counts for a trend chart (Mon..Sun)
export const mockTrend = [1, 2, 1, 3, 2, 1, 1]
