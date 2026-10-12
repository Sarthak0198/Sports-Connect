import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { SportsResume } from '../components/profile/SportsResume';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const MyProfile = () => {
  const { profile: authProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getMyProfile();
        setProfileData(data);
      } catch (err) {
        console.warn('Profile fetch note:', err.message);
        setProfileData(authProfile);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authProfile]);

  if (loading) return <LoadingSpinner text="Loading digital sports résumé..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Link to="/profile/edit">
          <Button variant="primary" size="sm" icon={Edit3}>
            Edit Sports Résumé
          </Button>
        </Link>
      </div>

      {/* Render Digital Sports Resume */}
      <SportsResume athlete={profileData || authProfile} isOwner={true} />

    </div>
  );
};
