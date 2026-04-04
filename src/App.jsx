import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import AppLayout from './components/AppLayout';
import AppAuthGate from './components/app/AppAuthGate';
import Dashboard from './pages/app/Dashboard';
import Schedule from './pages/app/Schedule';
import Promo from './pages/app/Promo';
import Analytics from './pages/app/Analytics';
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
import AudienceMonetization from './pages/app/AudienceMonetization';
import Experiments from './pages/app/Experiments';
import Profile from './pages/app/Profile';
import Settings from './pages/app/Settings';
import AdminAuthGate from './components/app/admin/AdminAuthGate';
import AdminDashboard from './pages/app/admin/Dashboard';
import AdminExtensions from './pages/app/admin/ExtensionIntegrations';
import AdminImports from './pages/app/admin/ImportLogCenter';
import AdminReview from './pages/app/admin/ManualReviewQueue';
import AdminSessions from './pages/app/admin/SessionInspection';
import AdminErrors from './pages/app/admin/ErrorCenter';
import AdminSupport from './pages/app/admin/CreatorSupport';
import AdminMessaging from './pages/app/admin/Messaging';
import TikTokCallback from './pages/TikTokCallback';
import DesktopAuth from './pages/DesktopAuth';
import DesktopCallback from './pages/DesktopCallback';
import ILoveYouMegan from './pages/ILoveYouMegan';
import ExtensionAuth from './pages/ExtensionAuth';

const HomeRedirect = () => <Navigate to="/app/dashboard" replace />;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
  if (authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  } else if (authError.type === 'auth_required') {
    // Allow TikTok callback page to load without auth — it will handle login redirect itself
    if (['/tiktok-callback', '/desktop/auth', '/desktop/callback'].includes(window.location.pathname)) {
      return (
        <Routes>
          <Route path="/tiktok-callback" element={<TikTokCallback />} />
          <Route path="/desktop/auth" element={<DesktopAuth />} />
          <Route path="/desktop/callback" element={<DesktopCallback />} />
          <Route path="*" element={null} />
        </Routes>
      );
    }
    navigateToLogin();
    return null;
  }
  }

  // Redirect authenticated users to dashboard
  return (
    <Routes>
      <Route path="/app/*" element={<AppAuthGate />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="promo" element={<Promo />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="coach" element={<Coach />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="golive" element={<GoLive />} />
          <Route path="debrief" element={<PostLiveDebrief />} />
          <Route path="replay" element={<ReplayReviewPage />} />
          <Route path="audience" element={<AudienceMonetization />} />
          <Route path="experiments" element={<Experiments />} />
        </Route>
        <Route element={<AdminAuthGate />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/extensions" element={<AdminExtensions />} />
          <Route path="admin/imports" element={<AdminImports />} />
          <Route path="admin/review" element={<AdminReview />} />
          <Route path="admin/sessions" element={<AdminSessions />} />
          <Route path="admin/errors" element={<AdminErrors />} />
          <Route path="admin/support" element={<AdminSupport />} />
          <Route path="admin/messaging" element={<AdminMessaging />} />
        </Route>
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/tiktok-callback" element={<TikTokCallback />} />
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
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
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