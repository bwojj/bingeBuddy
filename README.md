# Binge Buddy
### A recovery companion app for people working through binge eating disorder.

---

## What This Is

Most eating disorder resources are either clinical tools you need a therapist to use, or generic wellness apps that miss the point entirely. Binge Buddy is built for the person in the moment — someone who needs to track urges, log how they are feeling, and have something to reach for when things get hard.

The app walks users through an onboarding flow to identify their main causes and motivations, then gives them a set of daily tools: urge tracking, journaling, audio recording support, progress tracking, and a panic button for when they need an urge gone fat.

The backend is a Django REST API connected to a PostgreSQL database. The frontend is a React Native app built with Expo. The app is available on the App Store.

---

## Download

> Available on the [App Store](https://apps.apple.com/us/app/my-binge-buddy/id6760266779)

---

## User Guide

1. **Create an account** — sign up with your email and a password.
2. **Complete onboarding** — you will be asked about your main cause and what motivates you to recover. This personalizes the experience.
3. **Track urges** — log an urge when it happens. The tracker records what you were doing and how strong the urge was.
4. **Use the panic button** — if you are in a hard moment, the panic button gives you something to focus on right away.
5. **Journal** — log how you are feeling in text. Both are saved to your account.
6. **Check your progress** — the progress screen shows your patterns over time so you can see what is working.

---

## Tech Stack

| Technology | Why It Was Used |
|------------|-----------------|
| **React Native (Expo)** | Cross-platform mobile. Expo's file-based routing made the project structure clean and easy to navigate. |
| **Django** | Chosen for its ORM and built-in admin interface. Made building and testing the backend significantly faster than a lighter framework would have. |
| **Django REST Framework** | Handles the REST API on top of Django. Integrates directly with the ORM and is straightforward to work with. |
| **PostgreSQL** | All of the data in this app is relational — users, urge logs, journal entries, and progress all reference each other. PostgreSQL was the right call. |
| **Simple JWT** | Token-based authentication built into Django. Secure and not complicated to set up. |
| **Railway** | Backend hosting. Simple deployment from GitHub and cheap for low-traffic projects. |
| **Expo EAS** | Handles the build and App Store submission pipeline. |

---

## Project Structure

```
bingeBuddy/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── bingeBuddyAPI/
│   │   ├── migrations/
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── authentication.py     ← Custom JWT views
│   │   ├── models.py             ← User, urge, journal, and progress models
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   ├── Procfile
│   ├── railway.toml
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── (onboarding)/
    │   │   │   ├── maincause.jsx       ← Onboarding step 1
    │   │   │   ├── motivation.jsx      ← Onboarding step 2
    │   │   │   └── _layout.jsx
    │   │   ├── login.jsx
    │   │   ├── signup.jsx
    │   │   └── _layout.jsx
    │   ├── (main)/
    │   │   ├── index.jsx               ← Home screen
    │   │   ├── panic.jsx               ← Panic button screen
    │   │   ├── progress.jsx            ← Progress tracking
    │   │   ├── journal.jsx             ← Journal entries
    │   │   ├── tracker.jsx             ← Urge tracker
    │   │   ├── audio-recording.jsx     ← Audio journal recording
    │   │   ├── personalization.jsx     ← User personalization settings
    │   │   ├── profile-settings.jsx
    │   │   ├── privacy-security.jsx
    │   │   ├── settings.jsx
    │   │   └── _layout.jsx
    │   ├── components/
    │   │   ├── HomeMotivation.jsx
    │   │   └── HomeQuoteBox.jsx
    │   └── _layout.jsx
    ├── assets/
    │   └── images/
    ├── components/
    │   ├── AuthApi.js          ← Login, register, token refresh
    │   ├── DataAPI.js          ← General data API calls
    │   ├── JournalAPI.js       ← Journal entry API calls
    │   ├── OnboardingApi.js    ← Onboarding flow API calls
    │   ├── UrgeAPI.js          ← Urge tracking API calls
    │   ├── LoadingScreen.jsx
    │   └── authStorage.js      ← Token storage
    ├── context/
    │   └── AuthContext.js      ← Global auth state
    ├── android/
    ├── ios/
    ├── app.json
    └── eas.json
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
```

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file inside `backend/backend/` (next to `settings.py`):

```env
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/binge_buddy_db
SECRET_KEY=your-secret-key
DEBUG=True
```

4. Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
```

1. Install dependencies:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with Expo Go or run on a simulator. Make sure the backend is running first and update the API base URL in your environment config to point at your local server.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/token/` | Obtain JWT access + refresh tokens |
| POST | `/token/refresh/` | Refresh access token |
| POST | `/register/` | Create a new user account |
| POST | `/logout/` | Invalidate session |
| GET | `/authenticated/` | Check if current user is authenticated |

### User & Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/user/` | Get or update user profile |
| POST | `/api/onboarding/` | Submit onboarding responses |

### Urge Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/urges/` | List or log urges |
| GET/PUT/DELETE | `/api/urges/{id}/` | Retrieve, update, or delete a urge log |

### Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/journal/` | List or create journal entries |
| GET/PUT/DELETE | `/api/journal/{id}/` | Retrieve, update, or delete an entry |
| POST | `/api/journal/audio/` | Upload an audio journal entry |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/` | Get progress data |
| POST | `/api/update-progress/` | Update progress metrics |

### Misc
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/` | Health check |

---

## Future Improvements

- Push notifications for check-in reminders
- Streak tracking for urge-free days
- Expanded progress analytics and visualizations

---

## Development Notes

This project was built with AI-assisted development. Claude was used throughout for code generation, debugging, and frontend styling. All architecture decisions, feature scoping, data modeling, and deployment were done independently. The goal was to ship something real and useful — AI was a tool to do that faster, not a shortcut around understanding the code.
