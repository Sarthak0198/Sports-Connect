import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AthleteDashboard } from '../components/dashboard/AthleteDashboard';
import { CoachDashboard } from '../components/dashboard/CoachDashboard';
import { OrganizationDashboard } from '../components/dashboard/OrganizationDashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Authenticating user session..." />;

  const role = profile?.role || 'athlete';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {role === 'athlete' && <AthleteDashboard profile={profile} />}
      {role === 'coach' && <CoachDashboard profile={profile} />}
      {(role === 'club' || role === 'organizer') && <OrganizationDashboard profile={profile} />}
    </div>
  );
};
