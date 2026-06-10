import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import Footer from '../components/common/Footer';

const CAT_IMAGE = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1779236270/sad-cat-sad-cat-meme_x1dvkh.gif';
const QR_IMAGE  = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1780993919/Screenshot_2026-06-09_135847_aqdthn.png';

export default function BillingPage() {
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      <style>{`
        .flip-container {
          perspective: 1200px;
        }
        .flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.72s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .flip-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .flip-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          overflow: hidden;
        }
        .flip-face-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="flex flex-col w-full min-h-screen px-7 pt-24 pb-10 overflow-y-auto fade-in font-sans antialiased relative">

        {/* Ambient Background Orbs */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-400/20 blur-[120px] pointer-events-none z-0" />

        <div className="max-w-[1040px] w-full mx-auto space-y-12 z-10 flex-1">

          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm">
              <CreditCard size={14} /> Usage &amp; Billing
            </div>
            <h1 className="text-[44px] md:text-[56px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
              Scale your editing.<br />Simple, transparent pricing.
            </h1>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">

            {/* Free Tier */}
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 flex flex-col hover:bg-white/40 transition-colors shadow-sm">
              <h3 className="text-[20px] font-bold text-slate-900 mb-2">Creator Basic</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[48px] font-black tracking-tighter text-slate-800">₹0</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-[14px] text-slate-600 font-medium mb-8">
                Perfect for testing the waters and occasional short-form edits.
              </p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[14px] font-bold text-slate-700">
                  <CheckCircle2 size={18} className="text-slate-400" />
                  <b>Unlimited</b> AI Credits monthly
                </li>
                <li className="flex items-center gap-3 text-[14px] font-bold text-slate-700">
                  <CheckCircle2 size={18} className="text-slate-400" /> 1080p Export Quality
                </li>
                <li className="flex items-center gap-3 text-[14px] font-bold text-slate-700">
                  <CheckCircle2 size={18} className="text-slate-400" />
                  Standard <b>Unlimited</b> styles
                </li>
              </ul>
              <button className="w-full py-3.5 bg-white/60 border border-white/80 rounded-xl text-slate-800 font-bold hover:bg-white shadow-sm transition-all">
                Current Plan
              </button>
            </div>

            {/* Support / Coffee Card */}
            <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 flex flex-col hover:bg-white/40 transition-colors shadow-sm">

              {/* Card flip wrapper */}
              <div className="w-full mb-6 flip-container" style={{ height: '352px' }}>
                <div className={`flip-inner${flipped ? ' is-flipped' : ''}`}>

                  {/* Front face — cat image */}
                  <div className="flip-face">
                    <img
                      src={CAT_IMAGE}
                      alt="Support the developer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Back face — QR code */}
                  <div className="flip-face flip-face-back bg-white flex items-center justify-center">
                    <img
                      src={QR_IMAGE}
                      alt="Buy me a coffee — scan to pay"
                      className="w-full h-full object-contain p-5"
                    />
                  </div>

                </div>
              </div>

              <button
                onClick={() => setFlipped(f => !f)}
                className="w-full py-3.5 bg-white/60 border border-white/80 rounded-xl text-slate-800 font-bold hover:bg-white shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} className="text-yellow-500" fill="currentColor" />
                {flipped ? 'Scan to pay ☕' : 'Buy me a Cigarette'}
              </button>
            </div>

          </div>

          <div className="flex items-center justify-center gap-2 text-[12px] font-semibold text-slate-400 pt-8 pb-4">
            <ShieldCheck size={14} /> Payments secured by Stripe
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
}
