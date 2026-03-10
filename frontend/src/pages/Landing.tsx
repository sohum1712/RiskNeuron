import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, TrendingUp, CloudRain, Factory, Thermometer, Navigation, Store, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const payoutExamples = [
  { name: 'Rahul Kumar', disruption: 'Heavy Rain', amount: 420, upi: 'UPI20240115143022' },
  { name: 'Priya Sharma', disruption: 'Flood', amount: 385, upi: 'UPI20240115143145' },
  { name: 'Mohammed Ali', disruption: 'Severe Pollution', amount: 310, upi: 'UPI20240115143308' },
  { name: 'Anita Devi', disruption: 'Extreme Heat', amount: 275, upi: 'UPI20240115143421' }
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [currentPayoutIndex, setCurrentPayoutIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPayoutIndex((prev) => (prev + 1) % payoutExamples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentPayout = payoutExamples[currentPayoutIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-black text-slate-100">
              Swift<span className="text-cyan-400">Cover</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={() => navigate('/onboarding')}>
              Get Protected
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              Admin Console
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">🏆</span>
                <span className="text-sm text-cyan-400 font-medium">
                  DEVTrails 2026 · Q-Commerce Income Insurance
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-4">
                When Rain Stops Orders,
              </h1>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-cyan-400 mb-6">
                We Don't Stop Paying.
              </h1>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Zepto, Blinkit, and Swiggy Instamart partners get automatic income protection 
                the instant disruptions hit their zone. No forms. No waiting.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/onboarding')}
                  className="shadow-2xl shadow-cyan-500/30"
                >
                  Get Protected — from ₹49/week
                </Button>
                <Button variant="ghost" size="lg" onClick={() => navigate('/admin')}>
                  View Admin Console
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>✓ No paperwork</span>
                <span>✓ No claim forms</span>
                <span>✓ Fully automated</span>
                <span>✓ Zero touch</span>
              </div>
            </motion.div>

            {/* Right Column - Animated Payout Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-96 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPayoutIndex}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-full max-w-md"
                  >
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-white/20 rounded-full p-3">
                          <span className="text-3xl">💰</span>
                        </div>
                        <div className="bg-white/20 rounded-full px-3 py-1">
                          <span className="text-white text-sm font-bold">✓ PAID</span>
                        </div>
                      </div>
                      <div className="text-white">
                        <div className="text-4xl font-black mb-2">
                          ₹{currentPayout.amount}
                        </div>
                        <div className="text-emerald-100 font-semibold mb-1">
                          {currentPayout.name}
                        </div>
                        <div className="text-emerald-50 text-sm mb-3">
                          {currentPayout.disruption}
                        </div>
                        <div className="bg-white/10 rounded-lg px-3 py-2 text-xs font-mono">
                          {currentPayout.upi}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">50M+</div>
              <div className="text-slate-300">Q-Commerce gig workers unprotected in India</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">₹49</div>
              <div className="text-slate-300">Weekly coverage starts from</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">&lt; 5 min</div>
              <div className="text-slate-300">Average automated payout time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Register in 60 seconds</h3>
              <p className="text-slate-400">
                Your zone, platform, and shift analysed by AI instantly
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3">Choose your weekly plan</h3>
              <p className="text-slate-400">
                ₹49–₹149/week. Renews every 7 days like your platform payouts
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Get paid automatically</h3>
              <p className="text-slate-400">
                Disruption detected → claim filed → UPI credited. You do nothing
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disruptions We Cover */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">Disruptions We Cover</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CloudRain, title: 'Heavy Rain & Floods', desc: 'When roads become rivers' },
              { icon: Factory, title: 'Pollution (AQI 200+)', desc: 'Toxic air, zero orders' },
              { icon: Thermometer, title: 'Extreme Heat (42°C+)', desc: 'Too hot to deliver' },
              { icon: Navigation, title: 'Traffic Shutdowns', desc: 'Roads blocked, income stopped' },
              { icon: Store, title: 'Dark Store Closure', desc: 'No store, no deliveries' },
              { icon: AlertCircle, title: 'Curfews & Strikes', desc: 'City lockdowns covered' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <item.icon className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Q-Commerce Workers Are Most At Risk */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">
            Why Q-Commerce Workers Are Most At Risk
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="text-3xl font-black text-red-400 mb-3">Zone-locked 2km</div>
              <p className="text-slate-300">
                One flooded road eliminates your entire income
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="text-3xl font-black text-amber-400 mb-3">10-min delivery pressure</div>
              <p className="text-slate-300">
                No rerouting possible. Rain = cancelled orders immediately
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="text-3xl font-black text-purple-400 mb-3">₹0 base salary</div>
              <p className="text-slate-300">
                Pure order income. 0 deliveries = ₹0. No safety net
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>SwiftCover — AI-Powered Parametric Micro-Insurance for Q-Commerce Workers</p>
          <p className="mt-2">Built for Guidewire DEVTrails 2026</p>
        </div>
      </footer>
    </div>
  );
};
