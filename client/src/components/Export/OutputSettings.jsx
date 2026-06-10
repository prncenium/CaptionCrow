import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

export default function OutputSettings() {
    const [settings, setSettings] = useState({
        resolution: '3840x2160',
        format: 'mp4',
        audio: '320',
        captionMode: 'burn_srt',
        colorSpace: 'rec709',
        bitrate: '32'
    });

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white/55 backdrop-blur-xl border border-white/75 rounded-3xl p-5 shadow-[0_8px_32px_rgba(180,100,140,0.10)] h-fit">
            
            

            <div className="space-y-1">
                
                
                
                
                
                
            </div>

        </div>
    );
}