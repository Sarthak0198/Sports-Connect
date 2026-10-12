import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Menu,
  X,
  User,
  Bell,
  LogOut,
  LayoutDashboard,
  Bookmark,
  FileText,
  Users,
  MessageSquare,
  Settings,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar = () => {
  const { profile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-sports-navy flex items-center justify-center text-white shadow-md group-hover:bg-sports-blue transition-colors">
              <Trophy className="w-6 h-6 text-sports-cyan group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-display text-sports-navy block leading-none">
                SPORTS<span className="text-sports-blue">CONNECT</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-1">
                Connect · Compete · Grow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/opportunities"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/opportunities')
                  ? 'text-sports-blue bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Opportunities
            </Link>
            <Link
              to="/athletes"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/athletes')
                  ? 'text-sports-blue bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Athletes
            </Link>
            <Link
              to="/coaches"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/coaches')
                  ? 'text-sports-blue bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Coaches
            </Link>
            <Link
              to="/organizations"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/organizations')
                  ? 'text-sports-blue bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Academies & Clubs
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/about')
                  ? 'text-sports-blue bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Organizer quick post opportunity */}
                {(profile?.role === 'organizer' || profile?.role === 'club') && (
                  <Link
                    to="/opportunities/create"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sports-emerald text-white hover:bg-emerald-600 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Opportunity
                  </Link>
                )}

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="p-2.5 rounded-xl text-slate-600 hover:text-sports-blue hover:bg-slate-100 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sports-blue rounded-full ring-2 ring-white"></span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-sports-navy text-white flex items-center justify-center font-bold text-sm">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{profile?.full_name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {profile?.full_name}
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 capitalize">
                        {profile?.role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-2xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="font-semibold text-sm text-slate-800">{profile?.full_name}</div>
                        <div className="text-xs text-slate-500 truncate">{profile?.email}</div>
                        <div className="mt-1.5">
                          <Badge variant="blue" size="sm">
                            {profile?.role?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Digital Sports Résumé
                        </Link>
                        <Link
                          to="/applications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          My Applications
                        </Link>
                        <Link
                          to="/saved"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          Saved Opportunities
                        </Link>
                        <Link
                          to="/connections"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          Connections
                        </Link>
                        <Link
                          to="/inquiries"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          Coaching Inquiries
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sports-blue"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-sports-navy hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sports-blue text-white hover:bg-sports-blueHover shadow-md hover:shadow-glow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            Opportunities
          </Link>
          <Link
            to="/athletes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            Athletes
          </Link>
          <Link
            to="/coaches"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            Coaches
          </Link>
          <Link
            to="/organizations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            Academies & Clubs
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            About
          </Link>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-bold text-sports-blue bg-blue-50"
                >
                  Dashboard ({profile?.full_name})
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                >
                  Digital Sports Résumé
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-sports-blue text-white font-bold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
