# LaundryShare Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared` and import from there. Never duplicate type definitions.
- **API Calls:** Use React Query hooks for all Supabase queries. Never call Supabase directly in components.
- **Environment Variables:** Access through `process.env.EXPO_PUBLIC_*` only. Never hardcode keys.
- **Error Handling:** All async operations must have try/catch. Use toast notifications for user-facing errors.
- **State Updates:** Never mutate state directly. Use Zustand actions or React Query mutations.
- **RLS Reliance:** Trust RLS for authorization. Don't implement duplicate auth checks in frontend.
- **Real-time Cleanup:** Always unsubscribe from Supabase channels in useEffect cleanup.

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `HostCard.tsx` |
| Hooks | camelCase with 'use' | `useAuth.ts` |
| Screens | PascalCase + Screen | `HomeScreen.tsx` |
| Stores | camelCase + Store | `authStore.ts` |
| Types | PascalCase | `Booking`, `Host` |
| Database Tables | snake_case | `host_services` |
| Database Columns | snake_case | `created_at` |
| Edge Functions | kebab-case | `create-payment-intent` |
| Constants | SCREAMING_SNAKE_CASE | `BOOKING_STATUS` |

## State Management Patterns

- Use **Zustand** for global client state (auth, app mode, notifications)
- Use **React Query** for server state (bookings, hosts, messages)
- Local component state for UI-only state (form inputs, modals)
- Persist auth state with AsyncStorage

## Error Handling

### Error Response Format

```typescript
interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_EMAIL_EXISTS: 'auth/email-exists',
  BOOKING_HOST_UNAVAILABLE: 'booking/host-unavailable',
  BOOKING_PAYMENT_FAILED: 'booking/payment-failed',
  NETWORK_ERROR: 'network/error',
} as const;
```

### Frontend Error Handling

```typescript
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    console.error(error);
    let message = 'Something went wrong. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('network')) {
        message = 'Please check your internet connection.';
      } else if (error.message.includes('unauthorized')) {
        message = 'Please sign in to continue.';
      }
    }

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
    });
  }, []);

  return { handleError };
}
```

### Edge Function Error Handling

```typescript
function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      error: {
        message,
        timestamp: new Date().toISOString(),
      }
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    }
  );
}
```

## Component Template

```typescript
// Example: HostCard.tsx
import { View, Text, Pressable } from 'react-native';
import { Avatar, Rating } from '@/components/common';
import { Host } from '@/types/database';

interface HostCardProps {
  host: Host & { full_name: string; avatar_url: string | null };
  distance: number;
  onPress: () => void;
}

export function HostCard({ host, distance, onPress }: HostCardProps) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row items-center">
        <Avatar url={host.avatar_url} name={host.full_name} size={48} />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{host.full_name}</Text>
          <Text className="text-gray-500 text-sm">{distance.toFixed(1)} km away</Text>
        </View>
        <Rating value={host.rating_avg} count={host.rating_count} />
      </View>
    </Pressable>
  );
}
```

## Testing Standards

### Test Organization

- **Frontend Tests:** `apps/mobile-web/__tests__/`
- **Backend Tests:** `supabase/functions/{function-name}/index.test.ts`
- **E2E Tests:** `e2e/flows/*.yaml` (Maestro)

### Component Test Example

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { HostCard } from '@/components/host/HostCard';

describe('HostCard', () => {
  const mockHost = {
    id: '1',
    full_name: 'John Doe',
    avatar_url: null,
    rating_avg: 4.5,
    rating_count: 10,
  };

  it('renders host name and rating', () => {
    const { getByText } = render(
      <HostCard host={mockHost} distance={1.5} onPress={() => {}} />
    );
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('1.5 km away')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HostCard host={mockHost} distance={1.5} onPress={onPress} />
    );
    fireEvent.press(getByTestId('host-card'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Security Standards

### Frontend Security

- CSP Headers: Configured via Vercel headers
- XSS Prevention: React's built-in escaping, no `dangerouslySetInnerHTML`
- Secure Storage: `expo-secure-store` for sensitive data (tokens)

### Backend Security

- Input Validation: Zod schemas in edge functions
- Rate Limiting: Supabase built-in + custom per-function
- CORS Policy: Restrict to app domains in production

### Data Security

- Row Level Security: All tables protected by RLS policies
- API Keys: Anon key only exposes RLS-protected data
- Secrets: Edge function secrets stored in Supabase vault
