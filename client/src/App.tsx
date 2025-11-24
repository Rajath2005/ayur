import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import DrishtiPage from "@/pages/drishti";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import ConversationsPage from "@/pages/conversations";
import SubscriptionPage from "@/pages/subscription";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import NotFound from "@/pages/not-found";
import { MobileAppLayout } from "@/components/layouts/MobileAppLayout";
import Preloader from "./preloader/Preloader";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/chat/:id">
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      </Route>
      <Route path="/drishti-upload">
        <ProtectedRoute>
          <DrishtiPage />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/conversations">
        <ProtectedRoute>
          <ConversationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/subscription">
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CookieConsentProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Preloader />
              <Toaster />
              <CookieConsentBanner />
              <MobileAppLayout>
                <Router />
              </MobileAppLayout>
            </TooltipProvider>
          </ThemeProvider>
        </CookieConsentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
