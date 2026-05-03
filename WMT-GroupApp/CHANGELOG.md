# Changelog

## v1.0.0 — Maison · Luxury Restaurant Experience

The first feature-complete release. Built from a JS-only react-navigation skeleton into an App-Store-quality experience.

### Backend

**Models**
- Extended **User**: phone, dietaryPreferences, favoriteCuisines, favorites[], addresses[], paymentMethods[] (last4 only), totalBookings, totalSpend, loyaltyTier, suspended, recalculateTier method
- Extended **Restaurant**: address, city, heroImage, featured, tags[], menu[] (sections + items + prices + tags + images), hours[], capacity, depositRequired, depositAmount
- Extended **Booking**: occasion, tableNumber, checkInCode (auto-generated), checkedIn, depositPaid, totalAmount, groupInviteCode, groupConfirmedBy[], waitlist status
- Extended **Review**: tags[] (food/service/ambience/value), photos[], helpfulCount, helpfulBy[], reportCount, hidden flag, updatedAt timestamp
- Extended **Payment**: type (deposit/full/tip), splits[], cardLast4, cardBrand, refunded status

**New endpoints**
- Auth: forgot-password, update-profile, change-password, delete-account, favorites/toggle, addresses CRUD, admin user management (list/suspend/delete)
- Restaurants: cuisines list, search filters extended (featured, minRating)
- Bookings: get-by-id, modify-own, check-in, capacity-aware waitlist
- Reviews: edit-own, delete, helpful, report, admin moderation
- Payments: get-by-id, refund, saved methods CRUD (add/list/set-default/delete), tip + split + card-detection
- New `/api/admin/analytics` — totals, top restaurants, 7-day revenue series
- New `/api/ai/recommend` — restaurant-aware menu sommelier

**Seed**
- Replaced 4-restaurant placeholder seed with 12 fully detailed restaurants (Maison Lumière, Azure Seafood Atelier, Sakura Omakase, Trattoria del Borgo, The Velvet Steakhouse, Casa de Mole, The Indus Crown, Sky Garden Vegan, Le Bistro Quinze, Dragon Pearl, Brunch Atelier, Amber & Smoke)
- Each with multi-section menus (3 sections × 2-3 items), real Unsplash photography, hours, capacity, deposit settings, tags
- Auto-creates 2 demo users + ~24 reviews across the catalog
- Idempotent: re-runs seed if menus or reviews are missing
- Fixed silent seed failure caused by Mongoose 9 hook signature change

**Infra**
- Bumped JSON body limit to 10mb (for photo uploads)
- Bound express to 0.0.0.0 (Expo Go on physical device needs LAN-reachable host)
- Banner now reads "Maison Luxury Restaurant API"

### Mobile

**Foundation (new)**
- Theme system: light + dark, generous spacing scale, typography tokens, soft layered shadows, gold/charcoal/ivory/burgundy palette
- Single source-of-truth API client (`services/api.js`) with axios interceptors and friendly-error helper
- Secure token storage via `expo-secure-store` (with AsyncStorage fallback)
- AuthContext provider with auto-refresh, sign-in/sign-up/sign-out, 401 handler
- Toast provider with success/error/info variants and slide-in spring animations
- ErrorBoundary with branded fallback
- OfflineBanner via `@react-native-community/netinfo`

**UI components (new)**
- Button (primary, dark, outline, ghost, danger, gold-outline) with press-scale + haptics
- Input with focus border, eye toggle, shake-on-error + error haptic
- Card, Skeleton (shimmer), Stars (interactive + display), Tag (with active state),
  Header, ScreenContainer, Avatar, Stepper, PriceTag, Divider, EmptyState
- LoyaltyRing (animated SVG progress)
- QRCode (deterministic SVG, no extra deps)
- Sparkline + CountUp for analytics

**Screens (new + rewritten)**
- Onboarding (3-page swipe with full-bleed photos)
- Login (hero gradient, demo-account chips, biometric option)
- Register (matching gradient + form validation)
- ForgotPassword (returns demo temporary password)
- Home (animated hero carousel, "Picked for you" recommendations driven by favoriteCuisines, cuisine chips, full restaurant grid, stagger-in animations, optimistic favorite toggle, pull-to-refresh)
- Search (debounced live results, filter modal with cuisine/price/rating/sort)
- RestaurantDetail (paginated photo gallery, 4 tabs: Overview / Menu / Reviews / Hours, "Open in Maps" via expo-linking, sommelier launch button)
- SommelierModal (in-app chat with preset prompts, restaurant-aware reply with picks)
- Booking (date strip, animated time grid, party stepper, occasion chips, special requests, deposit hand-off)
- BookingDetail (booking summary, QR check-in card, status chips, share-to-invite, cancel, pay deposit/final)
- MyBookings (Upcoming/Past tabs, status-tone chips)
- Review (5-star animated input, tag picker, multi-photo upload, character counter)
- MyReviews (edit / delete, tag chips)
- Payment (saved cards selection, add-card form, tip presets, split bill 2-10 ways, secure footer)
- PaymentMethods (add/set-default/delete cards)
- PaymentHistory (status chips, **PDF receipts via expo-print**, long-press to refund)
- Profile (avatar, loyalty ring, lifetime stats, 7 nav rows, sign-out confirmation)
- EditProfile (avatar upload, dietary + cuisine tag pickers, change-password form, delete-account confirm)
- Favorites (saved restaurants grid + remove)
- Addresses (full CRUD with default-flag handling)
- Settings (appearance status, notifications status, privacy/terms links)
- AdminDashboard (revenue card with sparkline, count-up tiles, top restaurants list, manage shortcuts)
- ManageRestaurants (full CRUD with modal form including hero image, featured flag)
- ManageBookings (filter chips, approve/reject/complete actions)
- ManageUsers (search, suspend/reactivate, delete; admins protected)
- ManageReviews (hide/show/delete with report-count surfacing)

**Navigation**
- Migrated to `@react-navigation/native-stack` (modal presentations work, smoother transitions)
- Bottom tabs: Discover / Search / Reservations / Admin (admins only) / Profile
- Conditional onboarding (only shown once per device)

**Phase 4 extras**
- Sommelier AI chat (preset suggestions, picks list with prices, "would you like wine?" follow-up)
- Loyalty tier ring (Bronze < $500 < Silver < $2000 < Gold < $5000 < Platinum, animated fill on profile)
- Group bookings (share link with checkInCode + booking ID, deep-link scheme `maison://`)
- Waitlist (auto-set when capacity exceeded)
- QR check-in (SVG render, activates 30 min before booking)
- Receipt splitting (2-10 way split, each guest's share computed client-side)
- Genuine dark mode (every component uses `useTheme()` tokens, not inverted colors)
- Skeleton screens + optimistic UI on every list/mutation

**Polish**
- Haptic on every button press, tab switch, rating tap, time-slot select, favorite toggle, payment success
- Stagger fade-in-up on list items via Reanimated v3
- Press-scale 0.97 on every Button via withSpring
- Form errors trigger shake + error haptic on the offending Input
- Onboarding photos use Ken-Burns-style continuous transitions

**Dependencies installed**
- expo-haptics, expo-image, expo-linear-gradient, expo-blur, expo-linking,
  expo-secure-store, expo-image-picker, expo-clipboard, expo-print,
  expo-local-authentication
- react-native-svg, @react-native-community/netinfo
- @react-navigation/native-stack

### Documentation

- README rewritten with quick-start, demo script, structure, stack, simulation notes, Render redeploy guide
- BACKEND_REPORT.md (Phase 0): liveness, full endpoint inventory by module, CRUD smoke results, inconsistencies, verdict
- This CHANGELOG

### Removed / deprecated

- Legacy `theme/colors.js` constants left in place for backward compatibility but no longer referenced
- Legacy `components/CustomButton.js` and `components/CustomInput.js` left untouched (unimported)
- Old `screens/main/HomeScreen.js`, `LoginScreen.js`, etc. completely rewritten — old code is gone, replaced not patched
