# AyurChat - Ayurvedic AI Wellness Companion

A fullstack AI chatbot application built with React, Node.js, Express, Firebase Auth, and Gemini AI, providing personalized Ayurvedic wellness guidance.

## 🌿 Features

### Frontend
- Landing page with Ayurvedic theming and feature highlights
- Secure login and registration with Firebase Auth
- Dashboard with wellness insights and quick actions
- Conversational chat UI with attachments, emoji picker, and typing indicators
- Persistent dark/light mode and responsive design

### Backend
- **Auth**: All protected routes validate Firebase ID tokens via middleware
- **Chat**: `/api/chat` streams AI responses from Gemini
- **Conversations**: CRUD routes for managing chat history
- **Messages**: Fetch conversation messages
- **Ayurvedic utilities**: Symptom analysis, herbal remedies, appointment link generation
- **Uploads**: Placeholder upload endpoint for attachments

## 🚀 Getting Started

### Prerequisites
1. **Firebase Project**
   - Enable Authentication (Email/Password + Google provider)
   - Add Web apps for local development and production domains
   - Download a service account JSON for Firebase Admin access

2. **Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Generate an API key and store it securely

3. **Optional Database**
   - Configure a PostgreSQL database for persistent storage (`DATABASE_URL`)
   - If omitted, the server falls back to the in-memory store

### Environment Variables
Configure the following secrets in Replit (or `.env` locally):

```
# Firebase (frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=... # optional

# Firebase (backend)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} # JSON string

# Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Database (optional)
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Optional Integrations
- **Pinecone** – `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`
- **Cloudinary** – `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## 📦 Installation & Running

### Using Replit
1. Open this Repl
2. Add the required secrets (see above)
3. Click "Run" to install dependencies and start the dev server
4. The combined app is served from the generated Replit URL

### Local Development
```bash
# Install dependencies
npm install

# Run database migrations (if using Postgres)
npm run db:push

# Start development server (frontend + backend)
npm run dev
```

Vite proxies API calls to the Express server, allowing both frontend and backend to run together.

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # Auth context
│   │   ├── pages/         # Route pages
│   │   ├── services/      # Firebase auth helpers & API utils
│   │   └── lib/           # Query client and utilities
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts          # API route handlers
│   ├── middleware/        # Firebase token verification
│   ├── storage.ts         # Persistence abstraction
│   ├── gemini.ts          # Gemini AI integration
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts
└── db/                    # Optional database migrations
```

## 🔐 Authentication Overview

- The frontend initializes Firebase using `client/src/services/firebaseClient.ts`
- `AuthContext` listens to `onAuthStateChanged` to manage user state
- API requests include `Authorization: Bearer <idToken>` headers via `client/src/lib/queryClient.ts`
- The backend validates tokens through `server/middleware/verifyFirebaseToken.ts`
- `/api/auth/me` returns the decoded Firebase user, enabling profile display in the dashboard

## 🤖 AI Features

- Uses Google's Gemini models for Ayurvedic guidance
- Supports symptom analysis, remedy suggestions, and appointment context generation
- Includes safety messaging to remind users to consult practitioners

## 📝 API Routes Reference

### Authentication
```http
GET /api/auth/me        # Returns current Firebase-authenticated user
```

### Conversations
```http
GET    /api/conversations
GET    /api/conversations/:id
POST   /api/conversations
DELETE /api/conversations/:id
```

### Messages
```http
GET  /api/messages/:conversationId
POST /api/chat                 # Sends a message and receives Gemini response
```

### Ayurvedic Utilities
```http
POST /api/symptom
POST /api/remedies
POST /api/appointment-link
```

### Uploads
```http
POST /api/upload               # Placeholder upload handler
```

## 🔧 Troubleshooting

- **401 Unauthorized**: Confirm the frontend attaches the Firebase ID token and the backend has a valid `FIREBASE_SERVICE_ACCOUNT`.
- **Firebase config warnings**: Double-check all `VITE_FIREBASE_*` values and authorized domains.
- **Gemini errors**: Verify `GEMINI_API_KEY` is active and the account has model access.

## 📚 Related Documentation

- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/start)
- [Google AI Studio](https://aistudio.google.com/)
- [AUTH_SSO_GUIDE.md](./AUTH_SSO_GUIDE.md) for MediQ ↔ AyurDost SSO setup
