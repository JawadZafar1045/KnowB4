import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, BookOpen, Award, BarChart2,
  CheckCircle2, Building2, GraduationCap,
  Target, Eye, ShieldCheck, Mail, Phone, MapPin, Send
} from 'lucide-react';
import loginBg from '../../assets/login-bg.jpg';
import logoImg from '../../assets/logo.png';
import byteBuggersLogo from '../../assets/byte-buggers-logo.png';
import szoneLogo from '../../assets/szone-logo.png';

/* ------------------------------------------------------------------ */
/* PLACEHOLDER CONTENT (AI generated) - replace with your real content */
/* Everything for the new About and Contact sections is in this block. */
/* ------------------------------------------------------------------ */
const ABOUT = {
  heading: 'Building a Security-Aware Workforce',
  paragraphs: [
    'ThinkB4Act is a security awareness and training platform that helps organizations turn their employees into the first line of defense against cyber threats.',
    'Most security incidents start with a human mistake, such as a phishing click or a weak password. We give every organization a simple way to train its people, track progress, and prove compliance, all from one secure platform.'
  ],
  cards: [
    {
      icon: Target,
      title: 'Our Mission',
      text: 'To make practical cybersecurity training accessible, measurable, and engaging for every organization, regardless of its size.'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      text: 'A world where every employee thinks before they act online, and every organization can verify that its people are prepared.'
    },
    {
      icon: ShieldCheck,
      title: 'Our Values',
      text: 'Security first, clarity over complexity, and trust through transparency, including verifiable certificates anyone can check.'
    }
  ]
};

const CONTACT = {
  heading: 'Get in Touch',
  intro: 'Have a question about the platform, or want to onboard your organization? Send us a message and our team will get back to you.',
  email: 'info@thinkb4act.com',
  phone: '+92 (370) 7041413',
  address: 'Head office\nIslamabad\nM1, Crown Vista Plaza, Phase 3, Ghauri Town\n\nSub-Office\nBahawalpur\nCB 1135, Faiz Colony, Model Town A',
  hours: 'Monday to Friday, 9:00 AM to 5:00 PM'
};
/* ------------------------------------------------------------------ */

const btnPrimaryStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '13px 26px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #196478 0%, #0d3741 100%)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.95rem',
  textDecoration: 'none',
  boxShadow: '0 8px 20px rgba(13,55,65,0.35)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

const btnOutlineStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.35)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.95rem',
  textDecoration: 'none',
  transition: 'all 0.2s ease'
};

const features = [
  {
    icon: Users,
    title: 'Multi-Tenant Workforce Management',
    text: 'Onboard every department and employee under one secure, isolated organization space — complete with roles, departments, and status tracking.'
  },
  {
    icon: BookOpen,
    title: 'Interactive Security Training',
    text: "Curated cybersecurity courses with lessons, real-world scenarios, and knowledge checks that adapt to every learner's pace."
  },
  {
    icon: BarChart2,
    title: 'Live Compliance Analytics',
    text: 'Track completion rates, campaign performance, and department readiness in real time — exportable to CSV, Excel, or PDF for audits.'
  },
  {
    icon: Award,
    title: 'Tamper-Proof Certification',
    text: 'Every completed course issues a verifiable digital certificate with a public QR-based validation page — no login required to confirm authenticity.'
  }
];

const stats = [
  { label: 'Training Modules', value: '15+' },
  { label: 'Organizations Onboarded', value: '2+' },
  { label: 'Certificates Issued', value: '100%' },
  { label: 'Uptime Target', value: '99.9%' }
];

// Shared hover handlers so every card in the page behaves identically
const cardHoverOn = (e) => {
  e.currentTarget.style.transform = 'translateY(-6px)';
  e.currentTarget.style.boxShadow = '0 16px 30px -8px rgba(53, 108, 137, 0.22), 0 4px 10px -2px rgba(53, 108, 137, 0.1)';
  e.currentTarget.style.borderColor = '#356c89';
  const bar = e.currentTarget.querySelector('.feature-accent-bar');
  if (bar) bar.style.transform = 'scaleX(1)';
  const iconBox = e.currentTarget.querySelector('.feature-icon');
  if (iconBox) iconBox.style.transform = 'scale(1.08) rotate(-3deg)';
};
const cardHoverOff = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
  e.currentTarget.style.borderColor = '#d3e3ea';
  const bar = e.currentTarget.querySelector('.feature-accent-bar');
  if (bar) bar.style.transform = 'scaleX(0)';
  const iconBox = e.currentTarget.querySelector('.feature-icon');
  if (iconBox) iconBox.style.transform = 'scale(1) rotate(0deg)';
};

const navLinkStyle = {
  color: '#3f3f46', fontWeight: 600, fontSize: '0.85rem',
  textDecoration: 'none', padding: '8px 12px', borderRadius: '9999px'
};

const homeCss = `
.tb-navlinks{display:flex;align-items:center;gap:4px}
@media (max-width:560px){.tb-navlinks{display:none}}
.tb-navlinks a:hover{background:#f0f4f7;color:#196478}
.tb-input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #d4d4d8;border-radius:10px;font:inherit;font-size:0.9rem;color:#18181b;background:#fff;transition:border-color .15s ease, box-shadow .15s ease}
.tb-input:focus{outline:none;border-color:#356c89;box-shadow:0 0 0 3px rgba(53,108,137,0.18)}
`;

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formError, setFormError] = useState('');
  const [formSent, setFormSent] = useState(false);

  // smooth scrolling for the About / Contact anchor links
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = prev; };
  }, []);

  const onField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFormError('');
    setFormSent(false);
  };

  // No backend endpoint yet: this opens the visitor's email app with the message filled in.
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError('Please fill in your name, email, and message.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const subject = form.subject.trim() || `Website enquiry from ${form.name.trim()}`;
    const body = `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormSent(true);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f3f8fa' }}>
      <style>{homeCss}</style>

      {/* Hero */}
      <div style={{
        minHeight: '88vh',
        backgroundImage: `linear-gradient(180deg, rgba(15,28,63,0.6) 0%, rgba(10,15,30,0.78) 100%), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top nav — floating pill style */}
        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'center' }}>
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', maxWidth: '1000px',
            background: '#ffffff',
            borderRadius: '9999px',
            padding: '10px 12px 10px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logoImg} alt="ThinkB4Act" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
              <span style={{ color: '#12151A', fontWeight: 800, fontSize: '0.98rem' }}>
                THINKB4<span style={{ color: '#356c89' }}>ACT</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="tb-navlinks">
                <a href="#features" style={navLinkStyle}>Features</a>
                <a href="#about" style={navLinkStyle}>About Us</a>
                <a href="#contact" style={navLinkStyle}>Contact Us</a>
              </div>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 22px', borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #196478 0%, #0d3741 100%)',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.85rem',
                  textDecoration: 'none', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 12px rgba(13,55,65,0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(13,55,65,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,55,65,0.3)'; }}
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>

        {/* Hero content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: '40px 24px'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.03em', maxWidth: '820px', lineHeight: 1.15, marginBottom: '20px'
          }}>
            Security Awareness Training,<br />Built for the Whole Organization
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', maxWidth: '620px',
            lineHeight: 1.6, marginBottom: '36px'
          }}>
            ThinkB4Act helps organizations onboard employees, run cybersecurity training campaigns,
            and issue verifiable certificates — all from a single, secure, multi-tenant platform.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/login"
              style={btnPrimaryStyle}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 26px rgba(13,55,65,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(13,55,65,0.35)'; }}
            >
              Sign In to Portal <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              style={btnOutlineStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = '#5EEAD4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
            >
              Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        background: '#0d3741', padding: '28px 24px',
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '48px'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#5EEAD4', fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features + About: soft brand-tinted band */}
      <div style={{ background: 'linear-gradient(180deg, #e6f1f5 0%, #f3f9fa 100%)' }}>
      {/* Features */}
      <div id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
            Everything Your Team Needs to Stay Secure
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.95rem', marginTop: '8px' }}>
            One platform for onboarding, training, tracking, and certifying every employee.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  background: '#ffffff', border: '1px solid #d3e3ea', borderRadius: '14px',
                  padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden', cursor: 'default',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={cardHoverOn}
                onMouseLeave={cardHoverOff}
              >
                <div
                  className="feature-accent-bar"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, #356c89, #4e86a0)',
                    transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                  }}
                />
                <div
                  className="feature-icon"
                  style={{
                    width: '46px', height: '46px', borderRadius: '12px', background: '#356c89',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    transition: 'transform 0.25s ease'
                  }}
                >
                  <Icon size={22} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#18181b', marginBottom: '8px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#52525b', lineHeight: 1.6 }}>
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Us */}
      <div id="about" style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#356c89', letterSpacing: '0.1em', marginBottom: '8px' }}>
            ABOUT US
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
            {ABOUT.heading}
          </h2>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto 40px', textAlign: 'center' }}>
          {ABOUT.paragraphs.map((p, i) => (
            <p key={i} style={{ color: '#52525b', fontSize: '0.98rem', lineHeight: 1.75, marginBottom: '14px' }}>{p}</p>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {ABOUT.cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                style={{
                  background: '#ffffff', border: '1px solid #d3e3ea', borderRadius: '14px',
                  padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden', cursor: 'default',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={cardHoverOn}
                onMouseLeave={cardHoverOff}
              >
                <div
                  className="feature-accent-bar"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, #356c89, #4e86a0)',
                    transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                  }}
                />
                <div
                  className="feature-icon"
                  style={{
                    width: '46px', height: '46px', borderRadius: '12px', background: '#356c89',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    transition: 'transform 0.25s ease'
                  }}
                >
                  <Icon size={22} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#18181b', marginBottom: '8px' }}>{c.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#52525b', lineHeight: 1.65 }}>{c.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      </div>

      {/* How it works */}
      <div style={{ background: '#ffffff', borderTop: '1px solid #d3e3ea', borderBottom: '1px solid #d3e3ea', padding: '72px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181b', textAlign: 'center', marginBottom: '40px' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
            {[
              { icon: Building2, step: '01', title: 'Onboard Your Organization', text: 'Set up departments and invite employees in minutes.' },
              { icon: GraduationCap, step: '02', title: 'Assign Training Campaigns', text: 'Roll out courses with due dates and track engagement.' },
              { icon: CheckCircle2, step: '03', title: 'Verify & Report', text: 'Certificates are issued automatically and reports export instantly.' }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdfa',
                      border: '2px solid #356c89', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px', transition: 'all 0.25s ease', cursor: 'default'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#356c89'; e.currentTarget.style.transform = 'scale(1.1)'; const ic = e.currentTarget.querySelector('svg'); if (ic) ic.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.transform = 'scale(1)'; const ic = e.currentTarget.querySelector('svg'); if (ic) ic.style.color = '#356c89'; }}
                  >
                    <Icon size={24} color="#356c89" style={{ transition: 'color 0.25s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#356c89', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    STEP {s.step}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#52525b' }}>{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Powered By / Built By */}
      <div style={{ padding: '56px 24px', background: '#eaf3f7' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '30px', fontWeight: 600, letterSpacing: '0.02em' }}>
            THINKB4ACT IS PROUDLY SUPPORTED BY
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0' }}>
            {/* S Zone */}
            <div style={{
              width: '150px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 24px'
            }}>
              <img
                src={szoneLogo}
                alt="S Zone — Cyber Security Zone"
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  filter: 'grayscale(1) opacity(0.6)',
                  transition: 'filter 0.3s ease, transform 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0) opacity(1)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1) opacity(0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
              />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '54px', background: '#d4d4d8' }} />

            {/* Byte Buggers */}
            <div style={{
              width: '150px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 24px'
            }}>
              <img
                src={byteBuggersLogo}
                alt="Byte Buggers"
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  filter: 'grayscale(1) opacity(0.6)',
                  transition: 'filter 0.3s ease, transform 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0) opacity(1)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1) opacity(0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us */}
      <div id="contact" style={{ background: 'linear-gradient(180deg, #f3f9fa 0%, #e6f1f5 100%)', borderTop: '1px solid #d3e3ea', borderBottom: '1px solid #d3e3ea', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#356c89', letterSpacing: '0.1em', marginBottom: '8px' }}>
              CONTACT US
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
              {CONTACT.heading}
            </h2>
            <p style={{ color: '#71717a', fontSize: '0.95rem', maxWidth: '560px', margin: '10px auto 0', lineHeight: 1.6 }}>
              {CONTACT.intro}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', alignItems: 'start' }}>
            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
                { icon: Phone, label: 'Phone', value: CONTACT.phone },
                { icon: MapPin, label: 'Address', value: CONTACT.address },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: '#ffffff', border: '1px solid #d3e3ea', borderRadius: '14px', padding: '18px 20px'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', background: '#356c89', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={20} color="#ffffff" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a', letterSpacing: '0.06em' }}>{c.label.toUpperCase()}</div>
                      {c.href ? (
                        <a href={c.href} style={{ color: '#18181b', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', wordBreak: 'break-word' }}>{c.value}</a>
                      ) : (
                        <div style={{ color: '#18181b', fontWeight: 600, fontSize: '0.92rem' }}>{c.value}</div>
                      )}
                    </div>
                  </div>
                );
              })}
              <p style={{ fontSize: '0.82rem', color: '#71717a', margin: '4px 4px 0' }}>
                Office hours: {CONTACT.hours}
              </p>
            </div>

            {/* Contact form */}
            <form
              onSubmit={onSubmit}
              noValidate
              style={{
                background: '#ffffff', border: '1px solid #d3e3ea', borderRadius: '14px',
                padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: '14px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                  Full name
                  <input className="tb-input" value={form.name} onChange={onField('name')} placeholder="Your name" autoComplete="name" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                  Email
                  <input className="tb-input" type="email" value={form.email} onChange={onField('email')} placeholder="you@company.com" autoComplete="email" />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Subject (optional)
                <input className="tb-input" value={form.subject} onChange={onField('subject')} placeholder="How can we help?" />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#3f3f46' }}>
                Message
                <textarea className="tb-input" rows={5} value={form.message} onChange={onField('message')} placeholder="Tell us about your organization and what you need." style={{ resize: 'vertical' }} />
              </label>

              {formError && <div style={{ color: '#b91c1c', fontSize: '0.84rem', fontWeight: 600 }}>{formError}</div>}
              {formSent && !formError && (
                <div style={{ color: '#047857', fontSize: '0.84rem', fontWeight: 600 }}>
                  Your email app should now open with the message ready to send.
                </div>
              )}

              <button
                type="submit"
                style={{ ...btnPrimaryStyle, border: 'none', cursor: 'pointer', justifyContent: 'center', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 26px rgba(13,55,65,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(13,55,65,0.35)'; }}
              >
                Send Message <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #196478 0%, #0d3741 100%)',
        padding: '64px 24px', textAlign: 'center'
      }}>
        <img src={logoImg} alt="ThinkB4Act" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '14px', marginBottom: '10px' }}>
          Ready to strengthen your team's security posture?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '28px' }}>
          Sign in to your organization's portal to get started.
        </p>
        <Link
          to="/login"
          style={btnPrimaryStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 26px rgba(13,55,65,0.45)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(13,55,65,0.35)'; }}
        >
          Sign In to Portal <ArrowRight size={16} />
        </Link>
      </div>

      {/* Footer */}
      <div style={{ padding: '28px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#71717a', background: '#e6f1f5' }}>
        <p>ThinkB4Act &mdash; Multi-Tenant Security Awareness &amp; Training Platform</p>
        <p style={{ marginTop: '4px' }}>
          <a href="#about" style={{ color: '#356c89', textDecoration: 'none' }}>About Us</a>
          {' · '}
          <a href="#contact" style={{ color: '#356c89', textDecoration: 'none' }}>Contact Us</a>
          {' · '}
          <Link to="/verify/CA-2026-000001" style={{ color: '#356c89', textDecoration: 'none' }}>Verify a Certificate</Link>
        </p>
      </div>
    </div>
  );
}