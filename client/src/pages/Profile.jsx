import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, ShieldCheck, LogOut, Loader2, Compass, Coins, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/format';
import { motion } from 'motion/react';

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Stats states
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalContributed: 0,
    netBalance: 0,
    loadingStats: true,
  });

  useEffect(() => {
    // Load local user cache first
    const cached = localStorage.getItem('tripsplit_user');
    if (cached) {
      const u = JSON.parse(cached);
      setCurrentUser(u);
      setName(u.name || '');
    }

    // Refresh user profile details from backend
    api.get('/auth/me')
      .then(res => {
        setCurrentUser(res.data);
        setName(res.data.name || '');
        localStorage.setItem('tripsplit_user', JSON.stringify(res.data));
      })
      .catch(err => {
        console.error('Failed to sync user details:', err);
      });

    // Compile travel statistics
    const loadStats = async () => {
      try {
        const tripsRes = await api.get('/trips');
        const trips = tripsRes.data;

        let totalContributed = 0;
        let netBalance = 0;

        // Fetch each trip summary in parallel
        const summaries = await Promise.all(
          trips.map(async (t) => {
            try {
              const res = await api.get(`/trips/${t._id}/summary`);
              return res.data;
            } catch {
              return null;
            }
          })
        );

        // Calculate aggregated stats
        summaries.forEach((sum) => {
          if (!sum) return;
          
          // Match matching stats by email
          const myStat = sum.memberStats?.find(
            s => s.member.email === currentUser?.email
          );

          if (myStat) {
            totalContributed += myStat.paid || 0;
            netBalance += myStat.balance || 0;
          }
        });

        setStats({
          totalTrips: trips.length,
          totalContributed,
          netBalance,
          loadingStats: false,
        });
      } catch (err) {
        console.error('Failed to load life stats:', err);
        setStats(prev => ({ ...prev, loadingStats: false }));
      }
    };

    if (currentUser) {
      loadStats();
    }
  }, [currentUser?.email]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    
    if (newPassword) {
      if (newPassword.length < 6) {
        return toast.error('New password must be at least 6 characters');
      }
      if (newPassword !== confirmPassword) {
        return toast.error('Passwords do not match');
      }
    }

    setUpdating(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword ? newPassword : undefined,
      });

      // Update local storage cache
      localStorage.setItem('tripsplit_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Profile settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('tripsplit_token');
    localStorage.removeItem('tripsplit_user');
    toast.success('Signed out securely');
    navigate('/login');
  };

  // Determine Google connection status (if user has email but password is placeholderless)
  const isGoogleUser = currentUser?.email && !currentUser?.password; 

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 py-10 px-6 relative overflow-hidden font-sans">
      {/* Visual background atmospheric lights */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8 animate-slide-up">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors font-medium cursor-pointer border-0 bg-transparent"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3054ff] to-[#2040e0] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-2xl font-black text-white">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{currentUser?.name || 'User Profile'}</h1>
              <p className="text-slate-400 text-xs mt-1 font-semibold flex items-center gap-1.5">
                <Mail size={12} className="text-slate-500" /> {currentUser?.email}
              </p>
            </div>
          </div>
          
          {/* Sign Out Trigger */}
          <button
            onClick={handleSignOut}
            className="btn-danger flex items-center gap-2 px-5 py-2.5 rounded-2xl cursor-pointer"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Settings Customization Panel (7 Columns) */}
          <div className="md:col-span-7 card-premium p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-extrabold text-white text-lg">Account Settings</h2>
              <p className="text-slate-500 text-xs mt-0.5 font-bold">Customize name and security details</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="label-premium text-[10px]">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text" required
                    className="input-premium text-xs py-2.5"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Update display name"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Password update segment (Only shown/accessible if it is not a Google social account) */}
              {!isGoogleUser ? (
                <>
                  <div className="border-t border-white/5 my-4 pt-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Change Password</h3>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="label-premium text-[10px]">Current Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        className="input-premium text-xs py-2.5"
                        style={{ paddingLeft: '2.75rem' }}
                        placeholder="••••••••"
                        value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="label-premium text-[10px]">New Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="password"
                          className="input-premium text-xs py-2.5"
                          style={{ paddingLeft: '2.75rem' }}
                          placeholder="Min 6 characters"
                          value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="label-premium text-[10px]">Confirm New Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="password"
                          className="input-premium text-xs py-2.5"
                          style={{ paddingLeft: '2.75rem' }}
                          placeholder="Re-enter password"
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#3054ff]/5 border border-[#3054ff]/20 rounded-2xl p-4 flex items-start gap-3 my-4">
                  <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Google Authenticated</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                      Your account is managed via Google Login. Password change is handled directly inside your Google Account settings.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="btn-primary w-full py-3.5 text-xs font-bold justify-center mt-6 shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                {updating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </form>
          </div>

          {/* Life Travel Stats Panel (5 Columns) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Stats Card */}
            <div className="card-premium p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Travel Ledger Stats</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-bold">Lifetime statistics on TripSplit</p>
              </div>

              {stats.loadingStats ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="animate-spin text-blue-400" size={24} />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Syncing ledger metrics...</span>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {/* Total Trips */}
                  <div className="flex items-center justify-between p-3.5 bg-white/2 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Compass size={18} className="text-blue-400" />
                      <span className="text-slate-300 text-xs font-bold">Total Trips</span>
                    </div>
                    <span className="text-white font-black text-sm">{stats.totalTrips}</span>
                  </div>

                  {/* Contributions */}
                  <div className="flex items-center justify-between p-3.5 bg-white/2 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Coins size={18} className="text-emerald-400" />
                      <span className="text-slate-300 text-xs font-bold">Contributed</span>
                    </div>
                    <span className="text-emerald-400 font-black text-sm">{formatINR(stats.totalContributed)}</span>
                  </div>

                  {/* Net Balance */}
                  <div className="flex items-center justify-between p-3.5 bg-white/2 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className={stats.netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'} />
                      <span className="text-slate-300 text-xs font-bold">Net Standing</span>
                    </div>
                    <span className={`font-black text-sm ${stats.netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      {stats.netBalance >= 0 ? '+' : ''}{formatINR(stats.netBalance)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Google Authentication Info Box */}
            <div className="card-premium p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h4 className="text-white text-xs font-bold">Google Auth Connection</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Secure SSO integration</p>
                </div>
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isGoogleUser 
                  ? 'bg-blue-500/10 border-blue-500/35 text-blue-400'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                {isGoogleUser ? 'Linked' : 'Not Linked'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
