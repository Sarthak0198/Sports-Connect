import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Award, Activity, User, Shield } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const EditProfile = () => {
  const navigate = useNavigate();
  const { profile: authProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('basic');

  // Form States
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [visibility, setVisibility] = useState('public');

  // Athletic Attributes
  const [position, setPosition] = useState('');
  const [playingLevel, setPlayingLevel] = useState('grassroots');
  const [currentTeam, setCurrentTeam] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [dominantHand, setDominantHand] = useState('right');
  const [videoUrl, setVideoUrl] = useState('');

  // Achievements & Stats lists
  const [achievements, setAchievements] = useState([]);
  const [statistics, setStatistics] = useState([]);

  // Modals for adding achievement / stat
  const [showAchModal, setShowAchModal] = useState(false);
  const [achForm, setAchForm] = useState({ title: '', competition_name: '', year: '2025', medal: 'winner', description: '' });

  const [showStatModal, setShowStatModal] = useState(false);
  const [statForm, setStatForm] = useState({ metric_name: '', metric_value: '', metric_unit: '', season_or_year: '2025' });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await api.getMyProfile();
        if (data) {
          setFullName(data.full_name || '');
          setCity(data.city || '');
          setState(data.state || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
          setPhone(data.phone || '');
          setVisibility(data.visibility || 'public');

          const ext = data.athlete_profiles || {};
          setPosition(ext.position || '');
          setPlayingLevel(ext.playing_level || 'state');
          setCurrentTeam(ext.current_team || '');
          setHeightCm(ext.height_cm || '');
          setWeightKg(ext.weight_kg || '');
          setDominantHand(ext.dominant_hand || 'right');
          setVideoUrl(ext.highlight_video_url || '');

          setAchievements(data.achievements || []);
          setStatistics(data.statistics || []);
        }
      } catch (err) {
        console.warn('Profile fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.updateMyProfile({
        full_name: fullName,
        city,
        state,
        bio,
        avatar_url: avatarUrl,
        phone,
        visibility,
        position,
        playing_level: playingLevel,
        current_team: currentTeam,
        height_cm: heightCm || null,
        weight_kg: weightKg || null,
        dominant_hand: dominantHand,
        highlight_video_url: videoUrl
      });

      await refreshProfile();
      setSuccess('Profile successfully updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      const created = await api.addAchievement(achForm);
      setAchievements([...achievements, created]);
      setShowAchModal(false);
      setAchForm({ title: '', competition_name: '', year: '2025', medal: 'winner', description: '' });
    } catch (err) {
      alert(err.message || 'Failed to add achievement');
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await api.deleteAchievement(id);
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete achievement');
    }
  };

  const handleAddStatistic = async (e) => {
    e.preventDefault();
    try {
      const created = await api.addStatistic(statForm);
      setStatistics([...statistics, created]);
      setShowStatModal(false);
      setStatForm({ metric_name: '', metric_value: '', metric_unit: '', season_or_year: '2025' });
    } catch (err) {
      alert(err.message || 'Failed to add statistic');
    }
  };

  const handleDeleteStatistic = async (id) => {
    try {
      await api.deleteStatistic(id);
      setStatistics(statistics.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete statistic');
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile editor..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Résumé View
        </Link>
        <Button variant="primary" size="sm" icon={Save} isLoading={saving} onClick={handleSaveAll}>
          Save All Changes
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          Edit Sports Profile
        </h1>
        <p className="text-xs text-slate-500">
          Update your public metrics, competition honors, and scout visibility.
        </p>
      </div>

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'basic' ? 'bg-sports-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Personal & Bio
        </button>
        <button
          onClick={() => setActiveTab('athletic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'athletic' ? 'bg-sports-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Athletic Attributes
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'achievements' ? 'bg-sports-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Medals & Honors ({achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stats' ? 'bg-sports-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Verified Statistics ({statistics.length})
        </button>
      </div>

      {/* TAB 1: BASIC INFO */}
      {activeTab === 'basic' && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Player Biography / Scout Pitch</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your current match readiness, fitness background, and athletic goals..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            >
              <option value="public">Public (Visible to all selectors, coaches, and academies)</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private (Only visible to organizations you apply to)</option>
            </select>
          </div>
        </Card>
      )}

      {/* TAB 2: ATHLETIC ATTRIBUTES */}
      {activeTab === 'athletic' && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Playing Position / Role</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Right-Arm Fast Bowler / Raider"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Competitive Playing Level</label>
              <select
                value={playingLevel}
                onChange={(e) => setPlayingLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="grassroots">Grassroots</option>
                <option value="school">School / College Team</option>
                <option value="district">District Circuit</option>
                <option value="state">State Representative</option>
                <option value="national">National Inter-State</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="182"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="74"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dominant Hand / Foot</label>
              <select
                value={dominantHand}
                onChange={(e) => setDominantHand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="ambidextrous">Ambidextrous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Club / Academy</label>
            <input
              type="text"
              value={currentTeam}
              onChange={(e) => setCurrentTeam(e.target.value)}
              placeholder="e.g. Maharashtra Youth Sports Club"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Highlight Video URL (YouTube / Google Drive)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
        </Card>
      )}

      {/* TAB 3: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-sports-navy">Tournament Medals & Honors</h3>
            <Button size="sm" variant="emerald" icon={Plus} onClick={() => setShowAchModal(true)}>
              Add Achievement
            </Button>
          </div>

          {achievements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No achievements recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ach.title} ({ach.year})</h4>
                    <span className="text-[11px] text-sports-blue font-semibold">{ach.competition_name}</span>
                    {ach.description && <p className="text-[11px] text-slate-500 mt-0.5">{ach.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteAchievement(ach.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: STATISTICS */}
      {activeTab === 'stats' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-sports-navy">Game & Physical Statistics</h3>
            <Button size="sm" variant="emerald" icon={Plus} onClick={() => setShowStatModal(true)}>
              Add Metric
            </Button>
          </div>

          {statistics.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No metrics recorded yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statistics.map((st) => (
                <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">{st.metric_name}</span>
                    <span className="text-base font-extrabold text-sports-navy">
                      {st.metric_value} <span className="text-xs text-slate-400 font-normal">{st.metric_unit}</span>
                    </span>
                    {st.season_or_year && (
                      <span className="block text-[10px] text-slate-400">Season: {st.season_or_year}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteStatistic(st.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal: Add Achievement */}
      <Modal isOpen={showAchModal} onClose={() => setShowAchModal(false)} title="Add Tournament Achievement">
        <form onSubmit={handleAddAchievement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Honor / Medal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Best Fast Bowler / State Gold Medal"
              value={achForm.title}
              onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Competition / Tournament Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Maharashtra Inter-District Trophy"
              value={achForm.competition_name}
              onChange={(e) => setAchForm({ ...achForm, competition_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                required
                value={achForm.year}
                onChange={(e) => setAchForm({ ...achForm, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medal / Category</label>
              <select
                value={achForm.medal}
                onChange={(e) => setAchForm({ ...achForm, medal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="gold">Gold Medal</option>
                <option value="silver">Silver Medal</option>
                <option value="bronze">Bronze Medal</option>
                <option value="winner">Winner Trophy</option>
                <option value="runner_up">Runner Up</option>
                <option value="special_award">Special Award</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Match Impact</label>
            <textarea
              rows={2}
              placeholder="e.g. Took 19 wickets at an economy of 3.84 across 5 games..."
              value={achForm.description}
              onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setShowAchModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add to Résumé</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Statistic */}
      <Modal isOpen={showStatModal} onClose={() => setShowStatModal(false)} title="Add Match / Physical Metric">
        <form onSubmit={handleAddStatistic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Metric Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Top Bowling Speed, Yo-Yo Score, 100m Sprint"
              value={statForm.metric_name}
              onChange={(e) => setStatForm({ ...statForm, metric_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Metric Value</label>
              <input
                type="text"
                required
                placeholder="e.g. 138.4, 11.78, 42"
                value={statForm.metric_value}
                onChange={(e) => setStatForm({ ...statForm, metric_value: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                placeholder="e.g. km/h, seconds, wickets"
                value={statForm.metric_unit}
                onChange={(e) => setStatForm({ ...statForm, metric_unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Season / Year</label>
            <input
              type="text"
              placeholder="e.g. 2025-26"
              value={statForm.season_or_year}
              onChange={(e) => setStatForm({ ...statForm, season_or_year: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setShowStatModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Metric</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
