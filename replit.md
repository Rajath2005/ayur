# AyurChat - Ayurvedic AI Wellness Companion

## Project Overview
A modern fullstack AI chatbot application providing personalized Ayurvedic wellness guidance. Built with React, Node.js, Express, Supabase (PostgreSQL), and Google Gemini AI.

## Tech Stack
- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, Drizzle ORM, Passport.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5 Flash/Pro
- **Styling**: Tailwind CSS with herbal green theme, dark/light mode

## Key Features
1. **Landing Page** with Ayurvedic-themed hero section
2. **Authentication** with secure login/register
3. **Dashboard** with wellness statistics
4. **AI Chat Interface** with:
   - Real-time streaming simulation
   - File upload support
   - Emoji picker
   - Voice input simulation
   - Typing indicators
   - Conversation history sidebar
5. **Quick Actions** for symptom checking, remedies, appointments
6. **Dark/Light Mode** with persistent theme

## Project Structure
```
├── client/src/           # React frontend
│   ├── components/       # Reusable components + shadcn/ui
│   ├── pages/           # Route pages (Landing, Login, Register, Dashboard, Chat)
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data persistence interface
│   └── gemini.ts        # Gemini AI integration
├── shared/              # Shared types and schemas
└── db/                  # Database migrations
```

## Environment Variables (Configured via Replit Secrets)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `SESSION_SECRET` - Express session secret

## Recent Changes (October 15, 2025)
- Implemented complete schema with users, conversations, messages, appointments tables
- Built all frontend pages with herbal green theme and dark mode
- Created reusable sidebar component with conversation management
- Implemented chat interface with file upload metadata, emoji picker, mic simulation
- Set up theme provider with localStorage persistence
- Added comprehensive routing with wouter
- Configured design tokens in index.css and tailwind.config.ts
- Implemented all backend API routes with Gemini AI integration
- Set up Supabase PostgreSQL database with Drizzle ORM
- Added express-session for authentication
- Configured bcrypt password hashing and passport.js
- Added all required data-testid attributes for testing

## User Preferences
- Herbal green color scheme (hsl(142 45% 35%))
- Modern, clean design with wellness focus
- Responsive layouts for desktop and mobile
- Smooth transitions and subtle animations
- Accessibility-first approach

## Development Notes
- Using Supabase PostgreSQL for data persistence with automatic fallback to in-memory storage
- Gemini AI integration completed with medical guardrails and Ayurvedic system prompts
- File upload UI with attachment metadata (actual file storage can be enhanced with Cloudinary)
- Voice recording UI simulation (can integrate real transcription services)
- Pinecone vector DB placeholder for future RAG implementation
- All interactive elements have data-testid attributes for e2e testing

## Implementation Status
✅ Complete schema with Drizzle ORM
✅ All frontend pages with herbal green theme
✅ Authentication with bcrypt and passport.js
✅ Session management with express-session
✅ Gemini AI chat responses with medical guardrails
✅ Conversation and message management
✅ Dark/light theme toggle
✅ Responsive design
✅ Database migrations completed
✅ All API routes functional

## Notes on File Upload
- UI allows file attachment with preview and removal
- Attachment metadata (name, type, size) is passed to backend
- For production: integrate Cloudinary or S3 for actual file storage
- Current implementation stores metadata only
