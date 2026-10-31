import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './lib/theme/useTheme';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { UserDashboard } from './components/dashboard/UserDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // If user is not authenticated, show the Login / Signup page directly without preloader!
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#05030a] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
        <div className="w-full flex items-center justify-center relative z-10 animate-in fade-in duration-300">
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  // Once authenticated: Show the customized User Dashboard with Bottom Navbar
  return <UserDashboard />;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
