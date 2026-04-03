import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Shield, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { loginWorker } from '../api/client';
import { useStore } from '../store/useStore';
import { AppBackground } from '../components/AppBackground';
import toast from 'react-hot-toast';

const C = {
  orange: '#F97316',
  orangeHover: '#EA6C0E',
};

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setWorkerId } = useStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const worker = await loginWorker(phone);
      setWorkerId(worker.id);
      toast.success(`Welcome back, ${worker.name.split(' ')[0]}!`);
      navigate(`/dashboard/${worker.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'No account found with this number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden"
      style={{ fontFamily: font.body, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <AppBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-10 text-white/55 hover:text-white transition-colors group"
          style={{ fontFamily: font.label, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        {/* Logo + heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-lg shadow-[#F97316]/30">
              <Shield size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>SwiftCover</span>
          </div>
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 10 }}>
            Welcome<br />back.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.65 }}>
            Enter your registered phone number to access your dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/[0.10] rounded-2xl p-7">
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontFamily: font.label, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
              Phone Number
            </label>

            <div
              className="flex items-center bg-white/[0.06] border border-white/[0.12] rounded-xl overflow-hidden mb-5 focus-within:border-[#F97316]/60 transition-colors"
            >
              <div className="flex items-center gap-2 px-4 py-4 border-r border-white/[0.10] text-white/60">
                <Phone size={15} />
                <span style={{ fontFamily: font.label, fontSize: 13, fontWeight: 600 }}>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength={10}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder:text-white/25"
                style={{ fontFamily: font.body, fontSize: 15 }}
              />
              {phone.length === 10 && (
                <div className="pr-4 text-[#22C55E]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-base transition-all"
              style={{
                fontFamily: font.display,
                background: phone.length === 10 ? C.orange : 'rgba(249,115,22,0.25)',
                color: phone.length === 10 ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                letterSpacing: '0.01em',
                border: 'none',
              }}
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Checking...</>
                : <>Access Dashboard <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span style={{ fontFamily: font.label, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.12em' }}>NEW TO SWIFTCOVER?</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl transition-all"
            style={{
              fontFamily: font.display, fontWeight: 700, fontSize: 14,
              background: 'transparent', color: C.orange,
              border: '1px solid rgba(249,115,22,0.35)', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; }}
          >
            Create Account — Free Quote <ArrowRight size={14} />
          </button>
        </div>

        {/* Demo hint */}
        <p className="text-center mt-6 text-white/35 text-xs" style={{ fontFamily: font.body }}>
          Demo accounts: 9876543210 · 9876543211 · 9876543212
        </p>
      </motion.div>
    </div>
  );
};
