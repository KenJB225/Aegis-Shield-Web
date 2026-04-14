# Aegis-Dry System Setup - Complete Guide Overview

This document provides an overview of all setup guides and quick navigation for setting up the complete Aegis-Dry system (mobile app, unified web+backend app, and database).

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Aegis-Dry IoT System                         │
└──────────────────────────────┬──────────────────────────────────┘
                              │
      ┌────────────────────┬────────────────────┐
      │                    │                    │
    ┌────▼─────┐         ┌────▼─────┐         ┌──▼──────┐
    │  Mobile  │         │  Web     │         │   ESP32  │
    │   App    │         │ Dashboard│         │ Hardware │
    │ (Flutter)│         │ (Next.js)│         │          │
    └────┬─────┘         └────┬─────┘         └──┬───────┘
      │                    │                   │
      │              ┌─────▼────────────────────▼─────┐
      │              │   Unified Next.js API Routes   │
      │              │      (function gateway)        │
      │              └───────────────┬────────────────┘
      │                              │
      │                     ┌────────▼────────┐
      │                     │ Supabase Edge   │
      │                     │ Functions       │
      │                     │ (backend logic) │
      │                     └────────┬────────┘
      └──────────────────────────────┴───────────────
             │
        ┌─────────▼──────────┐
        │  Supabase (BaaS)   │
        │  - PostgreSQL DB   │
        │  - Auth            │
        │  - Realtime        │
        │  - RLS             │
        └────────────────────┘
```

---

## Quick Start Checklist

### Phase 1: Backend Infrastructure (20-30 minutes)
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create Supabase project (aegis-dry)
- [ ] Run Database Setup SQL Script in SQL Editor
- [ ] Run RLS Setup SQL Script in SQL Editor
- [ ] Run Realtime Setup SQL Script in SQL Editor
- [ ] Configure Authentication (Email provider)
- [ ] Configure Security Settings (JWT, session duration)
- [ ] **Go to:** [Supabase Setup Guide](supabase_setup.instructions.md)

### Phase 2: Unified Next.js Web + Backend (15-25 minutes)
- [ ] Use the existing Next.js project (same folder for web and backend)
- [ ] Install dependencies (@supabase/supabase-js, axios, etc.)
- [ ] Create Supabase client configuration
- [ ] Create API routes for device, sensor, and admin endpoints
- [ ] Set up environment variables (.env.local)
- [ ] Test health endpoint
- [ ] Deploy to Vercel or self-hosted server
- [ ] **Go to:** [Supabase Setup Guide - Unified Next.js Section](supabase_setup.instructions.md#unified-nextjs-web--backend-setup)

### Phase 3: Flutter Mobile App Setup (30-45 minutes)
- [ ] Create Flutter project
- [ ] Install dependencies (supabase_flutter, riverpod, dio, etc.)
- [ ] Create environment configuration (lib/config/env.dart)
- [ ] Create Supabase service and models
- [ ] Implement authentication (login/signup)
- [ ] Create state management providers (Riverpod)
- [ ] Implement real-time database subscriptions
- [ ] Implement API client calls to Next.js routes
- [ ] Validate that Next.js routes invoke Supabase Edge Functions
- [ ] Enforce required Set Location flow before Home access
- [ ] Add Settings -> Change Location flow and weather refresh behavior
- [ ] Test on Android emulator/iOS simulator
- [ ] **Go to:** [Flutter Mobile App Setup Guide](mobile_setup.instructions.md)

### Phase 4: Web Superadmin Dashboard (45-60 minutes)
- [ ] Build pages inside the same Next.js project (`src/app/*`)
- [ ] Install client dependencies as needed
- [ ] Implement admin authentication
- [ ] Create admin pages (Users, Activity Logs, Dashboard)
- [ ] Implement role-based access control
- [ ] Set up API communication with Next.js backend
- [ ] Test authentication and authorization
- [ ] Deploy to Vercel or self-hosted server

---

## Detailed Setup Guides

### 1. Database and Backend Infrastructure
**File:** [supabase_setup.instructions.md](supabase_setup.instructions.md)

**Contents:**
- Supabase project creation
- Database table setup (automated SQL + manual UI options)
- Authentication configuration
- Row Level Security (RLS) policies (automated SQL + manual UI options)
- Realtime configuration (automated SQL + manual UI options)
- Next.js backend server setup
- Environment variables configuration
- API keys and security best practices

**Key Features:**
- ✅ Automated SQL Editor setup (fastest method - 2 minutes)
- ✅ Manual UI setup options (for learning)
- ✅ Complete Next.js API routes examples
- ✅ Supabase client initialization
- ✅ Security best practices

---

### 2. Flutter Mobile Application
**File:** [mobile_setup.instructions.md](mobile_setup.instructions.md)

**Contents:**
- Flutter project setup and structure
- Supabase integration with Flutter
- Authentication (signup, signin, password reset)
- Real-time database subscriptions
- Next.js API integration patterns for Flutter
- Edge Function invocation patterns from Next.js
- State management with Riverpod
- Models and services architecture
- Testing and validation

**Key Features:**
- ✅ Complete project structure
- ✅ Supabase service initialization
- ✅ Real-time device status and sensor data
- ✅ Push notifications setup (Firebase)
- ✅ Offline support with Hive
- ✅ Common issues and solutions

---

### 3. Database Schema Reference
**File:** [database_schema.instructions.md](database_schema.instructions.md)

**Contents:**
- Complete database schema documentation
- User profiles table
- Devices table
- Event logs table
- Sensor readings table
- Activity logs table
- Row Level Security policies
- Realtime subscriptions
- Data relationships

---

### 4. Tech Stack and Architecture
**File:** [techstack_and_architeture.instructions.md](techstack_and_architeture.instructions.md)

**Contents:**
- Complete technology stack explanation
- Backend (Next.js) architecture and endpoints
- Frontend (Flutter) architecture
- Web superadmin panel structure
- Database (Supabase) capabilities
- API endpoints documentation

---

### 5. System Logic and Operations
**File:** [logic_and_operations.instructions.md](logic_and_operations.instructions.md)

**Contents:**
- System initialization flow
- Dual-layer protection flow (proactive + reactive)
- Layer 1: Proactive logic (cloud/API driven)
- Layer 2: Reactive failsafe (hardware driven)
- Device sleep cycles and wake patterns

---

### 6. User Flows
**File:** [user_flow.instructions.md](user_flow.instructions.md)

**Contents:**
- Mobile app user flows
- Super admin web panel flows
- Authentication flows
- Device management flows
- Settings and configuration flows

---

## Setup Options

### Option A: Fastest Setup (Recommended for Development)
**Time:** ~2 hours total

1. **Supabase (15-20 mins):** Use SQL Editor automated scripts
2. **Next.js Backend (20-25 mins):** Copy provided templates
3. **Flutter Mobile (45-60 mins):** Follow step-by-step guide
4. **No Web Dashboard initially**

### Option B: Complete Production Setup
**Time:** ~6-8 hours total

1. **Supabase:** Complete all setup with security configurations
2. **Next.js Backend:** Deploy to Vercel, configure production environment
3. **Flutter Mobile:** Build for both Android and iOS
4. **React Web Dashboard:** Implement complete superadmin panel
5. **Testing & Validation:** Comprehensive testing across all platforms

### Option C: Incremental Development
**Time:** ~2 weeks (part-time)

1. **Week 1:** Database + Backend API
2. **Week 2:** Mobile app + Authentication
3. **Week 3:** Web dashboard + Integration testing
4. **Week 4:** Deployment and production setup

---

## Environment Variables Summary

### Mobile App (Flutter)
```dart
MOBILE_API_BASE_URL=https://your-nextjs-app.vercel.app/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
OPENWEATHERMAP_API_KEY=your_api_key
```

### Web Backend (Next.js)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (server-only!)
OPENWEATHERMAP_API_KEY=your_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random_secret_string
NODE_ENV=development
```

### Web Dashboard (same Next.js project)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Deployment Options

### Database (Supabase)
- **Default:** Hosted on Supabase cloud (recommended)
- **Alternative:** Self-hosted PostgREST

### Backend (Next.js)
- **Recommended:** Vercel (native Next.js platform)
- **Alternatives:** 
  - DigitalOcean App Platform
  - AWS Amplify
  - Heroku
  - Railway.app
  - Self-hosted Node.js server

### Mobile App (Flutter)
- **Android:** Google Play Store
- **iOS:** Apple App Store
- **Web:** Browser (same Next.js deployment as backend)

### Web Dashboard
- **Next.js (same app as backend):** Vercel (recommended) or any Node.js host
- **Alternative:** Self-hosted Next.js server

---

## Security Checklist

- [ ] Supabase RLS policies enabled on all tables
- [ ] Service Role Key only in Next.js backend environment
- [ ] Anon Key in client-side code (mobile/web)
- [ ] JWT tokens properly validated
- [ ] CORS configured correctly
- [ ] API rate limiting implemented
- [ ] Audit logging enabled (activity_logs table)
- [ ] API keys rotated regularly
- [ ] Environment variables in .env.local (never committed)
- [ ] HTTPS enforced in production
- [ ] Database backups configured

---

## Testing Checklist

### Database Testing
- [ ] Tables created with correct schema
- [ ] RLS policies enforce user data isolation
- [ ] Realtime subscriptions work for tables
- [ ] Foreign key constraints work
- [ ] CHECK constraints validate data (status, mode, health)

### Backend API Testing
- [ ] Health endpoint responds
- [ ] Device endpoints return correct data
- [ ] Sensor endpoints return readings
- [ ] Admin endpoints require proper authentication
- [ ] Error handling returns proper status codes

### Mobile App Testing
- [ ] Authentication (signup/signin) works
- [ ] Real-time device status updates
- [ ] Sensor readings display correctly
- [ ] Manual override commands send successfully
- [ ] Activity logs load with pagination
- [ ] Threshold updates sync to Supabase

### Web Dashboard Testing
- [ ] Super admin authentication works
- [ ] User list displays with pagination
- [ ] Activity logs show all user actions
- [ ] Enable/disable users works
- [ ] Dashboard stats update correctly

---

## Troubleshooting Quick Links

### Supabase Issues
1. **RLS Denies Access:** Check user_id matches in user_profiles table
2. **Realtime Not Working:** Verify tables in realtime_updates publication
3. **Auth Failed:** Check email templates and confirmation settings
4. **Connection Timeout:** Verify Supabase URL and network connectivity

### Backend Issues
1. **Device Instructions Error:** Check rain_threshold and user_profiles join
2. **API Route 404:** Verify file is in src/app/api folder with route.js
3. **Supabase Client Error:** Verify environment variables are set correctly
4. **CORS Error:** Add allowed origins to API configuration

### Mobile App Issues
1. **Supabase Connection Fails:** Verify URL and Anon Key in lib/config/env.dart
2. **Real-time Updates Missing:** Enable Realtime in Supabase dashboard
3. **Query Fails:** Verify RLS policy and that `user_profiles` mapping exists for the logged-in user
4. **State Not Updating:** Verify Riverpod providers are watching correct streams

---

## Next Steps After Setup

1. **Configure OpenWeatherMap API** - For weather forecast integration
2. **Set up Firebase Cloud Messaging** - For push notifications
3. **Implement Offline Support** - Use Hive for Flutter caching
4. **Setup Logging and Monitoring** - Use Sentry or similar
5. **Configure Backup Strategy** - Automate database backups
6. **Load Testing** - Ensure API can handle expected traffic
7. **Security Audit** - Review all authentication and authorization flows
8. **App Store Submission** - Prepare for iOS and Android deployment

---

## Support and Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Flutter Documentation:** https://flutter.dev/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Riverpod Documentation:** https://riverpod.dev
- **React Documentation:** https://react.dev

---

## Document Version and Updates

- **Version:** 1.0.0
- **Last Updated:** March 2026
- **Maintainer:** Development Team
- **Status:** Complete and Production-Ready

---

For specific detailed instructions, refer to the individual setup guides listed above.

