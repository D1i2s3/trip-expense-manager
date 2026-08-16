import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, MapPin, Users, Wallet, Trash2, ChevronRight,
  TrendingUp, TrendingDown, Bell, CheckCircle2, Navigation, Compass,
  Star, HelpCircle, X, ChevronRightCircle, RefreshCw, Send, Globe,
  User, LogOut, ChevronDown, QrCode, Copy
} from 'lucide-react';
import api from '../utils/api';
import { formatINR, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

import TripIcon, { EMOJI_TO_NAME } from '../components/TripIcon';

export default function Home() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [quickUpi, setQuickUpi] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickName, setQuickName] = useState('');

  // Dynamic user details
  const userStr = localStorage.getItem('tripsplit_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Guest Traveler', email: 'guest@tripsplit.com' };
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'G';

  const handleSignOut = () => {
    if (confirm('Do you want to Sign Out?')) {
      localStorage.removeItem('tripsplit_token');
      localStorage.removeItem('tripsplit_user');
      navigate('/login');
    }
  };

  const load = async () => {
    try {
      const r = await api.get('/trips');
      setTrips(r.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips(prev => prev.filter(t => t._id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewDemo = async () => {
    const loadingToast = toast.loading('Populating Goa Trip demo...');
    try {
      const tripRes = await api.post('/trips', {
        name: 'Goa Trip 🌴',
        date: '2026-08-12',
        description: 'Demo trip to Goa beaches and cafes',
        coverEmoji: '🌴',
      });
      const tripId = tripRes.data._id;

      const m1 = await api.post(`/trips/${tripId}/members`, { name: 'Rahul', emoji: '🏄' });
      const m2 = await api.post(`/trips/${tripId}/members`, { name: 'Aman', emoji: '💻' });
      const m3 = await api.post(`/trips/${tripId}/members`, { name: 'Priya', emoji: '👩‍🍳' });
      const m4 = await api.post(`/trips/${tripId}/members`, { name: 'Neha', emoji: '📷' });
      const m5 = await api.post(`/trips/${tripId}/members`, { name: 'Rohit', emoji: '🥾' });

      const memberIds = [m1.data._id, m2.data._id, m3.data._id, m4.data._id, m5.data._id];

      await api.post(`/trips/${tripId}/expenses`, {
        paidBy: m3.data._id,
        amount: 8500,
        category: 'Hotel',
        description: 'Hotel Stay booking',
        date: '2026-08-12',
        sharedBy: memberIds
      });

      await api.post(`/trips/${tripId}/expenses`, {
        paidBy: m1.data._id,
        amount: 6150,
        category: 'Transport',
        description: 'Car rental (camper van)',
        date: '2026-08-13',
        sharedBy: memberIds
      });

      await api.post(`/trips/${tripId}/expenses`, {
        paidBy: m2.data._id,
        amount: 4200,
        category: 'Food',
        description: 'Beach Cafe Dinner',
        date: '2026-08-14',
        sharedBy: memberIds.slice(0, 4)
      });

      toast.dismiss(loadingToast);
      toast.success('Demo loaded successfully!');
      navigate(`/trip/${tripId}`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to initialize demo: ' + err.message);
    }
  };

  const steps = [
    {
      title: "1. Create Trip",
      desc: "Give your trip a name, select a starting date, and add all travel companions to the trip guest list.",
      iconName: "plane"
    },
    {
      title: "2. Record Expenses",
      desc: "Log hotel bookings, meals, and taxi fares. Select exactly who paid and who shared the benefits of that expense.",
      iconName: "creditCard"
    },
    {
      title: "3. Auto Settle Up",
      desc: "TripSplit runs our smart minimum-transaction algorithm to find the absolute fewest payment transactions needed to clear all balances.",
      iconName: "onboardingSettle"
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* Volumetric Glowing Lights */}
      <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none animate-glow" />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] bg-indigo-900/5 rounded-full blur-[130px] pointer-events-none animate-glow" />

      {/* Earth Map Textured Vector Background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
          <path d="M150,150 Q180,100 240,130 T350,120 T420,180 T500,140 T650,200 T800,150 T900,220" fill="none" stroke="#3054ff" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M100,300 Q200,280 280,350 T400,310 T550,400 T700,320 T850,380" fill="none" stroke="#3054ff" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="240" cy="130" r="4" fill="#3054ff" />
          <circle cx="500" cy="140" r="4" fill="#3054ff" />
          <circle cx="700" cy="320" r="4" fill="#3054ff" />
        </svg>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 bg-[#000000]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-[#3054ff] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight text-white flex items-center gap-2">
              TripSplit
              <span className="w-4 h-4 rounded bg-[#3054ff]/20 border border-[#3054ff]/35"></span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-8">
            <span onClick={() => navigate('/')} className="text-sm font-semibold text-blue-400 cursor-pointer">Dashboard</span>
            <span onClick={() => {
              const el = document.getElementById('my-trips-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} className="text-sm font-medium text-slate-400 hover:text-white cursor-pointer transition-colors">My Trips</span>
            <span onClick={() => setShowHowItWorks(true)} className="text-sm font-medium text-slate-400 hover:text-white cursor-pointer transition-colors">How It Works</span>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick Scan & Pay Button */}
            <button
              onClick={() => setShowQuickPay(true)}
              title="Quick Scan & Pay"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <QrCode size={16} />
            </button>

            {/* User profile avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all shadow-sm cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#3054ff]/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {userInitial}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-11 w-48 glass border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-slide-up">
                  <div className="p-2.5 border-b border-white/5 mb-1.5 text-left">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setShowProfile(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left border-0 bg-transparent cursor-pointer"
                  >
                    <User size={14} className="text-blue-400" /> Profile Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left border-0 bg-transparent cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3054ff]/10 border border-[#3054ff]/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              <Star size={11} className="fill-blue-400" />
              <span>Smart Travel Fintech</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.1]">
              Split expenses.<br />
              <span className="bg-gradient-to-r from-white to-[#b4c0ff] bg-clip-text text-transparent">Keep the memories.</span>
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
              Track group expenses, see who owes what, and settle everything with fewer transactions. Beautifully designed for modern travelers.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button onClick={() => navigate('/trip/new')} className="btn-primary py-3 px-6 text-xs flex items-center gap-2">
                <span className="text-base font-bold">+</span> Create Your Trip
              </button>
              <button onClick={handleViewDemo} className="btn-secondary py-3 px-6 text-xs">
                View Demo
              </button>
            </div>

            {/* Features checkmarks list */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 text-xs font-semibold text-slate-500 border-t border-white/5">
              <span className="flex items-center gap-1.5">✓ Smart splitting</span>
              <span className="flex items-center gap-1.5">✓ Automatic settlement</span>
              <span className="flex items-center gap-1.5">✓ No complicated calculations</span>
            </div>
          </div>

          {/* Right Column Mockup Illustration with High Fidelity custom vectors */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Goa Card */}
            <div className="relative w-full max-w-sm glass border border-white/10 rounded-3xl p-5 shadow-2xl animate-float">
              
              {/* Trip header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">Goa Trip 🌴</h3>
                  <p className="text-slate-500 text-[10px] font-bold">12 Aug – 17 Aug</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Total Spent</p>
                  <p className="text-teal-400 font-black text-base">₹24,850</p>
                </div>
              </div>

              {/* Items list with custom high-fidelity SVG icons */}
              <div className="space-y-4">
                
                <div className="flex justify-between items-center bg-white/2 border border-white/5 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <TripIcon name="hotel" size={40} className="shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold">Hotel Stay</p>
                      <p className="text-slate-500 text-[10px] font-medium">Priya paid</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">₹8,500</span>
                </div>

                <div className="flex justify-between items-center bg-white/2 border border-white/5 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <TripIcon name="carRental" size={40} className="shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold">Car rental</p>
                      <p className="text-slate-500 text-[10px] font-medium">Rahul paid</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">₹6,150</span>
                </div>

                <div className="flex justify-between items-center bg-white/2 border border-white/5 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <TripIcon name="food" size={40} className="shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold">Beach Cafe Dinner</p>
                      <p className="text-slate-500 text-[10px] font-medium">Aman paid</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">₹4,200</span>
                </div>
              </div>

              {/* Footer companions list */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2.5">
                    <TripIcon name="surfer" size={28} className="rounded-full border border-navy" />
                    <TripIcon name="programmer" size={28} className="rounded-full border border-navy" />
                    <TripIcon name="chef" size={28} className="rounded-full border border-navy" />
                    <TripIcon name="photographer" size={28} className="rounded-full border border-navy" />
                    <TripIcon name="hiker" size={28} className="rounded-full border border-navy" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">+2 others</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#3054ff]/25 border border-[#3054ff]/35 flex items-center justify-center text-blue-400">
                  <svg className="w-4.5 h-4.5 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Jet & Biplane high-fidelity vectors floating */}
            <div className="absolute -top-10 -left-6 w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl animate-float-slow">
              <TripIcon name="plane" size={44} />
            </div>
            <div className="absolute -bottom-8 right-0 w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl animate-float-reverse">
              <TripIcon name="plane" size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Your Trips Section */}
      <div id="my-trips-section" className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 scroll-mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-white">Your Trips</h3>
            <p className="text-slate-400 text-xs mt-1">Manage active and past travel group logs</p>
          </div>
          <button onClick={() => navigate('/trip/new')} className="btn-primary text-xs py-2.5 px-4">
            <PlusCircle size={15} /> Create Trip
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-premium p-6 animate-pulse h-80 bg-white/5" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="card-premium p-16 text-center max-w-lg mx-auto">
            <TripIcon name="emptyTrips" size={80} className="mx-auto mb-6 animate-float" />
            <h4 className="text-xl font-bold text-white mb-2">No trips yet</h4>
            <p className="text-slate-400 text-sm mb-6">Create a trip and invite your friends to start tracking expenses.</p>
            <button onClick={() => navigate('/trip/new')} className="btn-primary">
              <PlusCircle size={18} /> Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, idx) => {
              const nameLower = trip.name.toLowerCase();
              let coverUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=70';
              if (nameLower.includes('goa')) coverUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=70';
              else if (nameLower.includes('manali')) coverUrl = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=70';
              else if (nameLower.includes('bali')) coverUrl = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=70';
              else if (nameLower.includes('dubai')) coverUrl = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=70';
              else if (nameLower.includes('himachal')) coverUrl = 'https://images.unsplash.com/photo-1570168007244-df2348dc9443?w=800&auto=format&fit=crop&q=70';

              const spendPercent = Math.min(100, Math.round((trip.total / 30000) * 100)) || 10;

              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  className="card-premium overflow-hidden cursor-pointer group flex flex-col h-full animate-fade-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={coverUrl}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] to-transparent opacity-85" />
                    <button
                      onClick={(e) => handleDelete(e, trip._id)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-[#070b13]/80 border border-white/10 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors z-10"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">
                        <TripIcon name={EMOJI_TO_NAME[trip.coverEmoji] || 'palmTree'} size={28} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-tight">{trip.name}</h4>
                        <span className="text-[10px] text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                          <MapPin size={10} /> {formatDate(trip.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-slate-500 text-xs font-semibold">Total spending</span>
                        <span className="text-white font-extrabold text-sm">{formatINR(trip.total)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${spendPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5.5 h-5.5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">👤</span>
                        <span className="text-[10px] text-slate-500 font-bold">{trip.memberCount || 0} companions</span>
                      </div>
                      <ChevronRight size={15} className="text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive 'How It Works' Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-premium p-6 md:p-8 w-full max-w-lg relative animate-slide-up bg-gradient-to-b from-[#111827] to-[#070b13]">
            
            <button onClick={() => setShowHowItWorks(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">How TripSplit Works</h3>
                <p className="text-slate-400 text-xs mt-0.5">Learn how to easily balance group budgets</p>
              </div>
            </div>

            {/* Steps tracker indicator */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`h-2 flex-1 rounded-full cursor-pointer transition-all ${
                    idx === activeStep ? 'bg-teal-400' : 'bg-white/5'
                  }`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="space-y-4 min-h-[140px]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <TripIcon name={steps[activeStep].iconName} size={32} />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">{steps[activeStep].title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mt-2">{steps[activeStep].desc}</p>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(p => p - 1)}
                className="text-slate-500 hover:text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Previous Step
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(p => p + 1)}
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => { setShowHowItWorks(false); navigate('/trip/new'); }}
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Create Your Trip
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#000000] text-center text-xs text-slate-600">
        <p>© 2026 TripSplit Inc. All rights reserved. Splitting expenses beautifully.</p>
      </footer>

      {/* Quick Pay Modal Overlay */}
      {showQuickPay && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card-premium p-6 w-full max-w-md animate-slide-up relative overflow-hidden text-slate-100">
            {/* Volumetric glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#3054ff]/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h2 className="font-black text-white text-base">Quick Scan & Pay</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Generate Instant UPI QR & deep links</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowQuickPay(false); setQuickUpi(''); setQuickAmount(''); setQuickName(''); }} 
                className="p-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Form fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="label-premium text-[10px]">Recipient UPI ID *</label>
                    <input 
                      type="text" required
                      className="input-premium text-xs py-2.5 font-mono"
                      value={quickUpi} onChange={e => setQuickUpi(e.target.value)}
                      placeholder="e.g. name@upi"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="label-premium text-[10px]">Recipient Name</label>
                    <input 
                      type="text"
                      className="input-premium text-xs py-2.5"
                      value={quickName} onChange={e => setQuickName(e.target.value)}
                      placeholder="e.g. Rahul Soni"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="label-premium text-[10px]">Amount (INR) - Optional</label>
                  <input 
                    type="number"
                    className="input-premium text-xs py-2.5 font-bold"
                    value={quickAmount} onChange={e => setQuickAmount(e.target.value)}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              {/* Dynamic QR Display */}
              {quickUpi.trim() ? (
                <div className="text-center space-y-4 pt-2">
                  <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl border border-white/10 flex flex-col items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${quickUpi.trim()}&pn=${encodeURIComponent(quickName.trim() || 'Payee')}&am=${quickAmount || ''}&cu=INR&tn=QuickSplit%20Payment`
                      )}`}
                      alt="Quick UPI QR Code"
                      className="w-[180px] h-[180px]"
                    />
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-2.5 flex items-center gap-1.5">
                      <QrCode size={11} /> Scan to Pay
                    </span>
                  </div>
                  
                  {/* Pay button for Mobile */}
                  <a
                    href={`upi://pay?pa=${quickUpi.trim()}&pn=${encodeURIComponent(quickName.trim() || 'Payee')}&am=${quickAmount || ''}&cu=INR&tn=QuickSplit%20Payment`}
                    className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-lg block text-center"
                  >
                    🚀 Open Google Pay / UPI App
                  </a>
                </div>
              ) : (
                <div className="p-8 bg-white/2 border border-white/5 border-dashed rounded-2xl text-center text-slate-500">
                  <QrCode size={40} className="mx-auto mb-2 opacity-30 animate-pulse" />
                  <p className="text-[10px] font-semibold leading-normal">Enter a valid UPI ID above to generate a real-time scannable QR Code and Google Pay link.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
