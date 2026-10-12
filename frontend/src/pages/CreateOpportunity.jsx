import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Send, AlertCircle, Building } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CreateOpportunity = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [sports, setSports] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sportId, setSportId] = useState('');
  const [category, setCategory] = useState('trial');
  const [orgId, setOrgId] = useState('');
  const [city, setCity] = useState(profile?.city || 'Pune');
  const [state, setState] = useState(profile?.state || 'Maharashtra');
  const [venueAddress, setVenueAddress] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [skillLevel, setSkillLevel] = useState('District / State');
  const [availablePositions, setAvailablePositions] = useState('');
  const [applicationFee, setApplicationFee] = useState('Free');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('published');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listSports().then(data => setSports(data || [])).catch(() => {});
    api.getMyOrganizations().then(data => {
      setOrganizations(data || []);
      if (data?.[0]?.id) setOrgId(data[0].id);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Date validations
    if (startsOn && endsOn && endsOn < startsOn) {
      setError('Event end date cannot be earlier than start date.');
      setLoading(false);
      return;
    }

    if (startsOn && registrationDeadline && registrationDeadline > startsOn) {
      setError('Registration deadline must be before or on the event start date.');
      setLoading(false);
      return;
    }

    try {
      const created = await api.createOpportunity({
        title,
        description,
        sport_id: sportId ? parseInt(sportId, 10) : null,
        category,
        org_id: orgId || null,
        city,
        state,
        venue_address: venueAddress,
        starts_on: startsOn || null,
        ends_on: endsOn || null,
        registration_deadline: registrationDeadline || null,
        eligibility,
        min_age: minAge ? parseInt(minAge, 10) : null,
        max_age: maxAge ? parseInt(maxAge, 10) : null,
        skill_level: skillLevel,
        available_positions: availablePositions,
        application_fee: applicationFee,
        instructions,
        status
      });

      navigate(`/opportunities/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          Publish Sports Opportunity
        </h1>
        <p className="text-xs text-slate-500">
          Create selection trials, tournament entries, or coaching scholarship combines.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold font-display text-sports-navy border-b border-slate-100 pb-2">
            Opportunity Overview
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. U-19 Maharashtra State Kabaddi Selection Trials 2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="trial">Selection Trial</option>
                <option value="tournament">Tournament</option>
                <option value="camp">Training Camp</option>
                <option value="scholarship">Scholarship Combine</option>
                <option value="academy_admission">Academy Admission</option>
                <option value="coaching_program">Coaching Clinic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Discipline</label>
              <select
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="">Select Sport</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hosting Organization</label>
              <select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline event format, selection committee, lodging provisions, and itinerary..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
        </Card>

        {/* Location & Dates */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold font-display text-sports-navy border-b border-slate-100 pb-2">
            Schedule & Venue
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Deadline *</label>
              <input
                type="date"
                required
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Starts On</label>
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ends On</label>
              <input
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Satara"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Venue & Ground Address</label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Chhatrapati Shivaji Krida Sankul, Powai Naka"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
        </Card>

        {/* Eligibility & Instructions */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold font-display text-sports-navy border-b border-slate-100 pb-2">
            Eligibility & Registration Instructions
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. Boys born between 2007-2010. Weight under 70 kg."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Age</label>
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Age</label>
              <input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="19"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Fee</label>
              <input
                type="text"
                value={applicationFee}
                onChange={(e) => setApplicationFee(e.target.value)}
                placeholder="Free or ₹150"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Available Positions / Squad Slots</label>
            <input
              type="text"
              value={availablePositions}
              onChange={(e) => setAvailablePositions(e.target.value)}
              placeholder="e.g. Corners, Covers, Fast Bowlers, Sprinters"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Bring original Aadhaar card and standard playing kit. Reporting time 7:30 AM."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to="/dashboard">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={loading} icon={PlusCircle}>
            Publish Opportunity
          </Button>
        </div>

      </form>
    </div>
  );
};
