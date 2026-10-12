import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ExploreAthletes } from './pages/ExploreAthletes';
import { FindCoaches } from './pages/FindCoaches';
import { Organizations } from './pages/Organizations';
import { OrganizationProfile } from './pages/OrganizationProfile';
import { Opportunities } from './pages/Opportunities';
import { OpportunityDetails } from './pages/OpportunityDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { NotFound } from './pages/NotFound';

// Authenticated Pages
import { Dashboard } from './pages/Dashboard';
import { MyProfile } from './pages/MyProfile';
import { EditProfile } from './pages/EditProfile';
import { SavedOpportunities } from './pages/SavedOpportunities';
import { MyApplications } from './pages/MyApplications';
import { Connections } from './pages/Connections';
import { CoachingInquiries } from './pages/CoachingInquiries';
import { Notifications } from './pages/Notifications';
import { AccountSettings } from './pages/AccountSettings';

// Organization & Organizer Pages
import { CreateOpportunity } from './pages/CreateOpportunity';
import { EditOpportunity } from './pages/EditOpportunity';
import { ManageOpportunities } from './pages/ManageOpportunities';
import { ReviewApplications } from './pages/ReviewApplications';
import { ApplicantDetails } from './pages/ApplicantDetails';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sports-blue selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/athletes" element={<ExploreAthletes />} />
              <Route path="/athletes/:id" element={<MyProfile />} />
              <Route path="/coaches" element={<FindCoaches />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/organizations/:id" element={<OrganizationProfile />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunities/:id" element={<OpportunityDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedOpportunities /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
              <Route path="/inquiries" element={<ProtectedRoute><CoachingInquiries /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />

              {/* Organization & Organizer Routes */}
              <Route path="/opportunities/create" element={<ProtectedRoute><CreateOpportunity /></ProtectedRoute>} />
              <Route path="/opportunities/manage" element={<ProtectedRoute><ManageOpportunities /></ProtectedRoute>} />
              <Route path="/opportunities/:id/edit" element={<ProtectedRoute><EditOpportunity /></ProtectedRoute>} />
              <Route path="/opportunities/:id/applications" element={<ProtectedRoute><ReviewApplications /></ProtectedRoute>} />
              <Route path="/applications/:id" element={<ProtectedRoute><ApplicantDetails /></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
