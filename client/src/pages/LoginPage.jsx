import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import { useAuthStore } from '../store/useAuthStore';

const LOGO = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1780233993/Gemini_Generated_Image_ux5ru8ux5ru8ux5r_1_zlv7on.png';

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, rightSlot, disabled }) {
    return (
        <div className="relative flex items-center">
            <Icon size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/50 border border-white/70 text-[13px] font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {rightSlot && (
                <div className="absolute right-3 text-slate-400">{rightSlot}</div>
            )}
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuthStore();

    const [tab, setTab] = useState('signin');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // sign-in fields
    const [siEmail, setSiEmail] = useState('');
    const [siPass, setSiPass]   = useState('');

    // sign-up fields
    const [suName, setSuName]       = useState('');
    const [suEmail, setSuEmail]     = useState('');
    const [suPass, setSuPass]       = useState('');
    const [suConfirm, setSuConfirm] = useState('');

    const clearMessages = () => { setError(''); setSuccess(''); };

    const handleSignIn = async () => {
        clearMessages();
        if (!siEmail.trim()) { setError('Please enter your email address.'); return; }
        if (!siPass) { setError('Please enter your password.'); return; }

        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: siEmail.trim(), password: siPass }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Sign in failed.');
            } else {
                loginUser(data.user, data.token);
                setSuccess(`Welcome back, ${data.user.name}!`);
                setTimeout(() => navigate('/'), 800);
            }
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        clearMessages();
        if (!suName.trim()) { setError('Please enter your full name.'); return; }
        if (!suEmail.trim()) { setError('Please enter your email address.'); return; }
        if (suPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (suPass !== suConfirm) { setError('Passwords do not match.'); return; }

        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: suName.trim(), email: suEmail.trim(), password: suPass }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Registration failed.');
            } else {
                loginUser(data.user, data.token);
                setSuccess(`Account created! Welcome, ${data.user.name}!`);
                setTimeout(() => navigate('/'), 800);
            }
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (t) => { setTab(t); clearMessages(); };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 relative fade-in font-sans antialiased overflow-y-auto py-20">

            {/* Ambient orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-fuchsia-400/20 blur-[120px] pointer-events-none z-0" />

            {/* Card */}
            <div className="w-full max-w-[420px] bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] shadow-[0_8px_40px_rgba(120,80,200,0.10)] p-8 z-10 space-y-6">

                {/* Brand */}
                <div className="flex flex-col items-center gap-1.5 pb-1">
                    <img src={LOGO} alt="VartaLab AI" className="h-10 w-auto object-contain drop-shadow-sm" />
                    <span className="text-[11px] text-slate-400 tracking-[0.18em] uppercase font-semibold">VartaLab AI</span>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/40 border border-white/60 rounded-2xl p-1">
                    {['signin', 'signup'].map(t => (
                        <button
                            key={t}
                            onClick={() => handleTabChange(t)}
                            disabled={isLoading}
                            className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all duration-200 ${
                                tab === t
                                    ? 'bg-white/90 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {t === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Error / Success Banner */}
                {error && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-[12px] font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50/80 border border-green-200/60 text-green-700 text-[12px] font-medium">
                        <CheckCircle2 size={14} className="shrink-0" />
                        {success}
                    </div>
                )}

                {/* ── Sign In form ── */}
                {tab === 'signin' && (
                    <div className="space-y-3">
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={siEmail}
                            onChange={e => setSiEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <InputField
                            icon={Lock}
                            type={showPass ? 'text' : 'password'}
                            placeholder="Password"
                            value={siPass}
                            onChange={e => setSiPass(e.target.value)}
                            disabled={isLoading}
                            rightSlot={
                                <button onClick={() => setShowPass(p => !p)} className="hover:text-slate-600 transition-colors">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            }
                        />
                        <div className="flex justify-end">
                            <button className="text-[11px] font-semibold text-[#007AFF] hover:underline">
                                Forgot password?
                            </button>
                        </div>
                        <button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#007AFF] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(0,122,255,0.30)] hover:bg-[#0066DD] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <><span>Sign In</span> <ArrowRight size={15} /></>
                            )}
                        </button>
                    </div>
                )}

                {/* ── Sign Up form ── */}
                {tab === 'signup' && (
                    <div className="space-y-3">
                        <InputField
                            icon={User}
                            placeholder="Full name"
                            value={suName}
                            onChange={e => setSuName(e.target.value)}
                            disabled={isLoading}
                        />
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={suEmail}
                            onChange={e => setSuEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <InputField
                            icon={Lock}
                            type={showPass ? 'text' : 'password'}
                            placeholder="Password (min. 6 characters)"
                            value={suPass}
                            onChange={e => setSuPass(e.target.value)}
                            disabled={isLoading}
                            rightSlot={
                                <button onClick={() => setShowPass(p => !p)} className="hover:text-slate-600 transition-colors">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            }
                        />
                        <InputField
                            icon={Lock}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={suConfirm}
                            onChange={e => setSuConfirm(e.target.value)}
                            disabled={isLoading}
                            rightSlot={
                                <button onClick={() => setShowConfirm(p => !p)} className="hover:text-slate-600 transition-colors">
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            }
                        />
                        <button
                            onClick={handleSignUp}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#007AFF] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(0,122,255,0.30)] hover:bg-[#0066DD] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <><span>Create Account</span> <Sparkles size={14} /></>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                            By creating an account you agree to our{' '}
                            <span className="text-[#007AFF] cursor-pointer hover:underline">Terms</span>
                            {' '}and{' '}
                            <span className="text-[#007AFF] cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-black/8" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-black/8" />
                </div>

                {/* Google button */}
                <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/60 border border-white/80 text-[13px] font-bold text-slate-700 hover:bg-white shadow-sm transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

            </div>
            <Footer />
        </div>
    );
}
