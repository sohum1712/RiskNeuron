import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { PolicyPage } from './pages/PolicyPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';

// Root component — shows landing page, no auto-redirect
// Users can explicitly navigate to their dashboard via Login
const Root: React.FC = () => {
  return <Landing />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard/:workerId" element={<WorkerDashboard />} />
          <Route path="/policy/:workerId" element={<PolicyPage />} />
          <Route path="/claims/:workerId" element={<ClaimsPage />} />
          <Route path="/profile/:workerId" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '16px'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F8FAFC'
              }
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F8FAFC'
              }
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
