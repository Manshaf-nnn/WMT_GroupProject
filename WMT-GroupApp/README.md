# Maison · Luxury Restaurant Experience System

A production-grade React Native (Expo) mobile app + Node/Express + MongoDB backend, built for the **Luxury Restaurant Experience** brief.

> Visual identity: deep charcoal · champagne gold · ivory · burgundy. Light and dark modes, Playfair-style headings, generous space, gold detailing.

---

## What's in the box

**Six modules · full CRUD · live backend**

| # | Module | Highlights |
|---|---|---|
| 1 | Auth & Profile | Sign-up, login, forgot-password (with temp-password demo), Face ID / Touch ID, profile editor, dietary preferences, favorite cuisines, address book, change password, delete account |
| 2 | Discovery | Animated hero carousel, debounced search, filters (cuisine / price / min rating), sort, restaurant detail with photo gallery, menu, hours, reviews, Open in Maps, favorites |
| 3 | Booking | Date picker, animated time slots, party-size stepper, occasion, special requests, deposit flow, **QR check-in code**, cancel, group invite via share link |
| 4 | Payments (mocked) | Saved cards CRUD, default selection, deposit + full + tip, **bill splitting**, **PDF receipts** via expo-print, refunds |
| 5 | Reviews | 5-star rating, photo upload, food/service/ambience/value tags, edit, delete, helpful, report |
| 6 | Admin | Analytics dashboard with **animated count-ups + revenue sparkline**, manage restaurants, bookings, users (suspend/reactivate/delete), reviews (hide/delete) |

**Phase 4 extras shipped**

- **Sommelier AI chat** — restaurant-aware menu recommendations powered by `/api/ai/recommend`
- **Loyalty tiers** — Bronze / Silver / Gold / Platinum with animated progress ring (auto-calculated from spend)
- **Group bookings** — shareable invite link via `expo-linking` + Share API
- **Waitlist** — backend marks bookings as `waitlist` when capacity is exceeded
- **QR check-in** — generated SVG QR, activates 30 min before arrival
- **Receipt splitting** — split a bill 2-10 ways at payment time
- **Genuine dark mode** — every component uses theme tokens, not inverted colors
- **Skeleton screens + optimistic UI** on every mutation

**Quality bar**

- Onboarding (3-screen swipeable intro)
- Offline banner via `@react-native-community/netinfo`
- Error boundaries with friendly fallback
- Toasts for non-blocking feedback
- Haptics on every meaningful interaction
- Skeleton loaders while fetching
- Animated transitions (Reanimated v3)
- Pull-to-refresh on every list
- Friendly empty states

---

## Quick start (5 minutes)

You'll run two things: the **backend** (on your Mac) and **Expo Go** (on your iPhone). Both must be on the **same Wi-Fi network** (your iPhone hotspot also works).

### 1. Backend

```bash
cd WMT-GroupApp/backend
npm install
npm run dev      # listens on :5001 and auto-seeds 12 restaurants
```

You should see:
```
🚀 Maison API ready at: http://localhost:5001
✅ Connected to MongoDB successfully
🌱 Seeding Maison...
✅ Seeded 12 restaurants with menus & reviews
```

### 2. Find your Mac's LAN IP

```bash
ipconfig getifaddr en0     # Wi-Fi
# or
ipconfig getifaddr en1     # Ethernet/USB
```

Copy that IP — e.g. `192.168.1.10`.

### 3. Mobile app

```bash
cd WMT-GroupApp/mobile/frontend
echo "EXPO_PUBLIC_API_URL=http://<YOUR-MAC-IP>:5001/api" > .env
npm install
npx expo start
```

Press `s` to switch to Expo Go (if needed), then scan the QR with the **Camera app** on your iPhone (iOS 16+) or with the **Expo Go** app.

> **No QR scan available?** Open Expo Go on your phone, tap "Enter URL manually", and enter `exp://<YOUR-MAC-IP>:8081`.

---

## Test credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@luxury.com` | `admin1234` |
| **Guest (demo user)** | `guest@maison.com` | `guest1234` |
| Second guest | `james@maison.com` | `guest1234` |

The login screen has tap-to-fill chips for both Admin and Guest accounts.

---

## What to demo (golden path · 3 minutes)

1. **Onboarding** → swipe through, tap "Begin"
2. **Login** as Guest (use the chip)
3. **Home** → tap a featured restaurant
4. **Restaurant detail** → swipe the photo gallery, tap "Menu" tab, tap the gold sparkle icon to open the **Sommelier**
5. Ask the sommelier: *"romantic something with truffle"* — get a personalised recommendation
6. **Reserve** → pick date + 19:30 + 2 guests + add a note → "Continue to Payment" (deposit-required restaurants) or "Confirm" (others)
7. On the payment screen → toggle **Split** + add tip + tap **Pay**
8. Booking detail screen shows **QR check-in code** + animated entrance
9. Back to **Profile** → see your loyalty ring fill up + lifetime spend
10. Sign out, log in as **Admin**, open **Admin** tab → see analytics with sparkline + animated count-ups, then tap into Manage Restaurants to add or edit

---

## Project structure

```
WMT-GroupApp/
├── backend/
│   ├── src/
│   │   ├── models/        # User, Restaurant, Booking, Review, Payment
│   │   ├── controllers/   # auth, restaurant, booking, review, payment, admin, ai
│   │   ├── routes/        # /api/{auth,restaurants,bookings,reviews,payments,admin,ai}
│   │   ├── middleware/    # protect, admin
│   │   └── utils/         # autoSeed, generateToken
│   ├── .env               # MONGODB_URI, JWT_SECRET, PORT
│   └── package.json
├── mobile/frontend/
│   ├── App.js             # navigation root + providers
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Button, Input, Card, Skeleton, Stars, Tag, Header, Toast,
│   │   │   │              # ScreenContainer, LoyaltyRing, QRCode, Stepper, PriceTag,
│   │   │   │              # Avatar, Divider, EmptyState
│   │   │   ├── restaurant/    # RestaurantCard
│   │   │   ├── admin/         # Sparkline, CountUp
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── OfflineBanner.js
│   │   │   └── SommelierModal.js
│   │   ├── screens/
│   │   │   ├── auth/      # Login, Register, Forgot, Onboarding
│   │   │   ├── main/      # Home, Search, RestaurantDetail, Booking, BookingDetail,
│   │   │   │              # MyBookings, Review, MyReviews, Payment, PaymentMethods,
│   │   │   │              # PaymentHistory, Profile, EditProfile, Favorites,
│   │   │   │              # Addresses, Settings
│   │   │   └── admin/     # AdminDashboard, ManageRestaurants, ManageBookings,
│   │   │                  # ManageUsers, ManageReviews
│   │   ├── services/      # api, authService, storage (secure-store), config
│   │   ├── store/         # AuthContext
│   │   └── theme/         # colors, typography, spacing, dark-mode hook
│   ├── app.json           # Expo config (slug: luxury-restaurant-system, scheme: maison)
│   ├── .env               # EXPO_PUBLIC_API_URL
│   └── package.json
├── docs/
│   ├── api_endpoints.md   # legacy quick reference
│   └── ...
└── BACKEND_REPORT.md      # full Phase 0 backend audit
```

---

## Stack

**Backend:** Node 20 · Express 4 · Mongoose 9 · MongoDB Atlas · bcryptjs · jsonwebtoken · cors · morgan
**Mobile:** Expo SDK 54 (managed) · React 19 · React Native 0.81 · React Navigation 7 (native-stack + bottom-tabs) · Reanimated 3 · expo-image · expo-linear-gradient · expo-blur · expo-haptics · expo-secure-store · expo-image-picker · expo-clipboard · expo-print · expo-local-authentication · expo-linking · @react-native-community/netinfo · react-native-svg · lucide-react-native · axios

---

## Notes on production-readiness

**What's real:**
- Live backend on MongoDB Atlas, JWT-protected routes, bcrypt-hashed passwords, role-based access, full CRUD, automated seed
- Every screen hits the live API — no mock data
- Single-source-of-truth API client (`services/api.js`)
- Secure token storage (expo-secure-store, with AsyncStorage fallback for web)

**What's intentionally simulated:**
- **Stripe payments** — the project mocks the card-vault and charge flow client-side, since real Stripe needs an account, test keys, and an Expo dev build (not Expo Go). All card numbers stored are last-4 only, and "charges" are recorded in MongoDB as completed transactions.
- **Push notifications** — `expo-notifications` requires a custom dev build for production push. Not wired up.
- **Native maps** — `react-native-maps` is incompatible with Expo Go. Restaurant detail and booking screens use `expo-linking` to open Apple/Google Maps with the address.
- **Apple Calendar add-event** — same EAS-build constraint. The booking detail page provides a shareable group invite link instead.
- **AI sommelier** — backend serves curated, restaurant-aware recommendations (filtered + ranked by tags / keyword match against the menu). Easy upgrade to a real LLM via the existing `/api/ai/recommend` endpoint.

---

## Run scripts

**Backend:**
- `npm run dev` — nodemon, auto-restart
- `npm start` — production-mode start

**Mobile:**
- `npm start` — start Expo dev server
- `npx expo start` — same, with full options
- `npx expo export` — produce a static web bundle (for sanity-checking imports)

---

## Render redeploy

The Render service at `https://wmt-groupproject.onrender.com` is currently serving an older build. To redeploy with the latest code:

1. Push to `main`. Render's GitHub integration should auto-deploy if you've connected this repo.
2. If not connected, in your Render dashboard:
   - Set **Root Directory** to `WMT-GroupApp/backend`
   - Set **Build Command** to `npm install`
   - Set **Start Command** to `npm start`
   - Add the env vars from `backend/.env` (especially `MONGODB_URI` and `JWT_SECRET`)
3. After redeploy, change `EXPO_PUBLIC_API_URL` in `mobile/frontend/.env` to `https://wmt-groupproject.onrender.com/api` and restart Expo.

---

## License

Internal coursework project. © 2026 WMT Group.
