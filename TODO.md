# Fix Authentication Issues

## Information Gathered
- Client uses Firebase Auth with Google sign-in popup flow
- Server verifies Firebase ID tokens via middleware
- Errors observed:
  - Cross-Origin-Opener-Policy blocks window.close in Google sign-in popup
  - 401 Unauthorized on /api/conversations GET and POST requests
- Token retrieval uses getIdToken without force refresh, potentially causing expired token issues
- Firebase configs need verification for client/server consistency

## Plan
1. **Fix Token Expiration**: Modify `getIdTokenForCurrentUser` to force refresh tokens to prevent 401 errors from expired tokens
2. **Address COOP Issue**: Switch from popup to redirect flow for Google sign-in to avoid COOP policy blocking
3. **Verify Firebase Config**: Ensure client and server use matching Firebase project configurations
4. **Test Authentication Flow**: Verify sign-in works and API calls succeed with valid tokens

## Dependent Files to Edit
- `client/src/services/auth.ts` - Update token retrieval and sign-in method
- `client/src/contexts/AuthContext.tsx` - Update to handle redirect flow
- `client/src/pages/login.tsx` - Update sign-in UI if needed

## Followup Steps
- Test Google sign-in flow
- Verify API calls work after authentication
- Check Firebase console for any configuration issues
