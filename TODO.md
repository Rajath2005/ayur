# TODO: Fix Google Login Redirect Issue

## Tasks
- [ ] Modify `client/src/services/auth.ts`: Change signInWithGoogle to use signInWithPopup instead of signInWithRedirect to avoid redirect flow issues
- [ ] Modify `client/src/contexts/AuthContext.tsx`: Remove getRedirectResult check as it's not needed for popup flow
- [ ] Modify `client/src/pages/login.tsx`: Update handleGoogleSignIn to refresh user and redirect after successful popup sign-in
- [ ] Modify `client/src/pages/register.tsx`: Update handleGoogleSignIn to refresh user and redirect after successful popup sign-in

## Followup Steps
- [ ] Test Google login popup and redirect to dashboard
- [ ] Test Google registration popup and redirect to dashboard
- [ ] Verify no redirect flow issues remain
