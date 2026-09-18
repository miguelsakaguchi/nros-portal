import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@workspace/nros-design-system/components/ui/toaster';
import { TooltipProvider } from '@workspace/nros-design-system/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { PortalShell } from '@/components/PortalShell';
import {
  SessionErrorScreen,
  SessionLoadingScreen,
  SignInScreen,
} from '@/components/AuthScreens';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { DashboardPage } from '@/pages/dashboard';
import { RisksPage } from '@/pages/riscos';
import { PlansPage } from '@/pages/planos';
import { AssessmentPage } from '@/pages/avaliacao';
import { ReportsPage } from '@/pages/relatorios';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();

  if (location === "/avaliacao") {
    return (
      <RoutedErrorBoundary>
        <AssessmentPage />
      </RoutedErrorBoundary>
    );
  }

  return (
    <AuthProvider>
      <AuthGate>
        <RoutedErrorBoundary>
          <PortalShell>
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/riscos" component={RisksPage} />
              <Route path="/plano-de-acao" component={PlansPage} />
              <Route path="/relatorios" component={ReportsPage} />
              <Route component={NotFound} />
            </Switch>
          </PortalShell>
        </RoutedErrorBoundary>
      </AuthGate>
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading, error } = useAuth();
  if (isLoading) return <SessionLoadingScreen />;
  if (error) return <SessionErrorScreen />;
  if (!user) return <SignInScreen />;
  return children;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
