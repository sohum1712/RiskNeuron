const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace('import { ArrowLeft, ArrowRight, Loader2 } from \'lucide-react\';', 'import { ArrowLeft, ArrowRight, Loader2, User, Phone, MapPin, Building2, ShieldCheck, Smartphone, TrendingUp } from \'lucide-react\';');

// Update Header
const newHeader = `<div className="text-left mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#F97316]/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-[#F97316]" />
            </span>
            <span className="font-label text-[#F97316] text-xs tracking-widest uppercase">Verified Protection</span>
          </div>
          <h1 className="text-5xl font-black mb-3 text-white leading-tight">Secure Your<br/>Earnings Now</h1>
          <p className="text-[#94A3B8] text-lg max-w-md">Our AI risk engine calculates your custom protection in under 60 seconds.</p>
        </div>`;

content = content.replace(/<div className="text-left mb-8">[\s\S]*?<\/div>/, newHeader);

// Update Step 1 with Grid layout
const newStep1 = `            {step === 1 && (
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
                          onChange={(e) => updateField('phone', e.target.value.replace(/\\D/g, '').slice(0, 10))}
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
            )}`;

content = content.replace(/\{step === 1 && \([\s\S]*?\}\s*<\/motion.div>\s*\)\s*\}/, newStep1);

fs.writeFileSync(file, content);
console.log('Finalized Engaging Onboarding UI');
