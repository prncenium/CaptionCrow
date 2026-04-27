import React from 'react';
import { useEditorStore } from './store/useEditorStore';
import VideoDropzone from './components/Upload/VideoDropzone';
import VideoPlayer from './components/Editor/VideoPlayer';
import Timeline from './components/Editor/Timeline'; 
import CaptionList from './components/Editor/CaptionList'; // <-- NEW: Imported CaptionList
import StyleSelector from './components/Controls/StyleSelector';
import ColorPicker from './components/Controls/ColorPicker';
import ExportButton from './components/Controls/ExportButton';

export default function App() {
  // Read from our global brain to see if the user has uploaded a file yet
  const { videoFile } = useEditorStore();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#121212] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 font-bold text-black bg-emerald-500 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            C
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Caption-Crow</h1>
        </div>
        
        {/* Export Button (Only shows when editing) */}
        {videoFile && (
          <ExportButton />
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {!videoFile ? (
          /* State 1: Upload View */
          <VideoDropzone />
        ) : (
          /* State 2: Full Editor View */
          <div className="flex flex-col w-full h-full p-4 gap-4">
            
            {/* Top Row: 3-Column Layout */}
            <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
              
              {/* Left Column: Captions List */}
              <div className="w-80 flex-shrink-0 flex flex-col">
                 <CaptionList />
              </div>

              {/* Center Column: Video Player */}
              <div className="flex-1 relative border rounded-xl border-neutral-800 bg-black flex items-center justify-center overflow-hidden shadow-2xl">
                <VideoPlayer />
              </div>

              {/* Right Column: Styling Controls (Moved from left to right) */}
              <aside className="flex flex-col w-80 gap-6 flex-shrink-0 p-5 overflow-y-auto border rounded-xl border-neutral-800 bg-[#121212]">
                <div>
                  <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-400 uppercase">Typography Controls</h3>
                  <StyleSelector />
                </div>
                
                <hr className="border-neutral-800" />
                
                <div>
                  <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-400 uppercase">Color Styles</h3>
                  <ColorPicker />
                </div>
              </aside>

            </div>

            {/* Bottom Row: The Advanced NLE Timeline */}
            <div className="flex-shrink-0 border rounded-xl border-neutral-800 bg-[#121212] overflow-hidden shadow-lg">
               <Timeline />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}