# AyurChat - Ayurvedic AI Wellness Companion

A modern fullstack web application providing personalized Ayurvedic wellness guidance powered by AI. Built with React, TypeScript, Tailwind CSS, Firebase Auth, and an Express backend that integrates Gemini AI.

![Deployed at](https://ayudost-chatbot.onrender.com)

## Features

- **Secure Authentication**: Email/password and Google OAuth sign-in backed by Firebase Auth
- **SSO Ready**: Shares the same Firebase project as MediQ for seamless cross-app sign-on
- **AI Chat Interface**: Real-time conversations with Gemini AI for Ayurvedic guidance
- **User Dashboard**: Personalized wellness insights and conversation history
- **Dark/Light Mode**: Theme toggle with persistent preferences
- **Responsive Design**: Optimized for desktop and mobile with an herbal green theme

## Tech Stack

- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, Drizzle ORM
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Data Storage**: PostgreSQL via Drizzle ORM (with in-memory fallback for local dev)
- **AI**: Google Gemini 2.5 Flash/Pro

## 🧠 AI Architecture & RAG Pipeline

AyurDost uses an advanced **Retrieval-Augmented Generation (RAG)** pipeline to provide accurate, context-aware Ayurvedic guidance.

### Workflow Diagram

```mermaid
graph TD
    User([User]) -->|Sends Message| API[API Endpoint /api/chat]
    API -->|Auth & Credits Check| Controller[Chat Controller]
    Controller -->|Select Mode| ModeSwitch{Mode?}
    
    ModeSwitch -->|VAIDYA| Vaidya[Vaidya Diagnostic Flow]
    ModeSwitch -->|LEGACY| Legacy[Simple Gemini Chat]
    ModeSwitch -->|GYAAN| RAG[Advanced RAG Pipeline]
    
    subgraph "Advanced RAG Pipeline (10 Steps)"
        RAG --> Step1[1. Domain Check]
        Step1 -->|Is Ayurvedic?| CheckDomain{Yes/No}
        CheckDomain -->|No| Reject[Refuse Query]
        CheckDomain -->|Yes| Step2[2. Query Rewriting]
        
        Step2 --> Step3[3. Entity Extraction]
        Step3 --> Step4[4. Generate Embeddings]
        Step4 --> Step5[5. Dual Search]
        
        Step5 -->|Vector Search| Pinecone[(Pinecone DB)]
        Step5 -->|Keyword Search| Mongo[(MongoDB)]
        
        Pinecone --> Step6[6. Context Ranking]
        Mongo --> Step6
        
        Step6 --> Step7[7. Context Compression]
        Step7 --> Step8[8. Gemini Generation]
        Step8 --> Step9[9. Hallucination Check]
        Step9 -->|Accurate?| CheckAcc{Yes/No}
        
        CheckAcc -->|No| Adjust[Minor Adjustments]
        CheckAcc -->|Yes| Step10[10. Final Polish]
        Adjust --> Step10
    end
    
    Step10 --> Response[Final Answer]
    Reject --> Response
    Vaidya --> Response
    Legacy --> Response
    
    Response -->|Save Message| DB[(Database)]
    DB -->|Return Response| User
```

### The 10-Step RAG Process

1.  **Domain Check**: Verifies if the query is related to Ayurveda using a fast LLM check.
2.  **Query Rewriting**: Optimizes the user's query for better search retrieval (e.g., adding synonyms, clarifying intent).
3.  **Entity Extraction**: Identifies key Ayurvedic terms (Herbs, Doshas, Symptoms) to boost search relevance.
4.  **Embeddings**: Generates vector embeddings for the rewritten query.
5.  **Dual Search**: Performs a hybrid search using **Pinecone** (semantic vector search) and **MongoDB** (keyword search) for maximum coverage.
6.  **Context Ranking**: Ranks retrieved documents based on relevance scores.
7.  **Context Compression**: Selects and compresses the most relevant information to fit within the LLM's context window.
8.  **Gemini Generation**: Generates a comprehensive answer using the retrieved context and internal Ayurvedic knowledge.
9.  **Hallucination Check**: Verifies that the generated answer is supported by the retrieved context to ensure accuracy.
10. **Final Polish**: Formats the response, adds necessary disclaimers, and ensures a helpful tone.


## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Web app + Google sign-in enabled
- Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))
- Optional: PostgreSQL database (or use the default in-memory storage during development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ayur
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with the following values:

   ```env
   # Firebase (Frontend)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id # optional

   # Firebase (Backend)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} # JSON string for firebase-admin

   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key

   # Database Configuration (optional for Postgres)
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

   **Notes**
   - Frontend variables must start with `VITE_` to be available in React (`import.meta.env`)
   - `FIREBASE_SERVICE_ACCOUNT` should be the raw JSON (escaped) for a service account with Firebase Admin access
   - Restart the dev server after editing `.env`

4. **Run database migrations** (optional, only if using Postgres)
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173` (frontend) with the Express API proxied through Vite.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (AuthContext)
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API and auth helpers (firebaseClient.ts, auth.ts)
│   │   └── lib/           # Utilities (query client, helpers)
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── middleware/        # Auth token verification middleware
│   ├── storage.ts         # Data persistence abstraction
│   └── gemini.ts          # AI integration helpers
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
└── AUTH_SSO_GUIDE.md      # Firebase SSO integration guide with MediQ
```

## Authentication System

### Architecture

The app uses **Firebase Auth** for client-side authentication and **Firebase Admin** on the backend to validate ID tokens:

1. **Sign Up/Sign In**: Users can register with email/password or Google OAuth
2. **Client Session**: Firebase manages session persistence in the browser
3. **ID Token Retrieval**: The frontend attaches the current user's ID token to every API request (`Authorization: Bearer <token>`)
4. **Backend Verification**: Express middleware (`server/middleware/verifyFirebaseToken.ts`) verifies the token with Firebase Admin and exposes the decoded user on `req.user`
5. **Protected Routes**: Dashboard, chat, and data routes require a valid Firebase session

### Key Files

- `client/src/services/firebaseClient.ts` – Firebase SDK initialization (Auth, Firestore, Storage)
- `client/src/services/auth.ts` – Authentication helpers (sign up, sign in, Google OAuth, token helpers)
- `client/src/contexts/AuthContext.tsx` – Global auth state management using `onAuthStateChanged`
- `client/src/lib/queryClient.ts` – Fetch helpers that attach Firebase ID tokens to API calls
- `server/middleware/verifyFirebaseToken.ts` – Express middleware to validate tokens
- `server/routes.ts` – Protected API routes using the decoded Firebase user

## Single Sign-On (SSO) with MediQ

AyurDost (AyurChat) and MediQ share the **same Firebase project**. When a user signs in on either site, their Firebase session is recognized by the other site, enabling seamless SSO experiences.

📖 Read the detailed setup guide in [AUTH_SSO_GUIDE.md](./AUTH_SSO_GUIDE.md).

## Troubleshooting

- **401 Unauthorized responses**
  - Ensure the frontend is obtaining the latest Firebase ID token (`getIdTokenForCurrentUser`)
  - Confirm the `Authorization: Bearer <token>` header is present on requests
  - Verify `FIREBASE_SERVICE_ACCOUNT` is configured correctly on the server

- **Firebase initialization warnings**
  - Double-check all `VITE_FIREBASE_*` values in `.env`
  - Make sure the Firebase Web app is configured with the correct domain (localhost + production domains)

- **Gemini API errors**
  - Ensure `GEMINI_API_KEY` is set and the Google AI Studio project has access to the requested model

## Support

For issues or questions:
- Review [AUTH_SSO_GUIDE.md](./AUTH_SSO_GUIDE.md) for Firebase SSO setup
- Check Firebase Auth documentation for provider configuration
- Open an issue on GitHub or contact the development team
