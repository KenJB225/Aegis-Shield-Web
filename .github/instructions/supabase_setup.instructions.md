# Supabase Project Setup Guide

This guide provides step-by-step instructions for setting up the Aegis-Dry Supabase project, which serves as the backend-as-a-service (BaaS) for the mobile application and database backend for the web superadmin panel.

---

## Table of Contents
## Quick Start (SQL Editor - Fastest Method)

If you want to set up the entire database in minutes using automated SQL scripts:

1. Complete **Supabase Project Creation** (see below)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the **Complete Database Setup SQL Script** (see [Database Table Setup - Option 1](#option-1-automated-setup-recommended---sql-editor))
4. Run the **Complete RLS Setup SQL Script** (see [Row Level Security - Option 1](#option-1-automated-setup-recommended---sql-editor-1))
5. Run the **Realtime Setup SQL Script** (see [Realtime Configuration - Option 1](#option-1-automated-setup-recommended---sql-editor-2))
6. Continue with **Authentication Configuration** and beyond

This automated approach will create all tables, indexes, enable RLS, and set up realtime in under 2 minutes!

---

1. [Supabase Project Creation](#supabase-project-creation)
2. [Database Table Setup](#database-table-setup)
3. [Authentication Configuration](#authentication-configuration)
4. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
5. [Realtime Configuration](#realtime-configuration)
6. [Environment Variables Setup](#environment-variables-setup)
7. [API Keys and Configuration](#api-keys-and-configuration)
8. [Unified Next.js Web + Backend Setup](#unified-nextjs-web--backend-setup)
9. [Testing and Validation](#testing-and-validation)

---

## Supabase Project Creation

### Step 1: Create a Supabase Account
1. Visit [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up using:
   - Email + Password, OR
   - GitHub account (recommended for development)
4. Verify your email address

### Step 2: Create a New Project
1. After login, navigate to the **Projects** dashboard
2. Click **"New Project"** button
3. Fill in the following details:
   - **Project Name:** `aegis-dry` (or your chosen name)
   - **Database Password:** Create a strong password (save this securely)
   - **Region:** Select the region closest to your users (e.g., `us-east-1` for North America)
   - **Pricing Plan:** Select "Free" for development or "Pro" for production
4. Click **"Create new project"**
5. Wait for the project to initialize (typically 1-2 minutes)

### Step 3: Verify Project Access
1. Once initialized, you should see the Supabase dashboard
2. Note the **Project URL** and **Anon Key** (visible in the API section)
3. You'll use these keys later in environment variables

---

## Database Table Setup

### Option 1: Automated Setup (Recommended) - SQL Editor

The fastest way to set up the database is to use the **SQL Editor** in Supabase. Follow these steps:

1. In Supabase Dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the complete SQL script below
4. Click **"Run"** to execute all tables at once

#### Complete Database Setup SQL Script

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  profile_picture_url TEXT,
  role TEXT DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Create devices table
CREATE TABLE devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mac_address TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'EXTENDED' CHECK (status IN ('EXTENDED', 'DOCKED')),
  rain_threshold INTEGER DEFAULT 75 CHECK (rain_threshold >= 0 AND rain_threshold <= 100),
  mode TEXT DEFAULT 'AUTO' CHECK (mode IN ('AUTO', 'MANUAL')),
  system_health_status TEXT DEFAULT 'Safe' CHECK (system_health_status IN ('Safe', 'Warning', 'Critical')),
  last_checked_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Create event_logs table
CREATE TABLE event_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'SENSOR_TRIGGER', 'API_TRIGGER', 'MANUAL_OVERRIDE', 
    'SYSTEM_SELF_TEST', 'SENSOR_SYNC', 'ROUTINE_BACKUP', 
    'FIRMWARE_UPDATE', 'THRESHOLD_UPDATED'
  )),
  action_taken TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create sensor_readings table
CREATE TABLE sensor_readings (
  reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('RAIN', 'TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE')),
  value FLOAT NOT NULL,
  unit TEXT NOT NULL,
  battery_level INTEGER,
  signal_strength TEXT CHECK (signal_strength IN ('Excellent', 'Good', 'Fair', 'Poor')),
  status TEXT DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'LinkLost')),
  timestamp TIMESTAMP DEFAULT now()
);

-- Create activity_logs table (for admin panel)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_event_logs_device_id ON event_logs(device_id);
CREATE INDEX idx_event_logs_timestamp ON event_logs(timestamp DESC);
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
```

After running this script, proceed to **Step 2** below for RLS policies.

---

### Option 2: Manual Setup via UI

If you prefer to create tables manually through the Supabase UI:

#### Step 1: Create User Profiles Table
1. Navigate to **Database > Tables**
2. Click **"Create a new table"**
3. Set table name: `user_profiles`
4. Add columns:
   - `id` (UUID, Primary Key) - Auto-generate from `gen_random_uuid()`
   - `user_id` (UUID, Foreign Key) - References `auth.users(id)`
   - `full_name` (Text)
   - `phone` (Text, nullable)
   - `company_name` (Text, nullable)
   - `profile_picture_url` (Text, nullable)
   - `role` (Text, Default: 'USER')
   - `is_active` (Boolean, Default: true)
   - `created_at` (Timestamp, default: `now()`)
   - `updated_at` (Timestamp, default: `now()`)
5. Click **"Save"**

#### Step 2: Create Devices Table
1. Click **"Create a new table"**
2. Set table name: `devices`
3. Add columns:
   - `device_id` (UUID, Primary Key) - gen_random_uuid()
   - `user_id` (UUID, Foreign Key) - References user_profiles(id)
   - `mac_address` (Text, Unique)
   - `status` (Text, Default: 'EXTENDED') - 'EXTENDED' or 'DOCKED'
   - `rain_threshold` (Integer, Default: 75) - Range: 0-100
   - `mode` (Text, Default: 'AUTO') - 'AUTO' or 'MANUAL'
   - `system_health_status` (Text, Default: 'Safe') - 'Safe', 'Warning', 'Critical'
   - `last_checked_at` (Timestamp)
   - `updated_at` (Timestamp, Default: now())
   - `created_at` (Timestamp, Default: now())
4. Click **"Save"**

#### Step 3: Create Event Logs Table
1. Click **"Create a new table"**
2. Set table name: `event_logs`
3. Add columns:
   - `log_id` (UUID, Primary Key) - gen_random_uuid()
   - `device_id` (UUID, Foreign Key) - References devices(device_id)
   - `event_type` (Text) - 'SENSOR_TRIGGER', 'API_TRIGGER', 'MANUAL_OVERRIDE', etc.
   - `action_taken` (Text) - 'Retracted', 'Extended', 'Config Updated'
   - `details` (JSONB) - Store additional context
   - `timestamp` (Timestamp, Default: now())
4. Click **"Save"**

#### Step 4: Create Sensor Readings Table
1. Click **"Create a new table"**
2. Set table name: `sensor_readings`
3. Add columns:
   - `reading_id` (UUID, Primary Key) - gen_random_uuid()
   - `device_id` (UUID, Foreign Key) - References devices(device_id)
   - `sensor_type` (Text) - 'RAIN', 'TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE'
   - `value` (Float)
   - `unit` (Text) - '%', '°C', '%RH', etc.
   - `battery_level` (Integer, nullable)
   - `signal_strength` (Text, nullable) - 'Excellent', 'Good', 'Fair', 'Poor'
   - `status` (Text, Default: 'Online') - 'Online', 'Offline', 'LinkLost'
   - `timestamp` (Timestamp, Default: now())
4. Click **"Save"**

#### Step 5: Create Activity Logs Table (for Admin Panel)
1. Click **"Create a new table"**
2. Set table name: `activity_logs`
3. Add columns:
   - `id` (UUID, Primary Key) - gen_random_uuid()
   - `actor_id` (UUID, Foreign Key) - References auth.users(id)
   - `action` (Text) - describe the action taken
   - `resource_type` (Text) - e.g., 'USER', 'DEVICE', 'SYSTEM'
   - `resource_id` (Text, nullable) - ID of affected resource
   - `changes` (JSONB, nullable) - store before/after changes
   - `ip_address` (Text, nullable)
   - `user_agent` (Text, nullable)
   - `created_at` (Timestamp, Default: now())
4. Click **"Save"**

---

## Row Level Security (RLS) Policies

RLS policies ensure that users can only access their own data. There are two ways to set them up:

### Option 1: Automated Setup (Recommended) - SQL Editor

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the complete SQL script below
4. Click **"Run"** to execute all RLS policies at once

#### Complete RLS Setup SQL Script

```sql
-- Step 1: Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Step 2: Policies for user_profiles table
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 3: Policies for devices table
CREATE POLICY "Users can view their own devices"
  ON devices
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own devices"
  ON devices
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own devices"
  ON devices
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Step 4: Policies for event_logs table
CREATE POLICY "Users can view event logs for their devices"
  ON event_logs
  FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM devices WHERE user_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can insert event logs"
  ON event_logs
  FOR INSERT
  WITH CHECK (true);

-- Step 5: Policies for sensor_readings table
CREATE POLICY "Users can view sensor readings for their devices"
  ON sensor_readings
  FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM devices WHERE user_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can insert sensor readings"
  ON sensor_readings
  FOR INSERT
  WITH CHECK (true);

-- Step 6: Policies for activity_logs table (Admin-only)
CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Service role can insert activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (true);
```

---

### Option 2: Manual Setup via UI

If you prefer to create policies manually:

#### Step 1: Enable RLS on All Tables
1. Navigate to **Database > Tables**
2. For each table (`user_profiles`, `devices`, `event_logs`, `sensor_readings`, `activity_logs`):
   - Click on the table
   - Click **"Security"** tab
   - Click **"Enable RLS"**

#### Step 2: Create Policies for User Profiles
1. Go to **user_profiles** table > **Security** tab
2. Click **"New Policy"** button
3. Choose **"For SELECT operation"** and select **"Custom template with Fn"**
4. Policy name: `Users can view their own profile`
5. Paste this in the USING expression box:
   ```sql
   auth.uid() = user_id
   ```
6. Click **"Save"**
7. Repeat for **UPDATE operation** with the same USING expression

#### Step 3: Create Policies for Devices
1. Go to **devices** table > **Security** tab
2. Click **"New Policy"**
3. Choose **"For SELECT"** > **"Custom template"**
4. Policy name: `Users can view their own devices`
5. USING expression:
   ```sql
   user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
   ```
6. Click **"Save"**
7. Repeat for **UPDATE** and **INSERT** operations

#### Step 4: Create Policies for Event Logs
1. Go to **event_logs** table > **Security** tab
2. Click **"New Policy"**
3. Policy name: `Users can view event logs for their devices`
4. SELECT USING:
   ```sql
   device_id IN (SELECT device_id FROM devices WHERE user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
   ```
5. Click **"Save"**
6. Create a second policy for service role INSERT operations
7. Policy name: `Service role can insert event logs`
8. INSERT WITH CHECK: `true`
9. Click **"Save"**

#### Step 5: Create Policies for Sensor Readings
1. Go to **sensor_readings** table > **Security** tab
2. Follow the same pattern as event_logs
3. SELECT USING:
   ```sql
   device_id IN (SELECT device_id FROM devices WHERE user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
   ```

#### Step 6: Create Policies for Activity Logs (Admin Only)
1. Go to **activity_logs** table > **Security** tab
2. Policy name: `Super admins can view all activity logs`
3. SELECT USING:
   ```sql
   EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN')
   ```
4. Click **"Save"**

---

## Authentication Configuration

### Step 1: Configure Email Authentication
1. Navigate to **Authentication > Providers**
2. Click on **Email** provider
3. Enable it if not already enabled
4. Customize settings:
   - **Confirm email:** Toggle ON (require email verification)
   - **Redirect URL:** Set to your application's callback URL (e.g., `https://yourdomain.com/auth/callback`)
5. Click **"Save"**

### Step 2: Configure OAuth Providers (Optional)
For external authentication (Google, GitHub, etc.):
1. Click on the provider (e.g., **Google**)
2. Click **"Enable"**
3. Add your OAuth credentials from the provider's console
4. Set redirect URLs for your mobile app and web app
5. Click **"Save"**

### Step 3: Email Templates
1. Navigate to **Authentication > Email Templates**
2. Customize templates for:
   - **Confirmation:** Email sent on signup
   - **Reset Password:** For password recovery
   - **Magic Link:** For passwordless login (if needed)
3. Update the template URLs to point to your application

### Step 4: Security Settings
1. Navigate to **Authentication > Security**
2. Configure:
   - **Session Duration:** Set to 24 hours (or as needed)
   - **JWT Expiry:** Set to 1 hour
   - **Enable Multi-Factor Authentication (MFA):** Optional for super admin accounts
3. Click **"Save"**

---

## Row Level Security (RLS) Policies

RLS policies ensure that users can only access their own data. Execute the following SQL queries using the **SQL Editor** in Supabase:

### Step 1: Enable RLS on All Tables
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Policies for User Profiles
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 3: Create Policies for Devices
```sql
-- Users can view their own devices
CREATE POLICY "Users can view their own devices"
  ON devices
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own devices
CREATE POLICY "Users can update their own devices"
  ON devices
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Devices can insert updates (service-level access)
CREATE POLICY "Service can insert device updates"
  ON devices
  FOR UPDATE
  USING (true);  -- Restrict this to a service role in production
```

### Step 4: Create Policies for Event Logs
```sql
-- Users can view event logs for their devices
CREATE POLICY "Users can view event logs for their devices"
  ON event_logs
  FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM devices WHERE user_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Service can insert event logs
CREATE POLICY "Service can insert event logs"
  ON event_logs
  FOR INSERT
  WITH CHECK (true);  -- Restrict to service role in production
```

### Step 5: Create Policies for Sensor Readings
```sql
-- Users can view sensor readings for their devices
CREATE POLICY "Users can view sensor readings for their devices"
  ON sensor_readings
  FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM devices WHERE user_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Service can insert sensor readings
CREATE POLICY "Service can insert sensor readings"
  ON sensor_readings
  FOR INSERT
  WITH CHECK (true);
```

### Step 6: Create Policies for Activity Logs (Admin Only)
```sql
-- Only super admins can view activity logs
CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );
```

---

## Realtime Configuration

Realtime allows the mobile app to receive instant updates when data changes.

### Option 1: Automated Setup (Recommended) - SQL Editor

To enable realtime for specific tables via SQL:

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the SQL script below
4. Click **"Run"** to enable realtime

#### Realtime Setup SQL Script

```sql
-- Create a publication for real-time subscriptions
CREATE PUBLICATION IF NOT EXISTS realtime_updates;

-- Add tables to the publication
ALTER PUBLICATION realtime_updates ADD TABLE devices;
ALTER PUBLICATION realtime_updates ADD TABLE sensor_readings;
ALTER PUBLICATION realtime_updates ADD TABLE event_logs;
```

---

### Option 2: Manual Setup via UI

1. Navigate to **Database > Replication**
2. Under **Publications**, click **"Create a publication"**
3. Name it: `realtime_updates`
4. Enable the following tables:
   - `devices`
   - `sensor_readings`
   - `event_logs`
5. Click **"Save"**

---

### Step 3: Configure Realtime Channels (in Application Code)
In your Mobile (Flutter) and Web (Next.js) applications, subscribe to realtime changes:

**Example for Flutter:**
```dart
final subscription = supabase
  .from('devices')
  .stream(primaryKey: ['device_id'])
  .listen((List<Map<String, dynamic>> data) {
    // Handle real-time updates
  });
```

**Example for Next.js:**
```javascript
const channel = supabase
  .channel('devices')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'devices' },
    (payload) => {
      console.log('Device update:', payload);
    }
  )
  .subscribe();
```

---

## Environment Variables Setup

### Step 1: Create .env.local Files

#### For Mobile App (Flutter)
Create `lib/config/env.dart`:
```dart
class Env {
  static const String supabaseUrl = 'YOUR_SUPABASE_URL';
  static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  static const String openWeatherMapApiKey = 'YOUR_OPENWEATHERMAP_KEY';
}
```

#### For Web Backend (Next.js)
Create `.env.local` in the Next.js project root:
```
# Supabase (Public - can be exposed to frontend)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Supabase (Server-only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# External APIs
OPENWEATHERMAP_API_KEY=YOUR_OPENWEATHERMAP_KEY

# Authentication
NEXTAUTH_URL=http://localhost:3000  # Change to production URL
NEXTAUTH_SECRET=generate-secure-random-string-here

# Server Config
NODE_ENV=development
```

**Important Keys Explanation:**
- `NEXT_PUBLIC_*` - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Use for Anon Key only.
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only key. **NEVER** include in `NEXT_PUBLIC_`
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### Step 2: Generate API Keys
1. Navigate to **Settings > API**
2. Copy the following keys:
   - **Project URL** - Your Supabase endpoint
   - **Anon (Public) Key** - For client-side access (mobile app)
  - **Service Role Key** - For server-side access (Next.js backend only!)
3. Store these securely (never commit to version control)

---

## API Keys and Configuration

### Understanding API Keys

| Key | Scope | Use Case |
|-----|-------|----------|
| **Anon Key** | Client-side | Mobile/web auth flows and approved realtime reads |
| **Service Role Key** | Server-side only | Next.js API routes and Supabase Edge Functions for privileged backend logic |
| **Project URL** | Both | Base endpoint for all requests |

### Security Best Practices
1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Use Service Role Key only in Next.js server** (getServerSideProps, API routes, server actions)
4. **Route mobile operational requests through Next.js API routes** instead of direct privileged table writes
5. **Prefix public values with `NEXT_PUBLIC_`** in Next.js (these are exposed to browser)
6. **Rotate keys regularly** in production environments
7. **Use separate projects** for development and production
8. **Never use Service Role Key in browser code** - only in Next.js API Routes with `SUPABASE_SERVICE_ROLE_KEY`

---

## Unified Next.js Web + Backend Setup

### Step 1: Create or Use the Existing Next.js Project
```bash
# If project already exists (Aegis-Shield-Web), skip creation and use it directly.
# For a new project only:
npx create-next-app@latest Aegis-Shield-Web
cd Aegis-Shield-Web
```

When prompted:
- **TypeScript:** Yes (recommended)
- **ESLint:** Yes
- **Tailwind CSS:** Yes (optional)
- **App Router:** Yes
- **Src directory:** Yes

### Step 2: Install Required Dependencies
```bash
npm install @supabase/supabase-js
npm install axios          # For weather API calls
npm install jsonwebtoken   # For token verification
npm install cors           # For CORS handling
npm install dotenv         # Environment variables
```

### Step 3: Use a Unified Project Structure
```
Aegis-Shield-Web/
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│       └── api/
│           ├── auth/
│           │   └── [...nextauth]/
│           │       └── route.js
│           ├── device/
│           │   ├── instructions/
│           │   │   └── route.js
│           │   ├── [deviceId]/
│           │   │   ├── status/
│           │   │   │   └── route.js
│           │   │   ├── sensors/
│           │   │   │   └── route.js
│           │   │   ├── logs/
│           │   │   │   └── route.js
│           │   │   ├── threshold/
│           │   │   │   └── route.js
│           │   │   └── manual-override/
│           │   │       └── route.js
│           ├── sensor/
│           │   └── [deviceId]/
│           │       ├── latest/
│           │       │   └── route.js
│           │       └── history/
│           │           └── route.js
│           ├── admin/
│           │   ├── users/
│           │   │   └── route.js
│           │   ├── activity-logs/
│           │   │   └── route.js
│           │   └── dashboard/
│           │       └── route.js
│           └── health/
│               └── route.js
│   ├── App.jsx
│   ├── App.css
│   └── lib/
│       ├── supabase/
│       │   └── client.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── errorHandler.js
│       └── services/
│           ├── deviceService.js
│           ├── weatherService.js
│           └── auditService.js
├── .env.local
├── .env.example
├── next.config.mjs
├── jsconfig.json
├── package.json
└── README.md
```

### Step 4: Create Supabase Client (src/lib/supabase/client.js)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const serverClient = createClient(supabaseUrl, supabaseServiceKey);

export const clientSide = (token) => {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const client = createClient(supabaseUrl, anonKey);
  
  if (token) {
    client.auth.setSession({
      access_token: token,
      refresh_token: '',
      user: null,
    });
  }
  
  return client;
};
```

### Step 5: Create API Route Example (Next.js route invoking Edge Function)
```javascript
import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/client';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }
    
    // Next.js acts as gateway; edge function executes backend logic.
    const { data, error } = await serverClient.functions.invoke('aegis-api', {
      body: {
        action: 'GET_DEVICE_INSTRUCTION',
        deviceId,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Edge function invocation failed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      command: data.command,
      reason: data.reason,
      threshold: data.threshold,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 6: Create Authentication Middleware (src/lib/middleware/auth.js)
```javascript
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

export async function verifyAuth(token) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export function withAuth(handler) {
  return async (request) => {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const payload = await verifyAuth(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return handler(request, payload);
  };
}
```

### Step 7: Environment Variables (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# External APIs
OPENWEATHERMAP_API_KEY=YOUR_OPENWEATHERMAP_KEY

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Server Config
NODE_ENV=development
```

### Step 8: Run the Development Server
```bash
npm run dev
```

The server will be available at `http://localhost:3000`

### Step 9: Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

For production deployment, use **Vercel** (recommended for Next.js):
```bash
npm install -g vercel
vercel
```

Or deploy to other platforms:
- **DigitalOcean App Platform**
- **Heroku**
- **AWS Amplify**
- **Railway.app**

---

## Testing and Validation

### Step 1: Test Supabase Connection
Use the Supabase Dashboard or run this test in Node.js:
```javascript
const supabase = require('./src/config/supabase');

async function testConnection() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);
  
  if (error) console.error('Connection failed:', error);
  else console.log('Connection successful:', data);
}

testConnection();
```

### Step 2: Test Authentication
```javascript
async function testAuth() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'TestPassword123!',
  });
  
  if (error) console.error('Auth failed:', error);
  else console.log('Auth successful:', data);
}
```

### Step 3: Test Realtime Updates
- Use Supabase Studio to insert/update records
- Check that Flutter app receives real-time notifications
- Verify Next.js backend receives Realtime events

### Step 4: Test API Endpoints
```bash
# Test health check
curl http://localhost:3000/api/health

# Test device status endpoint
curl http://localhost:3000/api/device/:deviceId/status

# Test sensor readings endpoint
curl http://localhost:3000/api/sensor/:deviceId
```

---

## Next Steps

1. **Set up authentication in the mobile app** - Configure Flutter Supabase client
2. **Set up authentication in the web app** - Configure Next.js authentication
3. **Implement API endpoints** - Build device control, sensor data, and admin endpoints
4. **Configure webhooks** - Set up Supabase webhooks for critical events
5. **Deploy** - Deploy Next.js backend to production environment
6. **Monitor** - Set up logging and monitoring for production systems

---

## Troubleshooting

### RLS Policy Issues
- **Problem:** Users can't access their data
- **Solution:** Check user_id matches in user_profiles table; verify RLS policies are enabled

### Realtime Not Working
- **Problem:** Mobile app not receiving updates
- **Solution:** Verify Realtime is enabled in Supabase settings; check subscription code

### Service Key Leaks
- **Problem:** Service role key is exposed
- **Solution:** Immediately regenerate the key in Supabase dashboard

### Connection Timeout
- **Problem:** Backend can't connect to Supabase
- **Solution:** Verify SUPABASE_URL and firewall settings; check network connectivity
