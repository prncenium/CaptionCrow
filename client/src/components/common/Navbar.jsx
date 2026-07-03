import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Scissors, Folder, CreditCard, MessageSquareWarning, Film, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logoutUser } = useAuthStore();

  const navItems = [
    { name: 'Upload',   path: '/',          icon: Home },
    { name: 'Editor',  path: '/editor',     icon: Scissors },
    { name: 'Presets', path: '/library',    icon: Folder },
    { name: 'My Edits', path: '/my-edits', icon: Film },
    { name: 'Billing', path: '/billing',    icon: CreditCard },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="px-4 pt-2 shrink-0 select-none z-50 relative">
      <header className="flex items-center justify-between h-14 bg-white/50 backdrop-blur-2xl border border-white/65 rounded-2xl px-5 py-0 shadow-[0_2px_20px_rgba(160,90,160,0.08),0_1px_0_rgba(255,255,255,0.9)_inset]">

        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 h-full">
          <img
            src="https://res.cloudinary.com/dbtfi1rbi/image/upload/v1780233993/Gemini_Generated_Image_ux5ru8ux5ru8ux5r_1_zlv7on.png"
            alt="Caption Crow logo"
            className="h-full w-auto object-contain drop-shadow-sm"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tight text-slate-900">VartaLab AI</span>
            <span className="text-[9px] text-slate-400 tracking-[0.14em] uppercase font-semibold mt-[2px]">AI Captioning</span>
          </div>
        </div>

        {/* Center: Nav links */}
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/90 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/45'
                }`
              }
            >
              <item.icon size={12} strokeWidth={2} />
              {item.name}
            </NavLink>
          ))}

          <div className="w-px h-4 mx-1.5 bg-black/10 rounded-full" />

          <NavLink
            to="/feedback"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/90 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/45'
              }`
            }
          >
            <MessageSquareWarning size={12} strokeWidth={2} />
            Feedback
          </NavLink>
        </nav>

        {/* Right: Auth */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-white/60">
              <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
                <User size={11} className="text-accent" strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 max-w-[90px] truncate">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50/60 transition-all duration-200 border border-transparent hover:border-red-200/50"
            >
              <LogOut size={12} strokeWidth={2.5} />
              Sign Out
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-white shadow-[0_2px_8px_rgba(0,122,255,0.35)]'
                  : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
              }`
            }
          >
            <LogIn size={12} strokeWidth={2.5} />
            Sign In
          </NavLink>
        )}

      </header>
    </div>
  );
}
