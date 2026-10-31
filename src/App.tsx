import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './components/common/Toast';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { UserDashboard } from './components/dashboard/UserDashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05030a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1st Page: If user is not authenticated, show ONLY the Login / Signup page!
  if (!user) {
    return (
      <div className="min-h-screen bg-[#05030a] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

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
    <AuthProvider>
      <InventoryProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
