import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import { UploadCloud } from 'lucide-react';

// Import our modular panel components
import CaptionList from '../components/Editor/LeftPanel/CaptionList';
import VideoPlayer from '../components/Editor/CenterCanvas/VideoPlayer';
import TextStyles from '../components/Editor/RightPanel/TextStyles';
import TimelineManager from '../components/Editor/Timeline/TimelineManger';

export default function EditorPage() {
  const { videoFile } = useEditorStore();
  const navigate = useNavigate();

  // 1. Guard Rail: Handle the "No Video" state with Liquid Glass styling
  if (!videoFile) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-80px)] p-6 bg-transparent fade-in">
        <div className="flex flex-col items-center justify-center max-w-md p-10 bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.10)] rounded-3xl text-center">
            <div className="p-4 mb-6 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] shadow-inner">
                <UploadCloud className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No active project found</h2>
            <p className="text-neutral-600 mb-8 font-medium">
                Upload a video in the Dashboard to start your AI captioning workflow.
            </p>
            <button 
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-[#007AFF] text-white font-semibold rounded-xl hover:bg-[#0066d6] shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-all"
            >
                Go to Upload Hub
            </button>
        </div>
      </div>
    );
  }

  return (
    /* 🚨 THE MASTER TRANSPARENT SKELETON 🚨 
       This spaces out the panels perfectly while letting the mesh background shine through. */
    <div className="px-5 pt-3 pb-3 flex flex-col gap-3 w-full h-[calc(100vh-76px)] bg-transparent overflow-hidden fade-in">
      
      {/* Top Workspace: 3-Column Layout */}
      <div className="flex gap-3 flex-1 min-h-0">
        
        {/* Left Panel: Caption Management (Width matches Figure AI ref) */}
        <aside className="w-[320px] flex-shrink-0 flex flex-col min-h-0">
          <CaptionList />
        </aside>

        {/* Center Panel: The Canvas / Monitor */}
        <main className="flex-1 flex flex-col min-w-0 relative">
           <VideoPlayer />
           
           
        </main>

        {/* Right Panel: Properties & Styles */}
        <aside className="w-[290px] flex-shrink-0 flex flex-col min-h-0">
          <TextStyles />
        </aside>

      </div>

      {/* Bottom Workspace: Professional NLE Timeline */}
      <footer className="h-[180px] flex-shrink-0 flex flex-col">
          <TimelineManager />
      </footer>

    </div>
  );
}