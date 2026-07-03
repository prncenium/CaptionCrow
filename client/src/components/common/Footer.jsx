import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Globe, Code2, Mail } from 'lucide-react';

const LOGO = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1783089346/Gemini_Generated_Image_i1uzgxi1uzgxi1uz_vwlus1.png';

const PRODUCT = [
  { label: 'Upload',   path: '/' },
  { label: 'Editor',   path: '/editor' },
  { label: 'Presets',  path: '/library' },
  { label: 'My Edits', path: '/my-edits' },
];

const SUPPORT = [
  { label: 'Feedback', path: '/feedback' },
  { label: 'Billing',  path: '/billing' },
  { label: 'Sign In',  path: '/login' },
];

const SOCIALS = [
  { icon: Globe,  href: '#',                        label: 'Website' },
  { icon: Code2,  href: '#',                        label: 'GitHub'  },
  { icon: Mail,   href: 'mailto:hello@vartalab.ai', label: 'Email'   },
];

export default function Footer() {
  return (
    <footer className="w-full mt-20 relative bg-white/25 backdrop-blur-2xl border-t border-white/60 shadow-[0_-8px_32px_rgba(0,0,0,0.04)]">
      {/* Thin gradient accent line at very top */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-accent/35 to-transparent" />

      <div className="max-w-310 w-full mx-auto px-6 pt-14 pb-8">

        {/* ── Trust badges ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          {['Free to use', 'No signup required', 'AI-powered', '4K export ready'].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-white/80 text-[11px] font-semibold text-slate-500 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {badge}
            </span>
          ))}
        </div>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-12 border-b border-white/50">

          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <img src={LOGO} alt="VartaLab AI" className="h-9 w-auto object-contain drop-shadow-sm" />
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-bold tracking-tight text-slate-900">VartaLab AI</span>
                <span className="text-[10px] text-slate-400 tracking-[0.14em] uppercase font-semibold mt-0.5">AI Captioning</span>
              </div>
            </div>

            <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-72.5">
              Professional AI-powered caption editor with cinematic styles, frame-accurate timing, and 4K export — built for creators who care about detail.
            </p>

            {/* Social icons — block body so linter sees SocialIcon as used */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-white/70 border border-white/80 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-accent hover:bg-white hover:border-accent/25 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,122,255,0.15)] transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <SocialIcon size={15} strokeWidth={2} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-slate-400 mb-5">Product</p>
            <ul className="flex flex-col gap-3.5">
              {PRODUCT.map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) =>
                      `text-[14px] font-semibold transition-colors duration-200 ${
                        isActive ? 'text-accent' : 'text-slate-600 hover:text-slate-900'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-slate-400 mb-5">Support</p>
            <ul className="flex flex-col gap-3.5">
              {SUPPORT.map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `text-[14px] font-semibold transition-colors duration-200 ${
                        isActive ? 'text-accent' : 'text-slate-600 hover:text-slate-900'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-[13px] text-slate-400 font-medium">
            © {new Date().getFullYear()} VartaLab AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-400 font-medium">
            <Sparkles size={11} className="text-[#7a4d8a]/60" />
            Crafted for creators who caption.
          </div>
        </div>

      </div>
    </footer>
  );
}
