import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Shield, User, Phone, MapPin, Mail, Clock, Briefcase,
  Save, ChevronRight, LogOut, Bell, Lock, Eye, EyeOff,
  Building2, CreditCard, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getWorker, getDashboard } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { AppBackground } from '../components/AppBackground';
import { BrandLogo } from '../components/BrandLogo';
import toast from 'react-hot-toast';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

export const ProfilePage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { clearWorker } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'danger'>('profile');
  const [showUpi, setShowUpi] = useState(false);

  const { data: worker, isLoading: workerLoading } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => getWorker(parseInt(workerId!)),
    enabled: !!workerId
  });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', workerId],
    queryFn: () => getDashboard(parseInt(workerId!)),
    enabled: !!workerId
  });

  const handleSignOut = () => {
    clearWorker();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  if (workerLoading || !worker) {
    return (
      <div className="relative min-h-screen bg-[#0C1117] flex items-center justify-center">
        <AppBackground />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="relative z-10">
          <User className="w-12 h-12 text-[#5690FF]" />
        </motion.div>
      </div>
    );
  }

  const activePolicy = dashboard?.active_policy;

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Alerts', icon: Bell },
    { id: 'danger' as const, label: 'Danger Zone', icon: AlertTriangle },
  ];

  /* ─── Glassmorphic Input Component ─── */
  const InfoField = ({ icon: Icon, label, value, editable = false }: { icon: any; label: string; value: string; editable?: boolean }) => (
    <div className="group">
      <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.18em] mb-1.5 block" style={{ fontFamily: font.label }}>{label}</label>
      <div className="flex items-center gap-3 p-3.5 bg-white/[0.05] border border-white/[0.09] rounded-xl group-hover:border-white/[0.15] transition-colors">
        <Icon className="w-4 h-4 text-[#5690FF]/70 flex-shrink-0" />
        <span className="text-sm font-medium text-white/85 flex-1" style={{ fontFamily: font.body }}>{value || '—'}</span>
        {editable && (
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2 py-0.5 bg-white/[0.05] rounded" style={{ fontFamily: font.label }}>EDIT</span>
        )}
      </div>
    </div>
  );

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navItems = workerId ? [
    { label: 'Dashboard', path: `/dashboard/${workerId}` },
    { label: 'Policy', path: `/policy/${workerId}` },
    { label: 'Claims', path: `/claims/${workerId}` },
  ] : [];

  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: font.body }}>
      
      <AppBackground />

      {/* ─── Floating pill navbar ─── */}
      <nav style={{
        position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          backdropFilter: scrolled ? 'blur(40px)' : 'none',
          background: scrolled ? 'rgba(12,17,23,0.75)' : 'transparent',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          borderRadius: 40, padding: '6px 8px',
          display: 'flex', alignItems: 'center', pointerEvents: 'auto', gap: 8,
          transition: 'all 0.3s ease-in-out',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        }}>
          {/* Back + Logo */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={() => navigate(`/dashboard/${workerId}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <ArrowLeft style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #5690FF, #7AABFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(86,144,255,0.35)' }}>
                <Shield style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span className="hidden sm:block" style={{ fontFamily: font.display, fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>
                <BrandLogo size={16} />
              </span>
            </button>
          </div>

          {/* Center label */}
          <div className="hidden md:block px-3 text-center">
            <p style={{ fontFamily: font.label, fontSize: 9, fontWeight: 900, color: '#5690FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 1 }}>Account</p>
            <p style={{ fontFamily: font.label, fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Profile & Settings</p>
          </div>

          {/* Nav pills */}
          <div className="flex items-center gap-1 pr-1">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.path;
              return (
                <button key={item.label} onClick={() => navigate(item.path)}
                  style={{ fontFamily: font.label, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: isActive ? '#5690FF' : 'rgba(255,255,255,0.60)', background: isActive ? 'rgba(86,144,255,0.12)' : 'rgba(255,255,255,0.06)', border: isActive ? '1px solid rgba(86,144,255,0.35)' : '1px solid transparent', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16">
        
        {/* ─── Header ─── */}
        <div className="mb-10">
          <p className="text-[9px] font-black text-[#5690FF] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: font.label }}>
            Account Settings
          </p>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ fontFamily: font.display }}>
            Profile & Settings
          </h1>
        </div>

        {/* ─── Profile Hero Card ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#5690FF]/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5690FF] to-[#3D5FCC] flex items-center justify-center text-4xl font-black shadow-2xl shadow-[#5690FF]/20" style={{ fontFamily: font.display }}>
                {worker.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-4 border-[#0C1117] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white/90 mb-1" style={{ fontFamily: font.display }}>{worker.name}</h2>
              <p className="text-white/30 text-sm mb-3" style={{ fontFamily: font.body }}>
                Worker ID: #{worker.id} • Member since {new Date(worker.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={worker.platform as any} className="!text-[9px]">{worker.platform.replace(/_/g, ' ')}</Badge>
                <Badge variant={worker.risk_tier as any} className="!text-[9px]">{worker.risk_tier} risk</Badge>
                {activePolicy && <Badge variant="active" className="!text-[9px]">{activePolicy.plan_type} plan</Badge>}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center px-6 py-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <p className="text-2xl font-black text-[#5690FF]" style={{ fontFamily: font.display }}>{Math.round(worker.risk_score * 100)}</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest" style={{ fontFamily: font.label }}>Risk Score</p>
              </div>
              <div className="text-center px-6 py-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                <p className="text-2xl font-black text-[#22C55E]" style={{ fontFamily: font.display }}>{worker.avg_daily_orders}</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest" style={{ fontFamily: font.label }}>Avg Orders</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Tabs + Content ─── */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3 space-y-1 sticky top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-[#5690FF]/10 text-[#5690FF]'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-bold" style={{ fontFamily: font.body }}>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 text-[#5690FF]/40" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white/80 mb-6" style={{ fontFamily: font.display }}>Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <InfoField icon={User} label="Full Name" value={worker.name} editable />
                      <InfoField icon={Phone} label="Phone Number" value={worker.phone} editable />
                      <InfoField icon={MapPin} label="City" value={worker.city} />
                      <InfoField icon={Building2} label="Dark Store" value={worker.dark_store_name} />
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white/80 mb-6" style={{ fontFamily: font.display }}>Work Details</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <InfoField icon={Briefcase} label="Platform" value={worker.platform.replace(/_/g, ' ')} />
                      <InfoField icon={Clock} label="Shift Type" value={worker.shift_type} />
                      <InfoField icon={MapPin} label="Zone" value={worker.zone_name} />
                      <div className="group">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5 block" style={{ fontFamily: font.label }}>Experience</label>
                        <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                          <Briefcase className="w-4 h-4 text-[#5690FF]/60 flex-shrink-0" />
                          <span className="text-sm font-medium text-white/70">{worker.experience_months} months</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white/80 mb-6" style={{ fontFamily: font.display }}>Payment Details</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="group">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5 block" style={{ fontFamily: font.label }}>UPI ID</label>
                        <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                          <CreditCard className="w-4 h-4 text-[#5690FF]/60 flex-shrink-0" />
                          <span className="text-sm font-medium text-white/70 flex-1">
                            {showUpi ? (worker.upi_id || 'Not set') : '••••••••@upi'}
                          </span>
                          <button onClick={() => setShowUpi(!showUpi)} className="text-white/20 hover:text-white/40 transition-colors">
                            {showUpi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <InfoField icon={CreditCard} label="Daily Earnings Avg" value={`₹${worker.avg_daily_earnings?.toFixed(0) || 0}`} />
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex justify-end">
                    <Button variant="primary" onClick={() => toast.success('Profile saved!')} className="!px-8">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white/80 mb-2" style={{ fontFamily: font.display }}>Security Settings</h3>
                    <p className="text-sm text-white/30 mb-6">Manage your account security and authentication methods.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-[#22C55E]" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white/70">Phone Verification</p>
                            <p className="text-xs text-white/30">Verified via {worker.phone}</p>
                          </div>
                        </div>
                        <Badge variant="active" className="!text-[9px]">VERIFIED</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#5690FF]/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#5690FF]" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white/70">Two-Factor Auth</p>
                            <p className="text-xs text-white/30">Extra layer of protection</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="!text-xs !px-4 !py-1.5">Enable</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-[#3B82F6]" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white/70">Login Sessions</p>
                            <p className="text-xs text-white/30">1 active session</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="!text-xs !px-4 !py-1.5">Manage</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white/80 mb-2" style={{ fontFamily: font.display }}>Notification Preferences</h3>
                    <p className="text-sm text-white/30 mb-6">Choose how you want to be alerted about disruptions and payouts.</p>

                    {[
                      { label: 'Disruption Alerts', desc: 'Get notified when a disruption is detected in your zone', on: true },
                      { label: 'Claim Updates', desc: 'Updates when your claims are processed or paid', on: true },
                      { label: 'Policy Reminders', desc: 'Reminders when your policy is about to expire', on: true },
                      { label: 'Weekly Summary', desc: 'Earnings and activity recap every Monday', on: false },
                      { label: 'Marketing', desc: 'Product updates and new feature announcements', on: false },
                    ].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.04] mb-3">
                        <div>
                          <p className="font-bold text-sm text-white/70">{pref.label}</p>
                          <p className="text-xs text-white/30 mt-0.5">{pref.desc}</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${pref.on ? 'bg-[#5690FF]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.on ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div className="bg-red-500/[0.03] backdrop-blur-xl border border-red-500/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-400/80 mb-2" style={{ fontFamily: font.display }}>Danger Zone</h3>
                    <p className="text-sm text-white/30 mb-6">Irreversible account actions. Proceed with caution.</p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                        <div>
                          <p className="font-bold text-sm text-white/70">Sign Out</p>
                          <p className="text-xs text-white/30">Log out of your current session</p>
                        </div>
                        <Button onClick={handleSignOut} className="!bg-white/5 hover:!bg-red-500/10 !text-red-400 !text-xs !px-4 !py-1.5 !border !border-red-500/20">
                          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-red-500/10">
                        <div>
                          <p className="font-bold text-sm text-red-400/70">Deactivate Account</p>
                          <p className="text-xs text-white/30">Permanently disable your Axio account</p>
                        </div>
                        <Button className="!bg-red-500/10 hover:!bg-red-500/20 !text-red-400 !text-xs !px-4 !py-1.5 !border !border-red-500/20">
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
