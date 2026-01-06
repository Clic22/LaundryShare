# LaundryShare Tech Stack

## Overview

LaundryShare employs a **serverless, BaaS-first architecture** using Supabase as the primary backend. The frontend is built with **Expo (React Native)** enabling a single codebase for iOS, Android, and Web platforms.

## Core Technologies

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.x | Type-safe development | Catch errors at compile time, better DX |
| **Frontend Framework** | React Native (Expo) | SDK 52 | Cross-platform mobile + web | Single codebase for iOS/Android/Web |
| **UI Component Library** | React Native Paper | 5.x | Material Design components | Consistent UI, accessibility built-in |
| **State Management** | Zustand + React Query | 4.x / 5.x | Client state + server state | Lightweight, separation of concerns |
| **Backend Language** | TypeScript | 5.x | Edge functions | Same language across stack |
| **Backend Framework** | Supabase | Latest | BaaS platform | Auth, DB, realtime, storage in one |
| **API Style** | Supabase Client SDK | Latest | Direct database access with RLS | No REST API layer needed |
| **Database** | PostgreSQL | 15 | Primary data store | ACID, PostGIS, JSON support |
| **Cache** | React Query | 5.x | Client-side caching | Automatic cache invalidation |
| **File Storage** | Supabase Storage | Latest | Images, files | Integrated with auth policies |
| **Authentication** | Supabase Auth | Latest | User authentication | Email, phone, OAuth providers |
| **CSS Framework** | NativeWind | 4.x | Tailwind for React Native | Familiar Tailwind syntax |

## Testing Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend Testing** | Jest + React Native Testing Library | Latest | Unit & component tests |
| **Backend Testing** | Vitest | Latest | Edge function tests |
| **E2E Testing** | Maestro | Latest | Mobile E2E tests |

## Build & Deployment

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Build Tool** | Expo CLI / EAS | Latest | Build orchestration |
| **Bundler** | Metro | Latest | React Native bundler |
| **IaC Tool** | Supabase CLI | Latest | Database migrations |
| **CI/CD** | GitHub Actions + EAS | Latest | Automated builds/deploys |

## Monitoring & Observability

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Monitoring** | Sentry | Latest | Error tracking |
| **Logging** | Supabase Dashboard | N/A | Query & function logs |

## Platform & Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | Supabase (PostgreSQL) | Primary data store with PostGIS |
| Authentication | Supabase Auth | User/host authentication |
| Real-time | Supabase Realtime | Chat, status updates |
| File Storage | Supabase Storage | Profile photos, images |
| Edge Functions | Supabase Edge Functions | Stripe webhooks, business logic |
| Web Hosting | Vercel | Expo web app, Next.js landing |
| Mobile Builds | Expo EAS | iOS/Android compilation |
| Payments | Stripe Connect | Marketplace transactions |
| Maps | Google Maps Platform | Host discovery, geolocation |
| Push Notifications | Expo Push Service | Mobile notifications |

## Deployment Regions

- **Supabase:** EU West (Paris) - GDPR compliance
- **Vercel:** Edge network (auto-optimized)

## Environment Variables

### Mobile/Web App (`apps/mobile-web/.env.local`)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxx
```

### Edge Functions (`supabase/.env`)

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Landing Page (`apps/landing/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

## Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
git

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install Supabase CLI
npm install -g supabase

# iOS development (macOS only)
xcode-select --install

# Android development
# Install Android Studio and configure ANDROID_HOME
```

## Development Commands

```bash
# Start Expo development server (iOS, Android, Web)
npm run dev -w apps/mobile-web

# Start iOS simulator
npm run ios -w apps/mobile-web

# Start Android emulator
npm run android -w apps/mobile-web

# Start web browser
npm run web -w apps/mobile-web

# Start landing page
npm run dev -w apps/landing

# Run all tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Generate Supabase types after schema changes
npm run db:types
```
