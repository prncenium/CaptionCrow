import React, { useState } from 'react';
import { Bug, Lightbulb, Palette, ChevronDown, ImagePlus, Send, CheckCircle2 } from "lucide-react";

const categoryMeta = {
  "bug": { label: "Bug", icon: Bug, accent: "#FF2D92", desc: "Something broken" },
  "feature": { label: "Feature Request", icon: Lightbulb, accent: "#FF9500", desc: "We should ship this" },
  "ui": { label: "UI Issue", icon: Palette, accent: "#007AFF", desc: "Visual or layout" },
};

export default function IssueForm({ onSubmitIssue }) {
    const [category, setCategory] = useState("bug");
    const [severity, setSeverity] = useState("medium");
    const [title, setTitle] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!title.trim()) return;
        
        setSubmitted(true);
        
        // Pass data up to the parent page
        onSubmitIssue({
            id: `CF-${Math.floor(Math.random() * 9000) + 1000}`,
            category: category,
            title: title,
            status: 'in review',
            date: 'just now'
        });

        setTimeout(() => {
            setSubmitted(false);
            setTitle("");
        }, 2000);
    };

    return (
        <div className="bg-white/55 backdrop-blur-xl border border-white/75 rounded-3xl p-6 shadow-[0_8px_32px_rgba(180,100,140,0.10)]">
            
            <div className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 mb-2.5 uppercase">Issue Category</div>
            
            {/* Category Selector Cards */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {Object.keys(categoryMeta).map(key => {
                    const m = categoryMeta[key];
                    const Icon = m.icon;
                    const active = category === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setCategory(key)}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-start gap-1.5 ${active ? "bg-white/80 border-2 shadow-sm" : "bg-white/40 border border-white/65 hover:bg-white/55"}`}
                            style={{ borderColor: active ? m.accent : undefined }}
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${m.accent}1F` }}>
                                <Icon size={15} strokeWidth={1.75} className="text-slate-900" />
                            </div>
                            <div className="text-[12.5px] font-semibold tracking-tight text-slate-900">{m.label}</div>
                            <div className="text-[10px] text-neutral-500">{m.desc}</div>
                        </button>
                    );
                })}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <div className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 mb-1.5 uppercase">Title</div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short summary — 8 words or fewer"
                        className="w-full bg-white/55 border border-white/70 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white/80 focus:border-[#007AFF] transition-colors"
                    />
                </div>
                <div>
                    <div className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 mb-1.5 uppercase">Severity</div>
                    <div className="flex gap-1.5">
                        {["low", "medium", "high"].map(s => (
                            <button
                                key={s}
                                onClick={() => setSeverity(s)}
                                className={`flex-1 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors ${
                                    severity === s
                                        ? s === "high" ? "bg-[#FF2D92] text-white shadow-sm"
                                        : s === "medium" ? "bg-[#FF9500] text-white shadow-sm"
                                        : "bg-[#34C759] text-white shadow-sm"
                                        : "bg-white/45 text-neutral-600 border border-white/65 hover:bg-white/65"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <div className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 mb-1.5 uppercase">Description</div>
                <textarea
                    rows={4}
                    placeholder="What did you do? What did you expect to happen? What actually happened?"
                    className="w-full bg-white/55 border border-white/70 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white/80 focus:border-[#007AFF] transition-colors resize-none"
                />
            </div>

            <div className="mb-5">
                <div className="text-[10px] tracking-[0.14em] font-bold text-neutral-500 mb-1.5 uppercase">Screenshot or Recording (optional)</div>
                <div className="bg-white/35 border border-dashed border-[#007AFF]/40 rounded-xl py-6 flex flex-col items-center justify-center hover:bg-white/45 cursor-pointer transition-colors">
                    <ImagePlus size={20} strokeWidth={1.5} className="text-[#007AFF] mb-1.5" />
                    <div className="text-[12px] font-semibold text-slate-800">Drop image, video, or paste from clipboard</div>
                    <div className="text-[10.5px] text-neutral-500 mt-0.5 font-medium">PNG, JPG, MP4, MOV · up to 50 MB</div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/55 pt-4">
                <div className="text-[11px] text-neutral-500 font-medium">
                    Submissions are private to your workspace
                </div>
                <button
                    onClick={handleSubmit}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                        submitted ? "bg-[#34C759] text-white" : "bg-[#007AFF] text-white hover:bg-[#0066d6] shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
                    }`}
                >
                    {submitted ? (<><CheckCircle2 size={14} strokeWidth={2.25} /> Submitted</>) : (<><Send size={13} strokeWidth={2.25} /> Submit Report</>)}
                </button>
            </div>
        </div>
    );
}