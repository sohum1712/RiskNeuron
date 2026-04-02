const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

const step2 = `
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
                        className={\`p-4 rounded-xl border-2 transition-all \${
                          formData.platform === platform.value
                            ? 'border-[#F97316] bg-[#F97316]/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }\`}
                      >
                        <div className={\`w-12 h-12 \${platform.color} rounded-lg mb-3 mx-auto shadow-lg\`} />
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
                        className={\`p-4 rounded-xl border transition-all text-left \${
                          formData.shift_type === shift.value
                            ? 'border-[#F97316] bg-[#F97316]/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }\`}
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
            )}`;

const step3 = `
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
            )}`;

const step4 = `
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
                        <div key={plan.plan_type} className={\`border-2 rounded-xl p-4 transition-all \${plan.recommended ? 'border-[#F97316] bg-[#F97316]/5' : 'border-white/10 background-blur-xl'}\`}>
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
            )}`;

content = content.replace(/\s*<\/AnimatePresence>/, step2 + step3 + step4 + '\n          </AnimatePresence>');
fs.writeFileSync(file, content);
console.log('Restored Onboarding steps');
