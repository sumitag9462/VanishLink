// File: src/router/index.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts and critical components can remain static imports or be lazy-loaded
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Auth Pages
const Login = React.lazy(() => import('../pages/Auth/Login'));
const Register = React.lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/Auth/ForgotPassword'));
const OAuthCallback = React.lazy(() => import('../pages/Auth/OAuthCallback'));
const AdminLogin = React.lazy(() => import('../pages/Auth/AdminLogin'));
const AdminRegister = React.lazy(() => import('../pages/Auth/AdminRegister'));

// Public Pages
const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const RedirectHandler = React.lazy(() => import('../pages/Public/RedirectHandler'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const WatchRoom = React.lazy(() => import('../pages/Public/WatchRoom'));

// User Dashboard
const DashboardHome = React.lazy(() => import('../pages/Dashboard/Home'));
const MyLinks = React.lazy(() => import('../pages/Dashboard/MyLinks'));
const CreateLink = React.lazy(() => import('../pages/Dashboard/CreateLink'));
const Browse = React.lazy(() => import('../pages/Dashboard/Browse'));
const MyReports = React.lazy(() => import('../pages/Dashboard/MyReports'));
const Analytics = React.lazy(() => import('../pages/Dashboard/Analytics'));
const GhostAnalytics = React.lazy(() => import('../pages/Dashboard/GhostAnalytics'));
const Settings = React.lazy(() => import('../pages/Dashboard/Settings'));
const WatchParty = React.lazy(() => import('../pages/Dashboard/WatchParty'));
const WebhookAudit = React.lazy(() => import('../pages/Dashboard/WebhookAudit'));
const DeveloperPortal = React.lazy(() => import('../pages/Dashboard/DeveloperPortal'));
const WorkspaceSettings = React.lazy(() => import('../pages/Dashboard/WorkspaceSettings'));
const BiolinkEditor = React.lazy(() => import('../pages/Dashboard/BiolinkEditor'));
const BiolinkView = React.lazy(() => import('../pages/Public/BiolinkView'));

// Admin Dashboard
const AdminDashboard = React.lazy(() => import('../pages/Admin/AdminDashboard'));
const LinkManagement = React.lazy(() => import('../pages/Admin/LinkManagement'));
const UserControls = React.lazy(() => import('../pages/Admin/UserControls'));
const AuditLogs = React.lazy(() => import('../pages/Admin/AuditLogs'));
const SystemSettings = React.lazy(() => import('../pages/Admin/SystemSettings'));
const Security = React.lazy(() => import('../pages/Admin/Security'));
const Moderation = React.lazy(() => import('../pages/Admin/Moderation'));

// Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="links" element={<MyLinks />} />
          <Route path="links/create" element={<CreateLink />} />
          <Route path="browse" element={<Browse />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ghost-analytics" element={<GhostAnalytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="watch" element={<WatchParty />} />
          <Route path="webhooks" element={<WebhookAudit />} />
          <Route path="developer" element={<DeveloperPortal />} />
          <Route path="workspaces" element={<WorkspaceSettings />} />
          <Route path="biolink" element={<BiolinkEditor />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="links" element={<LinkManagement />} />
          <Route path="users" element={<UserControls />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Public watch room */}
        <Route path="/watch/:roomCode" element={<WatchRoom />} />

        {/* Public Biolink view */}
        <Route path="/bio/:username" element={<BiolinkView />} />

        <Route path="/:slug" element={<RedirectHandler />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
