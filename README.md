# AyurChat - Ayurvedic AI Wellness Companion

A modern fullstack web application providing personalized Ayurvedic wellness guidance powered by AI. Built with React, TypeScript, Tailwind CSS, and Supabase.

![Deployed at](https://ayudost-chatbot.onrender.com)

## Features

- **Secure Authentication**: Email/password and Google OAuth sign-in powered by Supabase
- **Persistent Sessions**: Automatic login with session management
- **AI Chat Interface**: Real-time conversations with Gemini AI for Ayurvedic guidance
- **User Dashboard**: Personalized wellness insights and conversation history
- **Dark/Light Mode**: Theme toggle with persistent preferences
- **Responsive Design**: Optimized for desktop and mobile with herbal green Ayurvedic theme
- **SSO Ready**: Single Sign-On integration with MediQ (see AUTH_SSO_GUIDE.md)

## Tech Stack

- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, Drizzle ORM, Passport.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **AI**: Google Gemini 2.5 Flash/Pro
- **Styling**: Tailwind CSS with herbal green theme

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([Create one here](https://supabase.com))
- Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))

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

   Create a `.env` file in the root directory with these exact variable names (Vite requires `VITE_` prefix for frontend variables):

   ```env
   # Supabase Configuration (Frontend - VITE_ prefix required)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Configuration (Backend)
   GEMINI_API_KEY=your_gemini_api_key

   # Database Configuration (Backend)
   DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

   # Session Secret (Backend)
   SESSION_SECRET=your_random_session_secret
   ```

   **Important Notes:**
   - ✅ Place `.env` file in the **root directory** of the project
   - ✅ Frontend variables MUST have `VITE_` prefix to be accessible in React
   - ✅ After editing `.env`, **restart the development server** (`npm run dev`) for changes to take effect
   - ✅ Vite does NOT support `process.env` in frontend code - use `import.meta.env` instead

   **How to get Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or select existing one
   - Go to Settings > API
   - Copy `URL` and `anon public` key

4. **Configure Supabase Authentication**

   In your Supabase Dashboard:

   a. Enable Email/Password authentication:
      - Go to Authentication > Providers
      - Enable "Email" provider
      - Disable "Confirm email" for development (enable in production)

   b. (Optional) Enable Google OAuth:
      - Go to Authentication > Providers
      - Enable "Google" provider
      - Add your Google OAuth credentials
      - See [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

   c. Configure Site URL and Redirect URLs:
      - Go to Authentication > URL Configuration
      - Set Site URL: `http://localhost:5173` (dev) or your production URL
      - Add Redirect URLs:
        - `http://localhost:5173/dashboard`
        - `https://ayudost-chatbot.onrender.com/dashboard`

5. **Run database migrations** (optional - handled automatically)
   ```bash
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

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
│   │   ├── services/      # API services (auth.ts, supabaseClient.ts)
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data persistence
│   └── gemini.ts          # AI integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
└── AUTH_SSO_GUIDE.md      # SSO integration documentation
```

## Authentication System

### Architecture

The app uses **Supabase Auth** for authentication with the following flow:

1. **Sign Up/Sign In**: Users can register with email/password or Google OAuth
2. **Session Management**: Supabase automatically manages JWT tokens and refresh tokens
3. **Persistent Sessions**: Sessions are stored in localStorage and auto-refresh
4. **Protected Routes**: Dashboard and chat pages require authentication
5. **Logout**: Clears session and redirects to home page

### Key Files

- `client/src/services/auth.ts` - Authentication functions (signIn, signUp, logout, etc.)
- `client/src/services/supabaseClient.ts` - Supabase client configuration
- `client/src/contexts/AuthContext.tsx` - Global auth state management
- `client/src/components/ProtectedRoute.tsx` - Route protection wrapper

### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { signIn, signOut } from '@/services/auth';

function MyComponent() {
  const { user, loading, logout } = useAuth();

  const handleLogin = async () => {
    await signIn({ email: 'user@example.com', password: 'password' });
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Single Sign-On (SSO) with MediQ

For seamless authentication between MediQ and Ayudost Chatbot, see the comprehensive guide:

📖 **[AUTH_SSO_GUIDE.md](./AUTH_SSO_GUIDE.md)**

### Quick SSO Setup

**Option A: Shared Supabase Project (Recommended)**
1. Use the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in both apps
2. Configure redirect URLs for both domains in Supabase Dashboard
3. Users will be automatically logged in across both apps

**Option B: JWT Token Exchange (Separate Projects)**
1. Implement token exchange endpoint in both backends
2. Pass JWT tokens securely between apps
3. Verify and create sessions in each app

See the full guide for detailed implementation steps, security best practices, and troubleshooting.

## Features Overview

### Authentication Pages
- **Landing Page** (`/`) - Hero section with features and CTAs
- **Login** (`/login`) - Email/password + Google OAuth sign-in
- **Register** (`/register`) - User registration with email confirmation

### Protected Pages
- **Dashboard** (`/dashboard`) - User overview, stats, and quick actions
- **Chat** (`/chat/:id`) - AI conversation interface with Ayurvedic guidance

### Key Components
- **AuthContext** - Global authentication state
- **ProtectedRoute** - Route guard for authenticated pages
- **AppSidebar** - Navigation with conversations list and logout
- **ThemeToggle** - Dark/light mode switcher

## Development Notes

### State Management
- **Authentication**: React Context API (`AuthContext`)
- **Data Fetching**: TanStack Query for server state
- **Local State**: React hooks (useState, useEffect)

### Styling
- **Design System**: shadcn/ui components with Tailwind CSS
- **Color Scheme**: Herbal green primary (#568654), saffron accents
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: CSS variables with next-themes

### Security
- All authentication handled by Supabase
- JWT tokens automatically managed
- Row Level Security (RLS) on database tables
- Environment variables for sensitive data
- HTTPS required in production

## API Routes

### Authentication
```
POST /api/auth/register  - User registration
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout
GET  /api/auth/me        - Get current user
```

### Conversations
```
GET    /api/conversations     - List user conversations
GET    /api/conversations/:id - Get specific conversation
POST   /api/conversations     - Create new conversation
DELETE /api/conversations/:id - Delete conversation
```

### Chat
```
POST /api/chat           - Send message, get AI response
GET  /api/messages/:id   - Get messages for conversation
```

### Ayurvedic Features
```
POST /api/symptom            - Analyze symptoms
POST /api/remedies           - Get herbal remedies
POST /api/appointment-link   - Generate appointment link
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Frontend Variables (Required for Vite to expose them)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co          # Supabase project URL
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Supabase anonymous key
```

### Backend Variables
```env
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres  # PostgreSQL connection string
GEMINI_API_KEY=your_google_gemini_api_key                    # Google Gemini API key
SESSION_SECRET=your_random_secure_session_secret             # Express session secret (any random string)
```

### Important Configuration Notes
1. **Vite Frontend Variables**: All frontend variables MUST start with `VITE_` prefix
2. **File Location**: `.env` must be in the **root directory** (same level as `package.json`)
3. **Server Restart Required**: After modifying `.env`, restart the dev server (`npm run dev`)
4. **No process.env in Frontend**: Vite does not support `process.env` in React code - frontend code uses `import.meta.env`
5. **Production Builds**: Build command (`npm run build`) will embed `VITE_*` variables at build time

## Deployment

### Deploy to Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Build Command: `npm run build`
   - Start Command: `npm run start`

2. **Set Environment Variables**
   - Add all variables from `.env` file
   - Ensure `VITE_SUPABASE_URL` points to production Supabase

3. **Configure Supabase**
   - Add Render URL to Supabase redirect URLs
   - Update Site URL in Supabase settings

4. **Deploy**
   - Push to main branch
   - Render will auto-deploy

## Troubleshooting

### Authentication Issues

**Problem**: User not logged in after refresh
- Check that `persistSession: true` in Supabase client config
- Verify localStorage is not blocked by browser
- Clear browser cache and localStorage

**Problem**: Google OAuth not working
- Verify Google OAuth credentials in Supabase
- Check redirect URLs match exactly
- Ensure domain is added to Google Cloud Console

**Problem**: Session expired errors
- Enable `autoRefreshToken: true` in Supabase config
- Check token expiration settings in Supabase

### CORS Errors
- Add all domains to Supabase allowed origins
- Verify redirect URLs in Supabase settings
- Check `Access-Control-Allow-Origin` headers

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run check
```

### Environment Variable Issues

**Problem**: `[plugin:runtime-error-plugin] process is not defined` or `Missing Supabase environment variables`
- ✅ Ensure `.env` file is in the **root directory** (not in `client/` or `server/`)
- ✅ Variables must have `VITE_` prefix for frontend access: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- ✅ **Restart the dev server** after editing `.env` - changes don't take effect until restart
- ✅ Frontend code uses `import.meta.env.VITE_*`, NOT `process.env.VITE_*`
- ✅ Check browser console for environment variable loading errors

**Problem**: Environment variables are undefined in development
```bash
# Solution: Restart the dev server
npm run dev  # Stop with Ctrl+C, then run again
```

**Problem**: Build succeeds but production shows "Missing environment variables"
- ✅ Ensure `VITE_*` variables are set in your deployment platform
- ✅ For Render: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Environment Variables
- ✅ Rebuild after setting environment variables

## Testing

### Manual Testing Checklist
- [ ] User can register with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google
- [ ] Session persists after page refresh
- [ ] Protected routes redirect to login when not authenticated
- [ ] User info displays in dashboard
- [ ] Logout button clears session
- [ ] Dark/light mode toggle works
- [ ] Chat interface loads and sends messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check [AUTH_SSO_GUIDE.md](./AUTH_SSO_GUIDE.md) for SSO setup
- Review [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Open an issue on GitHub
- Contact development team

---

Built with Ayurvedic wisdom and modern technology
