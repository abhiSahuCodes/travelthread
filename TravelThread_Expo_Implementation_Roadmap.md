# TravelThread — React Native Expo Implementation Roadmap
**Version:** 2.0 (Expo-Exclusive Rewrite)
**Status:** Active
**Last Updated:** June 2026
**Scope:** iOS 16+ · Android 13+ · Expo SDK 54

---

## How to Use This Document

This roadmap is written for AI-assisted code editors, CLI builders, and agentic coding tools.

**Protocol for every module:**
1. Read the module specification fully before writing a single line.
2. Implement only what the module defines — nothing beyond its boundary.
3. Run the acceptance criteria checklist top to bottom.
4. Verify interface contracts are intact (no prop renames, no endpoint mutations, no store shape changes).
5. Only after all criteria pass: proceed to the next module.

**Never** generate multiple modules in a single pass. **Never** refactor a completed module's public interface without updating every downstream module's spec first.

---

## Global Constants (Lock These Before Module 1)

These values are referenced by every module. Set them once; treat as immutable.

```typescript
// src/constants/theme.ts — established in MODULE 0
export const COLORS = {
  accent: { primary: '#7C3AED', light: '#EDE9FE' },
  surface: { white: '#FFFFFF', card: '#F8F7FF' },
  text: { primary: '#1A1A2E', secondary: '#64748B' },
  border: { default: '#E5E5E5' },
  status: { synced: '#22C55E', warning: '#F59E0B', error: '#EF4444' },
} as const;

export const SPACING = {
  pagePad: 16,
  cardPad: 14,
  section: 20,
  radius: { card: 16, button: 12, pill: 24 },
  buttonHeight: { primary: 56, secondary: 48 },
} as const;

// src/constants/api.ts
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL; // e.g. https://api.travelthread.app

// src/constants/cloudinary.ts
export const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

// src/constants/limits.ts — free tier enforcement
export const LIMITS = {
  photosPerPlace: 10,
  voiceNotesPerPlace: 3,
  voiceNoteMaxDurationSec: 300,
  syncQueueMaxRetries: 5,
  offlineTileMaxMB: 500,
} as const;
```

---

## Dependency Map (Install Once in MODULE 0)

All packages listed here are installed in MODULE 0. No module adds new dependencies without updating this list and confirming compatibility.

```
Core
  expo ~54.0.0
  react-native 0.74.x
  typescript 5.x

Navigation
  @react-navigation/native
  @react-navigation/native-stack
  @react-navigation/bottom-tabs
  react-native-screens
  react-native-safe-area-context

Maps
  @maplibre/maplibre-react-native

State
  zustand
  @tanstack/react-query

Database & Storage
  expo-sqlite
  expo-secure-store
  expo-file-system

Auth
  expo-auth-session
  expo-web-browser

Media
  expo-image-picker
  expo-av
  expo-sharing
  react-native-image-viewing
  react-native-view-shot

UI & Gestures
  @gorhom/bottom-sheet
  react-native-gesture-handler
  react-native-reanimated
  react-native-svg
  @expo-google-fonts/inter

Input & Pickers
  @react-native-community/datetimepicker
  @react-native-community/netinfo

Networking
  axios

Charts
  victory-native

Analytics & Fonts
  expo-font
  expo-location
  expo-notifications (install now, use in Phase 2)
```

---

## Module Dependency Graph

```
MODULE 0  ──► MODULE 1  ──► MODULE 2  ──► MODULE 3
(Scaffold)    (DB+Sync)     (API Client)  (Auth Backend)
                                              │
                                              ▼
                                          MODULE 4  ──► MODULE 5  ──► MODULE 6
                                         (Auth UI)    (Map+Trips)   (Place Detail)
                                                           │
                                                           ▼
                                                       MODULE 7  ──► MODULE 8
                                                      (Log/Write)   (Timeline)
                                                           │
                                                           ▼
                                                       MODULE 9  ──► MODULE 10
                                                      (Insights)    (Profile/Settings)
                                                           │
                                                           ▼
                                                       MODULE 11
                                                      (EAS + Release)
```

---

---

# MODULE 0 — Project Scaffold, Design System, Navigation Shell

**Build order:** 1 of 11
**Depends on:** Nothing
**Blocks:** All other modules

---

## Objective

Create a runnable Expo project with the full navigation skeleton, design system tokens, font loading, and empty screen stubs. Every subsequent module drops code into this scaffold — the shell never needs restructuring.

---

## Required Expo APIs & Libraries

| Package | Purpose |
|--------|---------|
| `expo` (SDK 51) | Base SDK |
| `@react-navigation/native`, `native-stack`, `bottom-tabs` | Navigation |
| `react-native-screens`, `react-native-safe-area-context` | Native nav dependencies |
| `@expo-google-fonts/inter` | Typography |
| `expo-font` | Font loading |
| `react-native-gesture-handler` | Required by bottom-sheet and navigation |
| `react-native-reanimated` | Animation baseline |
| `react-native-svg` | Icon/illustration base |
| `expo-secure-store` | Token presence check for auth gate |
| `zustand` | Global state |
| `@tanstack/react-query` | Server-state cache |

---

## Directory Structure (Establish Now, Do Not Alter Shape Later)

```
travelthread/
├── app.json
├── eas.json
├── babel.config.js
├── tsconfig.json
├── .env.local                        # EXPO_PUBLIC_* vars
│
├── src/
│   ├── constants/
│   │   ├── theme.ts                  # Colors, spacing, radius, button heights
│   │   ├── api.ts                    # API_BASE, endpoint strings
│   │   ├── cloudinary.ts             # Cloud name
│   │   └── limits.ts                 # Free-tier limits
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Auth gate → AuthStack | TabNavigator
│   │   ├── AuthStack.tsx             # Onboarding → SignIn/Up screens
│   │   ├── TabNavigator.tsx          # 5-tab bar
│   │   ├── MapStack.tsx              # Map tab nested navigator
│   │   ├── TimelineStack.tsx         # Timeline tab nested navigator
│   │   ├── InsightsStack.tsx         # Insights tab nested navigator
│   │   └── ProfileStack.tsx          # Profile tab nested navigator
│   │
│   ├── screens/                      # One file per screen (stubs in MODULE 0)
│   │   ├── auth/
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── AuthScreen.tsx
│   │   ├── map/
│   │   │   ├── WorldMapScreen.tsx
│   │   │   ├── TripDetailMapScreen.tsx
│   │   │   └── PlaceDetailSheet.tsx
│   │   ├── timeline/
│   │   │   ├── AllTripsTimelineScreen.tsx
│   │   │   └── TripPlacesTimelineScreen.tsx
│   │   ├── log/
│   │   │   ├── NewTripSetupScreen.tsx
│   │   │   └── LogPlaceScreen.tsx
│   │   ├── insights/
│   │   │   ├── StatsOverviewScreen.tsx
│   │   │   └── HeatmapScreen.tsx
│   │   └── profile/
│   │       └── ProfileSettingsScreen.tsx
│   │
│   ├── components/                   # Shared UI atoms/molecules
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Primary, secondary, ghost variants
│   │   │   ├── Text.tsx              # Typed typography wrapper
│   │   │   ├── Card.tsx              # Surface card with default radius/shadow
│   │   │   ├── Pill.tsx              # Tag/filter pill
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── SkeletonBox.tsx
│   │   │   └── EmptyState.tsx
│   │   └── layout/
│   │       ├── ScreenWrapper.tsx     # SafeAreaView + page padding
│   │       └── TabBarIcon.tsx        # Icon + label for tab bar
│   │
│   ├── store/                        # Zustand slices (contracts defined here)
│   │   ├── authStore.ts
│   │   ├── tripsStore.ts
│   │   ├── syncStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/
│   │   └── useColorScheme.ts         # System dark/light (ignored for v1 — light only)
│   │
│   └── types/
│       ├── navigation.ts             # All RootStackParamList types
│       └── models.ts                 # All entity type interfaces
```

---

## Navigation Type Contracts (Stable — Never Change These Param Names)

```typescript
// src/types/navigation.ts

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  AuthScreen: { initialTab?: 'login' | 'signup' };
  EmailVerifyPending: { email: string };
  ResetPassword: { token: string };
};

export type TabParamList = {
  Map: undefined;
  Timeline: undefined;
  Log: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type MapStackParamList = {
  WorldMap: undefined;
  TripDetailMap: { tripId: string };
  PlaceDetail: { placeId: string; tripId: string };
};

export type TimelineStackParamList = {
  AllTripsTimeline: undefined;
  TripPlacesTimeline: { tripId: string };
};

export type InsightsStackParamList = {
  StatsOverview: undefined;
  Heatmap: undefined;
};

export type ProfileStackParamList = {
  ProfileSettings: undefined;
  EditProfile: undefined;
  CustomFieldsManager: undefined;
};

// Log tab uses modal sheet stack, not a nested navigator:
export type LogModalParamList = {
  NewTripSetup: undefined;
  LogPlace: { tripId: string; placeId?: string };  // placeId = edit mode
};
```

---

## Global State Contracts (Zustand Slice Shapes — Stable)

```typescript
// src/store/authStore.ts
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile) => void;
  clearAuth: () => void;
}

// src/store/tripsStore.ts
interface TripsState {
  trips: Trip[];
  selectedTripId: string | null;
  setTrips: (trips: Trip[]) => void;
  upsertTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  setSelectedTripId: (id: string | null) => void;
}

// src/store/syncStore.ts
interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  queueCount: number;
  isOfflineModeEnabled: boolean;
  setSyncStatus: (status: SyncState['status']) => void;
  setQueueCount: (count: number) => void;
  toggleOfflineMode: () => void;
}

// src/store/uiStore.ts
interface UIState {
  activeBottomSheet: 'none' | 'placeDetail' | 'tripCard';
  setActiveBottomSheet: (sheet: UIState['activeBottomSheet']) => void;
}
```

---

## Entity Type Contracts (src/types/models.ts — Stable)

```typescript
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  homeCountry: string | null;
  defaultCurrency: string;
  dateFormat: 'DMY' | 'MDY' | 'YMD';
  passwordHash: boolean;       // true = credentials user; never send hash to client
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destinations: string[];      // ISO country codes
  coverPhotoUrl: string | null;
  startDate: string;           // ISO 8601
  endDate: string | null;
  tags: string[];
  introNote: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields from API
  placeCount?: number;
  centroid?: { latitude: number; longitude: number };
}

export interface Place {
  id: string;
  tripId: string;
  userId: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  visitedAt: string;           // ISO 8601
  loggedAt: string;
  notes: string | null;
  spendAmount: number | null;
  spendCurrency: string | null;
  category: PlaceCategory;
  customFields: Record<string, unknown>;
  visitOrder: number;
  createdAt: string;
  updatedAt: string;
  photos: PlacePhoto[];
  voiceNotes: PlaceVoiceNote[];
}

export type PlaceCategory =
  'Food' | 'Temple' | 'Hotel' | 'Nature' | 'Market' | 'Museum' | 'Other';

export interface PlacePhoto {
  id: string;
  placeId: string;
  cloudinaryId: string;
  remoteUrl: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  capturedAt: string | null;
  localUri?: string;           // present only before Cloudinary upload
}

export interface PlaceVoiceNote {
  id: string;
  placeId: string;
  cloudinaryId: string;
  remoteUrl: string;
  durationSec: number | null;
  displayOrder: number;
  localUri?: string;           // present only before Cloudinary upload
}

export interface CustomFieldDefinition {
  id: string;
  userId: string;
  name: string;
  fieldType: 'Text' | 'Number' | 'Dropdown' | 'EmojiPicker';
  options: string[];
  defaultValue: string | null;
  displayOrder: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  payload: Record<string, unknown>;
  localFiles: LocalFileRef[];
  retries: number;
  status: 'pending' | 'failed';
  createdAt: string;
}

export interface LocalFileRef {
  localUri: string;
  type: 'image' | 'audio';
  fieldName: string;           // key in payload to replace with cloudinaryId
}
```

---

## Tab Bar Specification

```
Tabs (left → right):
  Map       — compass icon, label "Map"
  Timeline  — clock icon, label "Timeline"
  Log       — violet filled 56pt circle, "+" icon, NO label, elevated shadow
  Insights  — chart icon, label "Insights"
  Profile   — person icon, label "Profile"

Active state:  accent.primary icon + label
Inactive:      slate-400 (#94A3B8) icon + label
Background:    surface.white
Top border:    1px #E5E5E5
Bottom inset:  useSafeAreaInsets().bottom
Log FAB:       backgroundColor: accent.primary, borderRadius: 28,
               shadow: elevation 8 / shadowRadius 12
```

---

## Auth Gate Logic (RootNavigator.tsx)

```
On app launch:
1. Check expo-secure-store for 'accessToken'
2. If present AND not expired (decode JWT exp claim, no library needed):
   → Navigate to Main (TabNavigator)
3. Else:
   → Navigate to Auth (AuthStack → Onboarding)
4. Do NOT make an API call during the auth gate check — read token only.
```

---

## Deep Link Configuration

```
Scheme: travelthread
Paths handled:
  travelthread://verify?token=<t>         → AuthStack → AuthScreen (email verify flow)
  travelthread://reset-password?token=<t> → AuthStack → ResetPassword
  travelthread://trip/:id                 → Main → MapStack → TripDetailMap
  travelthread://place/:id                → Main → MapStack → PlaceDetail
```

Add to `app.json`:
```json
"scheme": "travelthread",
"intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "travelthread" }] }]
```

---

## Acceptance Criteria — MODULE 0

- [ ] `npx expo start` launches without errors on both iOS Simulator and Android Emulator
- [ ] All 5 tabs render their stub screen (screen name displayed as `<Text>`)
- [ ] RootNavigator correctly routes unauthenticated launch → Onboarding stub
- [ ] RootNavigator correctly routes authenticated launch (token manually seeded in SecureStore) → WorldMap stub
- [ ] Inter font loads via `useFonts` before splash screen hides
- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [ ] Theme tokens import correctly from `src/constants/theme.ts`
- [ ] No circular imports
- [ ] `app.json` has `scheme: "travelthread"` set

---

---

# MODULE 1 — Local Database (expo-sqlite) + Sync Queue

**Build order:** 2 of 11
**Depends on:** MODULE 0 (types/models.ts, constants/limits.ts)
**Blocks:** MODULE 4 (offline writes), MODULE 5 (cached reads), MODULE 7 (offline place saving)

---

## Objective

Establish the local SQLite database schema, migration system, and sync queue. This is the device's source of truth when offline. All subsequent modules that read or write local data call the functions defined here — they never touch SQLite directly.

---

## Required Expo APIs & Libraries

| Package | Purpose |
|--------|---------|
| `expo-sqlite` | SQLite database |
| `@react-native-community/netinfo` | Connectivity detection for drain trigger |
| `expo-file-system` | Clear local media files on logout |

---

## Database Schema (SQLite DDL)

```sql
-- Managed by src/db/migrations.ts
-- Version tracked in user_version PRAGMA

CREATE TABLE IF NOT EXISTS trips (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  name            TEXT NOT NULL,
  destinations    TEXT NOT NULL,   -- JSON array of ISO codes
  cover_photo_url TEXT,
  start_date      TEXT NOT NULL,   -- ISO 8601
  end_date        TEXT,
  tags            TEXT NOT NULL,   -- JSON array
  intro_note      TEXT,
  is_archived     INTEGER NOT NULL DEFAULT 0,
  place_count     INTEGER DEFAULT 0,
  centroid_lat    REAL,
  centroid_lng    REAL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS places (
  id              TEXT PRIMARY KEY,
  trip_id         TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  name            TEXT NOT NULL,
  address         TEXT,
  latitude        REAL NOT NULL,
  longitude       REAL NOT NULL,
  visited_at      TEXT NOT NULL,
  logged_at       TEXT NOT NULL,
  notes           TEXT,
  spend_amount    REAL,
  spend_currency  TEXT,
  category        TEXT NOT NULL DEFAULT 'Other',
  custom_fields   TEXT NOT NULL DEFAULT '{}',  -- JSON
  visit_order     INTEGER NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS place_photos (
  id              TEXT PRIMARY KEY,
  place_id        TEXT NOT NULL,
  cloudinary_id   TEXT,
  remote_url      TEXT,
  thumbnail_url   TEXT,
  local_uri       TEXT,            -- non-null before upload
  display_order   INTEGER NOT NULL,
  captured_at     TEXT,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS place_voice_notes (
  id              TEXT PRIMARY KEY,
  place_id        TEXT NOT NULL,
  cloudinary_id   TEXT,
  remote_url      TEXT,
  local_uri       TEXT,            -- non-null before upload
  duration_sec    INTEGER,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  name            TEXT NOT NULL,
  field_type      TEXT NOT NULL,
  options         TEXT NOT NULL DEFAULT '[]',  -- JSON
  default_value   TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id              TEXT PRIMARY KEY,
  operation       TEXT NOT NULL,   -- CREATE | UPDATE | DELETE
  endpoint        TEXT NOT NULL,
  payload         TEXT NOT NULL,   -- JSON
  local_files     TEXT NOT NULL DEFAULT '[]',  -- JSON array of LocalFileRef
  retries         INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | failed
  created_at      TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_user       ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_places_trip      ON places(trip_id, visit_order);
CREATE INDEX IF NOT EXISTS idx_photos_place     ON place_photos(place_id, display_order);
CREATE INDEX IF NOT EXISTS idx_voice_place      ON place_voice_notes(place_id, display_order);
CREATE INDEX IF NOT EXISTS idx_queue_status     ON sync_queue(status, created_at);
```

---

## Public API Contract (src/db/index.ts)

These are the only functions other modules call. Internal implementation is opaque.

```typescript
// Lifecycle
export async function initDatabase(): Promise<void>
export async function clearDatabase(): Promise<void>    // call on logout

// Trips
export async function upsertTrips(trips: Trip[]): Promise<void>
export async function getTrips(): Promise<Trip[]>
export async function getTripById(tripId: string): Promise<Trip | null>
export async function deleteTrip(tripId: string): Promise<void>

// Places
export async function upsertPlaces(places: Place[]): Promise<void>
export async function getPlacesByTrip(tripId: string): Promise<Place[]>
export async function getPlaceById(placeId: string): Promise<Place | null>
export async function deletePlace(placeId: string): Promise<void>

// Photos
export async function upsertPhotos(photos: PlacePhoto[]): Promise<void>
export async function getPhotosByPlace(placeId: string): Promise<PlacePhoto[]>
export async function deletePhoto(photoId: string): Promise<void>

// Voice Notes
export async function upsertVoiceNotes(notes: PlaceVoiceNote[]): Promise<void>
export async function getVoiceNotesByPlace(placeId: string): Promise<PlaceVoiceNote[]>
export async function deleteVoiceNote(noteId: string): Promise<void>

// Custom Fields
export async function upsertCustomFieldDefs(defs: CustomFieldDefinition[]): Promise<void>
export async function getCustomFieldDefs(): Promise<CustomFieldDefinition[]>

// Sync Queue
export async function enqueueSync(item: Omit<SyncQueueItem, 'id' | 'retries' | 'status' | 'createdAt'>): Promise<string>
export async function getPendingSyncItems(): Promise<SyncQueueItem[]>
export async function updateSyncItem(id: string, patch: Partial<SyncQueueItem>): Promise<void>
export async function removeSyncItem(id: string): Promise<void>
export async function getSyncQueueCount(): Promise<number>
```

---

## Sync Engine (src/sync/SyncEngine.ts)

```typescript
// Public interface — called by NetInfo listener and manual retry
class SyncEngine {
  static async drain(): Promise<void>
  // 1. Get all pending sync_queue items ordered by created_at ASC
  // 2. For each item:
  //    a. Upload localFiles to Cloudinary (get signed params → POST to Cloudinary)
  //    b. Replace localUri refs in payload with cloudinaryId + remoteUrl
  //    c. POST/PATCH/DELETE to API endpoint
  //    d. On success: removeSyncItem + upsert returned entity to SQLite
  //    e. On failure: increment retries; if >= LIMITS.syncQueueMaxRetries mark FAILED
  // 3. Update syncStore.status throughout
}
```

**NetInfo integration (src/sync/useSyncOnReconnect.ts):**
```typescript
// React hook — mount once in RootNavigator
export function useSyncOnReconnect(): void {
  // NetInfo.addEventListener → on isConnected = true: SyncEngine.drain()
  // Update syncStore.status accordingly
}
```

---

## Acceptance Criteria — MODULE 1

- [ ] `initDatabase()` creates all tables on first run without error
- [ ] `initDatabase()` is idempotent — safe to call on subsequent launches
- [ ] `upsertTrips([])` with empty array does not throw
- [ ] `upsertTrips(trips)` followed by `getTrips()` returns the same trips
- [ ] `enqueueSync(item)` inserts a row; `getSyncQueueCount()` returns 1
- [ ] `removeSyncItem(id)` removes the row; count returns 0
- [ ] `clearDatabase()` removes all rows from all tables
- [ ] TypeScript: all exported functions have correct return types; no `any`
- [ ] No direct SQLite calls outside `src/db/`

---

---

# MODULE 2 — API Client + Auth Interceptor

**Build order:** 3 of 11
**Depends on:** MODULE 0 (constants/api.ts), MODULE 1 (syncStore pattern)
**Blocks:** MODULE 3 (auth endpoints), all feature modules

---

## Objective

Create a single Axios instance used by every module for all API calls. Implement the JWT refresh interceptor, offline-mode blocking interceptor, and Cloudinary signed-upload helper. No module creates its own fetch or Axios instance.

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `axios` | HTTP client |
| `expo-secure-store` | Read/write tokens |
| `@react-native-community/netinfo` | Offline-mode check |

---

## Secure Store Key Constants

```typescript
// src/constants/storage.ts — referenced by MODULE 2 and MODULE 3 only
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tt_access_token',
  REFRESH_TOKEN: 'tt_refresh_token',
  USER_PROFILE: 'tt_user_profile',
} as const;
```

---

## API Client Contract (src/api/client.ts)

```typescript
// Named export — import from here everywhere
export const apiClient: AxiosInstance

// Interceptor chain (executed in order):
// REQUEST:
//   1. Offline-mode check: if syncStore.isOfflineModeEnabled → reject with OfflineModeError
//   2. NetInfo check: if not connected → reject with NetworkError (do NOT block — let caller decide to queue)
//   3. Attach Authorization: Bearer <accessToken> from SecureStore

// RESPONSE (error):
//   4. On 401: call POST /api/auth/refresh with refreshToken from SecureStore
//   5. Store new accessToken in SecureStore
//   6. Retry original request once
//   7. If refresh fails (401 on refresh): call authStore.clearAuth() → navigate to Auth

export class OfflineModeError extends Error { name = 'OfflineModeError' }
export class NetworkError extends Error { name = 'NetworkError' }
```

---

## Cloudinary Upload Helper (src/api/cloudinary.ts)

```typescript
// Step 1: Get signed params from backend
export async function getImageUploadParams(): Promise<CloudinarySignedParams>
export async function getAudioUploadParams(): Promise<CloudinarySignedParams>

// Step 2: Upload file directly to Cloudinary
export async function uploadImageToCloudinary(
  localUri: string,
  params: CloudinarySignedParams,
  onProgress?: (percent: number) => void
): Promise<{ cloudinaryId: string; remoteUrl: string; thumbnailUrl: string }>

export async function uploadAudioToCloudinary(
  localUri: string,
  params: CloudinarySignedParams,
  onProgress?: (percent: number) => void
): Promise<{ cloudinaryId: string; remoteUrl: string; durationSec: number }>

// Thumbnail URL builder (no API call — pure string transform)
export function buildThumbnailUrl(
  cloudinaryId: string,
  width: number,
  height: number,
  crop: 'fill' | 'fit' = 'fill'
): string
// Returns: https://res.cloudinary.com/{CLOUD_NAME}/image/upload/w_{w},h_{h},c_{crop},q_auto,f_auto/{cloudinaryId}

interface CloudinarySignedParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
}
```

---

## API Endpoint Functions (src/api/endpoints/)

Each feature module has its own endpoint file. Define here which files exist and their function signatures. Modules only implement the ones they need.

```
src/api/endpoints/
  auth.ts          → MODULE 3
  trips.ts         → MODULE 5
  places.ts        → MODULE 5 + 7
  stats.ts         → MODULE 9
  search.ts        → MODULE 5
  export.ts        → MODULE 10
  customFields.ts  → MODULE 10
  users.ts         → MODULE 10
```

---

## Acceptance Criteria — MODULE 2

- [ ] `apiClient` attaches Bearer token on every request (unit test with mocked SecureStore)
- [ ] On 401, the interceptor calls refresh and retries the original request
- [ ] On refresh 401, `clearAuth()` is called (use jest mock)
- [ ] When `isOfflineModeEnabled = true`, `apiClient` rejects with `OfflineModeError`
- [ ] `buildThumbnailUrl` produces correct Cloudinary URL format for given dimensions
- [ ] `getImageUploadParams` calls `POST /api/upload/image` with auth header
- [ ] No `any` types in this module

---

---

# MODULE 3 — Backend (Next.js API) + Auth Endpoints

**Build order:** 4 of 11
**Depends on:** Neon DB, Prisma schema, Resend, `google-auth-library`, `bcryptjs`, `jsonwebtoken`
**Blocks:** MODULE 4 (auth UI needs real endpoints), all feature modules

---

## Objective

Build the Next.js API-only backend deployed to Vercel. Implement all auth endpoints, JWT token management, and the Cloudinary signed upload helpers. This is the server counterpart; it runs independently of the mobile app.

---

## Backend Project Structure

```
travelthread-api/               (separate repo or monorepo package)
├── prisma/
│   └── schema.prisma           (exact schema from PRD §8)
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── google/route.ts
│       │   ├── refresh/route.ts
│       │   ├── logout/route.ts
│       │   ├── forgot-password/route.ts
│       │   ├── reset-password/route.ts
│       │   └── verify-email/route.ts
│       ├── users/
│       │   └── me/route.ts
│       ├── upload/
│       │   ├── image/route.ts
│       │   └── audio/route.ts
│       ├── trips/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── places/
│       │           ├── route.ts
│       │           └── [pid]/route.ts
│       ├── stats/route.ts
│       ├── search/route.ts
│       ├── export/route.ts
│       ├── custom-fields/route.ts
│       └── health/route.ts     (Vercel cron keep-alive for Neon)
├── src/
│   ├── lib/
│   │   ├── prisma.ts           (singleton PrismaClient with Neon adapter)
│   │   ├── jwt.ts              (sign, verify, decode access + refresh tokens)
│   │   ├── hash.ts             (SHA-256 for token storage, bcrypt for passwords)
│   │   ├── cloudinary.ts       (sign upload params, delete asset)
│   │   ├── resend.ts           (sendVerificationEmail, sendPasswordResetEmail)
│   │   └── google.ts           (verifyGoogleIdToken)
│   └── middleware/
│       ├── auth.ts             (verifyJWT → req.userId)
│       └── rateLimit.ts        (10 req/min per IP on /api/auth/*)
├── vercel.json                 (cron: /api/health every 4 min)
└── .env.local
    # DATABASE_URL (Neon pooled)
    # DIRECT_URL (Neon direct, for migrations)
    # JWT_SECRET
    # REFRESH_TOKEN_SECRET
    # CLOUDINARY_CLOUD_NAME
    # CLOUDINARY_API_KEY
    # CLOUDINARY_API_SECRET
    # RESEND_API_KEY
    # GOOGLE_CLIENT_ID
```

---

## JWT Token Contracts

```typescript
// Access Token (JWT, 15 min)
interface AccessTokenPayload {
  sub: string;          // userId
  email: string;
  iat: number;
  exp: number;
}

// Refresh Token (opaque random string, 30 days)
// Stored in DB as SHA-256(rawToken)
// Never decoded — verified by DB lookup + expiry check

// Response shape from all auth endpoints that return tokens:
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;   // same shape as src/types/models.ts UserProfile
}
```

---

## Auth Endpoint Specs

### POST /api/auth/register
Request: `{ name, email, homeCountry, password, confirmPassword }`
- Validate all fields; reject if email already exists
- Hash password: `bcrypt(password, 12)`
- Create `User` in Neon
- Generate random email verification token; hash it; store in `VerificationToken` (type `EMAIL_VERIFICATION`, expires +24h)
- Send verification email via Resend
- Response: `{ message: "Check your inbox" }`
- **Do not return tokens yet** — user must verify email first

### POST /api/auth/login
Request: `{ email, password }`
- Find User by email
- If not found or `bcrypt.compare` fails → `{ error: "Invalid email or password" }` (401)
- If `emailVerified` is null → `{ error: "Please verify your email", code: "EMAIL_NOT_VERIFIED" }` (403)
- Generate access + refresh tokens; store SHA-256(refreshToken) in `RefreshToken` table
- Response: `AuthResponse`

### POST /api/auth/google
Request: `{ idToken: string }`
- Verify `idToken` with `google-auth-library` `OAuth2Client.verifyIdToken`
- Extract: `sub` (googleId), `email`, `name`, `picture`
- Find User by `googleId`, else find by `email`, else create new User
- If found by email: set `googleId` (account linking)
- Set `emailVerified = now()` if not set
- Generate tokens; Response: `AuthResponse`

### POST /api/auth/refresh
Request: `{ refreshToken: string }`
- SHA-256 hash the incoming token; look up in `RefreshToken` table
- If not found or expired → 401
- Delete old `RefreshToken` row (rotation)
- Generate new access + refresh tokens; store new SHA-256(refreshToken)
- Response: `{ accessToken, refreshToken }`

### POST /api/auth/verify-email
Request: `{ token: string }`
- SHA-256 hash token; find in `VerificationToken` where `type = EMAIL_VERIFICATION`
- If not found or expired → 400
- Set `User.emailVerified = now()`; delete token
- Generate auth tokens (user is now fully authenticated)
- Response: `AuthResponse`

### POST /api/auth/forgot-password
Request: `{ email: string }`
- Find User; if not found → return 200 anyway (no disclosure)
- Generate reset token; store SHA-256 in `VerificationToken` (type `PASSWORD_RESET`, expires +1h)
- Send reset email via Resend with deep link: `travelthread://reset-password?token=<raw>`
- Response: `{ message: "If that email exists, a reset link has been sent" }`

### POST /api/auth/reset-password
Request: `{ token: string; newPassword: string }`
- SHA-256 hash token; find in `VerificationToken` (type `PASSWORD_RESET`)
- If expired → 400 `{ error: "Reset link expired" }`
- Hash new password; update `User.passwordHash`; delete token
- Invalidate all existing `RefreshToken` rows for user (force re-login)
- Response: `{ message: "Password updated" }`

### POST /api/auth/logout
Request: `{ refreshToken: string }` (body, not cookie)
- SHA-256 hash; delete matching `RefreshToken` row
- Response: `{ message: "Logged out" }`

---

## Upload Endpoint Specs

### POST /api/upload/image
Auth required. Generates Cloudinary signed upload params.
```typescript
// Response:
{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;   // preset configured in Cloudinary dashboard: auto-quality, auto-format
  folder: string;         // `travelthread/${userId}/photos`
}
```

### POST /api/upload/audio
Same pattern. Cloudinary resource_type = "video" for audio files.
```typescript
// folder: `travelthread/${userId}/audio`
```

---

## Health Endpoint + Vercel Cron

```typescript
// GET /api/health
// Returns: { status: "ok", ts: <ISO> }
// Vercel cron: runs every 4 minutes to keep Neon compute warm
```

`vercel.json`:
```json
{
  "crons": [{ "path": "/api/health", "schedule": "*/4 * * * *" }]
}
```

---

## Acceptance Criteria — MODULE 3

- [ ] `POST /api/auth/register` → creates user, sends email, returns 200 with message (no tokens)
- [ ] `POST /api/auth/login` with correct credentials → returns `AuthResponse` with valid JWT
- [ ] `POST /api/auth/login` with wrong password → 401, generic message
- [ ] `POST /api/auth/google` with real Google idToken → creates or finds user, returns `AuthResponse`
- [ ] `POST /api/auth/refresh` rotates refresh token; old token rejected after rotation
- [ ] `POST /api/auth/reset-password` with expired token → 400
- [ ] All `/api/auth/*` routes reject >10 req/min from same IP with 429
- [ ] `GET /api/health` returns 200 with status "ok"
- [ ] Prisma schema migrated to Neon (`npx prisma db push` or `migrate deploy`)
- [ ] No Cloudinary API secret logged or returned to client
- [ ] All routes protected by `auth.ts` middleware return 401 without a valid access token

---

---

# MODULE 4 — Auth UI (Onboarding + Sign Up / Log In)

**Build order:** 5 of 11
**Depends on:** MODULE 0 (navigation, theme), MODULE 2 (apiClient), MODULE 3 (auth endpoints)
**Blocks:** MODULE 5 (requires authentication to reach)

---

## Objective

Implement P-00a Onboarding and P-00b Sign Up / Log In screens. Handle all auth flows: Google OAuth, email/password login, email registration, email verification, password reset.

---

## Required Expo APIs & Libraries

| Package | Purpose |
|--------|---------|
| `expo-auth-session` | Google OAuth flow |
| `expo-web-browser` | In-app browser for OAuth consent |
| `expo-secure-store` | Persist tokens post-auth |
| `expo-linking` | Handle deep links for verify + reset |

---

## Screen Specifications

### OnboardingScreen (P-00a)

```
Layout:
  Background: LinearGradient — #0F172A → #1E1B4B (deep navy)
  Position 0 (absolute, bottom 30%): world map SVG texture, opacity 0.08

  Carousel (3 cards, FlatList horizontal, pagingEnabled):
    Card 1: PinIcon + "Pin your places" + "Drop a pin every time you arrive somewhere new."
    Card 2: FilmIcon + "Relive every trip" + "Photos, voice notes, and stories — all in one place."
    Card 3: GlobeIcon + "See your world" + "A living map of everywhere you've ever been."

  Pagination dots: 8×8 circles, active = #7C3AED, inactive = rgba(255,255,255,0.3)
  Logo: "TravelThread" wordmark, white, size 24 weight 600, top center

  CTA button (primary): "Get started" → AuthScreen { initialTab: 'signup' }
  Text link below: "Already have an account? Log in" → AuthScreen { initialTab: 'login' }

Animations (react-native-reanimated):
  On card change: title + description fade in (opacity 0→1, translateY 8→0, 300ms)
```

### AuthScreen (P-00b)

```
Layout:
  White background
  Violet gradient pill at top for logo/wordmark
  Segmented control: "Log in" / "Sign up" (animated underline, not native control)

LOG IN TAB:
  "Continue with Google" button (Google logo + text, border style)
    → expo-auth-session Google OAuth flow
    → on success: POST /api/auth/google → store tokens → navigate Main
  Divider: "— or —"
  Email TextInput (keyboardType="email-address", autoCapitalize="none")
  Password TextInput (secureTextEntry, show/hide toggle)
  "Forgot password?" text link → show ForgotPasswordModal
  "Log in" primary button
    → POST /api/auth/login
    → on EMAIL_NOT_VERIFIED error: show "Resend verification email?" prompt
    → on success: store tokens → navigate Main

SIGN UP TAB:
  "Continue with Google" button (same as above)
  Divider
  Display name TextInput
  Email TextInput
  Home country: flag + country name picker (Modal FlatList of ISO countries)
  Password TextInput (show/hide, strength indicator: weak/fair/strong)
  Confirm Password TextInput
  "Create account" primary button → POST /api/auth/register → navigate EmailVerifyPending

EMAIL VERIFY PENDING screen:
  Envelope icon (violet)
  "Check your inbox" heading
  Subtext with email address shown
  "Resend email" text button (cooldown 60s)
  Deep link handler: travelthread://verify?token → POST /api/auth/verify-email → store tokens → navigate Main

FORGOT PASSWORD MODAL (bottom sheet):
  Email field
  "Send reset link" → POST /api/auth/forgot-password

RESET PASSWORD screen (deep-linked):
  New password + confirm password
  "Reset password" → POST /api/auth/reset-password → navigate AuthScreen { initialTab: 'login' }

VALIDATION (all inline, shown below field on blur):
  Email: RFC 5322 regex
  Password: min 8 chars + 1 number
  Confirm: must match password
  Name: min 2 chars
  Buttons disabled until all validations pass
```

---

## Auth State Management (src/store/authStore.ts — implement now)

```typescript
// On successful auth (any method):
await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
authStore.setUser(user);
// Navigate to Main — do via navigation ref, not inside store
```

---

## Google OAuth Configuration

```
Provider: Google
expo-auth-session flow:
  discovery: Google.discovery
  clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID (Web client ID from Google Cloud Console)
  responseType: ResponseType.IdToken
  scopes: ['openid', 'profile', 'email']
  On success: result.params.id_token → POST /api/auth/google

Note: For bare/EAS builds, also configure:
  Android clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID
  iOS clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS
```

---

## Acceptance Criteria — MODULE 4

- [ ] Onboarding carousel swipes between 3 cards with correct dot indicator
- [ ] "Get started" navigates to AuthScreen with signup tab active
- [ ] Valid email + password logs in, tokens stored in SecureStore, navigates to WorldMap stub
- [ ] Wrong credentials show "Invalid email or password" inline (no field specificity)
- [ ] Unverified email login shows resend prompt
- [ ] Registration flow sends to EmailVerifyPending screen showing the correct email
- [ ] Deep link `travelthread://verify?token=valid` verifies and navigates to WorldMap
- [ ] Deep link `travelthread://reset-password?token=valid` opens ResetPassword screen
- [ ] Google OAuth opens in-app browser and returns to app on completion
- [ ] All form buttons are disabled during API call (loading spinner shown)
- [ ] Logout from a later module clears SecureStore and returns to Onboarding

---

---

# MODULE 5 — Map Screens (P-01 World Map + P-02 Trip Detail Map)

**Build order:** 6 of 11
**Depends on:** MODULE 0–4 complete
**Blocks:** MODULE 6 (Place Detail opened from map)

---

## Objective

Implement the two map screens using MapLibre + OpenFreeMap tiles. Render trip pins, clustering, trip route, and bottom sheets.

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `@maplibre/maplibre-react-native` | Map renderer |
| `@gorhom/bottom-sheet` | Trip cards bottom sheet |
| `react-native-reanimated` | Pin pulse animation |
| `axios` (via apiClient) | Fetch trips + places |
| `expo-sqlite` (via db module) | Offline cache reads |

---

## MapLibre Configuration

```typescript
// src/config/mapStyle.ts
// OpenFreeMap base style URL (no API key):
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Custom cartographic overrides (apply after loading):
// land fill: #F5F0EB (warm off-white)
// water fill: #B8CDD9 (slate-blue)
// border stroke: #D4CCBE opacity 0.6
```

---

## API Endpoint Functions (src/api/endpoints/trips.ts)

```typescript
export async function fetchTrips(params?: { year?: number }): Promise<Trip[]>
// GET /api/trips?year=<year> (optional)
// Upserts result into SQLite after success

export async function fetchTripPlaces(tripId: string): Promise<Place[]>
// GET /api/trips/:tripId/places
// Upserts result into SQLite

export async function createTrip(data: CreateTripInput): Promise<Trip>
// POST /api/trips

export async function updateTrip(tripId: string, data: Partial<CreateTripInput>): Promise<Trip>
// PATCH /api/trips/:tripId

export async function deleteTrip(tripId: string): Promise<void>
// DELETE /api/trips/:tripId

export async function searchTrips(query: string): Promise<SearchResult[]>
// GET /api/search?q=<query>

interface CreateTripInput {
  name: string;
  destinations: string[];
  coverPhotoUrl: string | null;
  startDate: string;
  endDate: string | null;
  tags: string[];
  introNote: string | null;
}

interface SearchResult {
  type: 'trip' | 'place';
  id: string;
  name: string;
  tripId?: string;
  tripName?: string;
}
```

---

## P-01 World Map Screen Spec

```
Component: WorldMapScreen

Map layer stack (bottom → top):
  1. MapLibre MapView (full-bleed, style: MAP_STYLE_URL)
  2. ShapeSource (id="trips-source"): GeoJSON FeatureCollection of trip centroids
     - ClusterProperties enabled; clusterMaxZoom: 10; clusterRadius: 50
  3. SymbolLayer (id="trip-pins"):
     - unclustered: violet pin icon (custom SDF icon registered with MapLibre)
     - icon-size: 1.2 when selected, 1.0 default
  4. CircleLayer (id="clusters"):
     - circle-color: #7C3AED; circle-radius: 18+; circle-opacity: 0.9
  5. SymbolLayer (id="cluster-count"):
     - text-field: {point_count}; text-color: white
  6. Reanimated pulse overlay: when selectedTripId set, render animated violet ring

Floating elements (absolute positioned):
  Search bar (top, frosted glass effect):
    - TextInput → debounce 300ms → searchTrips(q) → show dropdown results
    - On result tap: navigate to TripDetailMap or PlaceDetail
  Year filter pills (below search, horizontally scrollable):
    - Generate from trip years; "All" + 2023 + 2022 + ...
    - Active pill: accent.primary background + white text

Bottom sheet (@gorhom/bottom-sheet):
  snapPoints: ['35%', '65%']
  handle: 32×4pt rounded grabber
  Content: "Your Trips" label + trip count badge
  Horizontal FlatList of TripCards:
    TripCard props:
      coverPhotoUrl: string | null
      name: string
      destinations: string[]   (flags)
      year: string
      width: 160, height: 100
      borderRadius: 12
      onPress: () => navigate TripDetailMap { tripId }
    "+" Card at end: dashed border → navigate NewTripSetup

On map pin tap:
  setSelectedTripId(tripId)
  Scroll bottom sheet FlatList to the tapped trip's card
  Sheet snaps to 35%

Data loading:
  On screen mount:
    1. Show trips from SQLite immediately (getTrips())
    2. Fetch from API (fetchTrips()); upsert to SQLite; re-render
  On year filter change: re-fetch with ?year= param; filter SQLite locally as optimistic
```

---

## P-02 Trip Detail Map Screen Spec

```
Component: TripDetailMapScreen
Navigation params: { tripId: string }

State:
  trip: Trip
  places: Place[]
  selectedPlaceId: string | null

Map layer stack:
  1. MapLibre MapView
     - Initial camera: fitBounds to all place coordinates (padding: 60pt)
  2. LineLayer (id="route"):
     - GeoJSON LineString connecting places in visitOrder
     - line-color: #7C3AED; line-width: 2; line-dasharray: [4, 3]
  3. SymbolLayer (id="place-pins"):
     - numbered pins: icon = violet circle with visitOrder digit
     - Selected: scale 1.3, pulsing ring

Header:
  Back arrow, trip name (truncated at 20 chars), ellipsis menu
  Menu options: "Edit trip" (→ NewTripSetup in edit mode), "Delete trip" (confirm dialog)

Bottom panel (fixed height 180pt):
  Stat chips row: "{n} places · {currency}{spend}"
  Horizontal FlatList of PlaceCards:
    PlaceCard props:
      photo: PlacePhoto | null (first photo)
      name: string
      summary: string | null (first 60 chars of notes)
      visitedAt: string (formatted time)
      width: 200, height: 100
      onPress: () => navigate PlaceDetail { placeId, tripId }
    Active card: violet left border 3pt

On pin tap: scroll FlatList to matching card; highlight card

Offline tile download:
  On first load of TripDetailMap for a trip:
    MapLibre.offlineManager.createPack({
      name: tripId,
      styleURL: MAP_STYLE_URL,
      bounds: [[minLng, minLat], [maxLng, maxLat]],
      minZoom: 1,
      maxZoom: 12,
    })
  Only if online and pack not already downloaded.
```

---

## Acceptance Criteria — MODULE 5

- [ ] Map renders OpenFreeMap tiles without API key errors
- [ ] Trip pins render at correct coordinates from SQLite cache
- [ ] Clustering activates when pins overlap at current zoom
- [ ] Selecting a pin highlights it and scrolls bottom sheet card into view
- [ ] Year filter pills filter visible trips
- [ ] Search bar calls API and shows dropdown with trip and place results
- [ ] TripDetailMap camera fits all trip's place coordinates on mount
- [ ] Dashed route line connects places in visitOrder
- [ ] Numbered pins match visitOrder
- [ ] Delete trip shows confirmation dialog; on confirm calls API + removes from SQLite + pops screen
- [ ] Offline: when SQLite has cached data, map renders without network

---

---

# MODULE 6 — Place Detail Sheet (P-03)

**Build order:** 7 of 11
**Depends on:** MODULE 0–5; expo-av; react-native-image-viewing; expo-sharing
**Blocks:** MODULE 7 (edit mode of LogPlace links here)

---

## Objective

Implement the full-screen Place Detail bottom sheet: photos, voice note playback, text notes, spend, custom fields, share card.

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `@gorhom/bottom-sheet` | Full-screen sheet with drag-dismiss |
| `react-native-image-viewing` | Photo lightbox |
| `expo-av` | Audio playback |
| `expo-sharing` | Share card export |
| `react-native-view-shot` | Capture share card as image |
| `react-native-reanimated` | Progress bar animation |

---

## Component Spec

```
Component: PlaceDetailSheet
Navigation: opened as a modal screen or via bottom sheet state
Props passed via navigation params: { placeId: string; tripId: string }

Data loading:
  1. Get from SQLite: getPlaceById(placeId)
  2. Fetch from API: GET /api/trips/:tripId/places/:placeId
  3. Merge + upsert to SQLite

Layout (scrollable, full-screen sheet):

─── Header ───────────────────────────────────────
  Drag handle (top center)
  Place name (size 24, weight 600)
  Breadcrumb: "<TripName> · <date formatted per User.dateFormat>"
  Location chip: mapPin icon + address text (or "lat, lng" if no address)
  Right: ••• menu → Edit | Delete | Share

─── Photo Gallery ────────────────────────────────
  Section label: "Photos" + count badge
  Horizontal FlatList (height 180pt):
    Each item: Cloudinary thumbnail (400×300 c_fill) in RoundedRect 12pt
    Tap: open react-native-image-viewing lightbox with all full-res URLs
    "+" button (if editing): triggers expo-image-picker

─── Voice Notes ──────────────────────────────────
  Section label: "Voice Notes" + count badge
  Horizontal FlatList of VoiceNotePills:
    VoiceNotePill:
      width: 200, height: 56
      background: surface.card
      border: 1px border.default
      borderRadius: 28
      Left: play/pause icon (violet circle 36pt)
      Middle: static waveform SVG (5 bars, varying heights, violet)
               + animated progress bar (width interpolates from 0 to pill width during playback)
      Right: duration label "0:42" (text.secondary, size 12)
      State: idle | loading | playing | paused
      Only one pill plays at a time (global audio state in uiStore)

Voice note audio management:
  Use expo-av Audio.Sound
  On play tap:
    - If another sound is playing: sound.pauseAsync() on the other
    - sound.loadAsync({ uri: remoteUrl }) if not loaded
    - sound.playAsync()
  On pause tap: sound.pauseAsync()
  Progress: sound.setOnPlaybackStatusUpdate → update progress state
  On finish: reset to idle, release sound object

─── Notes ────────────────────────────────────────
  Section label: "Notes"
  Text (size 15, lineHeight 1.7 × 15 = 25.5, color text.primary)
  If null: italic placeholder "No notes for this place"

─── Spend ────────────────────────────────────────
  Row: wallet icon | "Spent" label | amount + currency (accent.primary, size 17, weight 600)
  Hidden if spendAmount is null

─── Custom Fields ────────────────────────────────
  Card (surface.card, radius 16, padding 14):
    For each key in Place.customFields:
      Row: field name (text.secondary) | value (text.primary)

─── Visit Time ───────────────────────────────────
  Row: clock icon | formatted visitedAt per User.dateFormat
  Category chip: PlaceCategory pill (accent.light background, accent.primary text)

─── Actions ──────────────────────────────────────
  "Edit place" secondary button → navigate LogPlace { tripId, placeId }
  "Share memory" ghost button → generateAndShareCard()

Share Card generation:
  Use react-native-view-shot to capture a hidden View:
    Content: place cover photo (500×300) + place name + trip name + "TravelThread" wordmark + violet bottom strip
  Save to expo-file-system temp path
  expo-sharing.shareAsync(tempPath)
```

---

## Acceptance Criteria — MODULE 6

- [ ] Sheet opens and renders all place data fields
- [ ] Photo gallery loads Cloudinary thumbnails; tap opens lightbox
- [ ] Voice note pill shows correct duration label
- [ ] Tapping play starts audio from Cloudinary URL via expo-av
- [ ] Tapping a second pill pauses the first; starts the second
- [ ] Progress bar advances during playback in real time
- [ ] Share card captures and opens native share sheet
- [ ] Edit button navigates to LogPlace with placeId (edit mode)
- [ ] Custom fields render from Place.customFields JSON correctly
- [ ] Spend row hidden when spendAmount is null

---

---

# MODULE 7 — Log Screens (P-06 New Trip + P-07 Log Place)

**Build order:** 8 of 11
**Depends on:** MODULE 0–6; expo-location; expo-image-picker; expo-av; MODULE 1 (offline queue)
**Blocks:** MODULE 8 (timeline links to logged trips)

---

## Objective

Implement the two primary data-entry screens. P-06 creates a trip; P-07 logs a place with photos, voice notes, text, spend, and custom fields. Both must work fully offline.

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `expo-location` | GPS for "Use current location" |
| `expo-image-picker` | Camera + library photo selection |
| `expo-av` | Voice note recording |
| `@react-native-community/datetimepicker` | Date/time pickers |
| `@maplibre/maplibre-react-native` | Inline 120pt map preview |
| `expo-file-system` | Store offline media files |
| MODULE 1 `enqueueSync` | Write to offline queue |
| MODULE 2 `uploadImageToCloudinary`, `uploadAudioToCloudinary` | Media upload |

---

## Nominatim Reverse Geocoder (src/utils/geocoder.ts)

```typescript
// FREE — no API key. Rate limit: 1 req/sec — enforce with a 1.1s debounce
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ displayName: string; address: string } | null>
// GET https://nominatim.openstreetmap.org/reverse?lat=&lon=&format=json
// User-Agent header: 'TravelThread/1.0 (contact@travelthread.app)'  ← required by Nominatim ToS
```

---

## P-06 New Trip Setup Spec

```
Modal presentation (nav modal stack over current tab)
Header: "New trip" | Cancel (left) | Save (right, disabled until valid)

Fields:
1. Cover photo (16:9 ratio, 343×193pt):
   Placeholder: dotted border, camera icon, "Add cover photo" label
   On tap: expo-image-picker.launchImageLibraryAsync({ mediaTypes: 'Images', aspect: [16,9] })
   On pick: upload to Cloudinary → store URL in form state
   While uploading: show progress bar over preview

2. Trip name (required):
   TextInput, placeholder "e.g. Japan Spring 2025"

3. Destinations (tag input):
   TextInput → autocomplete from ISO 3166 country list (bundled JSON)
   Selected country shows flag emoji + country name pill (deletable)
   Multi-select allowed

4. Date range:
   Start date: @react-native-community/datetimepicker (DateTimePickerModal pattern)
   End date: same (must be >= start date)

5. Tags (Should priority):
   Chip multi-select: Adventure, Beach, Business, Culture, Family, Food, Nature, Solo
   Custom text input → add custom tag

6. Notes / intro:
   Multiline TextInput, placeholder "Write a brief intro for this trip..."

Save action:
  If online:
    POST /api/trips → upsert to SQLite → navigate LogPlace { tripId: newTrip.id }
  If offline:
    Write to SQLite immediately (generate local cuid for temp ID)
    Enqueue: { operation: CREATE, endpoint: /api/trips, payload: tripData }
    Navigate LogPlace { tripId: tempId }
```

---

## P-07 Log a Place Spec

```
Modal presentation (continues from P-06 modal stack, or FAB from any tab)
Header: "Log a place" | Cancel | Save (disabled until name + location valid)

─── Active Trip Banner ────────────────────────────
  Chip showing current trip name + flag
  "Change" link → sheet to select a different trip

─── Place Name ────────────────────────────────────
  TextInput (required), placeholder "Place name"

─── Location ──────────────────────────────────────
  "Use current location" button (violet ghost):
    1. expo-location.requestForegroundPermissionsAsync()
    2. expo-location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    3. reverseGeocode(lat, lng) → autofill place name if empty
    4. Show inline 120pt MapLibre preview with draggable pin
  Manual entry: lat/lng fields shown if GPS denied

  Inline map preview (120pt height, MapLibre):
    Shows single draggable pin
    On drag: update lat/lng form state

─── Photos ────────────────────────────────────────
  Label: "Photos (max 10)"
  Horizontal list of photo thumbnails (80×80pt, borderRadius 8)
  "+" button (dashed border): launchImageLibraryAsync or launchCameraAsync
  Tap-and-hold on thumbnail: remove photo
  Upload logic:
    If online: getImageUploadParams() → uploadImageToCloudinary()
    If offline: copy to FileSystem.documentDirectory + 'photos/' → store localUri in form state
  Progress indicator per photo

─── Voice Notes ───────────────────────────────────
  Label: "Voice notes (max 3)"
  Mic button (56pt violet circle, center):
    On tap start:
      expo-av Audio.requestPermissionsAsync()
      const recording = new Audio.Recording()
      recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      recording.startAsync()
      Show: animated waveform bars (react-native-reanimated, bars bounce from expo-av metering)
      Show: elapsed timer label
    On tap stop:
      recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      Add to voice notes list as pill (play preview before save)
      Upload logic: same offline/online split as photos

  Voice note pill (pre-save preview):
    Play/pause + delete button visible
    Duration label

─── Text Notes ────────────────────────────────────
  Multiline TextInput, placeholder "What made this place special?"
  Min height 100pt

─── Spend ─────────────────────────────────────────
  Row: currency symbol selector (defaults to User.defaultCurrency)
       numeric TextInput (keyboardType="decimal-pad")

─── Visit Time ────────────────────────────────────
  Auto-filled: new Date() on screen mount
  Tappable to open DateTimePicker (mode="datetime")

─── Category ──────────────────────────────────────
  Horizontal chip group (single select): Food · Temple · Hotel · Nature · Market · Museum · Other
  Active: accent.primary fill, white text

─── Custom Fields ─────────────────────────────────
  Render each CustomFieldDefinition (fetched from SQLite + API):
    Text → TextInput
    Number → TextInput (keyboardType="numeric")
    Dropdown → Picker/modal select
    EmojiPicker → horizontal emoji grid
  Values stored in customFields JSON object

─── Save ──────────────────────────────────────────
  If online:
    POST /api/trips/:tripId/places (with all field values)
    Photos + voice notes already have cloudinaryIds from background upload
    On success: upsert to SQLite; toast "Place saved ✓"; dismiss modal
  If offline:
    Write Place row to SQLite (temp cuid)
    Enqueue sync item with localFiles refs for all un-uploaded media
    Toast "Saved locally — will sync when online"
    Dismiss modal

Edit mode (placeId provided in nav params):
  Pre-fill all fields from SQLite getPlaceById(placeId)
  Save → PATCH /api/trips/:tripId/places/:placeId

Offline banner:
  If syncStore.isOfflineModeEnabled OR not connected:
    Yellow banner at top: "Offline mode — changes will sync on reconnect"
```

---

## Acceptance Criteria — MODULE 7

- [ ] "Use current location" requests permission, gets GPS, reverse-geocodes and fills place name
- [ ] Inline map preview renders MapLibre with draggable pin
- [ ] Photo picker opens camera or library; thumbnail shown after selection
- [ ] Mic button starts recording; waveform animates; stop adds pill to list
- [ ] Voice note pill allows play preview before save
- [ ] Online save: POST /api/trips/:tripId/places succeeds; toast shown
- [ ] Offline save: SQLite written immediately; sync queue item created; toast shown "Saved locally"
- [ ] On reconnect: SyncEngine.drain() processes the queued place + uploads media
- [ ] Edit mode pre-fills all fields from existing place data
- [ ] Custom fields render from user's CustomFieldDefinition list
- [ ] Max 10 photos and 3 voice notes enforced in UI
- [ ] Voice note max 5 min enforced (recording auto-stops at 300 seconds)

---

---

# MODULE 8 — Timeline Screens (P-04 + P-05)

**Build order:** 9 of 11
**Depends on:** MODULE 0–7
**Blocks:** MODULE 9 (Insights can proceed in parallel after MODULE 7)

---

## Objective

Implement the two timeline screens: the master trip list (P-04) and the per-trip place timeline (P-05).

---

## API Endpoint Additions

```typescript
// Already defined in trips.ts — confirm these signatures:
export async function fetchTripsTimeline(params?: {
  year?: number;
  tag?: string;
  country?: string;
  cursor?: string;    // cursor-based pagination
}): Promise<{ trips: Trip[]; nextCursor: string | null }>
// GET /api/trips?timeline=true&year=&tag=&country=&cursor=

export async function fetchTripPlaces(tripId: string): Promise<Place[]>
// Already defined in MODULE 5; reuse
```

---

## P-04 All Trips Timeline Spec

```
Component: AllTripsTimelineScreen

Header: "Timeline" (24pt) + filter icon (right)

Year filter pills (horizontal scroll, same pattern as P-01):
  "All" + unique years from trips; single-select

Filter bottom sheet (on filter icon tap):
  Year selector
  Tag multi-select chips
  Country tag input with flag pills

Data: TanStack Query with infinite scroll
  queryKey: ['trips-timeline', { year, tags, country }]
  queryFn: fetchTripsTimeline with cursor
  FlatList: onEndReached → fetchNextPage

Timeline list layout:
  Vertical 2pt violet line running through left edge (x=28pt)
  Each year group:
    StickyHeader: year label pill (accent.light background, accent.primary text, borderRadius 24)
  Each trip:
    ● Filled violet circle (14pt diameter, x=21pt) on the timeline line
    TripCard (left=44pt, right=16pt):
      Cover photo (full width, 120pt height, borderRadius 12, top)
      Trip name (17pt, weight 600)
      Duration chip: "7 days · Apr 12–19"
      Flag emojis (first 3 destinations) + country names
      One-liner summary (first 80 chars of introNote, text.secondary)
      3 place thumbnails (48×48pt, overlap –8pt, borderRadius 8) + "+N more" if >3

Empty state:
  World illustration SVG (violet tones)
  "Your trips will appear here"
  "Log your first trip" primary button → navigate NewTripSetup

Skeleton loaders (while fetching):
  5 placeholder cards with animated shimmer (react-native-reanimated)
```

---

## P-05 Trip Places Timeline Spec

```
Component: TripPlacesTimelineScreen
Params: { tripId: string }

Header: back arrow | trip name | share icon (→ expo-sharing: share trip summary text)

Trip metadata bar:
  Start date – end date | flag emojis | country names | total days label

Timeline (vertical, scrollable FlatList):
  Line: 2pt violet, left=28pt
  Day divider: "Day 2 · April 15" (sticky: false — insert as list items)
  Each place:
    ● Violet circle node
    Timestamp label beside node (visitedAt time, text.secondary)
    PlaceCard:
      Hero photo (first photo, 343×160pt, borderRadius 12)
      Place name (17pt, weight 600)
      Spend chip: "{currency}{amount}" (accent.light pill, only if spendAmount set)
      Category chip
      Voice note badge: 🎙 {count} (only if voiceNotes.length > 0)
      First 80 chars of notes (text.secondary)
      On tap: navigate PlaceDetail { placeId, tripId }

Day divider logic:
  Group places by date(visitedAt); insert day divider before each new day group

FAB "+ Add place" (Should priority):
  Violet circle FAB, bottom right
  → navigate LogPlace { tripId }
```

---

## Acceptance Criteria — MODULE 8

- [ ] P-04 renders trips in reverse chronological order grouped by year
- [ ] Year sticky headers appear correctly without covering adjacent content
- [ ] Year filter pills filter the timeline in real time
- [ ] Infinite scroll loads next page on reaching list end
- [ ] 3 place photo thumbnails show per trip card; "+N more" shown when >3
- [ ] Empty state renders with CTA when no trips exist
- [ ] Skeleton loaders shown during initial fetch
- [ ] P-05 renders all places in visitOrder with correct day dividers
- [ ] Voice note badge only shows on places that have voice notes
- [ ] Tapping a place card opens PlaceDetail sheet
- [ ] All Cloudinary thumbnail URLs use the 400×300 c_fill transform string

---

---

# MODULE 9 — Insights Screens (P-08 Stats + P-09 Heatmap)

**Build order:** 10 of 11 (can be built in parallel with MODULE 8)
**Depends on:** MODULE 0–7
**Blocks:** MODULE 10 (Profile can proceed independently)

---

## Objective

Implement the two insights screens: aggregate stats (P-08) and the world heatmap with ranked country list (P-09).

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `victory-native` | Bar chart + progress bars |
| `@maplibre/maplibre-react-native` | Heatmap FillLayer |
| `react-native-view-shot` | Export heatmap as image |
| `expo-sharing` | Share heatmap export |

---

## API Endpoint

```typescript
// src/api/endpoints/stats.ts
export async function fetchStats(): Promise<StatsPayload>
// GET /api/stats
// Backend computes:
//   - countryCount: COUNT DISTINCT destinations
//   - tripCount: COUNT trips
//   - placeCount: COUNT places
//   - daysTraveling: SUM (endDate - startDate) in days
//   - kmCovered: SUM Haversine(consecutive places in each trip)
//   - spendByCurrency: { USD: 1200, EUR: 340, ... }
//   - tripsByYear: [{ year: 2024, count: 3 }, ...]
//   - topCountries: [{ code: 'JP', name: 'Japan', tripCount: 4, visitCount: 12 }]
//   - visitedCountryCodes: string[]  ← for heatmap

interface StatsPayload {
  countryCount: number;
  tripCount: number;
  placeCount: number;
  daysTraveling: number;
  kmCovered: number;
  spendByCurrency: Record<string, number>;
  tripsByYear: Array<{ year: number; count: number }>;
  topCountries: Array<{ code: string; name: string; tripCount: number; visitCount: number }>;
  visitedCountryCodes: string[];
}
```

---

## Backend: /api/stats Haversine Query

```sql
-- Approximate km calculation via Haversine formula in Postgres:
-- Run as a Prisma $queryRaw for each user's places ordered by trip + visitOrder
-- Sum distances between consecutive places within same trip
```

---

## P-08 Stats Overview Spec

```
Component: StatsOverviewScreen

Loading: skeleton shimmer on all cards while fetching

Hero banner:
  Gradient background (accent.primary → #5B21B6)
  Text: "You've explored {n} countries across {m} trips"
  Font: 22pt, white, weight 600

2×2 Metric Grid:
  Card 1: Places visited — large number (48pt, weight 700) + label (12pt, text.secondary)
  Card 2: Days traveling
  Card 3: Km covered (formatted with toLocaleString)
  Card 4: [blank or "multi-currency" note if > 1 currency]
  Card background: surface.card, radius 16, shadow: elevation 2

"Trips by Year" bar chart (victory-native VictoryBar):
  violet bars (#7C3AED)
  x-axis: years
  y-axis: trip count (integer ticks)
  NO green anywhere in chart
  Chart background: white card

"Top Destinations":
  Ranked list (top 5 countries):
    Rank number | flag emoji | country name | "{n} trips" | violet progress bar
  Progress bar width = (tripCount / maxTripCount) × available width

Spend Totals:
  One row per currency: "{symbol}{amount} {code}"
  Text.secondary label "Total logged spend"

Rule: No green element on this screen (aside from status chip not present here).
```

---

## P-09 Heatmap Screen Spec

```
Component: HeatmapScreen

Full-width MapLibre map:
  Same style as P-01 (OpenFreeMap)
  Natural Earth GeoJSON (bundled: assets/geo/ne_110m_countries.geojson, ~350KB gzipped)
  FillLayer (id="country-heatmap"):
    fill-color: interpolate expression based on visit count:
      0 → transparent
      1 → rgba(124, 58, 237, 0.15)
      2–3 → rgba(124, 58, 237, 0.35)
      4–6 → rgba(124, 58, 237, 0.55)
      7+ → rgba(124, 58, 237, 0.80)
    filter: match feature.ISO_A2 against visitedCountryCodes

Segmented tab below map: Countries | Continents (Cities deferred to v1.1)

Color scale legend strip:
  Horizontal, 5 stops from light violet to dark violet
  Labels: "1 visit" → "7+ visits"

Ranked country list (FlatList below legend):
  Each row: rank number | flag | country name | visit count pill | proportional violet bar

Export button (bottom):
  "Export as image" → react-native-view-shot captures full HeatmapScreen → expo-sharing.shareAsync()
  Toast "Image saved" on success
```

---

## GeoJSON Bundling Note

```
File: assets/geo/ne_110m_countries.geojson
Source: Natural Earth (public domain) — https://www.naturalearthdata.com/
Resolution: 110m (lower = smaller file, acceptable for world-overview heatmap)
Estimated size: ~750KB raw, ~350KB gzipped (acceptable for app bundle)
Add to app.json assets array: "assets/geo/ne_110m_countries.geojson"
Load via: require('../../../assets/geo/ne_110m_countries.geojson')
```

---

## Acceptance Criteria — MODULE 9

- [ ] Stats screen shows correct hero country + trip counts matching API response
- [ ] 2×2 metric grid renders all four stats with correct formatting
- [ ] Bar chart renders with violet bars; no green color present anywhere on screen
- [ ] Top 5 countries list renders with progress bars
- [ ] Heatmap screen loads GeoJSON from bundled asset without network
- [ ] Countries in visitedCountryCodes appear with violet fill; unvisited are transparent
- [ ] Color intensity increases with higher visit counts
- [ ] Export captures heatmap and opens native share sheet
- [ ] Segmented tab switches between Countries and Continents views

---

---

# MODULE 10 — Profile & Settings (P-10)

**Build order:** 11 of 11
**Depends on:** MODULE 0–9
**Blocks:** Nothing (final module before release prep)

---

## Objective

Implement the full Profile & Settings screen: account management, sync status, offline toggle, data export, custom fields CRUD, and account deletion.

---

## Required Libraries

| Package | Purpose |
|--------|---------|
| `expo-image-picker` | Avatar photo update |
| `expo-file-system` | Clear local files on logout/delete |
| MODULE 1 `clearDatabase` | Logout data clear |
| MODULE 2 `apiClient` | All settings API calls |

---

## API Endpoints

```typescript
// src/api/endpoints/users.ts
export async function fetchMe(): Promise<UserProfile>
// GET /api/users/me

export async function updateMe(data: UpdateMeInput): Promise<UserProfile>
// PATCH /api/users/me

export async function deleteAccount(): Promise<void>
// DELETE /api/users/me (cascades: DB + Cloudinary)

export async function exportData(): Promise<{ downloadUrl: string }>
// GET /api/export → returns presigned URL or JSON blob download link

interface UpdateMeInput {
  name?: string;
  image?: string;       // Cloudinary URL after upload
  homeCountry?: string;
  defaultCurrency?: string;
  dateFormat?: 'DMY' | 'MDY' | 'YMD';
}

// src/api/endpoints/customFields.ts
export async function fetchCustomFieldDefs(): Promise<CustomFieldDefinition[]>
// GET /api/custom-fields

export async function createCustomFieldDef(data: Omit<CustomFieldDefinition, 'id' | 'userId' | 'createdAt'>): Promise<CustomFieldDefinition>
// POST /api/custom-fields

export async function deleteCustomFieldDef(id: string): Promise<void>
// DELETE /api/custom-fields/:id

// src/api/endpoints/auth.ts (add logout)
export async function logout(refreshToken: string): Promise<void>
// POST /api/auth/logout

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>
// POST /api/auth/change-password (add this endpoint to backend in MODULE 10)
```

---

## P-10 Profile & Settings Spec

```
Component: ProfileSettingsScreen (ScrollView)

─── Profile Card ──────────────────────────────────
  Avatar (72×72pt, borderRadius 36):
    If User.image: Cloudinary URL (rendered with expo-image or Image)
    Else: initials in violet circle (first + last initial, white text, 24pt)
  Name (17pt, weight 600)
  Email (14pt, text.secondary)
  "Edit profile" → EditProfileScreen

─── Stat Row ──────────────────────────────────────
  3 columns (equal width): Trips | Places | Countries
  Number (24pt, weight 700, accent.primary)
  Label (12pt, text.secondary)

─── Sync Status ───────────────────────────────────
  Chip with icon:
    "Synced · 2m ago" — green (#22C55E) dot + text (this is the ONLY green element in app)
    "Syncing…" — amber dot + pulsing animation
    "Error — tap to retry" — red dot, tappable → SyncEngine.drain()
  Queue count: "3 items pending" shown in amber state

─── Offline Mode Toggle ──────────────────────────
  Row with label "Offline mode" + sub-label "Block all network requests"
  Switch (right): accent.primary when on
  On toggle: syncStore.toggleOfflineMode()
  Persistent banner appears when on (amber, full width)

─── Account Settings ─────────────────────────────
  List rows (border bottom separators):
  "Change password" (only if User.passwordHash is true) → ChangePasswordScreen
  "Default currency" → inline picker or modal
  "Date format" → segmented: DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD

─── Data ─────────────────────────────────────────
  "Export my data" → GET /api/export → open download URL in expo-linking or share via expo-sharing
  Note: ZIP contains all trip/place JSON + Cloudinary asset URLs

─── Custom Fields Manager ────────────────────────
  "Manage custom fields" → CustomFieldsManagerScreen:
    List of CustomFieldDefinition rows (name, type badge)
    Swipe-to-delete (react-native-gesture-handler)
    "+" button → AddCustomFieldSheet:
      Field name TextInput
      Field type picker: Text | Number | Dropdown | EmojiPicker
      If Dropdown: add options (tag input)
      Default value TextInput
      Save → POST /api/custom-fields → upsert to SQLite

─── About ────────────────────────────────────────
  "Help center" → WebView of help URL
  "Rate the app" → expo-linking to App Store / Play Store URL
  "Privacy Policy" → expo-linking or in-app WebView
  App version label (Expo Constants.expoConfig.version)

─── Danger Zone ──────────────────────────────────
  "Log out" (warm red text, ghost button):
    Alert confirm → POST /api/auth/logout (with refresh token)
    clearDatabase() + FileSystem clear + SecureStore clear + authStore.clearAuth()
    Navigate to OnboardingScreen (reset navigation stack)

  "Delete account" (warm red filled button):
    Two-step confirmation dialog:
      Step 1: "This will permanently delete all your data. Type DELETE to confirm."
      Step 2: Final confirm → DELETE /api/users/me
    Backend cascades: all DB rows + all Cloudinary assets deleted
    On success: same clearance as logout → navigate Onboarding
```

---

## Edit Profile Screen Spec

```
Component: EditProfileScreen

Avatar:
  Current avatar displayed (72pt)
  "Change photo" tap → expo-image-picker → upload to Cloudinary → update form state

Fields:
  Display name TextInput (pre-filled)
  Home country flag picker (same component as signup)

Save → PATCH /api/users/me → update authStore.user → pop screen
```

---

## Change Password Screen Spec

```
Only shown to credentials users (User.passwordHash === true)
Fields:
  Current password (secureTextEntry)
  New password (secureTextEntry, strength indicator)
  Confirm new password
Save → POST /api/auth/change-password
  Backend: verify current password with bcrypt, update hash, revoke all refresh tokens
```

---

## Acceptance Criteria — MODULE 10

- [ ] Profile card shows avatar (Cloudinary) or initials fallback
- [ ] Stat row shows correct trip/place/country counts
- [ ] Sync status chip shows green "Synced" when queue is empty and last sync was recent
- [ ] Sync status shows amber with queue count when items are pending
- [ ] Tapping error status chip triggers SyncEngine.drain()
- [ ] Offline mode toggle blocks API calls (OfflineModeError) when enabled
- [ ] Persistent amber banner shown when offline mode is on
- [ ] "Change password" row hidden for Google-only accounts
- [ ] Custom fields manager: create, view, delete all work
- [ ] Logout clears all SecureStore keys, SQLite, and file-system media; navigates to Onboarding
- [ ] Account deletion: requires two-step confirmation; calls DELETE /api/users/me; clears everything
- [ ] Data export opens a downloadable link or share sheet

---

---

# MODULE 11 — EAS Build Configuration + Pre-Release Checklist

**Build order:** 12 of 12 (final)
**Depends on:** All modules complete and passing acceptance criteria

---

## Objective

Configure EAS Build for iOS (TestFlight) and Android (Internal Testing Track). Verify app performance, accessibility, and free-tier compliance before release.

---

## EAS Configuration (eas.json)

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "ios": { "buildConfiguration": "Release" },
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "", "ascAppId": "", "appleTeamId": "" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json" }
    }
  }
}
```

**Note on free tier:** EAS Build gives 15 builds/month free. Use `eas build --local` during active development sprints to preserve the cloud quota for production builds.

---

## app.json Required Fields

```json
{
  "expo": {
    "name": "TravelThread",
    "slug": "travelthread",
    "version": "1.0.0",
    "scheme": "travelthread",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "app.travelthread",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "TravelThread uses your location to log where you are.",
        "NSMicrophoneUsageDescription": "TravelThread uses the microphone to record voice notes.",
        "NSPhotoLibraryUsageDescription": "TravelThread accesses your photo library to attach photos to places.",
        "NSCameraUsageDescription": "TravelThread uses the camera to take photos for places."
      }
    },
    "android": {
      "package": "app.travelthread",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "RECORD_AUDIO",
        "READ_MEDIA_IMAGES",
        "CAMERA"
      ],
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "travelthread" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-location",
      ["expo-av", { "microphonePermission": "Allow TravelThread to access the microphone." }],
      "expo-image-picker",
      "@maplibre/maplibre-react-native"
    ],
    "assets": ["assets/geo/ne_110m_countries.geojson", "assets/fonts/"],
    "extra": { "eas": { "projectId": "<your-eas-project-id>" } }
  }
}
```

---

## Pre-Release Checklist

### Performance
- [ ] Cold start measured on Pixel 6a (mid-range Android): < 2 seconds
- [ ] Map renders from cached tiles in < 500ms
- [ ] Place save (online) round-trip measured: < 600ms
- [ ] Cloudinary photo upload (5MB on LTE simulator): < 4 seconds

### Accessibility
- [ ] All interactive elements have `accessibilityLabel` set
- [ ] All buttons have `accessibilityRole="button"`
- [ ] Font scaling tested at iOS "Larger Text" setting — no clipping
- [ ] VoiceOver (iOS): complete auth flow navigable by voice
- [ ] TalkBack (Android): complete auth flow navigable by voice
- [ ] Colour contrast ratio ≥ 4.5:1 for all body text (verify with Figma or contrast checker)

### Free Tier Verification
- [ ] Cloudinary: confirm upload preset exists; test signed upload flow end-to-end
- [ ] Neon: connection string is pooled (uses PgBouncer endpoint); migrations applied
- [ ] Vercel: cron job visible in dashboard; /api/health returns 200
- [ ] Resend: domain verified; test email sends successfully
- [ ] OpenFreeMap: tiles load without 403/429 errors
- [ ] EAS Build: project linked; production build succeeds for both platforms

### Security
- [ ] No API secrets in app bundle (`strings` scan on .ipa / .aab)
- [ ] Refresh token in SecureStore cannot be read by other apps (verify on real device)
- [ ] Rate limiting on /api/auth/* verified (hit 11th request in 1 minute → 429)
- [ ] JWT expiry enforced: expired access token triggers refresh flow

### Deep Links
- [ ] `travelthread://verify?token=x` opens app from email client
- [ ] `travelthread://reset-password?token=x` opens app from email client
- [ ] `travelthread://trip/id` navigates to correct TripDetailMap
- [ ] `travelthread://place/id` navigates to correct PlaceDetail

---

---

## Appendix A — Open Question Resolutions (For This Roadmap)

| OQ | Resolution |
|----|-----------|
| OQ1 | Use OpenFreeMap liberty style; override land/water colors via MapLibre style JSON patch in MODULE 5 |
| OQ2 | Free tier limits (5 trips / 50 places) deferred to v1.1 — not enforced in v1.0 MVP |
| OQ3 | Signed uploads confirmed — implemented in MODULE 3 backend + MODULE 2 Cloudinary helper |
| OQ4 | Use m4a format (native iOS); Android records aac within m4a container via expo-av HIGH_QUALITY preset |
| OQ5 | Modal bottom sheet stack (preserves background tab scroll state) — confirmed in MODULE 7 |
| OQ6 | Bundle GeoJSON in app assets (350KB gzipped) — implemented in MODULE 9 |
| OQ7 | Vercel cron every 4 minutes for /api/health — implemented in MODULE 3 |
| OQ8 | expo-secure-store for tokens; SHA-256 hash in DB — implemented in MODULE 3 |
| OQ9 | Text + Number + Dropdown + EmojiPicker all included in v1 (schema already supports all four) |
| OQ10 | Immediate Cloudinary deletion on account delete via Admin API bulk destroy — MODULE 10 |
| OQ11 | `eas build --local` for dev sprints; cloud builds for TestFlight + Play Internal Track |
| OQ12 | Nominatim with User-Agent header + 1.1s debounce — implemented in MODULE 7 |

---

## Appendix B — API Backend Routes Implementation Order

Routes must be implemented in the backend before the module that consumes them.

| Route | Needed by Module |
|-------|----------------|
| /api/auth/* (all 8 routes) | MODULE 3 → MODULE 4 |
| /api/upload/image, /api/upload/audio | MODULE 3 → MODULE 7 |
| /api/trips (GET, POST) | MODULE 5 |
| /api/trips/:id (GET, PATCH, DELETE) | MODULE 5 |
| /api/trips/:id/places (GET, POST) | MODULE 5, 7 |
| /api/trips/:id/places/:pid (GET, PATCH, DELETE) | MODULE 6, 7 |
| /api/search | MODULE 5 |
| /api/stats | MODULE 9 |
| /api/users/me (GET, PATCH, DELETE) | MODULE 10 |
| /api/export | MODULE 10 |
| /api/custom-fields (GET, POST, DELETE) | MODULE 10 |
| /api/auth/change-password | MODULE 10 |

---

## Appendix C — Free Services Reference

| Service | Free Tier | URL |
|---------|-----------|-----|
| Expo EAS Build | 15 builds/month | expo.dev |
| Vercel Hobby | 100GB BW, 100K invocations/day | vercel.com |
| Neon | 0.5GB storage, 190 compute hours/month | neon.tech |
| Cloudinary | 25GB storage, 25GB BW, 25 credits/month | cloudinary.com |
| OpenFreeMap | No hard rate limit (fair use) | openfreemap.org |
| Resend | 3,000 emails/month, 100/day | resend.com |
| Google OAuth | Free up to 10K users | console.cloud.google.com |
| Nominatim (OSM) | Free, 1 req/sec, User-Agent required | nominatim.openstreetmap.org |
| Natural Earth GeoJSON | Public domain | naturalearthdata.com |

---

*End of TravelThread React Native Expo Implementation Roadmap v2.0*
