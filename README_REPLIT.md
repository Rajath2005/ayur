# AyurChat - Ayurvedic AI Wellness Companion

A fullstack AI chatbot application built with React, Node.js, Express, Supabase, and Gemini AI, providing personalized Ayurvedic wellness guidance.

## 🌿 Features

### Frontend
- **Landing Page**: Beautiful hero section with Ayurvedic theming and feature highlights
- **Authentication**: Secure login and registration with form validation
- **Dashboard**: Wellness overview with statistics and quick actions
- **Chat Interface**: 
  - Real-time AI-powered conversations with streaming simulation
  - File upload support with visual previews
  - Emoji picker integration
  - Voice input simulation (mic button)
  - Typing indicators
  - Conversation history sidebar
- **Dark/Light Mode**: Persistent theme toggle with herbal green color scheme
- **Responsive Design**: Optimized for desktop and mobile devices

### Backend
- **Authentication Routes** (`/api/auth`):
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  
- **Chat Routes** (`/api/chat`):
  - `POST /api/chat` - Send message and get AI response
  
- **Conversation Routes** (`/api/conversations`):
  - `GET /api/conversations` - List all user conversations
  - `GET /api/conversations/:id` - Get specific conversation
  - `POST /api/conversations` - Create new conversation
  - `DELETE /api/conversations/:id` - Delete conversation
  
- **Message Routes** (`/api/messages`):
  - `GET /api/messages/:conversationId` - Get all messages in conversation
  
- **Ayurvedic Features**:
  - `POST /api/symptom` - Symptom analysis with AI
  - `POST /api/remedies` - Get herbal remedy suggestions
  - `POST /api/appointment-link` - Generate appointment booking link
  
- **File Upload** (`/api/upload`):
  - `POST /api/upload` - Upload files for chat attachments

## 🚀 Getting Started

### Prerequisites
1. **Supabase Database**: 
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
   - Create a new project
   - Click "Connect" → "Connection string" → "Transaction pooler"
   - Copy the URI and replace `[YOUR-PASSWORD]` with your database password
   - Add as `DATABASE_URL` secret in Replit

2. **Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in and create an API key
   - Add as `GEMINI_API_KEY` secret in Replit

### Environment Variables
Create these secrets in Replit:
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
```

### Optional Integrations (Future Enhancement)
- **Pinecone**: For RAG-based Ayurvedic knowledge base
  - `PINECONE_API_KEY`
  - `PINECONE_ENVIRONMENT`
  
- **Cloudinary**: For image/file storage
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## 📦 Installation & Running

### Using Replit (Recommended)
1. Open this Repl
2. Click "Run" - the application will automatically:
   - Install all dependencies
   - Set up the database
   - Start both frontend and backend servers
3. The app will be available at the provided URL

### Local Development
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server (frontend + backend)
npm run dev
```

The application runs on a single port (5000) with Vite handling both frontend and backend.

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/        # Route pages
│   │   │   ├── landing.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx
│   │   │   └── chat.tsx
│   │   ├── lib/          # Utilities
│   │   └── App.tsx       # Main app component
│   └── index.html
│
├── server/                # Backend Express application
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Data persistence layer
│   ├── gemini.ts         # Gemini AI integration
│   └── index.ts          # Server entry point
│
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema & Zod validation
│
└── db/                   # Database migrations
    └── migrations/
```

## 🎨 Design System

### Color Palette
- **Primary (Herbal Green)**: `hsl(142 45% 35%)` - Trust and natural wellness
- **Light Mode**: Soft off-white backgrounds with subtle green tints
- **Dark Mode**: Deep charcoal with green undertones
- **Semantic Colors**: Success (green), Warning (amber), Error (red)

### Typography
- **Font Family**: Inter for UI, JetBrains Mono for code
- **Scales**: Responsive text sizes with proper hierarchy

### Components
- Built with shadcn/ui and Radix UI
- Consistent spacing using Tailwind (4, 6, 8, 12, 16, 24)
- Hover states with elevation system
- Smooth transitions (200-300ms)

## 🔧 Key Technologies

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching
- **React Hook Form** + Zod for forms
- **shadcn/ui** + Tailwind CSS for UI
- **emoji-picker-react** for emoji support
- **Lucide React** for icons

### Backend
- **Node.js** + **Express**
- **Drizzle ORM** with Supabase (PostgreSQL)
- **Gemini AI** (via @google/genai)
- **Passport.js** for authentication
- **Express Session** for session management

## 🤖 AI Features

### Gemini Integration
The application uses Google's Gemini AI for:
- Natural language understanding of health queries
- Ayurvedic remedy recommendations
- Symptom analysis from Ayurvedic perspective
- Conversational wellness guidance

### Medical Guardrails
- Intent classification to detect medical emergencies
- Safety filters for appropriate responses
- Disclaimer messaging for professional consultation
- Context-aware Ayurvedic knowledge base

## 📝 API Routes Reference

### Authentication
```typescript
POST /api/auth/register
Body: { username, email, password }

POST /api/auth/login
Body: { username, password }

POST /api/auth/logout
```

### Conversations
```typescript
GET /api/conversations
Response: Conversation[]

POST /api/conversations
Body: { title }

DELETE /api/conversations/:id
```

### Messages & Chat
```typescript
GET /api/messages/:conversationId
Response: Message[]

POST /api/chat
Body: { conversationId, content, attachments? }
```

### Ayurvedic Features
```typescript
POST /api/symptom
Body: { symptoms: string, conversationId? }

POST /api/remedies
Body: { condition: string, dosha?: string }

POST /api/appointment-link
Body: { reason: string, userId }
```

## 🔐 Security

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM
- Secure file upload handling

## 🚀 Deployment

This application is optimized for Replit deployment:
1. All environment variables configured via Replit Secrets
2. Database migrations run automatically
3. Single-port serving via Vite
4. Production build optimizations included

## 📄 License

MIT License - Feel free to use this for your wellness projects!

## 🙏 Acknowledgments

- Ancient Ayurvedic wisdom and practitioners
- Google Gemini AI for powering intelligent responses
- Supabase for robust database infrastructure
- shadcn/ui for beautiful component primitives
