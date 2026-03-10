import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

// Pages
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { PolicyPage } from './pages/PolicyPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Root component that handles auto-redirect
const Root: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkerId } = useStore();

  useEffect(() => {
    // If user has a stored worker ID, redirect to their dashboard
    if (currentWorkerId) {
      navigate(`/dashboard/${currentWorkerId}`);
    }
  }, [currentWorkerId, navigate]);

  return <Landing />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard/:workerId" element={<WorkerDashboard />} />
          <Route path="/policy/:workerId" element={<PolicyPage />} />
          <Route path="/claims/:workerId" element={<ClaimsPage />} />
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
