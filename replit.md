# AyurChat - Ayurvedic AI Wellness Companion

## Project Overview
A modern fullstack AI chatbot application providing personalized Ayurvedic wellness guidance. Built with React, Node.js, Express, Firebase Auth, and Google Gemini AI.

## Tech Stack
- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, Drizzle ORM
- **Authentication**: Firebase Auth (Email/Password + Google)
- **Database**: PostgreSQL via Drizzle ORM (with in-memory fallback for dev)
- **AI**: Google Gemini 2.5 Flash/Pro

## Key Features
1. **Landing Page** with Ayurvedic-themed hero section
2. **Firebase Authentication** with secure login/register flows
3. **Dashboard** with wellness statistics and quick actions
4. **AI Chat Interface** featuring:
   - Real-time response simulation
   - File attachment metadata
   - Emoji picker
   - Voice input mock
   - Typing indicators
   - Conversation history sidebar
5. **Quick Actions** for symptom checking, remedies, appointments
6. **Dark/Light Mode** with persistent theme

## Project Structure
```
├── client/src/           # React frontend
│   ├── components/       # Reusable components + shadcn/ui
│   ├── pages/            # Route pages (Landing, Login, Register, Dashboard, Chat)
│   ├── services/         # Firebase auth helpers & API utilities
│   ├── contexts/         # Auth context powered by Firebase
│   └── lib/              # Query client and shared helpers
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── middleware/      # Firebase token verification
│   ├── storage.ts       # Data persistence abstraction
│   └── gemini.ts        # Gemini AI integration
├── shared/              # Shared types and schemas
└── db/                  # Database migrations
```

## Environment Variables (Configured via Replit Secrets)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_SERVICE_ACCOUNT` — stringified service account JSON for firebase-admin
- `GEMINI_API_KEY` — Google Gemini API key
- `DATABASE_URL` — PostgreSQL connection string (optional for persistent storage)

## Recent Changes (October 2025)
- Migrated authentication to Firebase Auth + Firebase Admin token verification
- Updated documentation for Firebase SSO shared with MediQ
- Added automatic ID token attachment to all frontend API requests
- Hardened protected routes to rely solely on Firebase middleware
- Refreshed README assets to document the Firebase migration

## User Preferences
- Herbal green color scheme (hsl(142 45% 35%))
- Modern, clean design with wellness focus
- Responsive layouts for desktop and mobile
- Smooth transitions and subtle animations
- Accessibility-first approach

## Development Notes
- Firebase Auth handles sessions; ID tokens are passed via `Authorization` headers
- Backend uses Firebase Admin (`verifyFirebaseToken`) to secure routes
- Data persistence uses PostgreSQL (Drizzle) or in-memory storage if `DATABASE_URL` is absent
- Gemini AI integration includes Ayurvedic prompts and guardrails
- File upload UI captures metadata; integrate external storage for production
- Pinecone integration placeholders remain for future RAG functionality

## Implementation Status
✅ Firebase-based auth and SSO readiness with MediQ
✅ Dashboard, chat, and landing experiences complete
✅ Gemini AI responses with Ayurvedic-specific prompts
✅ Conversation and message management flows
✅ Dark/light theme toggle & responsive design
✅ Database migrations available via Drizzle
✅ API routes protected by Firebase middleware

## Notes on File Upload
- UI allows file attachment with preview and removal
- Attachment metadata (name, type, size) is passed to backend
- For production: integrate Cloudinary or S3 for actual file storage
- Current implementation stores metadata only
