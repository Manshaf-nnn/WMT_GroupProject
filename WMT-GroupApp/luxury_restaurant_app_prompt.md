# 🍽️ MASTER PROMPT — Luxury Restaurant Experience System (React Native + Expo)

> Copy everything below the line and paste it as a single prompt into your coding assistant (Claude Code, Cursor, etc.). It is structured so the assistant cannot skip steps.

---

## ROLE & MISSION

You are a **Senior React Native / Expo engineer + UI/UX designer** building a **production-grade, App Store–quality** mobile application called **"Luxury Restaurant Experience System."**

The backend **already exists and is hosted on Render**. Your job is **NOT** to rebuild the backend — it is to:

1. **Verify the existing backend end-to-end** (every endpoint, every CRUD path, auth flow, error states).
2. **Build a polished React Native (Expo) frontend** that consumes it, runnable via **Expo Go on iPhone**.
3. **Implement all 6 feature modules with full CRUD**.
4. **Suggest and implement reasonable improvements** that make the app feel premium.
5. Deliver a **final, testable, production-ready build**.

---

## HARD CONSTRAINTS (DO NOT VIOLATE)

- **Framework:** React Native via **Expo (managed workflow)** — must run in **Expo Go on iPhone** without ejecting or requiring a custom dev client. **Do not use any native modules incompatible with Expo Go.**
- **Backend:** Already deployed on **Render**. Before writing any frontend code, ask me for:
  - The Render **base URL**
  - The **API contract** (Postman collection, Swagger/OpenAPI, or README) — if I cannot provide one, **probe the API yourself** by hitting common routes and document what you find.
- **No mock data in final build.** All screens must hit the real Render backend.
- **State management:** Use **React Query (TanStack Query)** for server state + **Zustand** or Context for local UI state. No Redux boilerplate.
- **Navigation:** **Expo Router (file-based)** with typed routes.
- **Auth:** JWT/refresh token stored in **expo-secure-store** (never AsyncStorage for tokens).
- **Forms:** **react-hook-form + zod** for validation.
- **Styling:** **NativeWind (Tailwind for RN)** OR **StyleSheet with a centralized theme file** — pick one and be consistent.
- **Animations:** **react-native-reanimated v3** + **moti** for declarative animations. Every screen transition, list item, and key interaction must feel buttery (60fps).
- **Icons:** `@expo/vector-icons` (Ionicons / Feather).
- **Images:** `expo-image` (not the legacy `Image`) for caching and blur placeholders.
- **TypeScript everywhere.** No `any`. Strict mode on.

---

## PHASE 0 — BACKEND VERIFICATION (MANDATORY, BEFORE ANY UI CODE)

Before writing a single screen, you must produce a **Backend Health Report**:

1. Ping the Render base URL — confirm cold-start latency and warm response time.
2. List **every endpoint** grouped by the 6 modules (method, path, request schema, response schema, auth required Y/N).
3. For each endpoint, run a **CRUD smoke test** (create → read → update → delete) and record:
   - ✅ Working / ⚠️ Partial / ❌ Broken
   - Sample request/response
   - Any inconsistencies (snake_case vs camelCase, inconsistent error shapes, missing pagination, etc.)
4. Flag **anything missing** that the 6 modules below require. Propose minimal backend additions if needed (but do not implement them unless I approve).
5. Generate a **typed API client** (`/services/api.ts`) with one function per endpoint, fully typed from the verified contract.

**Do not proceed to Phase 1 until I confirm the report.**

---

## PHASE 1 — THE 6 CORE MODULES (FULL CRUD EACH)

### 1️⃣ User Authentication & Profile Management
- Sign up, login, logout, forgot password, email verification, refresh-token rotation.
- Profile screen: avatar (upload via `expo-image-picker`), name, phone, dietary preferences, favorite cuisines, address book (multiple addresses, CRUD).
- Change password, delete account (with confirmation modal).
- Biometric login (Face ID / Touch ID) via `expo-local-authentication`.

### 2️⃣ Restaurant Discovery & Listing System
- Home feed with **animated hero carousel** (featured restaurants), category chips, "near me" section.
- Search with **debounced live results**, filters (cuisine, price range $–$$$$, rating, distance, open now), sort (rating, distance, price).
- Restaurant detail screen: hero image gallery (pinch-to-zoom), menu, hours, map preview (`react-native-maps`), photos, reviews tab, "make reservation" CTA.
- Save / favorite restaurants (CRUD on user favorites).
- Skeleton loaders while fetching — never blank screens.

### 3️⃣ Admin Dashboard & System Management
- Role-gated route — only `role: "admin"` users can access.
- CRUD on: restaurants, menus, users (suspend/reactivate), reservations, reviews (moderate/delete).
- Analytics cards: total users, active reservations today, revenue this month, top restaurants — animated count-up numbers + sparkline charts (`victory-native` or `react-native-svg-charts`).
- Bulk actions (multi-select with animated checkboxes).

### 4️⃣ Payment Processing & Billing System
- Integrate **Stripe** via `@stripe/stripe-react-native` (Expo Go compatible via the Expo config plugin — confirm before using; if not Expo Go compatible, fall back to Stripe Checkout in a `WebView` / `expo-web-browser`).
- Saved payment methods (CRUD: add card, set default, delete).
- Billing history with downloadable receipts (PDF via `expo-print`).
- Deposit / pre-authorization flow for premium reservations.
- All amounts shown in user's locale currency.

### 5️⃣ Table Reservation & Booking Management
- Booking flow: pick date → pick time slot (animated time-slot grid) → party size stepper → special requests textarea → confirm.
- Calendar view (`react-native-calendars`) of user's upcoming reservations.
- CRUD: create, view, modify (date/time/party size), cancel (with cancellation policy display).
- Push notifications (`expo-notifications`) for booking confirmations, reminders 2 hours before, and changes.
- "Add to Apple Calendar" via `expo-calendar`.

### 6️⃣ Reviews, Ratings & Recommendation System
- Submit review: 5-star animated rating, photo upload (multi-image), text review, tags (food/service/ambience/value).
- Edit / delete own reviews.
- Helpful / report buttons on reviews.
- Personalized recommendations carousel on home ("Because you loved X…") — driven by backend; if backend lacks this, build a simple client-side recommender from user favorites + ratings.

---

## PHASE 2 — DESIGN SYSTEM ("LUXURY" FEEL)

This is what separates a B+ from an A+. Be deliberate.

- **Palette:** deep charcoal (`#0E0E10`), champagne gold (`#C8A45C`), ivory (`#F6F1E7`), accent burgundy (`#5B1A26`). Light + dark mode both supported (`useColorScheme`).
- **Typography:** Use **Playfair Display** (serif, headings) + **Inter** (sans, body) via `expo-font`. Generous letter-spacing on uppercase labels.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48.
- **Elevation:** soft, layered shadows — never harsh.
- **Imagery:** large, edge-to-edge food photography with subtle Ken Burns zoom on hero images.
- **Micro-interactions:**
  - Buttons: scale `0.97` on press (Reanimated `withSpring`).
  - Lists: stagger fade-in-up on mount.
  - Screen transitions: shared element transitions for restaurant card → detail page.
  - Pull-to-refresh: custom gold spinner.
  - Tab bar: animated indicator that slides.
  - Form errors: shake animation + haptic feedback (`expo-haptics`).
- **Empty states:** illustrated, never just "No data."
- **Haptics on every meaningful tap** (light/medium/success/error).

---

## PHASE 3 — UX / QUALITY BAR

- **Onboarding:** 3-screen swipeable intro the first time the app opens.
- **Offline handling:** detect offline (`@react-native-community/netinfo`), show banner, queue mutations where reasonable.
- **Error boundaries:** every screen wrapped; friendly fallback UI with "Try again."
- **Toasts:** use `sonner-native` or `react-native-toast-message` for non-blocking feedback.
- **Accessibility:** every touchable has `accessibilityLabel`, dynamic text scaling supported, color contrast ≥ AA.
- **Performance:** `FlatList` with `getItemLayout` where possible, memoized list items, image caching, no inline functions in render hot paths.
- **Logging:** Sentry (`sentry-expo`) for production error tracking — wire up but make DSN optional via `.env`.

---

## PHASE 4 — CLAUDE'S SUGGESTED IMPROVEMENTS (IMPLEMENT THESE TOO)

You proposed I include your own ideas. Implement all of these as part of the build:

1. **AI-powered "Sommelier" chat** — a small chat bubble that lets users ask "what should I order at [restaurant]?" Backed by a single `/ai/recommend` call (mock client-side if backend doesn't support it yet).
2. **Loyalty / tier system** — Bronze / Silver / Gold / Platinum based on bookings & spend, shown on the profile with animated progress ring.
3. **Group bookings** — invite friends via shareable deep link (`expo-linking`), each confirms separately.
4. **Waitlist for fully-booked slots** — auto-notify when a table opens.
5. **QR check-in at the restaurant** — generates a QR on the booking screen 30 min before arrival.
6. **Receipt splitting** — split the bill among party members in the payment module.
7. **Dark mode that genuinely re-themes** (not just inverted colors).
8. **Skeleton screens + optimistic UI** on every mutation so the app feels instant.

---

## PHASE 5 — PROJECT STRUCTURE

```
app/                        # expo-router routes
  (auth)/                   # login, register, forgot
  (tabs)/                   # home, search, bookings, profile
  (admin)/                  # admin-only routes
  restaurant/[id].tsx
  booking/[id].tsx
components/
  ui/                       # Button, Input, Card, Skeleton, Toast...
  restaurant/
  booking/
  payment/
  review/
features/                   # one folder per module, with hooks + screens
hooks/
services/
  api.ts                    # typed client
  auth.ts
  storage.ts
store/                      # zustand stores
theme/
  colors.ts
  typography.ts
  spacing.ts
utils/
constants/
types/
```

---

## PHASE 6 — DELIVERABLES & RUN INSTRUCTIONS

At the end, provide:

1. **A single `README.md`** with:
   - One-command setup: `npm install && npx expo start`
   - How to scan the QR with Expo Go on iPhone.
   - `.env.example` listing `EXPO_PUBLIC_API_URL` (Render URL), Stripe keys, Sentry DSN.
   - Test credentials (admin + regular user).
2. **A `BACKEND_REPORT.md`** from Phase 0.
3. **A `CHANGELOG.md`** of every improvement you added.
4. **Type-check + lint clean:** `npm run typecheck` and `npm run lint` both pass.
5. **No console warnings** in Expo Go.

---

## EXECUTION RULES

- **Work in phases. Do not jump ahead.** After each phase, summarize what you did and what's next.
- **Ask before assuming.** If the backend contract is unclear, ask — don't invent fields.
- **Show me file trees before generating large files** so I can sanity-check structure.
- **When you finish, give me the exact commands to run on my Mac to start the app and open it in Expo Go on my iPhone.**
- **Production-ready means:** no TODOs, no placeholder strings, no dummy images, no commented-out code, no unhandled promise rejections.

---

## START HERE

Begin with **Phase 0**. First message back to me should be a list of questions: Render base URL, available API docs, Stripe test keys, admin test account, and any branding assets I want to share. Then proceed.

Build it like it's going on the App Store next week. Let's go. 🥂
