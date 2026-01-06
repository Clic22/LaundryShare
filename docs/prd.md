# LaundryShare Product Requirements Document (PRD)

---

## 1. Goals and Background Context

### 1.1 Goals

- **G1:** Enable users without washing machines to find and book nearby hosts for full-service laundry (wash, dry, fold)
- **G2:** Enable hosts to monetize their idle washing machines with minimal effort
- **G3:** Deliver a laundry experience 30% cheaper than laundromats with greater convenience
- **G4:** Build a two-sided marketplace with trust mechanisms (ratings, verification, in-app payments)
- **G5:** Achieve product-market fit in one urban city within 6 months of launch
- **G6:** Create a scalable platform foundation for future expansion to other home services

### 1.2 Background Context

LaundryShare addresses a persistent pain point for students and urban renters: the inconvenience and cost of laundromats. While the sharing economy has disrupted transportation (Uber), accommodation (Airbnb), and food delivery, laundry remains underserved by peer-to-peer solutions.

The platform creates a win-win: users get cheaper, more convenient laundry service close to home, while hosts earn passive income from their underutilized washing machines. Unlike existing laundry delivery apps (Cleanly, Washio) that are premium-priced and corporate, LaundryShare offers a community-driven, affordable alternative.

The MVP focuses on validating the core marketplace mechanics: can we recruit hosts, attract users, and facilitate successful transactions with high satisfaction on both sides?

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-06 | 1.0 | Initial PRD created from Project Brief | John (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements

#### User (Customer) Requirements

- **FR1:** Users can create an account using email, phone number, or social login (Google, Apple)
- **FR2:** Users can browse nearby hosts on a map view with distance indicators
- **FR3:** Users can view host profiles showing ratings, reviews, services offered, pricing, and availability
- **FR4:** Users can filter hosts by distance, rating, price, and available services
- **FR5:** Users can book an available time slot with instant confirmation (no host approval needed)
- **FR6:** Users can select add-on services (ironing, folding) during booking if offered by host
- **FR7:** Users can pay for bookings through the app using credit/debit card (Stripe)
- **FR8:** Users receive push notifications for booking confirmations and status updates
- **FR9:** Users can track order status in real-time (booked → dropped off → washing → ready → picked up)
- **FR10:** Users can chat with hosts in-app without exchanging personal phone numbers
- **FR11:** Users can rate and review hosts after service completion (1-5 stars + text)
- **FR12:** Users can view their booking history and past orders
- **FR13:** Users can cancel bookings according to cancellation policy (before drop-off)

#### Host Requirements

- **FR14:** Hosts can register and create a host profile with location, machine details, and photos
- **FR15:** Hosts can set their availability calendar (days/times they accept bookings)
- **FR16:** Hosts can define services offered (wash only, wash+dry, add-ons) with platform-set pricing
- **FR17:** Hosts can view incoming bookings and booking details (user info, drop-off time, services)
- **FR18:** Hosts can update order status (received, washing, drying, ready for pickup)
- **FR19:** Hosts can chat with users in-app
- **FR20:** Hosts can view their earnings dashboard (completed orders, pending payouts)
- **FR21:** Hosts can withdraw earnings to their bank account via Stripe Connect
- **FR22:** Hosts receive push notifications for new bookings and user messages
- **FR23:** Hosts can view ratings and reviews received from users

#### Platform/Admin Requirements

- **FR24:** Platform calculates and deducts commission from each transaction automatically
- **FR25:** Platform handles payment processing and escrow (release to host after pickup confirmed)
- **FR26:** Platform provides basic admin dashboard to monitor users, hosts, and transactions
- **FR27:** Platform sends automated emails for account verification, booking confirmations, receipts
- **FR28:** Platform supports user/host mode toggle within single app (like Uber driver mode)

### 2.2 Non-Functional Requirements

- **NFR1:** App must load within 3 seconds on 4G connection
- **NFR2:** Host search results must return within 2 seconds
- **NFR3:** Real-time chat messages must deliver within 1 second
- **NFR4:** System must support 1,000 concurrent users in MVP phase
- **NFR5:** All user data must be encrypted at rest and in transit (HTTPS, Supabase encryption)
- **NFR6:** Platform must be GDPR compliant for EU users (data export, deletion requests)
- **NFR7:** Payment processing must be PCI compliant (handled via Stripe, no card storage)
- **NFR8:** App must work on iOS 14+ and Android 10+
- **NFR9:** Web app must be responsive and work on mobile browsers
- **NFR10:** System must maintain 99.5% uptime during business hours
- **NFR11:** All API calls must use Row Level Security (RLS) to prevent unauthorized data access
- **NFR12:** Push notifications must be delivered within 30 seconds of trigger event

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

A clean, friendly, and trustworthy interface that feels like a modern marketplace app (inspired by Airbnb's warmth and Uber's simplicity). The app should feel community-oriented, not corporate. Key emotions: trust, convenience, simplicity.

### 3.2 Key Interaction Paradigms

- **Map-first discovery:** Users see hosts on a map by default, can switch to list view
- **Instant booking:** One-tap booking without waiting for host approval
- **Progressive disclosure:** Show essential info first, details on demand
- **Real-time feedback:** Order status updates, chat notifications, visual confirmations
- **Mode switching:** Seamless toggle between User and Host modes (persistent bottom navigation)

### 3.3 Core Screens and Views

**User Mode:**
1. **Home/Search** - Map view with nearby hosts, search/filter bar
2. **Host Profile** - Photo, ratings, services, availability calendar, book button
3. **Booking Flow** - Select time, add-ons, confirm, pay
4. **My Orders** - Active orders with status, past orders history
5. **Order Detail** - Status timeline, chat with host, receipt
6. **Chat** - Conversation thread with host
7. **Profile/Settings** - Account info, payment methods, preferences

**Host Mode:**
1. **Dashboard** - Today's bookings, pending actions, earnings summary
2. **Calendar** - Availability management, upcoming bookings
3. **Booking Detail** - User info, services requested, status update buttons
4. **Earnings** - Total earned, pending, withdrawal history
5. **Chat** - Conversations with users
6. **Profile/Settings** - Host profile, services, bank account

**Shared:**
1. **Onboarding** - Welcome, signup/login, role selection
2. **Notifications** - Push notification center

### 3.4 Accessibility

**WCAG AA** compliance targeted:
- Sufficient color contrast ratios
- Touch targets minimum 44x44px
- Screen reader compatible labels
- Support for system font size preferences

### 3.5 Branding

- **Colors:** Fresh, clean palette (consider blues/greens for trust, white space for cleanliness)
- **Typography:** Modern, readable sans-serif
- **Tone:** Friendly, approachable, community-focused
- **Logo:** To be designed (suggest laundry-related icon + wordmark)

*Note: Full brand guidelines to be developed by UX Expert*

### 3.6 Target Device and Platforms

**Cross-Platform (Web Responsive + Mobile):**
- iOS (App Store)
- Android (Play Store)
- Web (responsive, mobile-first)

Primary focus: Mobile apps (80% of expected usage)
Secondary: Web app for convenience

---

## 4. Technical Assumptions

### 4.1 Repository Structure: Monorepo

Single repository containing:
- `/apps/mobile-web` - Expo app (iOS, Android, Web)
- `/apps/landing` - Next.js marketing site
- `/packages/shared` - Shared types, utilities, constants

**Rationale:** Small team, shared code, unified deployments, easier maintenance.

### 4.2 Service Architecture

**Serverless/BaaS (Backend-as-a-Service):**
- **Supabase** handles: Authentication, Database, Real-time, Storage, Edge Functions
- **No custom backend server** - Supabase client SDK with Row Level Security
- **Edge Functions** for: Stripe webhooks, complex business logic, push notifications

**Rationale:** Faster development, lower ops overhead, scales automatically, cost-effective for MVP.

### 4.3 Testing Requirements

**Unit + Integration Testing:**
- Unit tests for business logic and utility functions
- Integration tests for critical flows (booking, payment, status updates)
- Manual testing for UI/UX validation
- No E2E automation in MVP (manual testing sufficient)

**Testing Tools:**
- Jest for unit/integration tests
- React Native Testing Library for component tests

### 4.4 Additional Technical Assumptions

- **State Management:** React Context + Supabase real-time subscriptions (no Redux)
- **Navigation:** React Navigation v6+
- **Maps:** React Native Maps with Google Maps provider
- **Payments:** Stripe Connect for marketplace (platform receives payment, pays out to hosts)
- **Push Notifications:** Expo Notifications service
- **Image Handling:** Expo Image Picker + Supabase Storage
- **Geolocation:** expo-location + PostGIS for proximity queries
- **Environment Management:** Expo environment variables + Supabase project per environment
- **CI/CD:** GitHub Actions for linting/testing, EAS Build for mobile, Vercel for web

---

## 5. Epic List

| Epic | Title | Goal |
|------|-------|------|
| **Epic 1** | Foundation & Authentication | Establish project infrastructure, authentication, and basic user/host profiles |
| **Epic 2** | Host Discovery & Profiles | Enable users to find and view nearby hosts with availability and services |
| **Epic 3** | Booking & Payments | Implement complete booking flow with Stripe payment processing |
| **Epic 4** | Order Management & Status | Enable order tracking, status updates, and real-time notifications |
| **Epic 5** | Communication & Reviews | Add in-app chat and rating/review system |
| **Epic 6** | Host Earnings & Payouts | Implement earnings dashboard and Stripe Connect payouts |

---

## 6. Epic Details

---

### Epic 1: Foundation & Authentication

**Goal:** Establish the technical foundation with working authentication, user/host profiles, and mode switching. By the end of this epic, users can sign up, log in, and switch between User and Host modes.

---

#### Story 1.1: Project Setup & Infrastructure

**As a** developer,
**I want** the project scaffolded with all necessary configurations,
**so that** I can begin feature development with proper tooling in place.

**Acceptance Criteria:**
1. Expo project initialized with TypeScript template
2. Monorepo structure created (`/apps/mobile-web`, `/apps/landing`, `/packages/shared`)
3. Supabase project created and configured (development environment)
4. Environment variables configured for Supabase connection
5. ESLint and Prettier configured with consistent rules
6. Basic folder structure established (`/src/screens`, `/src/components`, `/src/services`, `/src/types`)
7. React Navigation installed and basic navigator shell created
8. App runs on iOS simulator, Android emulator, and web browser
9. README with setup instructions created

---

#### Story 1.2: User Authentication - Email/Password

**As a** user,
**I want** to create an account and log in with email/password,
**so that** I can access the platform securely.

**Acceptance Criteria:**
1. Sign up screen with email, password, confirm password fields
2. Supabase Auth integration for email/password signup
3. Email validation and password strength requirements enforced
4. Login screen with email and password fields
5. Error handling for invalid credentials, existing email, weak password
6. Successful login redirects to home screen
7. Auth state persisted (user stays logged in after app restart)
8. Logout functionality clears session and returns to login
9. Database table `profiles` created with user metadata (id, email, full_name, created_at)

---

#### Story 1.3: User Authentication - Social Login

**As a** user,
**I want** to sign up and log in with Google or Apple,
**so that** I can access the platform quickly without creating a new password.

**Acceptance Criteria:**
1. Google Sign-In button on login/signup screens
2. Apple Sign-In button on login/signup screens (iOS only, hidden on Android/web)
3. Supabase Auth OAuth integration for Google and Apple
4. New users via social login have profile created automatically
5. Existing users can link social accounts (future enhancement - not MVP)
6. Error handling for cancelled or failed OAuth flow

---

#### Story 1.4: User Profile Setup

**As a** user,
**I want** to complete my profile with basic information,
**so that** hosts can see who is booking their service.

**Acceptance Criteria:**
1. Profile setup screen shown after first login (if profile incomplete)
2. Fields: Full name (required), phone number (optional), profile photo (optional)
3. Profile photo upload to Supabase Storage
4. Phone number validation (format check)
5. Profile data saved to `profiles` table
6. User can edit profile from settings screen later
7. Profile completion status tracked (for future verification features)

---

#### Story 1.5: Host Registration & Profile

**As a** user with a washing machine,
**I want** to register as a host,
**so that** I can offer my laundry services and earn money.

**Acceptance Criteria:**
1. "Become a Host" option accessible from user profile/settings
2. Host registration flow: address input, machine details, profile photo
3. Address input with autocomplete (Google Places API or similar)
4. Location coordinates stored for proximity search (PostGIS geography type)
5. Database table `hosts` created (user_id FK, address, location, machine_type, is_active, created_at)
6. Host profile linked to user profile (one-to-one relationship)
7. Host can upload photos of their space/machine (Supabase Storage)
8. Host registration sets `is_active = false` initially (activated after setup complete)

---

#### Story 1.6: User/Host Mode Toggle

**As a** registered host,
**I want** to switch between User and Host modes,
**so that** I can use the app as a customer or manage my hosting.

**Acceptance Criteria:**
1. Bottom navigation shows mode indicator (User/Host)
2. Mode toggle accessible from profile or dedicated switch button
3. User mode shows: Home (search), My Orders, Chat, Profile
4. Host mode shows: Dashboard, Calendar, Earnings, Chat, Profile
5. Mode preference persisted locally
6. Non-hosts see only User mode (Host option hidden until registered)
7. Smooth transition animation between modes

---

### Epic 2: Host Discovery & Profiles

**Goal:** Enable users to discover nearby hosts, view their profiles, and see availability. This is the core discovery experience that drives bookings.

---

#### Story 2.1: Host Search - Map View

**As a** user,
**I want** to see nearby hosts on a map,
**so that** I can find hosts close to my location.

**Acceptance Criteria:**
1. Map view as default home screen (User mode)
2. User's current location detected and centered on map
3. Active hosts displayed as markers on map
4. Markers show basic info on tap (host name, rating, distance)
5. PostGIS query returns hosts within configurable radius (default 5km)
6. Map allows pan and zoom with marker clustering for dense areas
7. Permission handling for location access (request, denied state, manual entry fallback)
8. "Search this area" button to refresh results after map movement

---

#### Story 2.2: Host Search - List View

**As a** user,
**I want** to see nearby hosts in a list sorted by distance,
**so that** I can quickly browse options without using the map.

**Acceptance Criteria:**
1. Toggle between Map and List view (tab or button)
2. List shows host card: photo, name, rating, distance, price indication
3. List sorted by distance (nearest first) by default
4. Pull-to-refresh functionality
5. Infinite scroll or pagination for many results
6. Empty state when no hosts found in area
7. Tap on host card navigates to host profile

---

#### Story 2.3: Host Search - Filters

**As a** user,
**I want** to filter hosts by distance, rating, and services,
**so that** I can find hosts that meet my specific needs.

**Acceptance Criteria:**
1. Filter button opens filter modal/sheet
2. Distance filter: slider or preset options (1km, 2km, 5km, 10km)
3. Minimum rating filter: 4+ stars, 3+ stars, any
4. Services filter: checkboxes for add-ons (ironing, folding)
5. Filters applied update map markers and list results
6. Active filters indicated visually (badge count, highlighted button)
7. "Clear filters" option to reset
8. Filter preferences not persisted (reset on app restart)

---

#### Story 2.4: Host Profile View

**As a** user,
**I want** to view a host's detailed profile,
**so that** I can decide if I want to book with them.

**Acceptance Criteria:**
1. Host profile screen with header (photo, name, rating, total reviews)
2. About section: host description (optional), member since date
3. Services section: list of services offered with prices
4. Photos section: gallery of host's space/machine photos
5. Reviews section: list of recent reviews with ratings and text
6. Location section: approximate area (not exact address until booked)
7. "Book Now" button prominently displayed
8. Back navigation to search results

---

#### Story 2.5: Host Availability Calendar

**As a** user,
**I want** to see when a host is available,
**so that** I can choose a time slot that works for me.

**Acceptance Criteria:**
1. Availability calendar on host profile (day view or week view)
2. Available time slots shown as selectable options
3. Unavailable times grayed out or hidden
4. Slots that are already booked not shown
5. Calendar fetches real-time availability from database
6. Selecting a slot initiates booking flow

---

#### Story 2.6: Host Availability Management

**As a** host,
**I want** to set my available days and times,
**so that** users can only book when I'm able to provide service.

**Acceptance Criteria:**
1. Calendar view in Host mode showing availability
2. Ability to set recurring weekly availability (e.g., Mon-Fri 9am-5pm)
3. Ability to block specific dates (vacation, busy days)
4. Database table `host_availability` (host_id, day_of_week, start_time, end_time)
5. Database table `host_blocked_dates` (host_id, date, reason)
6. Changes saved immediately and reflected in user-facing calendar
7. Visual distinction between available, blocked, and booked slots

---

### Epic 3: Booking & Payments

**Goal:** Implement the complete booking flow from slot selection to payment. Users can book and pay, hosts receive booking notifications.

---

#### Story 3.1: Booking Flow - Service Selection

**As a** user,
**I want** to select services and add-ons for my booking,
**so that** I can customize my laundry order.

**Acceptance Criteria:**
1. Service selection step after choosing time slot
2. Base service shown with price (per kg pricing displayed)
3. Estimated weight input (kg) with price calculation
4. Add-on services shown as toggleable options with prices
5. Order summary updates in real-time as selections change
6. "Continue to Payment" button with total amount
7. Minimum order validation (if applicable)

---

#### Story 3.2: Stripe Integration Setup

**As a** developer,
**I want** Stripe Connect configured for the platform,
**so that** we can process payments and pay out hosts.

**Acceptance Criteria:**
1. Stripe account created and configured for France/EU
2. Stripe Connect enabled for marketplace model
3. Supabase Edge Function created for Stripe operations
4. Test mode configured for development
5. Webhook endpoint created and configured for payment events
6. Stripe React Native SDK integrated in Expo app
7. Environment variables configured for Stripe keys

---

#### Story 3.3: Booking Flow - Payment

**As a** user,
**I want** to pay for my booking securely,
**so that** my laundry order is confirmed.

**Acceptance Criteria:**
1. Payment screen showing order summary and total
2. Stripe payment sheet integration (card input)
3. Ability to save card for future bookings (optional)
4. Payment intent created via Supabase Edge Function
5. Successful payment creates booking record in database
6. Database table `bookings` (id, user_id, host_id, status, total_amount, services, scheduled_time, created_at)
7. Booking confirmation screen shown after successful payment
8. Error handling for failed payments with retry option
9. Platform commission calculated and stored (for later payout)

---

#### Story 3.4: Booking Confirmation & Notification

**As a** user,
**I want** to receive confirmation of my booking,
**so that** I know my laundry appointment is scheduled.

**Acceptance Criteria:**
1. Confirmation screen with booking details (date, time, host, address, services)
2. Host's full address revealed after booking confirmed
3. Push notification sent to user confirming booking
4. Push notification sent to host about new booking
5. Email confirmation sent to user with booking details
6. Booking appears in "My Orders" list immediately

---

#### Story 3.5: Host Booking View

**As a** host,
**I want** to see incoming bookings with details,
**so that** I can prepare for the laundry service.

**Acceptance Criteria:**
1. Host dashboard shows upcoming bookings
2. New booking highlighted/badged until viewed
3. Booking detail view shows: user name, photo, scheduled time, services requested
4. User's phone number visible for emergency contact (from profile)
5. Directions/map link to user's approximate location (for context)
6. Booking list sortable by date

---

#### Story 3.6: Booking Cancellation

**As a** user,
**I want** to cancel my booking if needed,
**so that** I'm not charged for a service I can't use.

**Acceptance Criteria:**
1. Cancel button on booking detail (before drop-off status)
2. Cancellation confirmation dialog with policy reminder
3. Free cancellation if before 24 hours of scheduled time
4. Refund processed via Stripe (full or partial based on policy)
5. Booking status updated to "cancelled"
6. Push notification sent to host about cancellation
7. Cancelled bookings shown in history with status

---

### Epic 4: Order Management & Status

**Goal:** Enable real-time order tracking with status updates. Both users and hosts can see and update order progress.

---

#### Story 4.1: Order Status Flow

**As a** user,
**I want** to track my laundry order status,
**so that** I know when to pick up my clothes.

**Acceptance Criteria:**
1. Order detail screen shows status timeline/progress bar
2. Status states: Booked → Dropped Off → Washing → Drying → Ready → Picked Up
3. Current status highlighted with timestamp
4. Status updates reflected in real-time (Supabase real-time subscription)
5. Each status change triggers push notification to user
6. "Ready for pickup" notification includes host address reminder

---

#### Story 4.2: Host Status Updates

**As a** host,
**I want** to update the order status as I progress,
**so that** users know when their laundry is ready.

**Acceptance Criteria:**
1. Active booking shows current status with "Update Status" button
2. Status can only progress forward (no skipping steps)
3. "Mark as Received" button when user drops off clothes
4. "Mark as Washing" → "Mark as Drying" → "Mark as Ready" flow
5. "Mark as Picked Up" to complete the order
6. Status updates saved to database with timestamp
7. Status change triggers push notification to user
8. Cannot update status of cancelled bookings

---

#### Story 4.3: Order Completion

**As a** host,
**I want** to mark an order as complete,
**so that** payment is released and I can receive my earnings.

**Acceptance Criteria:**
1. "Mark as Picked Up" button on ready orders
2. Completion triggers payment release (escrow to host earnings)
3. Order status set to "completed"
4. Order moved to host's "Past Orders" section
5. User prompted to rate the service (push notification)
6. Earnings updated in host dashboard

---

#### Story 4.4: User Order History

**As a** user,
**I want** to view my past and current orders,
**so that** I can track my laundry history.

**Acceptance Criteria:**
1. "My Orders" screen with tabs: Active, Past
2. Active orders show status, upcoming scheduled time
3. Past orders show completion date, host, total paid
4. Tap on order shows full order detail
5. Past orders show "Leave Review" button if not yet reviewed
6. Orders sorted by date (most recent first)

---

#### Story 4.5: Host Order History

**As a** host,
**I want** to view my completed orders,
**so that** I can track my service history and earnings.

**Acceptance Criteria:**
1. Host dashboard shows past orders section
2. Past orders show user name, date, services, amount earned
3. Filter by date range (this week, this month, all time)
4. Tap shows full order detail
5. Link to view review received (if any)

---

### Epic 5: Communication & Reviews

**Goal:** Enable in-app communication between users and hosts, and build trust through a rating and review system.

---

#### Story 5.1: In-App Chat - Basic Messaging

**As a** user,
**I want** to chat with my host,
**so that** I can coordinate drop-off/pickup details.

**Acceptance Criteria:**
1. Chat accessible from active booking detail
2. Real-time messaging using Supabase real-time
3. Database table `messages` (id, booking_id, sender_id, content, created_at)
4. Messages displayed in conversation thread (newest at bottom)
5. Text input with send button
6. Timestamps shown on messages
7. Visual distinction between sent and received messages
8. Push notification for new messages when app is backgrounded

---

#### Story 5.2: Chat Notifications

**As a** user or host,
**I want** to be notified of new chat messages,
**so that** I can respond promptly.

**Acceptance Criteria:**
1. Push notification when new message received
2. Notification shows sender name and message preview
3. Tapping notification opens chat conversation
4. Unread message count badge on Chat tab
5. In-app banner notification when app is open but on different screen
6. Messages marked as read when conversation opened

---

#### Story 5.3: Rating & Review System

**As a** user,
**I want** to rate and review my host after service,
**so that** other users can make informed decisions.

**Acceptance Criteria:**
1. Review prompt shown after order completed (status = picked up)
2. Rating: 1-5 stars (required)
3. Review text: optional, max 500 characters
4. Database table `reviews` (id, booking_id, user_id, host_id, rating, review_text, created_at)
5. One review per booking (cannot edit after submission)
6. Review submitted updates host's average rating
7. Push notification to host when review received

---

#### Story 5.4: Display Reviews on Host Profile

**As a** user,
**I want** to see reviews on host profiles,
**so that** I can choose a trustworthy host.

**Acceptance Criteria:**
1. Host profile shows average rating (stars + number)
2. Total review count displayed
3. Recent reviews section (last 5-10 reviews)
4. Each review shows: user name, rating, review text, date
5. "See all reviews" link if more than displayed
6. Empty state for hosts with no reviews yet

---

#### Story 5.5: Host Rating Summary

**As a** host,
**I want** to see my ratings and reviews,
**so that** I can understand how I'm performing.

**Acceptance Criteria:**
1. Host dashboard shows current average rating
2. Reviews section showing all received reviews
3. Rating breakdown (5-star: X, 4-star: Y, etc.)
4. Newest reviews highlighted
5. Cannot respond to reviews in MVP (future feature)

---

### Epic 6: Host Earnings & Payouts

**Goal:** Implement the host earnings dashboard and Stripe Connect payouts so hosts can track and withdraw their earnings.

---

#### Story 6.1: Stripe Connect Onboarding

**As a** host,
**I want** to connect my bank account,
**so that** I can receive payouts for my services.

**Acceptance Criteria:**
1. "Set up payouts" prompt in host earnings section
2. Stripe Connect onboarding flow (Stripe-hosted)
3. Required info: identity verification, bank account details
4. Onboarding status tracked (pending, verified, requires_action)
5. Host cannot receive payouts until onboarding complete
6. Supabase stores Stripe Connect account ID for host
7. Return to app after Stripe onboarding complete

---

#### Story 6.2: Earnings Dashboard

**As a** host,
**I want** to see my earnings summary,
**so that** I know how much I've earned.

**Acceptance Criteria:**
1. Earnings screen in Host mode
2. Total earnings: all time amount
3. Available balance: amount ready for withdrawal
4. Pending earnings: completed orders awaiting payout period
5. This week/month summary with comparison to previous period
6. Earnings breakdown by completed orders
7. Visual chart showing earnings over time (optional for MVP)

---

#### Story 6.3: Payout History

**As a** host,
**I want** to see my payout history,
**so that** I can track when I received money.

**Acceptance Criteria:**
1. Payout history list in earnings section
2. Each payout shows: amount, date, status (pending, paid, failed)
3. Database table `payouts` (id, host_id, amount, stripe_payout_id, status, created_at)
4. Payouts fetched from Stripe via API
5. Tap on payout shows details

---

#### Story 6.4: Request Payout

**As a** host,
**I want** to withdraw my available earnings,
**so that** I can receive money in my bank account.

**Acceptance Criteria:**
1. "Withdraw" button when available balance > 0
2. Withdrawal amount input (default: full available balance)
3. Minimum withdrawal amount enforced (e.g., €10)
4. Payout initiated via Stripe Connect API
5. Payout typically arrives in 2-7 business days (Stripe standard)
6. Confirmation screen after withdrawal requested
7. Available balance updated immediately
8. Push notification when payout sent to bank

---

#### Story 6.5: Earnings Notifications

**As a** host,
**I want** to be notified about my earnings,
**so that** I stay informed about my income.

**Acceptance Criteria:**
1. Push notification when order completed and earnings added
2. Push notification when payout sent to bank
3. Weekly summary email with earnings recap (optional, future)

---

## 7. Checklist Results Report

*To be completed after PRD review with pm-checklist execution.*

---

## 8. Next Steps

### 8.1 UX Expert Prompt

> Review the LaundryShare PRD (docs/prd.md) and Project Brief (docs/brief.md). Create a comprehensive UX design system and wireframes for the core screens identified. Focus on the User/Host mode switching pattern, the map-based discovery experience, and the booking/status tracking flows. Deliverables: Design system tokens, wireframes for all core screens, interaction specifications.

### 8.2 Architect Prompt

> Review the LaundryShare PRD (docs/prd.md) and Project Brief (docs/brief.md). Create a detailed technical architecture document covering: database schema with RLS policies, Supabase configuration, Expo project structure, Stripe Connect integration patterns, and real-time subscription architecture. Use the decided tech stack (Expo, Supabase, Stripe, Vercel). Deliverables: Architecture document with diagrams, database schema, API specifications.

---

*Document generated with BMAD Framework*
