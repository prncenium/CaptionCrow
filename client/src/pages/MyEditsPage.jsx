import React from 'react';
import { Film, Trash2, Clapperboard } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import Footer from '../components/common/Footer';

const PRESET_LABELS = {
    'slide-up':   'Viral Slide Up',
    'cinematic':  'Cinematic',
    'neon':       'Creator Neon',
    'minimalist': 'Minimalist',
};

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  === 1) return 'Yesterday';
    if (days  < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function EditCard({ edit, onDelete }) {
    return (
        <div className="group relative bg-white/30 backdrop-blur-xl border border-white/50 rounded-[24px] overflow-hidden hover:bg-white/40 hover:shadow-lg transition-all duration-200">

            {/* Thumbnail area */}
            <div className="relative h-36 bg-gradient-to-br from-slate-100/80 to-slate-200/60 flex items-center justify-center">
                <Film size={40} className="text-slate-300" strokeWidth={1.5} />

                {/* Status badge */}
                <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    edit.status === 'exported'
                        ? 'bg-green-500/15 text-green-700 border-green-500/30'
                        : 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
                }`}>
                    {edit.status === 'exported' ? 'Exported' : 'Editing'}
                </span>

                {/* Delete button — visible on hover */}
                <button
                    onClick={() => onDelete(edit.id)}
                    className="absolute top-3 left-3 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                    <Trash2 size={11} />
                </button>
            </div>

            {/* Info */}
            <div className="px-4 py-3.5 space-y-1.5">
                <p className="text-[13px] font-bold text-slate-900 truncate" title={edit.videoName}>
                    {edit.videoName}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{timeAgo(edit.startedAt)}</p>
                {edit.preset && (
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-700 border border-fuchsia-500/20">
                        {PRESET_LABELS[edit.preset] || edit.preset}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function MyEditsPage() {
    const { edits, deleteEdit } = useProjectStore();

    return (
        <>
            <div className="flex flex-col w-full min-h-screen px-7 pt-24 pb-10 overflow-y-auto fade-in font-sans antialiased relative">

                {/* Ambient orbs */}
                <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-400/20 blur-[120px] pointer-events-none z-0" />
                <div className="fixed bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0" />

                <div className="max-w-[1040px] w-full mx-auto space-y-10 z-10 flex-1">

                    {/* Header */}
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-700 text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm mb-3">
                                <Film size={13} /> My Edits
                            </div>
                            <h1 className="text-[40px] font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
                                Your editing history
                            </h1>
                            <p className="text-[14px] text-slate-500 font-medium mt-1">
                                Videos you've uploaded and captioned on this device.
                            </p>
                        </div>
                        {edits.length > 0 && (
                            <span className="text-[12px] font-bold text-slate-400 mb-1">
                                {edits.length} session{edits.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Empty state */}
                    {edits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center space-y-5">
                            <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-sm">
                                <Clapperboard size={32} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[16px] font-bold text-slate-700">No edits yet</p>
                                <p className="text-[13px] text-slate-400 font-medium mt-1">
                                    Upload a video on the home page to get started.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Edit cards grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {edits.map(edit => (
                                <EditCard key={edit.id} edit={edit} onDelete={deleteEdit} />
                            ))}
                        </div>
                    )}

                </div>

                <Footer />
            </div>
        </>
    );
}
