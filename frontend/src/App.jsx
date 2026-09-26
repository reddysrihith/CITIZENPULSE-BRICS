import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import JudgeDemoModal from './components/demo/JudgeDemoModal';

import LandingPage from './pages/LandingPage';
import CitizenRequestPage from './pages/CitizenRequestPage';
import DashboardPage from './pages/DashboardPage';
import HotspotsPage from './pages/HotspotsPage';
import InfrastructurePage from './pages/InfrastructurePage';
import RecommendationsPage from './pages/RecommendationsPage';
import PolicyBriefPage from './pages/PolicyBriefPage';
import ImpactSimulatorPage from './pages/ImpactSimulatorPage';
import BricsViewPage from './pages/BricsViewPage';
import DataExplorerPage from './pages/DataExplorerPage';
import IngestionPage from './pages/IngestionPage';
import ResponsibleAiPage from './pages/ResponsibleAiPage';
import AdminPage from './pages/AdminPage';
import SubmissionPage from './pages/SubmissionPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-[#07111F] text-slate-100 font-sans">
          {/* Global Sidebar Navigation */}
          <Sidebar />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Bar */}
            <TopBar />

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/citizen" element={<CitizenRequestPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/hotspots" element={<HotspotsPage />} />
                <Route path="/infrastructure" element={<InfrastructurePage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/policy-brief" element={<PolicyBriefPage />} />
                <Route path="/impact" element={<ImpactSimulatorPage />} />
                <Route path="/brics" element={<BricsViewPage />} />
                <Route path="/data" element={<DataExplorerPage />} />
                <Route path="/ingestion" element={<IngestionPage />} />
                <Route path="/responsible-ai" element={<ResponsibleAiPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/submission" element={<SubmissionPage />} />
              </Routes>
            </main>
          </div>

          {/* Floating 3-Minute Judge Demo Modal */}
          <JudgeDemoModal />
        </div>
      </Router>
    </AppProvider>
  );
}
