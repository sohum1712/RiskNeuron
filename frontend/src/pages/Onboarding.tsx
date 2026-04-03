import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, User, Phone, MapPin, Building2, ShieldCheck, Smartphone, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RiskGauge } from '../components/charts/RiskGauge';
import { registerWorker, createPolicy } from '../api/client';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { OnboardingResponse, PlanOption } from '../types';
import { AppBackground } from '../components/AppBackground';
const cities = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
const platforms = [
  { value: 'zepto', label: 'Zepto', color: 'bg-yellow-500' },
  { value: 'blinkit', label: 'Blinkit', color: 'bg-orange-500' },
  { value: 'swiggy_instamart', label: 'Swiggy Instamart', color: 'bg-purple-500' },
  { value: 'multiple', label: 'Multiple Platforms', color: 'bg-blue-500' }
];
const shifts = [
  { value: 'morning', label: 'Morning', time: '6am–2pm' },
  { value: 'evening', label: 'Evening', time: '2pm–10pm' },
  { value: 'night', label: 'Night', time: '10pm–6am' },
  { value: 'flexible', label: 'Flexible', time: 'Variable' }
];
const experiences = [
  '< 1 month', '1–3 months', '3–6 months', '6–12 months', '1–2 years', '2+ years'
];

const experienceToMonths: Record<string, number> = {
  '< 1 month': 0,
  '1–3 months': 2,
  '3–6 months': 4,
  '6–12 months': 9,
  '1–2 years': 18,
  '2+ years': 30
};

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setWorkerId } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [workerResult, setWorkerResult] = useState<OnboardingResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    dark_store_name: '',
    zone_name: '',
    platform: '',
    shift_type: 'flexible',
    experience_months: 4,
    avg_daily_orders: 25,
    upi_id: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = formData.name && formData.phone.length === 10 && formData.city && formData.dark_store_name;
  const isStep2Valid = formData.platform && formData.shift_type;

  const handleNext = async () => {
    if (step === 3) {
      // Register worker
      setAssessmentLoading(true);
      try {
        const response = await registerWorker({
          ...formData,
          zone_name: formData.dark_store_name // Use dark store as zone
        });
        setWorkerResult(response);
        setStep(4);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Registration failed');
      } finally {
        setAssessmentLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePlanSelect = async (planType: string) => {
    if (!workerResult) return;
    
    setSelectedPlan(planType);
    setLoading(true);
    
    try {
      await createPolicy({
        worker_id: workerResult.worker.id,
        plan_type: planType,
        auto_renew: false
      });
      
      toast.success('🛡️ Coverage activated!');
      setWorkerId(workerResult.worker.id);
      navigate(`/dashboard/${workerResult.worker.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to activate coverage');
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

    return (
<div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      overflow: 'hidden', 
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '40px'
    }}>
     <AppBackground />
     <style>{`
       h1, h2, h3 { font-family: 'Barlow', sans-serif !important; }
       .font-label { font-family: 'Space Grotesk', sans-serif !important; }
     `}</style>
     <div className="w-full max-w-2xl relative z-10 mr-12 ml-auto">
        {/* Header */}
        <div className="text-left mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#F97316]/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-[#F97316]" />
            </span>
            <span className="font-label text-[#F97316] text-xs tracking-widest uppercase">Verified Protection</span>
          </div>
          <h1 className="text-5xl font-black mb-3 text-white leading-tight">Secure Your<br/>Earnings Now</h1>
          <p className="text-[#94A3B8] text-lg max-w-md">Our AI risk engine calculates your custom protection in under 60 seconds.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step
                      ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/50'
                      : s < step
                      ? 'bg-[#F97316] text-white'
                      : 'bg-white/10 text-[#94A3B8]'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      s < step ? 'bg-[#F97316]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#94A3B8] mt-2">
            <span>Personal Info</span>
            <span>Platform & Shift</span>
            <span>Earnings</span>
            <span>AI Assessment</span>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white/[0.03] backdrop-blur-[16px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-xl p-8 min-h-[500px]">
          <AnimatePresence mode="wait" custom={step}>
                        {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-8"
              >
                <div className="md:col-span-3 space-y-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-[#F97316]" /> Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#F97316] transition-all placeholder:text-white/20"
                          placeholder="Your official ID name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Phone Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-[#CBD5E1]">
                          <Phone className="w-4 h-4 mr-2 opacity-50" /> +91
                        </span>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="flex-1 bg-black/40 border border-white/10 backdrop-blur-md rounded-r-xl px-4 py-4 text-white focus:outline-none focus:border-[#F97316] transition-all"
                          placeholder="Mobile number"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#CBD5E1] mb-2">City</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                          <select
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:border-[#F97316] transition-all"
                          >
                            <option value="">Select city</option>
                            {cities.map(city => (
                              <option key={city} value={city} className="bg-[#0C1117]">{city}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Dark Store</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                          <input
                            type="text"
                            value={formData.dark_store_name}
                            onChange={(e) => updateField('dark_store_name', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#F97316] transition-all"
                            placeholder="Store Zone"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="mb-6 p-5 bg-[#F97316]/10 rounded-2xl border border-[#F97316]/20">
                      <p className="font-bold text-[#F97316] mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Why location?
                      </p>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Risk profiles change block-by-block. Your zone helps us detect immediate climate threats.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center text-xs font-bold text-[#F97316]">1</div>
                        <p className="text-sm text-[#CBD5E1]">Account Setup</p>
                      </div>
                      <div className="flex items-center gap-3 opacity-30">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white">2</div>
                        <p className="text-sm text-white">Risk Profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={2}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-[#F97316]" /> Platform & Shift
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-3">Platform</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {platforms.map((platform) => (
                      <button
                        key={platform.value}
                        onClick={() => updateField('platform', platform.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.platform === platform.value
                            ? 'border-[#F97316] bg-[#F97316]/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-12 h-12 ${platform.color} rounded-lg mb-3 mx-auto shadow-lg`} />
                        <div className="font-semibold text-white text-sm">{platform.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-3">Shift</label>
                  <div className="grid grid-cols-2 gap-3">
                    {shifts.map((shift) => (
                      <button
                        key={shift.value}
                        onClick={() => updateField('shift_type', shift.value)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          formData.shift_type === shift.value
                            ? 'border-[#F97316] bg-[#F97316]/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-white flex items-center gap-2">
                           <Clock className="w-4 h-4 text-[#F97316]" /> {shift.label}
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-1">{shift.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Experience</label>
                  <select
                    value={Object.keys(experienceToMonths).find(k => experienceToMonths[k] === formData.experience_months)}
                    onChange={(e) => updateField('experience_months', experienceToMonths[e.target.value])}
                    className="w-full bg-black/20 border border-white/10 backdrop-blur-md rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#F97316]"
                  >
                    {experiences.map(exp => (
                      <option key={exp} value={exp} className="bg-[#0C1117]">{exp}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={3}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#F97316]" /> Earnings Information
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-5">
                    Average daily orders (Slide to adjust)
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={formData.avg_daily_orders}
                      onChange={(e) => updateField('avg_daily_orders', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
                    />
                    <div className="flex justify-between mt-4">
                      <span className="text-[#94A3B8] text-xs font-semibold">5 orders</span>
                      <div className="bg-[#F97316] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-[#F97316]/30">
                        {formData.avg_daily_orders} orders/day
                      </div>
                      <span className="text-[#94A3B8] text-xs font-semibold">60 orders</span>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-[#F97316]/20 to-transparent rounded-2xl border border-[#F97316]/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold mb-1">Typical daily earnings</div>
                      <div className="text-3xl font-black text-white">
                        ₹{formData.avg_daily_orders * 18} <span className="text-sm font-normal text-[#94A3B8]">/ day</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-[#94A3B8] uppercase font-bold mb-1">Monthly Potential</div>
                       <div className="text-xl font-bold text-[#F97316]">₹{formData.avg_daily_orders * 18 * 26}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
                    UPI ID <span className="text-white/20">(for faster settlements)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => updateField('upi_id', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 backdrop-blur-md rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#F97316]"
                    placeholder="yourname@upi"
                  />
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={4}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {assessmentLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Loader2 className="w-16 h-16 text-[#F97316] animate-spin mb-6" />
                    </motion.div>
                    <div className="space-y-3 text-center">
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#CBD5E1]">🔍 Analysing delivery zone...</motion.p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-[#CBD5E1]">🤖 Running AI risk model...</motion.p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="text-[#CBD5E1]">📊 personalising premium...</motion.p>
                    </div>
                  </div>
                ) : workerResult ? (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-2xl font-bold mb-6 underline decoration-[#F97316]">AI Risk Assessment</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <RiskGauge score={workerResult.risk_profile.risk_score} tier={workerResult.risk_profile.risk_tier} />
                      <div className="space-y-4">
                        <Badge variant={workerResult.risk_profile.risk_tier}>{workerResult.risk_profile.risk_tier.toUpperCase()} RISK</Badge>
                        <p className="text-[#CBD5E1] text-sm">{workerResult.message}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {workerResult.recommended_plans.map(plan => (
                        <div key={plan.plan_type} className={`border-2 rounded-xl p-4 transition-all ${plan.recommended ? 'border-[#F97316] bg-[#F97316]/5' : 'border-white/10 background-blur-xl'}`}>
                           {plan.recommended && <div className="text-[10px] text-[#F97316] font-bold uppercase mb-1">Recommended</div>}
                          <Badge variant={plan.plan_type}>{plan.plan_type}</Badge>
                          <div className="text-2xl font-black mt-2 text-white text-center">₹{plan.weekly_premium}</div>
                          <Button className="w-full mt-4" size="sm" onClick={() => handlePlanSelect(plan.plan_type)} loading={selectedPlan === plan.plan_type && loading}>Select</Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step > 1 ? 'Back' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                assessmentLoading
              }
              loading={assessmentLoading}
            >
              {step === 3 ? 'Analyse Risk' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
