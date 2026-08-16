import { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Compass, LogOut, Send, User, QrCode, X, Copy } from 'lucide-react';
import api from '../utils/api';
import TripIcon from './TripIcon';

export default function Layout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
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
    localStorage.removeItem('tripsplit_token');
    localStorage.removeItem('tripsplit_user');
    navigate('/login');
  };

  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(r => setTrip(r.data))
      .catch(() => {});
  }, [id]);

  const navItems = [
    { to: `/trip/${id}`, iconName: 'activities', label: 'Dashboard', end: true },
    { to: `/trip/${id}/add`, iconName: 'shopping', label: 'Add Expense' },
    { to: `/trip/${id}/expenses`, iconName: 'creditCard', label: 'History' },
    { to: `/trip/${id}/members`, iconName: 'backpack', label: 'Members' },
    { to: `/trip/${id}/settlement`, iconName: 'shakingHands', label: 'Settlement' },
    { to: `/trip/${id}/analytics`, iconName: 'activities', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col pb-20 md:pb-0 relative">
      {/* Visual background atmospheric lights */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl border-white/5 relative">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3054ff] to-[#2040e0] flex items-center justify-center shadow-lg shadow-blue-500/25 transition-transform hover:scale-105">
              <Send size={18} className="text-white transform rotate-45" />
            </div>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              TripSplit
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const isSelected = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to) && location.pathname !== `/trip/${id}`;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
                    isSelected
                      ? 'bg-[#3054ff] text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TripIcon name={item.iconName} size={16} className="rounded-lg" />
                  <span>{item.label}</span>
                  {isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-lg" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => navigate('/')}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all shadow-sm"
            >
              <Compass size={14} className="text-teal-400" />
              <span>All Trips</span>
            </button>

            {/* Notification bell */}
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all relative shadow-sm"
            >
              <Bell size={16} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-navy-light animate-pulse" />
            </button>

            {/* Notification list dropdown */}
            {showNotifications && (
              <div className="absolute right-12 top-12 w-80 glass border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">Notifications</h4>
                  <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-bold">New Updates</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                    <p className="text-xs text-white font-bold">Aman settled balance with Rahul</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">2 hours ago</p>
                  </div>
                  <div className="p-2.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                    <p className="text-xs text-white font-bold">Priya added Hotel Stay booking</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Yesterday</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Scan & Pay Button */}
            <button
              onClick={() => setShowQuickPay(true)}
              title="Quick Scan & Pay"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <QrCode size={16} />
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#3054ff]/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {userInitial}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-11 w-48 glass border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-slide-up">
                  <div className="p-2.5 border-b border-white/5 mb-1.5">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setShowProfile(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <User size={14} className="text-blue-400" /> Profile Settings
                  </button>
                  <button
                    onClick={() => { navigate('/'); setShowProfile(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <Compass size={14} className="text-blue-400" /> My Trips
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 relative z-10">
        <Outlet context={{ trip, setTrip }} />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-3 flex items-center justify-between z-45 rounded-t-3xl shadow-2xl">
        {navItems.map((item) => {
          const isSelected = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to) && location.pathname !== `/trip/${id}`;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 transition-all ${
                isSelected ? 'text-blue-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <TripIcon name={item.iconName} size={18} className={isSelected ? 'scale-110 transition-transform' : ''} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

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
