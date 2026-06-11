import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, ArrowRight, ImagePlus, X, Paperclip } from 'lucide-react';
import Footer from '../components/common/Footer';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    improvement: '',
    suggestion: '',
    bug: '',
    attachment: null // 🚨 NEW: Added state for the image upload
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 1. Package the data for file transfer
    const submitData = new FormData();
    submitData.append('bug', formData.bug);
    submitData.append('improvement', formData.improvement);
    submitData.append('suggestion', formData.suggestion);
    
    if (formData.attachment) {
      submitData.append('attachment', formData.attachment);
    }

    try {
      // 2. Send to your Node.js backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
        method: 'POST',
        body: submitData, // Notice: No 'Content-Type' header! Browser sets it automatically for FormData
      });

      if (!response.ok) throw new Error('Failed to send feedback');

      // 3. Success UI Reset
      alert("Feedback sent successfully! Thank you.");
      setFormData({ improvement: '', suggestion: '', bug: '', attachment: null });
      
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Something went wrong sending your feedback. Please try the WhatsApp link!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full px-7 pt-12 pb-10 overflow-y-auto fade-in font-sans antialiased relative">
      
      {/* Ambient Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-[100px] pointer-events-none z-0"></div>
      
      <div className="max-w-[1140px] w-full mx-auto space-y-12 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-start space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm">
            <MessageSquare size={14} /> Developer Direct
          </div>
          <h1 className="text-[44px] md:text-[56px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
            Tell me what's broken,<br />missing, or magical.
          </h1>
          <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-[540px]">
            I'm building this tool for creators like you. Whether you found a glitch or have a brilliant idea for a new feature, I want to hear it directly.
          </p>
        </div>

        {/* Main Grid: Form (Left) & Socials (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Simplified Feedback Form */}
          <div className="bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[32px] p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Question 1: Bugs */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  1. Did you come across any bugs or issues?
                </label>
                <textarea 
                  value={formData.bug}
                  onChange={(e) => setFormData({...formData, bug: e.target.value})}
                  placeholder="e.g., The export button froze at 10%..."
                  className="w-full h-24 bg-white/50 border border-white/80 rounded-2xl p-4 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Question 2: Improvements */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  2. Is there any room for improvement?
                </label>
                <textarea 
                  value={formData.improvement}
                  onChange={(e) => setFormData({...formData, improvement: e.target.value})}
                  placeholder="e.g., The timeline is a bit hard to read on smaller screens..."
                  className="w-full h-24 bg-white/50 border border-white/80 rounded-2xl p-4 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Question 3: Suggestions */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  3. Any feature suggestions?
                </label>
                <textarea 
                  value={formData.suggestion}
                  onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                  placeholder="e.g., It would be awesome if we could add our own custom fonts..."
                  className="w-full h-24 bg-white/50 border border-white/80 rounded-2xl p-4 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Image Upload / Dropzone Section */}
              <div className="space-y-2 pt-2">
                <label className="text-[13px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  <Paperclip size={14} className="text-[#007AFF]" /> Attach a screenshot (Optional)
                </label>
                
                {!formData.attachment ? (
                  // Upload State
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/80 bg-white/30 rounded-2xl cursor-pointer hover:bg-white/50 hover:border-[#007AFF]/50 transition-all shadow-sm group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus size={22} className="mb-2 text-slate-400 group-hover:text-[#007AFF] transition-colors" />
                      <p className="text-xs text-slate-500 font-medium"><span className="text-[#007AFF] font-bold">Click to upload</span> or drag and drop</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if(e.target.files[0]) setFormData({...formData, attachment: e.target.files[0]});
                      }}
                    />
                  </label>
                ) : (
                  // File Selected State (Preview Card)
                  <div className="flex items-center justify-between w-full p-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm fade-in">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center flex-shrink-0">
                         <ImagePlus size={18} className="text-[#007AFF]" />
                      </div>
                      <div className="truncate">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{formData.attachment.name}</p>
                        <p className="text-[11px] font-medium text-slate-500">{(formData.attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, attachment: null})}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 px-8 py-4 bg-[#007AFF] text-white rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#0066d6] shadow-[0_8px_24px_rgba(0,122,255,0.35)] transition-all active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : (
                  <>Send Feedback <Send size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Direct Connect Cards */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Connect Directly</h3>
            
            {/* Instagram Card - NOW USING AUTHENTIC SVG */}
            <a href="https://www.instagram.com/gopal.rawat0_0/" target="_blank" rel="noreferrer" className="group relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-6 hover:bg-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-orange-400/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    {/* Authentic Instagram Outline Logo */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-slate-900">Instagram</div>
                    <div className="text-[13px] font-medium text-slate-500">DM me your edits</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
              </div>
            </a>

            {/* WhatsApp Card - NOW USING AUTHENTIC SVG */}
            <a href="https://wa.me/8700341953" target="_blank" rel="noreferrer" className="group relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-6 hover:bg-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                    {/* Authentic WhatsApp Solid Logo */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-slate-900">WhatsApp</div>
                    <div className="text-[13px] font-medium text-slate-500">Fastest response time</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </a>

            <div className="mt-4 p-5 bg-[#007AFF]/5 border border-[#007AFF]/10 rounded-2xl">
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                <strong className="text-slate-800">Pro Tip:</strong> I actively read every single piece of feedback. If you suggest a great feature, there is a very high chance I will build it.
              </p>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}