# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BingeBuddy is a habit/urge-tracking mobile app: an Expo/React Native frontend (`frontend/`) talking to a Django REST API backend (`backend/`). There is no shared package manager or monorepo tooling — treat the two directories as independent projects.

## Commands

### Frontend (`frontend/`)
```bash
npm install          # install deps
npx expo start        # start dev server (Metro)
npm run android        # run:android
npm run ios            # run:ios
npm run web             # expo start --web
npm run lint             # expo lint (eslint-config-expo flat config)
```
No test runner is configured. Apple Sign In only works on a physical iOS device (not simulator).

### Backend (`backend/`)
```bash
python3 manage.py runserver          # local dev server
python3 manage.py makemigrations && python3 manage.py migrate   # after model changes
python3 manage.py test               # bingeBuddyAPI/tests.py
```
Deployed to Railway (`backend/Procfile`, `backend/railway.toml`) via gunicorn; static files served by whitenoise, media/uploads (motivation images, panic audio) via Cloudinary.

## Architecture

### Backend: single-app Django REST project
- `backend/backend/settings.py` — all configuration lives here (DB, JWT, CORS, Cloudinary). No per-environment settings files; env vars override defaults (`DB_HOST`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CLOUDINARY_*`, `DEBUG`, etc). DB is Postgres (Neon) even in this "backend" — there is no SQLite fallback configured.
- `backend/bingeBuddyAPI/` is the only app: `models.py`, `serializers.py`, `views.py`, `urls.py`, `authentication.py`.
- **Auth**: `CookiesJWTAuthentication` (`authentication.py`) is the `DEFAULT_AUTHENTICATION_CLASSES` for all of DRF — it reads the JWT from an `access_token` httponly cookie first, falling back to an `Authorization: Bearer` header. Every view/viewset defaults to `IsAuthenticated`; endpoints that must be public (`register`, `social-auth`, token obtain) explicitly set `AllowAny`.
- `CustomTokenObtainPairView`/`CustomTokenRefreshView` (in `views.py`) wrap SimpleJWT's views to additionally set `access_token`/`refresh_token` as cookies (30-day / 365-day lifetimes, `SIMPLE_JWT` in settings) alongside returning the tokens in the JSON body — the frontend uses the JSON body (stored via `expo-secure-store`) as the primary mechanism and cookies as a fallback for web/credentialed requests.
- `social_auth` (views.py) handles both Google and Apple sign-in server-side: Google is verified by calling Google's userinfo endpoint with the access token; Apple identity tokens are verified locally against Apple's JWKS (fetched live, matched by `kid`, RSA-decoded) with audience `settings.APPLE_BUNDLE_ID`. Both paths converge on find-or-create against `SocialAccount` (provider + provider_id), then issue the same JWT/cookie pair as regular login. `is_new` in the response tells the frontend whether to route into onboarding.
- Most simple mutations (`add_data_main_cause`, `add_data_motivation`, `set_motivation_image`, `update_profile`) are plain `@api_view` functions using `update_or_create` against `request.user`, not viewsets — only `UserData`, `User` (as "credentials"), `JournalEntry`, and `Urges` are registered as `ModelViewSet`s via the DRF router (`urls.py`), and even `UrgesView.list` is overridden to return just a count rather than a list.
- `urges_by_day` computes a Monday-Sunday weekly histogram of urge timestamps, doing the date bucketing in the caller's timezone (`tz` query param → `ZoneInfo`, default UTC) via `TruncDate(..., tzinfo=user_tz)` — get this timezone handling right if touching urge/progress code, since naive UTC bucketing will shift which day an urge counts against for non-UTC users.
- File uploads: `motivation_image` uses Django's `ImageField` (stored via `cloudinary_storage`'s `MediaCloudinaryStorage`, the global `default` storage backend). `panic_audio` instead uploads directly via `cloudinary.uploader.upload(..., resource_type='video')` in the view and stores the returned URL as a plain `URLField` — the two upload patterns are inconsistent, don't assume one implies the other.

### Frontend: Expo Router, context-driven auth/data state
- File-based routing under `frontend/app/`: `(auth)` group (login, signup, onboarding sub-group) and `(main)` group (dashboard, journal, tracker, coach, panic, settings, etc). Route access is gated centrally in `frontend/app/_layout.jsx`, which redirects based on `isAuthenticated` from `AuthContext` rather than per-screen guards.
- `frontend/context/AuthContext.js` is the single source of truth for auth state and most server-fetched user data (`userCredentials`, `userPreferences`, `urgeCount`, `urgesByDay`). On mount it checks `/api/authenticated`; once authenticated it fires one `Promise.all` batch (`fetchData`) to populate everything at once. Screens call `useAuth()` and `refreshUserData()` (not ad hoc refetching) after mutations, e.g. `panic.jsx` calls `refreshUserData()` after logging an urge so the dashboard/progress chart stay in sync.
- API calls are grouped by domain into flat function modules in `frontend/components/`: `AuthApi.js` (login/register/social/authenticated-check), `DataAPI.js` (user data & profile), `UrgeAPI.js` (log/count/by-day), `JournalAPI.js`, `OnboardingApi.js`. Every module independently hardcodes the same `BASEURL` constant (`https://bingebuddy-production.up.railway.app`) — there is no shared API client/axios instance despite axios being a dependency, and no local/staging URL switch. If adding a backend base URL, update it in every file that declares it.
- Every fetch call manually attaches both the bearer token (from `authStorage.js`, backed by `expo-secure-store`) and `credentials: 'include'` — follow this dual pattern for new endpoints since the backend authentication class accepts either.
- Social login flow: `expo-auth-session` (Google) / `expo-apple-authentication` (Apple) run client-side to obtain a provider token, then `socialAuth()` in `AuthApi.js` posts it to `/api/social-auth`; the returned `is_new` flag is used by the caller to route between onboarding and the main app.
