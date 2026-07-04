import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';

interface BotAssistantProps {
  onSendMessage: (msg: string) => void;
  isNewUser?: boolean;
}

export default function BotAssistant({ onSendMessage, isNewUser = false }: BotAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState<'happy' | 'thinking' | 'talking'>('happy');

  useEffect(() => {
    if (isNewUser) {
      setIsOpen(true);
      setTimeout(() => {
        triggerGreeting();
      }, 1000);
    }
  }, [isNewUser]);

  const triggerGreeting = () => {
    setIsTyping(true);
    setMood('thinking');
    setTimeout(() => {
      setIsTyping(false);
      setMood('talking');
      setSpeechBubble(
        "👋 Hello! I'm HackMate AI, your team's AI guide and task manager. I'll help you organize projects, remember every decision, manage deadlines, and answer your questions. Let's get started!"
      );
      setTimeout(() => {
        setMood('happy');
      }, 8000);
    }, 2500);
  };

  const handleBubbleClick = () => {
    setSpeechBubble(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-4 max-w-sm bg-white border border-gray-100 shadow-xl rounded-2xl p-4 pointer-events-auto relative cursor-pointer hover:shadow-2xl transition-all duration-300"
            onClick={handleBubbleClick}
          >
            <div className="absolute -bottom-2 right-10 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45" />
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{speechBubble}</p>
                <span className="text-[10px] text-gray-400 mt-2 block font-mono">Click bubble to dismiss</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 bg-white border border-gray-100 shadow-md rounded-full px-4 py-2.5 flex items-center gap-1.5 pointer-events-auto"
          >
            <span className="text-xs text-gray-500 font-medium">HackMate is thinking</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot Trigger / Floating Bot */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-auto cursor-pointer flex flex-col items-center"
        onClick={() => {
          if (!speechBubble) {
            triggerGreeting();
          } else {
            setSpeechBubble(null);
          }
        }}
      >
        <div className="relative group">
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />
          
          {/* The Robot Head SVG */}
          <div className="relative w-16 h-16 bg-white border border-gray-100 shadow-lg rounded-2xl flex items-center justify-center p-3 hover:scale-105 transition-all duration-300">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-gray-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Antenna */}
              <line x1="50" y1="20" x2="50" y2="35" strokeWidth="4" />
              <circle cx="50" cy="15" r="7" className="fill-blue-500 stroke-none" />
              
              {/* Ears */}
              <rect x="10" y="48" width="8" height="18" rx="3" className="fill-gray-100" />
              <rect x="82" y="48" width="8" height="18" rx="3" className="fill-gray-100" />

              {/* Head Base */}
              <rect x="18" y="32" width="64" height="50" rx="14" className="fill-white stroke-gray-900" strokeWidth="6" />

              {/* Glass Visor */}
              <rect x="26" y="42" width="48" height="22" rx="6" className="fill-gray-900" />

              {/* Eyes */}
              {mood === 'thinking' ? (
                <>
                  {/* Thinking eyes - curved arcs */}
                  <path d="M34,53 Q38,50 42,53" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M58,53 Q62,50 66,53" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
                </>
              ) : mood === 'talking' ? (
                <>
                  {/* Speaking eyes - high intensity glowing */}
                  <circle cx="38" cy="53" r="4.5" className="fill-blue-400 animate-pulse stroke-none" />
                  <circle cx="62" cy="53" r="4.5" className="fill-blue-400 animate-pulse stroke-none" />
                </>
              ) : (
                <>
                  {/* Regular Blinking Eyes */}
                  <circle cx="38" cy="53" r="4" className="fill-blue-400 stroke-none animate-[blink_5s_infinite]" />
                  <circle cx="62" cy="53" r="4" className="fill-blue-400 stroke-none animate-[blink_5s_infinite]" />
                </>
              )}

              {/* Mouth */}
              {mood === 'talking' ? (
                <path d="M42,70 Q50,75 58,70" strokeWidth="4" className="stroke-gray-900 fill-none" />
              ) : mood === 'thinking' ? (
                <line x1="44" y1="71" x2="56" y2="71" strokeWidth="4" className="stroke-gray-900" />
              ) : (
                <path d="M44,69 Q50,73 56,69" strokeWidth="4" className="stroke-gray-900 fill-none" />
              )}
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Tailwind inline blink animation */}
      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
}
