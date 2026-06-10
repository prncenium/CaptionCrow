import React from 'react';
import { Bug, Lightbulb, Palette, AlertCircle } from "lucide-react";

const categoryMeta = {
  "bug": { icon: Bug, accent: "#FF2D92" },
  "feature": { icon: Lightbulb, accent: "#FF9500" },
  "ui": { icon: Palette, accent: "#007AFF" },
};

export default function StatusBoard({ tickets }) {
    return (
        <div className="bg-white/55 backdrop-blur-xl border border-white/75 rounded-3xl p-5 shadow-[0_8px_32px_rgba(180,100,140,0.10)] h-fit">
            
            <div className="flex items-center justify-between mb-4">
                <div className="text-[14px] font-bold tracking-tight text-slate-900">Your recent tickets</div>
                <div className="text-[10.5px] text-[#007AFF] font-mono font-semibold bg-[#007AFF]/10 px-2 py-0.5 rounded-full border border-[#007AFF]/20">
                    {tickets.length} active
                </div>
            </div>

            {/* Render the active tickets */}
            <div className="space-y-2.5">
                {tickets.map(t => {
                    const m = categoryMeta[t.category] || categoryMeta["bug"];
                    const Icon = m.icon;
                    
                    return (
                        <div key={t.id} className="bg-white/60 border border-white/75 rounded-xl p-3 hover:bg-white/80 cursor-pointer transition-colors shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${m.accent}1F` }}>
                                    <Icon size={11} strokeWidth={2} className="text-slate-900" />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-neutral-500 tabular-nums">{t.id}</span>
                                <span className="text-[10px] text-neutral-400 font-medium ml-auto">{t.date}</span>
                            </div>
                            <div className="text-[12px] font-semibold tracking-tight leading-snug mb-2 text-slate-800">
                                {t.title}
                            </div>
                            <div className="text-[10.5px] text-[#007AFF] font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" /> {t.status}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Known Issue Notice */}
            <div className="mt-5 bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-xl p-3 flex gap-2.5 shadow-inner">
                <AlertCircle size={15} strokeWidth={2} className="text-[#FF9500] flex-shrink-0 mt-0.5" />
                <div>
                    <div className="text-[11.5px] font-bold tracking-tight text-slate-900">Known issue</div>
                    <div className="text-[10.5px] text-neutral-600 mt-0.5 leading-snug font-medium">
                        Cloud render queue may stall on uploads &gt; 4 GB. Workaround: split into 2 passes.
                    </div>
                </div>
            </div>
            
        </div>
    );
}