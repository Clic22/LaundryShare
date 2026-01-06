# LaundryShare

A peer-to-peer laundry service marketplace connecting users who need laundry done with hosts who have washing machines.

## Tech Stack

- **Frontend:** React Native (Expo SDK 52) - iOS, Android, Web
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Payments:** Stripe Connect
- **Language:** TypeScript

## Project Structure

```
laundryshare/
├── apps/
│   ├── mobile-web/     # Expo app (iOS, Android, Web)
│   └── landing/        # Next.js marketing site (placeholder)
├── packages/
│   └── shared/         # Shared types, constants, utilities
├── supabase/           # Supabase configuration (future)
└── docs/               # Project documentation
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd laundryshare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp apps/mobile-web/.env.example apps/mobile-web/.env.local
```

Edit `apps/mobile-web/.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the development server

```bash
# Start Expo dev server (all platforms)
npm run dev

# Or start specific platforms
npm run web      # Web browser
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Expo development server |
| `npm run web` | Start web browser |
| `npm run ios` | Start iOS simulator |
| `npm run android` | Start Android emulator |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests |

## Monorepo Structure

This project uses npm workspaces for monorepo management.

### apps/mobile-web

The main Expo application targeting iOS, Android, and Web.

```
apps/mobile-web/
├── src/
│   ├── components/    # Reusable UI components
│   ├── screens/       # Screen components
│   ├── navigation/    # React Navigation setup
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services (Supabase, etc.)
│   ├── stores/        # State management (Zustand)
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── assets/            # Static assets
└── App.tsx            # App entry point
```

### packages/shared

Shared code used across apps.

```
packages/shared/
└── src/
    ├── types/         # Shared TypeScript types
    ├── constants/     # Shared constants
    └── utils/         # Shared utilities
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Code Style

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `HostCard.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Screens | PascalCase + Screen | `HomeScreen.tsx` |
| Types | PascalCase | `Booking` |

## License

Private - All rights reserved
