# Single Sign-On (SSO) Integration Guide
## Connecting MediQ and Ayudost Chatbot Authentication

This guide explains how to implement Single Sign-On between MediQ and Ayudost Chatbot, allowing users to authenticate once and access both applications seamlessly.

## Table of Contents
1. [Option A: Shared Supabase Project (Recommended)](#option-a-shared-supabase-project)
2. [Option B: JWT Token Exchange (Separate Projects)](#option-b-jwt-token-exchange)
3. [Security Best Practices](#security-best-practices)
4. [Implementation Steps](#implementation-steps)
5. [Troubleshooting](#troubleshooting)

---

## Option A: Shared Supabase Project (Recommended)

### Overview
The simplest and most secure approach is to use the same Supabase project for both MediQ and Ayudost Chatbot. This allows automatic session sharing across both applications.

### Architecture
```
┌─────────┐         ┌──────────────────┐         ┌──────────────┐
│  MediQ  │◄───────►│ Shared Supabase  │◄───────►│   Ayudost    │
│   App   │         │     Project      │         │   Chatbot    │
└─────────┘         └──────────────────┘         └──────────────┘
                     - Auth Tables
                     - User Sessions
                     - Single Database
```

### Step-by-Step Implementation

#### 1. Use Same Supabase Project
Both applications should point to the same Supabase instance:

**MediQ `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Ayudost Chatbot `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co  # Same as MediQ
VITE_SUPABASE_ANON_KEY=your_anon_key_here            # Same as MediQ
```

#### 2. Configure Supabase Auth Settings

In your Supabase Dashboard (https://app.supabase.com):

1. Go to **Authentication > URL Configuration**
2. Add both domains to **Site URL**:
   - `https://mediq.yourdomain.com`
   - `https://ayudost-chatbot.onrender.com`
3. Add both domains to **Redirect URLs**:
   - `https://mediq.yourdomain.com/dashboard`
   - `https://ayudost-chatbot.onrender.com/dashboard`

#### 3. Session Sharing Across Domains

**Important:** Browser security prevents automatic cookie sharing across different domains. You have two sub-options:

##### A. Same Parent Domain (Recommended)
Host both apps under the same parent domain:
- MediQ: `mediq.yourdomain.com`
- Ayudost: `ayudost.yourdomain.com`

Configure Supabase client with `cookieOptions`:

```typescript
// client/src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage, // Use localStorage for cross-subdomain sharing
    storageKey: 'unified-auth-session', // Same key for both apps
  }
});
```

##### B. Different Domains with Token Passing
If apps are on completely different domains, implement token passing:

**From MediQ to Ayudost:**
```typescript
// In MediQ app
const redirectToAyudost = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Pass access token as query parameter
    window.location.href = `https://ayudost-chatbot.onrender.com/auth/callback?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
  }
};
```

**In Ayudost Chatbot:**
```typescript
// Create new route: client/src/pages/auth-callback.tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/services/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(() => {
        setLocation('/dashboard');
      });
    } else {
      setLocation('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
```

#### 4. Verify Session on Both Apps

Both apps will automatically verify sessions using Supabase's built-in auth:

```typescript
// This code is already implemented in client/src/contexts/AuthContext.tsx
const { data: { session } } = await supabase.auth.getSession();
```

### Advantages
- Simple setup
- Automatic session management
- Single source of truth for user data
- No custom token validation needed
- Built-in security with Supabase

### Disadvantages
- Both apps depend on same Supabase instance
- Shared database (can be mitigated with Row Level Security)

---

## Option B: JWT Token Exchange (Separate Projects)

### Overview
If MediQ and Ayudost must use separate Supabase/Firebase projects, implement JWT token exchange.

### Architecture
```
┌─────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  MediQ  │◄───────►│   Supabase   │         │   Supabase   │◄───────►│   Ayudost    │
│   App   │         │   Project A  │         │   Project B  │         │   Chatbot    │
└─────────┘         └──────────────┘         └──────────────┘         └──────────────┘
                           │                         ▲
                           │    JWT Token            │
                           └─────────────────────────┘
```

### Step-by-Step Implementation

#### 1. Create Token Exchange Endpoint

Create a secure backend endpoint to validate and exchange tokens:

**MediQ Backend (Node.js/Express):**
```typescript
// server/routes/token-exchange.ts
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const mediqSupabase = createClient(
  process.env.MEDIQ_SUPABASE_URL!,
  process.env.MEDIQ_SUPABASE_SERVICE_KEY! // Service role key
);

router.post('/api/generate-sso-token', async (req, res) => {
  const { access_token } = req.body;

  try {
    // Verify MediQ token
    const { data: { user }, error } = await mediqSupabase.auth.getUser(access_token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate SSO token (JWT with user info)
    const ssoToken = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        exp: Math.floor(Date.now() / 1000) + (60 * 15), // 15 minutes
      },
      process.env.SSO_SECRET_KEY!, // Shared secret between apps
      { algorithm: 'HS256' }
    );

    res.json({ sso_token: ssoToken });
  } catch (error) {
    res.status(500).json({ error: 'Token generation failed' });
  }
});

export default router;
```

#### 2. Create SSO Login Handler in Ayudost

**Ayudost Backend:**
```typescript
// server/routes/sso-login.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const ayudostSupabase = createClient(
  process.env.AYUDOST_SUPABASE_URL!,
  process.env.AYUDOST_SUPABASE_SERVICE_KEY!
);

router.post('/api/sso-login', async (req, res) => {
  const { sso_token } = req.body;

  try {
    // Verify SSO token
    const decoded = jwt.verify(sso_token, process.env.SSO_SECRET_KEY!) as {
      user_id: string;
      email: string;
      name: string;
    };

    // Check if user exists in Ayudost Supabase
    const { data: existingUser } = await ayudostSupabase.auth.admin.getUserById(decoded.user_id);

    if (!existingUser) {
      // Create user in Ayudost Supabase
      const { data: newUser, error } = await ayudostSupabase.auth.admin.createUser({
        email: decoded.email,
        email_confirm: true,
        user_metadata: { name: decoded.name }
      });

      if (error) throw error;
    }

    // Generate Ayudost session
    const { data, error } = await ayudostSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: decoded.email,
    });

    if (error) throw error;

    res.json({ access_token: data.properties.access_token });
  } catch (error) {
    res.status(401).json({ error: 'SSO login failed' });
  }
});

export default router;
```

#### 3. Frontend Integration

**MediQ: Initiate SSO**
```typescript
// In MediQ app
const loginToAyudost = async () => {
  const { data: { session } } = await mediqSupabase.auth.getSession();

  // Get SSO token from MediQ backend
  const response = await fetch('https://mediq-api.yourdomain.com/api/generate-sso-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: session.access_token })
  });

  const { sso_token } = await response.json();

  // Redirect to Ayudost with SSO token
  window.location.href = `https://ayudost-chatbot.onrender.com/sso-callback?token=${ssoToken}`;
};
```

**Ayudost: Handle SSO Callback**
```typescript
// client/src/pages/sso-callback.tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/services/supabaseClient';

export default function SSOCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('token');

    if (ssoToken) {
      // Exchange SSO token for Ayudost session
      fetch('/api/sso-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sso_token: ssoToken })
      })
      .then(res => res.json())
      .then(({ access_token }) => {
        // Set session in Ayudost Supabase
        return supabase.auth.setSession({ access_token });
      })
      .then(() => {
        setLocation('/dashboard');
      })
      .catch(() => {
        setLocation('/login');
      });
    }
  }, []);

  return <div>Authenticating...</div>;
}
```

### Advantages
- Complete separation between projects
- Each app can have independent database
- Flexible authentication customization

### Disadvantages
- More complex implementation
- Requires backend API for token exchange
- Need to manage shared secret securely
- Must sync user data between systems

---

## Security Best Practices

### 1. Secure Token Storage

**Use httpOnly Cookies (when possible):**
```typescript
// If both apps are on same parent domain
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => {
        // Custom cookie-based storage
        return Cookies.get(key);
      },
      setItem: (key, value) => {
        Cookies.set(key, value, {
          domain: '.yourdomain.com', // Parent domain
          secure: true,
          sameSite: 'lax',
          expires: 7 // 7 days
        });
      },
      removeItem: (key) => {
        Cookies.remove(key, { domain: '.yourdomain.com' });
      }
    }
  }
});
```

**Otherwise, use localStorage with encryption:**
```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.VITE_STORAGE_ENCRYPTION_KEY!;

const secureStorage = {
  getItem: (key: string) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
  setItem: (key: string, value: string) => {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encrypted);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
```

### 2. Token Validation

Always verify tokens server-side:

```typescript
// Backend token verification
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function verifyToken(accessToken: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  return user;
}
```

### 3. CORS Configuration

Configure CORS properly for cross-origin requests:

```typescript
// Express server
import cors from 'cors';

app.use(cors({
  origin: [
    'https://mediq.yourdomain.com',
    'https://ayudost-chatbot.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Token Expiration

Set appropriate token expiration times:

```typescript
// Supabase configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-session-lifetime': '3600', // 1 hour
    },
  },
});
```

### 5. Environment Variables

Keep all sensitive keys in environment variables:

```env
# MediQ
VITE_SUPABASE_URL=https://mediq-project.supabase.co
VITE_SUPABASE_ANON_KEY=mediq_anon_key
SUPABASE_SERVICE_KEY=mediq_service_key
SSO_SECRET_KEY=shared_secret_key_between_apps

# Ayudost
VITE_SUPABASE_URL=https://ayudost-project.supabase.co
VITE_SUPABASE_ANON_KEY=ayudost_anon_key
SUPABASE_SERVICE_KEY=ayudost_service_key
SSO_SECRET_KEY=same_shared_secret_key
```

---

## Implementation Steps

### Quick Start (Option A: Shared Supabase)

1. **Update Environment Variables:**
   - Use same Supabase URL and keys in both apps
   - Ensure both apps use same `storageKey` in Supabase config

2. **Configure Supabase Dashboard:**
   - Add all redirect URLs for both apps
   - Enable email/password authentication
   - (Optional) Configure Google OAuth provider

3. **Deploy Both Apps:**
   - MediQ: `npm run build && deploy`
   - Ayudost: `npm run build && deploy`

4. **Test SSO Flow:**
   - Log in to MediQ
   - Navigate to Ayudost
   - User should be automatically logged in

### Testing Checklist

- [ ] User can register in MediQ
- [ ] User session persists after refresh in MediQ
- [ ] User can access Ayudost without re-login
- [ ] User session persists after refresh in Ayudost
- [ ] Logout from MediQ logs out of Ayudost
- [ ] Logout from Ayudost logs out of MediQ
- [ ] Google OAuth works on both apps
- [ ] Password reset works on both apps

---

## Troubleshooting

### Issue: Session Not Shared Between Apps

**Symptoms:**
- User logged in to MediQ but not recognized in Ayudost

**Solutions:**
1. Verify both apps use same Supabase project
2. Check that `storageKey` is identical in both apps
3. Ensure redirect URLs are configured in Supabase
4. Clear browser cache and localStorage
5. Check browser console for CORS errors

### Issue: Token Expired Error

**Symptoms:**
- User gets logged out frequently
- "JWT expired" error

**Solutions:**
1. Enable `autoRefreshToken` in Supabase config
2. Implement token refresh logic:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

### Issue: CORS Errors

**Symptoms:**
- Network requests blocked by browser
- "Access-Control-Allow-Origin" error

**Solutions:**
1. Add domains to Supabase allowed origins
2. Configure backend CORS settings
3. Use proxy for development:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-supabase-project.supabase.co',
        changeOrigin: true,
      }
    }
  }
});
```

### Issue: User Data Not Syncing

**Symptoms:**
- User updates in MediQ not reflected in Ayudost

**Solutions:**
1. Use Supabase Realtime subscriptions:
```typescript
const channel = supabase
  .channel('user-updates')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'auth',
      table: 'users'
    },
    (payload) => {
      // Update local user state
      refreshUser();
    }
  )
  .subscribe();
```

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## Support

For issues or questions:
- Check Supabase logs in Dashboard
- Review browser Network tab for API errors
- Contact your development team
- Open issue on project repository
