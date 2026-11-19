import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { PageSkeleton } from '@/components/ui/Skeletons'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { ROUTES } from '@/lib/constants'

// Eagerly load tiny pages that are always needed at startup
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// ─── Lazy-loaded protected pages ──────────────────────────────────────────────
// Each import() call becomes its own JS chunk — loaded only when the route is
// visited, keeping the initial bundle as small as possible.

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const RecyclerDashboard = lazy(() =>
  import('@/pages/RecyclerDashboard').then((m) => ({ default: m.RecyclerDashboard }))
)
const IncentivesMarketplacePage = lazy(() =>
  import('@/pages/IncentivesMarketplacePage').then((m) => ({ default: m.IncentivesMarketplacePage }))
)
const IncentivesPage = lazy(() =>
  import('@/pages/IncentivesPage').then((m) => ({ default: m.IncentivesPage }))
)
const WasteListPage = lazy(() =>
  import('@/pages/WasteListPage').then((m) => ({ default: m.WasteListPage }))
)
const ManufacturerDashboardPage = lazy(() =>
  import('@/pages/ManufacturerDashboardPage').then((m) => ({
    default: m.ManufacturerDashboardPage,
  }))
)
const CollectorDashboardPage = lazy(() =>
  import('@/pages/CollectorDashboardPage').then((m) => ({ default: m.CollectorDashboardPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const RewardsPage = lazy(() =>
  import('@/pages/RewardsPage').then((m) => ({ default: m.RewardsPage }))
)
const SupplyChainTrackerPage = lazy(() =>
  import('@/pages/SupplyChainTrackerPage').then((m) => ({ default: m.SupplyChainTrackerPage }))
)
const CommunityPage = lazy(() =>
  import('@/pages/CommunityPage').then((m) => ({ default: m.CommunityPage }))
)
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
)
const WasteMapPage = lazy(() =>
  import('@/pages/WasteMapPage').then((m) => ({ default: m.WasteMapPage }))
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const VerificationPage = lazy(() =>
  import('@/pages/VerificationPage').then((m) => ({ default: m.VerificationPage }))
)
const RoutePlannerPage = lazy(() =>
  import('@/pages/RoutePlannerPage').then((m) => ({ default: m.RoutePlannerPage }))
)
const MessagingPage = lazy(() =>
  import('@/pages/MessagingPage').then((m) => ({ default: m.MessagingPage }))
)
const WasteComparisonPage = lazy(() =>
  import('@/pages/WasteComparisonPage').then((m) => ({ default: m.WasteComparisonPage }))
)
const PredictiveAnalyticsPage = lazy(() =>
  import('@/pages/PredictiveAnalyticsPage').then((m) => ({ default: m.PredictiveAnalyticsPage }))
)
const WasteMarketplacePage = lazy(() =>
  import('@/pages/WasteMarketplacePage').then((m) => ({ default: m.WasteMarketplacePage }))
)
const WasteCertificationPage = lazy(() =>
  import('@/pages/WasteCertificationPage').then((m) => ({ default: m.WasteCertificationPage }))
)
const RecyclingGuidePage = lazy(() =>
  import('@/pages/RecyclingGuidePage').then((m) => ({ default: m.RecyclingGuidePage }))
)
const PerformanceMonitoringPage = lazy(() =>
  import('@/pages/PerformanceMonitoringPage').then((m) => ({
    default: m.PerformanceMonitoringPage,
  }))
)
const GamificationPage = lazy(() =>
  import('@/pages/GamificationPage').then((m) => ({ default: m.GamificationPage }))
)
const OfflinePage = lazy(() =>
  import('@/pages/OfflinePage').then((m) => ({ default: m.OfflinePage }))
)
const WasteHistoryPage = lazy(() =>
  import('@/pages/WasteHistoryPage').then((m) => ({ default: m.WasteHistoryPage }))
)
const ParticipantSearchPage = lazy(() =>
  import('@/pages/ParticipantSearchPage').then((m) => ({ default: m.ParticipantSearchPage }))
)
const WasteStatisticsPage = lazy(() =>
  import('@/pages/WasteStatisticsPage').then((m) => ({ default: m.WasteStatisticsPage }))
)
const RewardTrackingPage = lazy(() =>
  import('@/pages/RewardTrackingPage').then((m) => ({ default: m.RewardTrackingPage }))
)
const MaterialTransferPage = lazy(() =>
  import('@/pages/MaterialTransferPage').then((m) => ({ default: m.MaterialTransferPage }))
)
const WasteVerificationDashboardPage = lazy(() =>
  import('@/pages/WasteVerificationDashboardPage').then((m) => ({
    default: m.WasteVerificationDashboardPage,
  }))
)
const ParticipantRegistrationPage = lazy(() =>
  import('@/pages/ParticipantRegistrationPage').then((m) => ({
    default: m.ParticipantRegistrationPage,
  }))
)
const TestReportsPage = lazy(() =>
  import('@/pages/TestReportsPage').then((m) => ({ default: m.TestReportsPage }))
)
const ComplianceReportsPage = lazy(() =>
  import('@/pages/ComplianceReportsPage').then((m) => ({ default: m.ComplianceReportsPage }))
)
const NotificationCenterPage = lazy(() =>
  import('@/pages/NotificationCenterPage').then((m) => ({ default: m.NotificationCenterPage }))
)
const BatchUploadPage = lazy(() =>
  import('@/pages/BatchUploadPage').then((m) => ({ default: m.BatchUploadPage }))
)
const FeatureFlagsPage = lazy(() =>
  import('@/pages/FeatureFlagsPage').then((m) => ({ default: m.FeatureFlagsPage }))
)
const PlatformHealthDashboardPage = lazy(() =>
  import('@/pages/PlatformHealthDashboardPage').then((m) => ({
    default: m.PlatformHealthDashboardPage,
  }))
)
const PerformanceSLAsPage = lazy(() =>
  import('@/pages/PerformanceSLAsPage').then((m) => ({ default: m.PerformanceSLAsPage }))
)
const GovernancePage = lazy(() =>
  import('@/pages/GovernancePage').then((m) => ({ default: m.GovernancePage }))
)
// Previously missing pages — now lazy-loaded
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)
const CharityDonationsPage = lazy(() =>
  import('@/pages/CharityDonationsPage').then((m) => ({ default: m.CharityDonationsPage }))
)
const EnvironmentalImpactDashboardPage = lazy(() =>
  import('@/pages/EnvironmentalImpactDashboardPage').then((m) => ({
    default: m.EnvironmentalImpactDashboardPage,
  }))
)
const ImpactCalculatorPage = lazy(() =>
  import('@/pages/ImpactCalculatorPage').then((m) => ({ default: m.ImpactCalculatorPage }))
)
const SearchResultsPage = lazy(() =>
  import('@/pages/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage }))
)
const SubscriptionsPage = lazy(() =>
  import('@/pages/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage }))
)
const QRCodePage = lazy(() =>
  import('@/pages/QRCodePage').then((m) => ({ default: m.QRCodePage }))
)
const OfflineSettings = lazy(() =>
  import('@/pages/OfflineSettings').then((m) => ({ default: m.OfflineSettings }))
)

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
// Wraps the route outlet in a Suspense boundary so every lazy page gets a
// consistent PageSkeleton loading fallback while its chunk is being fetched.

// eslint-disable-next-line react-refresh/only-export-components
function PageFallback() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Outlet />
    </Suspense>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? (
    <AppShell>
      <PageFallback />
    </AppShell>
  ) : (
    <Navigate to={ROUTES.LOGIN} replace />
  )
}

// Each protected page gets its own `errorElement` so a crash on one route
// renders a fallback in place of just that page — the app shell and every
// other route stay unaffected, and navigating away recovers automatically.
export const PROTECTED_ROUTES = [
  { path: ROUTES.DASHBOARD, element: <HomePage /> },
  { path: ROUTES.SUBMIT, element: <div>Submit Waste</div> },
  { path: ROUTES.COLLECT, element: <CollectorDashboardPage /> },
  { path: ROUTES.INCENTIVES, element: <IncentivesMarketplacePage /> },
  { path: ROUTES.INCENTIVES_MANAGE, element: <IncentivesPage /> },
  { path: ROUTES.TRANSFER, element: <MaterialTransferPage /> },
  { path: ROUTES.HISTORY, element: <div>History</div> },
  { path: ROUTES.DASHBOARD_RECYCLER, element: <RecyclerDashboard /> },
  { path: ROUTES.WASTES, element: <WasteListPage /> },
  { path: ROUTES.MANUFACTURER, element: <ManufacturerDashboardPage /> },
  { path: ROUTES.SETTINGS, element: <SettingsPage /> },
  { path: ROUTES.SETTINGS_OFFLINE, element: <OfflineSettings /> },
  { path: ROUTES.REWARDS, element: <RewardsPage /> },
  { path: ROUTES.TRACKER, element: <SupplyChainTrackerPage /> },
  { path: ROUTES.COMMUNITY, element: <CommunityPage /> },
  { path: ROUTES.GOVERNANCE, element: <GovernancePage /> },
  { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
  { path: ROUTES.MAP, element: <WasteMapPage /> },
  { path: ROUTES.ADMIN, element: <AdminDashboardPage /> },
  { path: ROUTES.VERIFY, element: <VerificationPage /> },
  { path: ROUTES.ROUTE_PLANNER, element: <RoutePlannerPage /> },
  { path: ROUTES.MESSAGES, element: <MessagingPage /> },
  { path: ROUTES.COMPARE, element: <WasteComparisonPage /> },
  { path: ROUTES.PREDICTIONS, element: <PredictiveAnalyticsPage /> },
  { path: ROUTES.MARKETPLACE, element: <WasteMarketplacePage /> },
  { path: ROUTES.CERTIFICATIONS, element: <WasteCertificationPage /> },
  { path: ROUTES.RECYCLING_GUIDE, element: <RecyclingGuidePage /> },
  { path: ROUTES.PERFORMANCE, element: <PerformanceMonitoringPage /> },
  { path: ROUTES.ACHIEVEMENTS, element: <GamificationPage /> },
  { path: ROUTES.OFFLINE, element: <OfflinePage /> },
  { path: ROUTES.WASTE_HISTORY, element: <WasteHistoryPage /> },
  { path: ROUTES.PARTICIPANT_SEARCH, element: <ParticipantSearchPage /> },
  { path: ROUTES.WASTE_STATISTICS, element: <WasteStatisticsPage /> },
  { path: ROUTES.REWARD_TRACKING, element: <RewardTrackingPage /> },
  { path: ROUTES.VERIFICATION_DASHBOARD, element: <WasteVerificationDashboardPage /> },
  { path: ROUTES.REGISTER, element: <ParticipantRegistrationPage /> },
  { path: ROUTES.TEST_REPORTS, element: <TestReportsPage /> },
  { path: ROUTES.COMPLIANCE_REPORTS, element: <ComplianceReportsPage /> },
  { path: ROUTES.NOTIFICATIONS, element: <NotificationCenterPage /> },
  { path: ROUTES.BATCH_UPLOAD, element: <BatchUploadPage /> },
  { path: ROUTES.FEATURE_FLAGS, element: <FeatureFlagsPage /> },
  { path: ROUTES.HEALTH, element: <PlatformHealthDashboardPage /> },
  { path: ROUTES.SLAS, element: <PerformanceSLAsPage /> },
  // Previously unrouted pages — wired up with lazy loading
  { path: ROUTES.PROFILE, element: <ProfilePage /> },
  { path: ROUTES.DONATIONS, element: <CharityDonationsPage /> },
  { path: ROUTES.ENVIRONMENTAL_IMPACT, element: <EnvironmentalImpactDashboardPage /> },
  { path: ROUTES.IMPACT_CALCULATOR, element: <ImpactCalculatorPage /> },
  { path: ROUTES.SEARCH, element: <SearchResultsPage /> },
  { path: ROUTES.SUBSCRIPTIONS, element: <SubscriptionsPage /> },
  { path: ROUTES.QR, element: <QRCodePage /> },
]

export const router = createBrowserRouter([
  { path: ROUTES.ROOT, element: <Navigate to={ROUTES.LOGIN} replace /> },
  { path: ROUTES.LOGIN, element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: ROUTES.ROOT, element: <LandingPage />, errorElement: <RouteErrorBoundary /> },
  {
    element: <ProtectedLayout />,
    errorElement: <RouteErrorBoundary />,
    children: PROTECTED_ROUTES.map((route) => ({
      ...route,
      errorElement: <RouteErrorBoundary />,
    })),
  },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage />, errorElement: <RouteErrorBoundary /> },
])
