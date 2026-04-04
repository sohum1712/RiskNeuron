import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import landingBgUrl from '../assets/images/Landing page.jpeg';
import howItWorksBgUrl from '../assets/images/Bg.jpeg';
function useFonts() {
  useEffect(() => {
    if (document.getElementById('sw-fonts-v2')) return;
    const link = document.createElement('link');
    link.id = 'sw-fonts-v2';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600&family=Poppins:ital,wght@1,600&display=swap';
    document.head.appendChild(link);
  }, []);
}

/* ─── Colour tokens ─── */
const C = {
  bg: '#0C1117',
  surface: '#161C27',
  surface2: '#1E2537',
  border: 'rgba(255,255,255,0.07)',
  orange: '#5690FF',
  orangeHover: '#4070E0',
  green: '#22C55E',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  mutedLight: 'rgba(255,255,255,0.35)',
};

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

/* ─── SVG Icons ─── */
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Navbar ─── */
function Navbar({ onJoin, onAdmin, onLogin }: { onJoin: () => void; onAdmin: () => void; onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = ['How It Works', 'Benefits', 'Coverage Plans', 'FAQ'];

  return (
    <nav style={{
      position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none'
    }}>
      <div style={{
        backdropFilter: scrolled ? 'blur(40px)' : 'none',
        background: scrolled ? 'rgba(12,17,23,0.7)' : 'transparent',
        border: scrolled ? `1px solid rgba(255, 255, 255, 0.12)` : '1px solid transparent',
        borderRadius: 40,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto',
        gap: 24,
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
          <ShieldIcon />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontStyle: 'italic', fontSize: 20, color: C.white, letterSpacing: '-0.01em' }}>Axio</span>
        </div>

        {/* Center: Pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {navLinks.map((l) => (
            <span key={l}
              style={{
                fontFamily: font.label, fontSize: 13, fontWeight: 500,
                color: C.white,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: '7px 14px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              {l}
            </span>
          ))}
        </div>

        {/* Right: Admin, Login, CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 4 }}>
          <button onClick={onAdmin}
            style={{ fontFamily: font.label, fontSize: 13, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', padding: '7px 12px', cursor: 'pointer', borderRadius: 20, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'none'; }}
          >
            Admin
          </button>
          <button onClick={onLogin}
            style={{
              fontFamily: font.label, fontWeight: 600, fontSize: 13, letterSpacing: '0.02em',
              background: 'rgba(255,255,255,0.1)', color: C.white, border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20, padding: '7px 18px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            Login
          </button>
          <button onClick={onJoin}
            style={{
              fontFamily: font.label, fontWeight: 600, fontSize: 13, letterSpacing: '0.02em',
              background: C.orange, color: C.white, border: 'none', borderRadius: 20, padding: '8px 20px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
            onMouseLeave={e => (e.currentTarget.style.background = C.orange)}
          >Protect Your Earnings</button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Floating overlay card ─── */
function FloatCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(8px)',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Mini line chart ─── */
function MiniChart() {
  const expected = [180, 200, 220, 240, 210, 260, 280, 270, 300, 290, 320, 340, 310, 350];
  const actual   = [170, 190, 140,  80,  60, 100, 220, 260, 280, 275, 310, 330, 300, 340];
  const w = 160, h = 60;
  const minV = 60, maxV = 360;
  const toX = (i: number) => (i / (expected.length - 1)) * w;
  const toY = (v: number) => h - ((v - minV) / (maxV - minV)) * h;
  const pathD = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <path d={pathD(expected)} fill="none" stroke="rgba(86,144,255,0.7)" strokeWidth="1.5" />
      <path d={pathD(actual)}   fill="none" stroke="rgba(34,197,94,0.7)"  strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

/* ─── Hero section ─── */
function Hero({ onJoin }: { onJoin: () => void }) {
  const features = [
    { icon: '⊙', label: 'Automatic Payouts', sub: 'No Claims Needed' },
    { icon: '◈', label: 'AI-Prediction Engine', sub: 'Income Forecasting' },
    { icon: '◎', label: 'Environmental Coverage', sub: 'Rain, Heat, Pollution' },
    { icon: '⊕', label: 'Instant UPI Transfer', sub: 'Under 5 Minutes' },
  ];

  return (
    <section style={{ 
      paddingTop: 110, paddingBottom: 0, minHeight: '100vh', position: 'relative', overflow: 'hidden',
      backgroundImage: `url("${landingBgUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Dark overlay to ensure text is readable against the photo -- reduced opacity and made a gradient so right side is clearer */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12, 17, 23, 0.85) 0%, rgba(12, 17, 23, 0.4) 50%, rgba(12, 17, 23, 0.1) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      {/* Moved text more to the left by reducing margin/padding and stretching container */}
      <div style={{ width: '100%', padding: '80px 5%', position: 'relative', zIndex: 10 }}>

        {/* LEFT */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ maxWidth: '650px' }}>
          {/* Partner badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ fontFamily: font.label, fontSize: 11, color: C.mutedLight, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Preferred Partners</span>
            {['Zepto', 'Blinkit', 'Swiggy'].map(p => (
              <span key={p} style={{ fontFamily: font.label, fontSize: 11, fontWeight: 600, background: C.surface2, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 8px' }}>{p}</span>
            ))}
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.0, letterSpacing: '-0.02em', color: C.white, marginBottom: 20 }}>
            YOUR EARNINGS,<br />SECURED.<br />
            <span style={{ color: C.orange }}>INSTANT PROTECTION</span><br />
            FOR INDIA'S GIG <br />WORKERS.
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: font.body, fontWeight: 300, fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 32, maxWidth: '46ch' }}>
            AI-Powered Parametric Insurance for India's Q-Commerce Gig Workers. Automatic compensation for income loss due to external disruptions, with instant UPI payouts. No forms, no waiting.
          </p>

          {/* Feature icons row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36, padding: '16px', backdropFilter: 'blur(10px)', borderRadius: 10, border: `1px solid ${C.border}` }}>
            {features.map((f) => (
              <div key={f.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: font.label, fontSize: 20, color: C.orange, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontFamily: font.label, fontWeight: 600, fontSize: 11, color: C.white, marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontFamily: font.body, fontSize: 11, color: C.mutedLight }}>{f.sub}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={onJoin}
            style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, letterSpacing: '0.01em', background: C.orange, color: C.white, border: 'none', borderRadius: 8, padding: '15px 36px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
            onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
            onMouseLeave={e => (e.currentTarget.style.background = C.orange)}
          >
            Get Covered Now — Free Quote <ArrowRightIcon />
          </button>
        </motion.div>

        {/* Removed RIGHT hand illustration blocks and float cards since the background image handles this aspect already */}
      </div>
    </section>
  );
}
function HowItWorks({ onJoin }: { onJoin: () => void }) {
  const steps = [
    { n: '01', title: 'Link Account', desc: 'Register with your phone, city, and platform details.' },
    { n: '02', title: 'Set Policy', desc: 'Choose Basic, Standard, or Premium. Coverage starts instantly.' },
    { n: '03', title: 'Trigger Detection', desc: 'AI monitors weather, AQI, and traffic for your zone 24/7.' },
    { n: '04', title: 'Automatic Payout', desc: 'Income loss verified. UPI credited. You do nothing.' },
  ];

  return (
    <section style={{ padding: '80px 40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontFamily: font.label, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.orange, marginBottom: 10 }}>How It Works</p>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, color: C.white, letterSpacing: '-0.02em' }}>Four steps to complete protection.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
          {/* connector line */}
          <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 1, background: C.border }} />

          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', 
                padding: '32px 20px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(16px)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: 16, 
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                margin: '0 10px',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: i === 3 ? C.orange : C.white }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontFamily: font.body, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button onClick={onJoin}
            style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, background: C.orange, color: C.white, border: 'none', borderRadius: 8, padding: '14px 40px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
            onMouseLeave={e => (e.currentTarget.style.background = C.orange)}
          >Start Your Coverage</button>
        </div>
      </div>
    </section>
  );
}

/* ─── Plans ─── */
function Plans({ onJoin }: { onJoin: () => void }) {
  const plans = [
    { name: 'Basic', price: '₹49', period: '/ week', max: '₹1,500', color: C.border, badge: null },
    { name: 'Standard', price: '₹89', period: '/ week', max: '₹2,500', color: C.orange, badge: 'Most Popular' },
    { name: 'Premium', price: '₹149', period: '/ week', max: '₹4,000', color: C.border, badge: null },
  ];

  const features = {
    Basic: ['Heavy Rain & Floods', 'Severe Pollution (AQI 250+)'],
    Standard: ['Heavy Rain & Floods', 'Severe Pollution (AQI 200+)', 'Extreme Heat (43°C+)', 'Traffic Shutdown'],
    Premium: ['Heavy Rain & Floods', 'Severe Pollution (AQI 180+)', 'Extreme Heat (42°C+)', 'Traffic Shutdown', 'Dark Store Closure', 'Curfews & Strikes', 'Platform Outages'],
  };

  return (
    <section style={{ padding: '80px 40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: font.label, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.orange, marginBottom: 10 }}>Coverage Plans</p>
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, color: C.white, letterSpacing: '-0.02em' }}>Coverage that matches your shift.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {plans.map((p) => {
            const isPopular = p.badge === 'Most Popular';
            return (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                style={{
                  background: isPopular ? 'rgba(86, 144, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${isPopular ? 'rgba(86, 144, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: 16,
                  padding: '32px 28px',
                  position: 'relative',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                {p.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: C.orange, borderRadius: 4, padding: '3px 12px' }}>
                    <span style={{ fontFamily: font.label, fontSize: 11, fontWeight: 700, color: C.white, letterSpacing: '0.06em' }}>{p.badge}</span>
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: C.orange, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 40, color: C.white }}>{p.price}</span>
                    <span style={{ fontFamily: font.body, fontSize: 14, color: C.muted }}>{p.period}</span>
                  </div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: C.muted, marginTop: 4 }}>Up to {p.max} / week</div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
                  {(features[p.name as keyof typeof features]).map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                      <div style={{ marginTop: 1, flexShrink: 0 }}><CheckIcon /></div>
                      <span style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={onJoin}
                  style={{
                    width: '100%', fontFamily: font.display, fontWeight: 700, fontSize: 14,
                    background: isPopular ? C.orange : 'transparent',
                    color: isPopular ? C.white : C.orange,
                    border: `1px solid ${isPopular ? C.orange : 'rgba(86,144,255,0.4)'}`,
                    borderRadius: 6, padding: '12px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = C.white; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isPopular ? C.orange : 'transparent'; e.currentTarget.style.color = isPopular ? C.white : C.orange; }}
                >Choose {p.name}</button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Partners + Testimonial ─── */
function PartnersAndTestimonial() {
  return (
    <section style={{ padding: '48px 40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>

        {/* Partners */}
        <div>
          <div style={{ fontFamily: font.label, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.mutedLight, marginBottom: 20 }}>Preferred Platform Partners</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[
              { name: 'Zepto', color: '#7C3AED' },
              { name: 'blinkit', color: '#F59E0B' },
              { name: 'Swiggy Instamart', color: '#5690FF' },
            ].map(p => (
              <div key={p.name} style={{ fontFamily: font.display, fontWeight: 900, fontSize: 20, color: p.color, letterSpacing: '-0.01em' }}>{p.name}</div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: 16, 
          padding: '24px 28px', 
          maxWidth: 360,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ fontFamily: font.label, fontSize: 22, color: C.orange, marginBottom: 8, lineHeight: 1 }}>"</div>
          <p style={{ fontFamily: font.body, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
            Last monsoon I lost 4 days of income. With Axio, ₹1,200 was in my UPI before I even checked the app. This is the real deal.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A5F3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.display, fontWeight: 700, fontSize: 14, color: C.white }}>R</div>
            <div>
              <div style={{ fontFamily: font.label, fontWeight: 600, fontSize: 13, color: C.white }}>Rahul Kumar</div>
              <div style={{ fontFamily: font.body, fontSize: 12, color: C.mutedLight }}>Zepto Partner, Hyderabad</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={C.orange}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer({ onAdmin }: { onAdmin: () => void }) {
  return (
    <footer style={{ padding: '24px 40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldIcon />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontStyle: 'italic', fontSize: 17, color: C.white }}>Axio</span>
        </div>
        <span style={{ fontFamily: font.body, fontSize: 12, color: C.mutedLight }}>Guidewire DEVTrails 2026 · AI-Powered Parametric Micro-Insurance by Axio</span>
        <button onClick={onAdmin} style={{ fontFamily: font.label, fontSize: 12, color: C.mutedLight, background: 'none', border: 'none', cursor: 'pointer' }}>Admin Console</button>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export const Landing: React.FC = () => {
  const navigate = useNavigate();
  useFonts();
  const onJoin = () => navigate('/onboarding');
  const onAdmin = () => navigate('/admin');
  const onLogin = () => navigate('/login');
  return (
    <div style={{ background: C.bg }}>
      <Navbar onJoin={onJoin} onAdmin={onAdmin} onLogin={onLogin} />
      <Hero onJoin={onJoin} />
      
      {/* Unified Background Wrapper to eliminate seams */}
      <div style={{ 
        position: 'relative', overflow: 'hidden',
        backgroundImage: `url("${howItWorksBgUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Dark overlay for the entire bottom half of the page */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12, 17, 23, 0.85) 0%, rgba(12, 17, 23, 0.4) 50%, rgba(12, 17, 23, 0.1) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        {/* Sections sit on top completely transparently */}
        <HowItWorks onJoin={onJoin} />
        <Plans onJoin={onJoin} />
        <PartnersAndTestimonial />
        <Footer onAdmin={onAdmin} />
      </div>
    </div>
  );
};
