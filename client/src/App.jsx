import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HistoryView from './pages/HistoryView';
import Login from './pages/Login';
import Register from './pages/Register';
import DailyCheckInModal from './components/DailyCheckInModal';
import JournalModal from './components/JournalModal';
import AssessmentModal from './components/AssessmentModal';
import GroundingTool from './components/GroundingTool';
import AlertSenderModal from './components/AlertSenderModal';
import Chatbot from './components/Chatbot';

export default function App() {
  const { user, loading, fetchWithAuth } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isAlertSenderOpen, setIsAlertSenderOpen] = useState(false);

  // Dashboard shared data
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(false);

  const loadDashboard = async () => {
    if (!user) return;
    setDashLoading(true);
    try {
      const res = await fetchWithAuth('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleActionSuccess = () => {
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Initializing SentinelMind AI...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Authenticated application
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 relative">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCheckIn={() => setIsCheckInOpen(true)}
        openJournal={() => setIsJournalOpen(true)}
        openAssessment={() => setIsAssessmentOpen(true)}
        openGrounding={() => setIsGroundingOpen(true)}
        openAlertSender={() => setIsAlertSenderOpen(true)}
        distressRisk={dashboardData?.distress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' ? (
          <Dashboard
            openCheckIn={() => setIsCheckInOpen(true)}
            openJournal={() => setIsJournalOpen(true)}
            openAssessment={() => setIsAssessmentOpen(true)}
            openGrounding={() => setIsGroundingOpen(true)}
            openAlertSender={() => setIsAlertSenderOpen(true)}
            dashboardData={dashboardData}
            loading={dashLoading}
            refreshDashboard={loadDashboard}
          />
        ) : (
          <HistoryView />
        )}
      </main>

      {/* Floating Action Modals */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <GroundingTool
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
      />

      <AlertSenderModal
        isOpen={isAlertSenderOpen}
        onClose={() => setIsAlertSenderOpen(false)}
        distressRisk={dashboardData?.distress}
      />

      {/* Floating AI Chatbot Assistant */}
      <Chatbot
        distressContext={dashboardData?.distress}
        openGrounding={() => setIsGroundingOpen(true)}
        openAssessment={() => setIsAssessmentOpen(true)}
        openJournal={() => setIsJournalOpen(true)}
        openCheckIn={() => setIsCheckInOpen(true)}
        openAlertSender={() => setIsAlertSenderOpen(true)}
      />

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SentinelMind — Dynamic AI Mental Wellness Monitoring & Longitudinal Distress Prediction</span>
          <span className="font-semibold text-slate-700">Clinical AI Screening • Non-Diagnostic Monitoring</span>
        </div>
      </footer>
    </div>
  );
}
