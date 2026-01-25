# VisualService - Project Tracker

## Project Status: CORE FEATURES COMPLETE

**Last Updated:** 2026-01-25
**Current Phase:** App Running - Feature Development

---

## Architecture Overview

```
visualservice/
├── mobile/                    # Expo React Native App
│   ├── app/                   # App screens (Expo Router)
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API & Supabase services
│   ├── store/                 # State management (Zustand)
│   ├── utils/                 # Helper functions
│   └── assets/                # Images, fonts
│
├── web/                       # Public Verification Page (React + Vite)
│   ├── src/
│   │   ├── pages/             # Verification, Rating pages
│   │   ├── components/        # UI components
│   │   └── services/          # Supabase client
│   └── public/
│
├── supabase/                  # Supabase configuration
│   ├── migrations/            # Database schema migrations
│   ├── functions/             # Edge functions (webhooks, image processing)
│   └── seed.sql               # Test data
│
└── docs/                      # Documentation
    ├── API.md                 # API documentation
    └── DEPLOYMENT.md          # Deployment guide
```

---

## Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Mobile App | Expo (React Native) | Single codebase → iOS + Android, easy app store deployment |
| Navigation | Expo Router | File-based routing, native feel |
| State | Zustand | Simple, fast, no boilerplate |
| Backend | Supabase | Auth, DB, Storage, RLS, Edge Functions all-in-one |
| Database | PostgreSQL (via Supabase) | Robust, row-level security |
| Storage | Supabase Storage | S3-compatible, integrated with auth |
| Web | React + Vite | Fast, lightweight for verification page |
| Styling | NativeWind (Tailwind for RN) | Rapid UI development |
| Payments | RevenueCat | Handles IAP for iOS + Android |

---

## Database Schema

### Tables

1. **profiles** (extends Supabase auth.users)
   - id (uuid, FK to auth.users)
   - email (text)
   - full_name (text)
   - business_name (text)
   - subscription_tier (enum: free, pro, enterprise)
   - subscription_status (enum: active, cancelled, past_due, trialing)
   - subscription_expires_at (timestamptz)
   - google_business_url (text, nullable)
   - created_at, updated_at

2. **photos**
   - id (uuid)
   - user_id (uuid, FK)
   - code (text, unique) - verification code
   - image_url (text) - Supabase storage path
   - watermarked_url (text) - processed image with watermark
   - captured_at (timestamptz)
   - tier_at_capture (enum)
   - expires_at (timestamptz)
   - photo_hash (text) - for fraud detection
   - device_info (jsonb)
   - created_at

3. **albums**
   - id (uuid)
   - user_id (uuid, FK)
   - name (text)
   - description (text, nullable)
   - created_at, updated_at

4. **photo_albums** (junction table)
   - photo_id (uuid, FK)
   - album_id (uuid, FK)
   - added_at (timestamptz)

5. **feedback**
   - id (uuid)
   - photo_code (text, FK to photos.code)
   - rating (int, 1-5)
   - comment (text, nullable)
   - customer_email (text, nullable)
   - ip_hash (text) - spam prevention
   - created_at

6. **verification_logs**
   - id (uuid)
   - photo_code (text)
   - verified_at (timestamptz)
   - ip_hash (text)
   - referrer (text, nullable)

7. **api_keys** (Enterprise only)
   - id (uuid)
   - user_id (uuid, FK)
   - key_hash (text)
   - key_preview (text) - first 8 + last 4 chars
   - rate_limit (int)
   - last_used_at (timestamptz)
   - revoked_at (timestamptz, nullable)
   - created_at

8. **webhooks** (Enterprise only)
   - id (uuid)
   - user_id (uuid, FK)
   - url (text)
   - events (text[])
   - active (boolean)
   - last_fired_at (timestamptz)
   - failure_count (int)
   - created_at

---

## Build Phases

### Phase 1: Foundation - COMPLETE
- [x] Project structure created
- [x] Expo app initialization
- [x] Basic navigation structure (Expo Router)
- [x] Authentication flow (signup/login/forgot password)
- [x] Supabase client setup
- [x] Zustand state management (auth + photos)
- [x] Supabase project setup
- [x] Database migrations deployed
- [x] Storage bucket created

### Phase 2: Core Mobile Features - COMPLETE
- [x] Camera screen with capture
- [x] Verification code generation (12-char alphanumeric)
- [x] Image processing utilities (compression, watermark prep)
- [x] **Real watermarking** - Burns code + timestamp directly into photos
- [x] Photo upload to Supabase Storage
- [x] Gallery view (grid, date grouping)
- [x] Photo detail screen
- [x] Share functionality (copy code, copy link, native share)
- [x] Post-capture confirmation screen
- [x] **Profile editing** - Name, business name, password change
- [x] **Album selection during capture** - Pre-select album before taking photos

### Phase 3: Organization & Albums - COMPLETE
- [x] Album creation/management
- [x] Album detail view
- [x] Add photos to albums (photo_albums junction)
- [x] Gallery filtering/search by code
- [x] Album limit enforcement (3 for Free tier)

### Phase 4: Web Verification Page - COMPLETE
- [x] Code lookup page (visualservice.app/verify/{code})
- [x] Verification display with timestamp
- [x] Star rating widget (1-5 stars)
- [x] Conditional routing (1-3 → feedback, 4-5 → Google review)
- [x] Comment submission form
- [x] Mobile-responsive design (Tailwind)

### Phase 5: Subscriptions - PENDING
- [ ] RevenueCat integration
- [ ] Subscription UI (in Settings)
- [ ] Tier enforcement (album limits, retention)
- [ ] Upgrade/downgrade flow
- [ ] App Store/Google Play IAP

### Phase 6: Before/After Overlay (Phase 2 PRD) - COMPLETE
- [x] Onion-skin camera overlay - Shows "before" photo as transparent overlay
- [x] Opacity slider (0-100%) with real-time adjustment
- [x] Toggle overlay visibility on/off
- [x] "Set Before" button to capture and set overlay photo
- [x] Clear overlay option
- [ ] Before/after pairing in albums (future enhancement)

### Phase 7: Enterprise API - PENDING
- [ ] API key generation in app
- [ ] REST endpoints (read-only)
- [ ] Rate limiting middleware
- [ ] Webhook delivery system

### Phase 8: Polish & Launch - PENDING
- [ ] App Store assets (screenshots, descriptions)
- [ ] Privacy policy, Terms of Service
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] Beta testing
- [ ] App Store submission

---

## Environment Variables Needed

### Mobile App (.env)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
REVENUECAT_IOS_KEY=
REVENUECAT_ANDROID_KEY=
```

### Web App (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Supabase Edge Functions
```
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Code Generation Logic

Verification codes: 12-character alphanumeric
- Format: `ABC123XYZ789`
- Characters: A-Z, 0-9 (no lowercase, no ambiguous chars like 0/O, 1/I/L)
- Generation: crypto-random, collision-checked against DB

---

## Watermark Specification

- Position: Bottom-right corner (future: customizable)
- Format: `Code: ABC123 | Jan 24, 2026 3:45 PM`
- Font: Clear, sans-serif, readable at small sizes
- Background: Semi-transparent dark for contrast
- Size: Scales with image (approximately 3% of image height)

---

## Data Retention Rules

| Tier | Retention | Enforcement |
|------|-----------|-------------|
| Free | 30 days | Cron job deletes expired photos + codes |
| Pro | 1 year | Same cron, different expiry calculation |
| Enterprise | Custom | Per-agreement, set in profile |

---

## API Endpoints (Enterprise)

Base: `api.visualservice.app/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /verify/{code} | Get code info |
| GET | /verify/{code}/feedback | Get feedback for code |
| GET | /feedback | List all feedback (paginated) |
| GET | /codes | List all codes (paginated, filtered) |
| GET | /analytics | Get aggregated analytics |

---

## Mobile App Screens

1. **Auth Stack**
   - Splash
   - Login
   - Signup
   - Forgot Password

2. **Main Stack (authenticated)**
   - Home (Camera quick access)
   - Camera
   - Post-Capture Preview
   - Gallery (grid view)
   - Photo Detail
   - Albums List
   - Album Detail
   - Settings
   - Subscription
   - Profile

---

## Dependencies to Install

### Mobile (Expo)
```
expo
expo-router
expo-camera
expo-image-picker (disabled - camera only)
expo-image-manipulator
expo-secure-store
expo-sharing
expo-clipboard
expo-device
@supabase/supabase-js
@react-native-community/slider
zustand
nativewind
tailwindcss
react-native-purchases (RevenueCat)
react-native-view-shot
react-native-url-polyfill
date-fns
uuid
```

### Web
```
react
react-dom
vite
@supabase/supabase-js
tailwindcss
react-router-dom
```

---

## Notes & Decisions

1. **Camera Only**: No photo library imports - ensures all photos are genuinely captured
2. **Watermark on Device**: Apply watermark client-side before upload (faster, reduces server load)
3. **Code Generation**: Client generates candidate, server validates uniqueness
4. **Offline Support**: Cache recent photos locally with SQLite
5. **Image Compression**: Compress to max 2048px width, 85% JPEG quality

---

## Current Task

**App Running - Ready for Feature Development**

Supabase is configured and the app is running. Next steps:
1. RevenueCat integration for subscriptions
2. Enterprise API development
3. App Store preparation and submission

---

## What's Built

### Mobile App (`/mobile`)
- **Auth**: Login, Signup, Forgot Password screens
- **Camera**: Full camera capture with permission handling
- **Post-Capture**: Code display, share options, confirmation
- **Gallery**: Grid view, date grouping, search by code
- **Photo Detail**: Full info, share, delete
- **Albums**: List, create, edit, delete, photo management
- **Settings**: Profile, subscription info, sign out

### Web App (`/web`)
- **Home Page**: Code entry form
- **Verification Page**: Code lookup, verification status
- **Rating Widget**: 5-star interactive rating
- **Feedback Flow**: Comment form, conditional routing
- **404 Page**: Not found handler

### Database Schema (`/supabase`)
- Complete PostgreSQL schema with RLS policies
- Tables: profiles, photos, albums, photo_albums, feedback, verification_logs, api_keys, webhooks

---

## Quick Start Commands

```bash
# Mobile App
cd mobile
cp .env.example .env  # Add your Supabase keys
npm run ios           # or npm run android

# Web App
cd web
cp .env.example .env  # Add your Supabase keys
npm run dev
```
