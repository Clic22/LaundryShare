# LaundryShare Source Tree

## Repository Structure

**Structure:** Monorepo with npm workspaces

**Monorepo Tool:** npm workspaces (simple, no additional tooling)

## High-Level Organization

```
laundryshare/
├── apps/
│   ├── mobile-web/     # Expo app (iOS, Android, Web)
│   └── landing/        # Next.js marketing site
├── packages/
│   └── shared/         # Shared types, constants, utilities
└── supabase/           # Supabase configuration and migrations
```

## Complete Project Structure

```
laundryshare/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint, test, type-check
│       ├── deploy-web.yml         # Deploy Expo web to Vercel
│       └── eas-build.yml          # Trigger EAS builds
├── apps/
│   ├── mobile-web/                # Expo app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── assets/
│   │   ├── app.json
│   │   ├── App.tsx
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── landing/                   # Next.js landing page
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── styles/
│       ├── public/
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/                    # Shared code
│       ├── src/
│       │   ├── types/
│       │   │   ├── database.ts    # Generated Supabase types
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   ├── booking.ts
│       │   │   └── index.ts
│       │   └── utils/
│       │       ├── formatters.ts
│       │       └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── functions/
│   │   ├── create-payment-intent/
│   │   ├── stripe-webhook/
│   │   ├── create-connect-account/
│   │   ├── create-connect-link/
│   │   ├── request-payout/
│   │   └── send-notification/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── docs/
│   ├── brief.md
│   ├── prd.md
│   ├── architecture.md
│   └── architecture/
│       ├── coding-standards.md
│       ├── tech-stack.md
│       └── source-tree.md
├── e2e/
│   └── flows/
│       ├── auth.yaml
│       ├── booking.yaml
│       └── chat.yaml
├── .env.example
├── .gitignore
├── package.json                   # Root package.json with workspaces
├── tsconfig.base.json
└── README.md
```

## Frontend Component Organization

```
apps/mobile-web/src/
├── components/
│   ├── common/           # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   └── Rating.tsx
│   ├── booking/          # Booking-related components
│   │   ├── BookingCard.tsx
│   │   ├── ServiceSelector.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   └── StatusTimeline.tsx
│   ├── host/             # Host-related components
│   │   ├── HostCard.tsx
│   │   ├── HostProfile.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── ReviewList.tsx
│   ├── chat/             # Chat components
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── ConversationList.tsx
│   └── map/              # Map components
│       ├── HostMap.tsx
│       └── HostMarker.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── ProfileSetupScreen.tsx
│   ├── user/
│   │   ├── HomeScreen.tsx
│   │   ├── HostDetailScreen.tsx
│   │   ├── BookingScreen.tsx
│   │   ├── MyOrdersScreen.tsx
│   │   └── OrderDetailScreen.tsx
│   ├── host/
│   │   ├── DashboardScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── EarningsScreen.tsx
│   │   └── HostProfileScreen.tsx
│   └── shared/
│       ├── ChatScreen.tsx
│       ├── SettingsScreen.tsx
│       └── NotificationsScreen.tsx
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── UserNavigator.tsx
│   └── HostNavigator.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useBooking.ts
│   ├── useHosts.ts
│   ├── useChat.ts
│   └── useLocation.ts
├── services/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── notifications.ts
│   └── location.ts
├── stores/
│   ├── authStore.ts
│   ├── modeStore.ts
│   └── notificationStore.ts
├── types/
│   └── database.ts       # Generated Supabase types
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

## Backend Edge Function Organization

```
supabase/
├── functions/
│   ├── create-payment-intent/
│   │   └── index.ts
│   ├── stripe-webhook/
│   │   └── index.ts
│   ├── create-connect-account/
│   │   └── index.ts
│   ├── create-connect-link/
│   │   └── index.ts
│   ├── request-payout/
│   │   └── index.ts
│   └── send-notification/
│       └── index.ts
├── migrations/
│   ├── 20260106000000_initial_schema.sql
│   └── 20260106000001_rls_policies.sql
├── seed.sql
└── config.toml
```

## Test Organization

```
apps/mobile-web/
├── __tests__/
│   ├── components/
│   │   └── HostCard.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── utils/
│       └── formatters.test.ts

supabase/functions/
├── create-payment-intent/
│   ├── index.ts
│   └── index.test.ts

e2e/
├── flows/
│   ├── auth.yaml
│   ├── booking.yaml
│   └── chat.yaml
```
