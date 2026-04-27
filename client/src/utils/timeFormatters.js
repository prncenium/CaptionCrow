import React from 'react';
import { useEditorStore } from './store/useEditorStore';
import VideoDropzone from './components/Upload/VideoDropzone';
import VideoPlayer from './components/Editor/VideoPlayer';
import TimelineSlider from './components/Editor/TimelineSlider';

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
          <button className="px-5 py-2 text-sm font-semibold text-black transition-colors bg-white rounded-md hover:bg-neutral-200">
            Export Video
          </button>
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {!videoFile ? (
          /* State 1: Upload View */
          <VideoDropzone />
        ) : (
          /* State 2: Full Editor View */
          <div className="flex w-full h-full p-4 gap-4">
            
            {/* Left Sidebar: Controls (We will build these actual tools next) */}
            <aside className="flex flex-col w-80 gap-6 flex-shrink-0 p-5 overflow-y-auto border rounded-xl border-neutral-800 bg-[#121212]">
              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-400 uppercase">Typography Controls</h3>
                <div className="h-32 border border-dashed rounded-lg border-neutral-700 bg-neutral-800/50 flex flex-col items-center justify-center text-sm text-neutral-500">
                  <p>Font Selector coming soon</p>
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-400 uppercase">Color Styles</h3>
                <div className="h-32 border border-dashed rounded-lg border-neutral-700 bg-neutral-800/50 flex items-center justify-center text-sm text-neutral-500">
                   <p>Color Picker coming soon</p>
                </div>
              </div>
            </aside>

            {/* Center Area: Video & Timeline */}
            <section className="flex flex-col flex-1 min-w-0 h-full gap-4">
              
              {/* Video Player & Canvas Container */}
              <div className="flex-1 relative border rounded-xl border-neutral-800 bg-black flex items-center justify-center overflow-hidden shadow-2xl">
                <VideoPlayer />
              </div>

              {/* Playback Controls */}
              <TimelineSlider />

            </section>
          </div>
        )}
      </main>
    </div>
  );
}