import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { initGlobalErrorLogging } from '@/lib/errorLogger';

// Init once at module load
initGlobalErrorLogging();
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/app/ErrorBoundary';
import DebugPanel from '@/components/app/DebugPanel';
import Layout from './components/Layout';
import AppLayout from './components/AppLayout';
import AppAuthGate from './components/app/AppAuthGate';
import Dashboard from './pages/app/Dashboard';
import Schedule from './pages/app/Schedule';
import Promo from './pages/app/Promo';
// Analytics merged into Dashboard
import Coach from './pages/app/Coach';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import ForCreators from './pages/ForCreators';
import Pricing from './pages/Pricing';
import FoundingCreators from './pages/FoundingCreators';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Waitlist from './pages/Waitlist';
import Blog from './pages/Blog';
import Notifications from './pages/app/Notifications';
import GoLive from './pages/app/GoLive';
import PostLiveDebrief from './pages/app/PostLiveDebrief';
import ReplayReviewPage from './pages/app/ReplayReview';

import Strategy from './pages/app/Strategy';
import AudienceMonetization from './pages/app/AudienceMonetization';
import Experiments from './pages/app/Experiments';
import Profile from './pages/app/Profile';
import Settings from './pages/app/Settings';
import Billing from './pages/app/Billing';
import AdminAuthGate from './components/app/admin/AdminAuthGate';
import AdminDashboard from './pages/app/admin/Dashboard';
import AdminExtensions from './pages/app/admin/ExtensionIntegrations';
import AdminImports from './pages/app/admin/ImportLogCenter';
import AdminReview from './pages/app/admin/ManualReviewQueue';
import AdminSessions from './pages/app/admin/SessionInspection';
import AdminErrors from './pages/app/admin/ErrorCenter';
import AdminSupport from './pages/app/admin/CreatorSupport';
import AdminSupportTickets from './pages/app/admin/SupportTickets';
import AdminMessaging from './pages/app/admin/Messaging';
import AdminGameLibrary from './pages/app/admin/GameLibraryAdmin';
import AdminUsers from './pages/app/admin/Users';
import GameIntel from './pages/app/GameIntel';

import DesktopAuth from './pages/DesktopAuth';
import DesktopCallback from './pages/DesktopCallback';
import ILoveYouMegan from './pages/ILoveYouMegan';
import ExtensionAuth from './pages/ExtensionAuth';
import OGCreators from './pages/OGCreators';
import Investors from './pages/Investors';
import GamesLibrary from './pages/GamesLibrary';
import TikTokAppealHelper from './pages/TikTokAppealHelper';
import PreOrder from './pages/PreOrder';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Track page views with GA4
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle user not registered error
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render all routes - AppAuthGate handles /app route protection
  return (
    <ErrorBoundary name="App">
      <Routes>
      <Route path="/app/*" element={<AppAuthGate />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="promo" element={<Promo />} />

          <Route path="coach" element={<Coach />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="golive" element={<GoLive />} />
          <Route path="debrief" element={<PostLiveDebrief />} />
          <Route path="replay" element={<ReplayReviewPage />} />

          <Route path="strategy" element={<Strategy />} />
          <Route path="audience" element={<AudienceMonetization />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="games" element={<GameIntel />} />
        </Route>
        <Route element={<AdminAuthGate />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/extensions" element={<AdminExtensions />} />
          <Route path="admin/imports" element={<AdminImports />} />
          <Route path="admin/review" element={<AdminReview />} />
          <Route path="admin/sessions" element={<AdminSessions />} />
          <Route path="admin/errors" element={<AdminErrors />} />
          <Route path="admin/games" element={<AdminGameLibrary />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/support" element={<AdminSupportTickets />} />
          <Route path="admin/creators" element={<AdminSupport />} />
          <Route path="admin/messaging" element={<AdminMessaging />} />
        </Route>
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-creators" element={<ForCreators />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/founding-creators" element={<FoundingCreators />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/i-love-you-megan" element={<ILoveYouMegan />} />
        <Route path="/extension-auth" element={<ExtensionAuth />} />
        <Route path="/desktop/auth" element={<DesktopAuth />} />
        <Route path="/desktop/callback" element={<DesktopCallback />} />
        <Route path="/og-creators" element={<OGCreators />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/popular-tiktok-games" element={<GamesLibrary />} />
        <Route path="/tiktok-appeal-helper" element={<TikTokAppealHelper />} />
        <Route path="/preorder" element={<PreOrder />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
    <DebugPanel />
    </ErrorBoundary>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App