import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RiskGauge } from '../components/charts/RiskGauge';
import { registerWorker, createPolicy } from '../api/client';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { OnboardingResponse, PlanOption } from '../types';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">Get Protected in 60 Seconds</h1>
          <p className="text-slate-400">AI-powered risk assessment & instant coverage</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                      : s < step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      s < step ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Personal Info</span>
            <span>Platform & Shift</span>
            <span>Earnings</span>
            <span>AI Assessment</span>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 min-h-[500px]">
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
              >
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-slate-700 border border-r-0 border-slate-600 rounded-l-lg text-slate-300">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-r-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select your city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Dark Store / Zone</label>
                    <input
                      type="text"
                      value={formData.dark_store_name}
                      onChange={(e) => updateField('dark_store_name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Blinkit Dark Store - Banjara Hills"
                    />
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
                <h2 className="text-2xl font-bold mb-6">Platform & Shift</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Platform</label>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <button
                        key={platform.value}
                        onClick={() => updateField('platform', platform.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.platform === platform.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                        }`}
                      >
                        <div className={`w-12 h-12 ${platform.color} rounded-lg mb-3 mx-auto`} />
                        <div className="font-semibold text-slate-100">{platform.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Shift</label>
                  <div className="grid grid-cols-2 gap-3">
                    {shifts.map((shift) => (
                      <button
                        key={shift.value}
                        onClick={() => updateField('shift_type', shift.value)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          formData.shift_type === shift.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-semibold text-slate-100">{shift.label}</div>
                        <div className="text-sm text-slate-400">{shift.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience</label>
                  <select
                    value={Object.keys(experienceToMonths).find(k => experienceToMonths[k] === formData.experience_months)}
                    onChange={(e) => updateField('experience_months', experienceToMonths[e.target.value])}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {experiences.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
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
                <h2 className="text-2xl font-bold mb-6">Earnings Information</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Average daily orders
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={formData.avg_daily_orders}
                    onChange={(e) => updateField('avg_daily_orders', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-slate-400 text-sm">5 orders/day</span>
                    <span className="text-cyan-400 text-lg font-bold">{formData.avg_daily_orders} orders/day</span>
                    <span className="text-slate-400 text-sm">60 orders/day</span>
                  </div>
                  <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
                    <div className="text-sm text-slate-400">Typical daily earnings</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      ≈ ₹{formData.avg_daily_orders * 18}/day
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    UPI ID <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => updateField('upi_id', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="yourname@paytm"
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    Used only to calculate your income loss during disruptions
                  </p>
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
                      <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
                    </motion.div>
                    <div className="space-y-3 text-center">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0 }}
                        className="text-slate-300"
                      >
                        🔍 Analysing your delivery zone...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-slate-300"
                      >
                        🤖 Running AI risk model...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        className="text-slate-300"
                      >
                        📊 Calculating personalised premium...
                      </motion.p>
                    </div>
                  </div>
                ) : workerResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">Your AI Risk Assessment</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <RiskGauge 
                          score={workerResult.risk_profile.risk_score} 
                          tier={workerResult.risk_profile.risk_tier as any}
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Badge variant={workerResult.risk_profile.risk_tier as any} size="md">
                            {workerResult.risk_profile.risk_tier.toUpperCase()} RISK
                          </Badge>
                          <p className="text-slate-300 mt-2">{workerResult.message}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-slate-400">Zone Risks</div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Flood Risk</span>
                                <span className="text-slate-300">{Math.round(workerResult.risk_profile.zone_flood_risk * 100)}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${workerResult.risk_profile.zone_flood_risk * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Heat Risk</span>
                                <span className="text-slate-300">{Math.round(workerResult.risk_profile.zone_heat_risk * 100)}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-orange-500 h-1.5 rounded-full" 
                                  style={{ width: `${workerResult.risk_profile.zone_heat_risk * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Pollution Risk</span>
                                <span className="text-slate-300">{Math.round(workerResult.risk_profile.zone_pollution_risk * 100)}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-gray-500 h-1.5 rounded-full" 
                                  style={{ width: `${workerResult.risk_profile.zone_pollution_risk * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Choose Your Plan</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {workerResult.recommended_plans.map((plan: PlanOption) => (
                        <div
                          key={plan.plan_type}
                          className={`border-2 rounded-xl p-4 transition-all ${
                            plan.recommended
                              ? 'border-cyan-500 bg-cyan-500/5'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {plan.recommended && (
                            <div className="flex items-center gap-1 text-cyan-400 text-sm font-semibold mb-2">
                              ⭐ Recommended
                            </div>
                          )}
                          <Badge variant={plan.plan_type as any} size="md" className="uppercase mb-3">
                            {plan.plan_type}
                          </Badge>
                          <div className="text-3xl font-black text-slate-100 mb-1">
                            ₹{plan.weekly_premium}
                          </div>
                          <div className="text-sm text-slate-400 mb-4">per week</div>
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Max/week</span>
                              <span className="text-slate-100 font-semibold">₹{plan.weekly_coverage_limit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Max/day</span>
                              <span className="text-slate-100 font-semibold">₹{plan.daily_coverage_limit}</span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 mb-2">Covered Disruptions</div>
                            <div className="flex flex-wrap gap-1">
                              {plan.covered_disruptions.slice(0, 3).map((d: string) => (
                                <span key={d} className="text-xs bg-slate-700 px-2 py-1 rounded">
                                  {d.replace(/_/g, ' ')}
                                </span>
                              ))}
                              {plan.covered_disruptions.length > 3 && (
                                <span className="text-xs text-slate-400">
                                  +{plan.covered_disruptions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-emerald-400 mb-3">
                            Est. savings: ₹{Math.round(plan.savings_potential_monthly)}/month
                          </div>
                          <Button
                            variant={plan.recommended ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handlePlanSelect(plan.plan_type)}
                            loading={selectedPlan === plan.plan_type && loading}
                            disabled={loading && selectedPlan !== plan.plan_type}
                            className="w-full"
                          >
                            Select Plan
                          </Button>
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
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
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
