import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEditorStore } from './store/useEditorStore';

// UI Components
import Navbar from './components/common/Navbar'; // Double check if this is in 'common' or 'layout'

// Pages
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ExportPage from './pages/ExportPage';
import FeedbackPage from './pages/FeedbackPage';
import BillingPage from './pages/BillingPage';
import LibraryPage from './pages/LibraryPage';
import MyEditsPage from './pages/MyEditsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const { videoFile } = useEditorStore();

  return (
    <Router>
      {/* 🚨 STRIPPED THE DARK MODE CLASSES 🚨
        Removed bg-[#0a0a0a] and text-white. 
        It is now bg-transparent so the index.css gradient shines through! 
      */}
      <div className="flex flex-col h-screen bg-transparent overflow-hidden">
        
        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          <Routes>
            {/* Dashboard / Upload Hub */}
            <Route path="/" element={<DashboardPage />} />
            
            {/* 1. Guarded Editor Route: Redirect to home if no file exists */}
            <Route 
              path="/editor" 
              element={videoFile ? <EditorPage /> : <Navigate to="/" replace />} 
            />
            
            {/* 2. Guarded Export Route: Redirect to home if no file exists */}
            <Route 
              path="/export" 
              element={videoFile ? <ExportPage /> : <Navigate to="/" replace />} 
            />
            
            {/* Public Pages */}
            <Route path="/feedback" element={<FeedbackPage />} />
            
            {/* Construction Placeholders - Updated to Light Theme Slate colors */}
            <Route path="/library" element={<LibraryPage />} />

            <Route path="/history" element={
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-500">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-800">History</p>
                <p className="text-xs mt-2 italic opacity-60">Rendering database connection pending</p>
              </div>
            } />

            <Route path="/billing" element={<BillingPage />} />
            <Route path="/my-edits" element={<MyEditsPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}