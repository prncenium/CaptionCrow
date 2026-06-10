import React from 'react';
import { motion } from 'framer-motion';

// 🚨 FIX: Accept the 'text' prop, defaulting to 'CAPTIONS' if nothing is passed
export default function Hero3DTitle({ text = "CAPTIONS" }) {
  
  // 🚨 FIX: Separate your hand-crafted CSS styles from the hardcoded letters
  const styleSequence = [
    { tilt: '-rotate-6', y: 'translate-y-2', z: 'z-0' },
    { tilt: 'rotate-3', y: '-translate-y-1', z: 'z-0' },
    { tilt: '-rotate-12', y: 'translate-y-3', z: 'z-0' },
    { tilt: 'rotate-[24deg]', y: '-translate-y-4', z: 'z-20' },
    { tilt: '-rotate-[18deg]', y: 'translate-y-2', z: 'z-10' },
    { tilt: 'rotate-6', y: 'translate-y-3', z: 'z-0' },
    { tilt: '-rotate-2', y: '-translate-y-1', z: 'z-0' },
    { tilt: 'rotate-12', y: 'translate-y-1', z: 'z-0' },
  ];

  // Split whatever text is passed via props into an array of characters
  // e.g., "PRESETS" -> ['P', 'R', 'E', 'S', 'E', 'T', 'S']
  const characters = text.split('');

  return (
    <div className="flex justify-center items-end  w-full perspective-1000">
      <div className="flex items-baseline justify-center gap-1 md:gap-2">
        {characters.map((char, index) => {
          
          // Grab the style for this index. The modulo (%) ensures that if 
          // a word is longer than 8 characters, it safely loops back to the first style.
          const style = styleSequence[index % styleSequence.length];

          return (
            // 1. The Initial Heavy Drop Animation (Runs once on load)
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -100, rotate: style.tilt.includes('-') ? -30 : 30 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ 
                type: "spring", 
                damping: 12, 
                stiffness: 200, 
                delay: index * 0.1 
              }}
              className={`relative ${style.z}`}
            >
              {/* 2. 🚨 THE NEW SET-INTERVAL ANIMATION 🚨 */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0], // Jumps up 15px and settles back down
                }}
                transition={{
                  duration: 1.5, // Takes 1.5 seconds to do the jump
                  repeat: Infinity, // Loops forever
                  repeatDelay: 4, // ⏳ THE INTERVAL: Waits 4 seconds before jumping again
                  ease: "easeInOut",
                  delay: 2 + (index * 0.1) // Waits 2 seconds for the initial drop to finish before starting the loop
                }}
              >
                <span 
                  className={`
                    block text-[72px] md:text-[110px] lg:text-[140px] font-black tracking-tighter 
                    text-[#f4f4f5] transform transition-transform hover:scale-110 duration-300
                    ${style.tilt} ${style.y}
                  `}
                  style={{
                    textShadow: `
                      0px 1px 0px #d4d4d8,
                      0px 2px 0px #d4d4d8,
                      0px 3px 0px #a1a1aa,
                      0px 4px 0px #a1a1aa,
                      0px 5px 0px #71717a,
                      0px 6px 0px #71717a,
                      0px 12px 20px rgba(0,0,0,0.2),
                      0px 24px 40px rgba(0,0,0,0.15)
                    `,
                    WebkitTextStroke: '1px rgba(255,255,255,0.5)'
                  }}
                >
                  {char}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}