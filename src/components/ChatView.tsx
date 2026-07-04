import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Network, Terminal, Trash2, ArrowRight, 
  RefreshCw, Copy, Check, RotateCcw, AlertCircle, Info, ChevronRight 
} from 'lucide-react';
import { Workspace, ChatMessage } from '../types';

interface ChatViewProps {
  workspace: Workspace;
}

// Custom animated robot head SVG component for Feature 5 empty state
const RobotRobot = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-tr from-blue-500 to-violet-500 rounded-full p-0.5 shadow-lg shadow-blue-500/20">
      <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
        {/* Grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:10px_10px] opacity-40" />
        <svg className="w-16 h-16 relative z-10 animate-bounce" style={{ animationDuration: '5s' }} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Antenna */}
          <motion.path 
            d="M32 16V8" 
            stroke="#3B82F6" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ stroke: ["#3B82F6", "#8B5CF6", "#3B82F6"] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle 
            cx="32" 
            cy="6" 
            r="4" 
            fill="#3B82F6"
            animate={{ scale: [1, 1.2, 1], fill: ["#3B82F6", "#A78BFA", "#3B82F6"] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          
          {/* Head */}
          <motion.rect 
            x="14" 
            y="16" 
            width="36" 
            height="28" 
            rx="10" 
            fill="url(#robot-gradient)" 
            stroke="#3B82F6" 
            strokeWidth="3"
            animate={{ y: [16, 15, 16] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          
          {/* Ears */}
          <rect x="8" y="24" width="6" height="12" rx="3" fill="#E2E8F0" stroke="#3B82F6" strokeWidth="2" />
          <rect x="50" y="24" width="6" height="12" rx="3" fill="#E2E8F0" stroke="#3B82F6" strokeWidth="2" />
          
          {/* Eyes Panel */}
          <rect x="20" y="22" width="24" height="10" rx="5" fill="#1E293B" />
          
          {/* Glowing Eyes */}
          <motion.circle 
            cx="26" 
            cy="27" 
            r="3" 
            fill="#60A5FA"
            animate={{ scale: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
          />
          <motion.circle 
            cx="38" 
            cy="27" 
            r="3" 
            fill="#60A5FA"
            animate={{ scale: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
          />

          {/* Smiling Mouth */}
          <path d="M26 36C26 36 29 39 32 39C35 39 38 36 38 36" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

          <defs>
            <linearGradient id="robot-gradient" x1="14" y1="16" x2="50" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default function ChatView({ workspace }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom sync states for Feature 7
  const [syncState, setSyncState] = useState<'connected' | 'syncing' | 'required'>('connected');
  
  // Confirmation states for Feature 1
  const [showClearModal, setShowClearModal] = useState(false);

  // Copy-to-clipboard state tracker
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Animated loader steps state for Feature 4
  const [thinkingStep, setThinkingStep] = useState("Searching project memory...");

  const scrollRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    "Describe our project",
    "Explain today's tasks",
    "Summarize Slack discussions",
    "Show project decisions",
    "What documents have been uploaded?",
    "Show pending deadlines"
  ];

  // Fetch initial chat history
  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/chat`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Error loading chat history.");
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [workspace.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Loading status text cycles for Feature 4
  useEffect(() => {
    if (!loading) return;
    const steps = [
      "Searching project memory...",
      "Analyzing project context...",
      "Generating response..."
    ];
    setThinkingStep(steps[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setThinkingStep(steps[idx]);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setInputText('');
    setLoading(true);

    // Set syncing status badge
    setSyncState('syncing');

    // Append user message immediately
    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      workspaceId: workspace.id,
      sender: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textToSend })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace temp messages with actual stored messages
        await fetchChatHistory();
        setSyncState('connected');
      } else {
        // Professional Error state - NEVER expose raw server logs
        setMessages(prev => [
          ...prev, 
          {
            id: 'err-' + Date.now(),
            workspaceId: workspace.id,
            sender: 'ai',
            content: "I couldn't retrieve that information from the project memory at the moment. Please try again in a few seconds, or upload the relevant document if it hasn't been indexed yet.",
            createdAt: new Date().toISOString()
          }
        ]);
        setSyncState('required');
      }
    } catch (e) {
      // Graceful fallback professional error
      setMessages(prev => [
        ...prev, 
        {
          id: 'err-' + Date.now(),
          workspaceId: workspace.id,
          sender: 'ai',
          content: "I couldn't retrieve that information from the project memory at the moment. Please try again in a few seconds, or upload the relevant document if it hasn't been indexed yet.",
          createdAt: new Date().toISOString()
        }
      ]);
      setSyncState('required');
    } finally {
      setLoading(false);
    }
  };

  // Perform manual re-syncing animation
  const handleManualSync = async () => {
    setSyncState('syncing');
    await new Promise(resolve => setTimeout(resolve, 1200));
    await fetchChatHistory();
    setSyncState('connected');
  };

  const handleClearHistoryClick = () => {
    setShowClearModal(true);
  };

  const confirmClearHistory = async () => {
    try {
      setShowClearModal(false);
      await fetch(`/api/workspaces/${workspace.id}/chat`, { method: 'DELETE' });
      // Clear with elegant empty array
      setMessages([]);
      setSyncState('connected');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    // Strip memory badge text when copying for clean code/response copies
    const cleanText = text.replace("🧠 Retrieved from HackMate AI Memory\n\n", "");
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRegenerate = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1];
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Simple premium syntax highlighting formatter for code blocks
  const formatCodeBlock = (code: string, lang: string) => {
    const lines = code.split("\n");
    return lines.map((line, idx) => {
      // Basic regex styling for a premium mock compiler feel
      if (line.trim().startsWith("//") || line.trim().startsWith("#") || line.trim().startsWith("/*")) {
        return (
          <div key={idx} className="text-slate-400 italic">
            {line}
          </div>
        );
      }

      return (
        <div key={idx} className="min-h-[1rem]">
          {line.split(/(\s+)/).map((word, wIdx) => {
            const trimmed = word.trim();
            if (/^(const|let|var|function|return|import|export|class|from|default|extends|interface|type|public|private|protected|async|await|try|catch|if|else|for|while|switch|case|break)$/.test(trimmed)) {
              return <span key={wIdx} className="text-pink-400 font-bold">{word}</span>;
            }
            if (/^(true|false|null|undefined)$/.test(trimmed)) {
              return <span key={wIdx} className="text-amber-400 font-semibold">{word}</span>;
            }
            if (/^(".*"|'.*'|`.*`)$/.test(trimmed)) {
              return <span key={wIdx} className="text-emerald-400">{word}</span>;
            }
            if (/^\d+$/.test(trimmed)) {
              return <span key={wIdx} className="text-blue-400">{word}</span>;
            }
            return <span key={wIdx}>{word}</span>;
          })}
        </div>
      );
    });
  };

  // Safe client-side custom markdown renderer that parses memory badge, code blocks, bold text, bullet points
  const renderFormattedContent = (content: string, messageId: string) => {
    const isMemoryRetrieved = content.includes("🧠 Retrieved from HackMate AI Memory");
    const cleanContent = content.replace("🧠 Retrieved from HackMate AI Memory\n\n", "").replace("🧠 Retrieved from HackMate AI Memory", "");

    // Split by triple backticks for code block formatting
    const parts = cleanContent.split("```");

    return (
      <div className="space-y-4">
        {/* Beautiful blue/purple memory badge for retrieved knowledge */}
        {isMemoryRetrieved && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-100/50 rounded-2xl px-4 py-2.5 w-fit">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-[10px] font-extrabold text-blue-900 tracking-wider uppercase font-mono">
              Retrieved from HackMate AI Memory
            </span>
          </div>
        )}

        {parts.map((part, index) => {
          const isCodeBlock = index % 2 === 1;

          if (isCodeBlock) {
            const lines = part.split("\n");
            let language = lines[0]?.trim() || "typescript";
            if (/^(javascript|typescript|js|ts|json|bash|html|css|yaml|md)$/i.test(language)) {
              lines.shift();
            } else {
              language = "code";
            }
            const codeText = lines.join("\n").trim();

            return (
              <div key={index} className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-md my-4 border border-slate-800 text-left">
                {/* Code block header bar */}
                <div className="flex justify-between items-center bg-slate-950 px-4 py-2 text-[10px] font-mono text-slate-400 border-b border-slate-800">
                  <span className="uppercase font-bold tracking-widest">{language}</span>
                  <button
                    onClick={() => handleCopyToClipboard(codeText, messageId + `-code-${index}`)}
                    className="flex items-center gap-1 hover:text-white transition-all active:scale-95"
                  >
                    {copiedId === messageId + `-code-${index}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Code content */}
                <pre className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed select-text">
                  <code>{formatCodeBlock(codeText, language)}</code>
                </pre>
              </div>
            );
          }

          // Render normal paragraphs and list bullets
          const lines = part.split("\n");
          return (
            <div key={index} className="space-y-2 text-xs text-gray-700 leading-relaxed text-left">
              {lines.map((line, lIdx) => {
                if (!line.trim()) return <div key={lIdx} className="h-2" />;

                // Check list bullet or item
                const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
                const isNumList = /^\d+\.\s/.test(line.trim());

                // Style bold, inline-code
                const formatInline = (text: string) => {
                  let formatted: React.ReactNode[] = [];
                  let currentText = text;
                  let key = 0;

                  // Simple tokenizer for bold **bold** and code `code`
                  const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
                  const tokens = currentText.split(tokenRegex);

                  return tokens.map((token, tIdx) => {
                    if (token.startsWith("**") && token.endsWith("**")) {
                      return <strong key={tIdx} className="font-extrabold text-gray-900">{token.slice(2, -2)}</strong>;
                    }
                    if (token.startsWith("`") && token.endsWith("`")) {
                      return <code key={tIdx} className="bg-slate-100 text-pink-600 font-mono text-[10.5px] px-1.5 py-0.5 rounded border border-gray-200/50">{token.slice(1, -1)}</code>;
                    }
                    return token;
                  });
                };

                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 pl-4 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{formatInline(line.trim().substring(2))}</span>
                    </div>
                  );
                }

                if (isNumList) {
                  const match = line.trim().match(/^(\d+\.)\s(.*)/);
                  if (match) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pl-4 py-0.5">
                        <span className="font-mono text-[10.5px] text-blue-600 font-black shrink-0">{match[1]}</span>
                        <span>{formatInline(match[2])}</span>
                      </div>
                    );
                  }
                }

                return <p key={lIdx}>{formatInline(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="ai-chat-memory-page" className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F5F5F5] font-sans overflow-hidden">
      
      {/* Main Premium Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] relative p-6 sm:p-8 overflow-hidden">
        
        {/* PREMIUM CHAT HEADER */}
        <div id="chat-workspace-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-md font-black text-gray-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              AI Chat Memory
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Interact with HackMate's persistent knowledge graph context in real-time.
            </p>
          </div>

          {/* Feature 7 - Small Interactive Status Badge */}
          <div className="flex items-center gap-2.5">
            <AnimatePresence mode="wait">
              {syncState === 'connected' && (
                <motion.div 
                  key="connected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-green-50 border border-green-200/50 rounded-full px-3.5 py-1 text-[10px] text-green-700 font-bold font-mono shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Cognee Memory Connected
                </motion.div>
              )}
              {syncState === 'syncing' && (
                <motion.div 
                  key="syncing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 rounded-full px-3.5 py-1 text-[10px] text-amber-700 font-bold font-mono animate-pulse shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Syncing Memory
                </motion.div>
              )}
              {syncState === 'required' && (
                <motion.div 
                  key="required"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-red-50 border border-red-200/50 rounded-full px-3.5 py-1 text-[10px] text-red-700 font-bold font-mono shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Memory Sync Required
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Sync Trigger */}
            <button
              onClick={handleManualSync}
              disabled={loading}
              className="p-1.5 hover:bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Re-sync memory maps"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            </button>

            {/* Trash Bin */}
            <button 
              onClick={handleClearHistoryClick}
              className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all border border-transparent hover:border-red-100/50 shadow-sm"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MESSAGES & CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6">
          <AnimatePresence mode="wait">
            {messages.length === 0 && !loading ? (
              /* FEATURE 5 - EMPTY CHAT STATE with Animated Robot */
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center min-h-[75%] max-w-2xl mx-auto text-center space-y-6"
              >
                {/* Robot Head */}
                <RobotRobot />

                {/* Welcome Message */}
                <div className="space-y-2.5 max-w-md">
                  <h3 className="text-md font-extrabold text-gray-900">
                    👋 Hello! I'm HackMate AI.
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I use Cognee's persistent memory to help your team remember discussions, summarize documents, answer questions, and retrieve project knowledge.
                  </p>
                  <p className="text-[11px] text-blue-600 font-bold font-mono">
                    Ask me anything to get started.
                  </p>
                </div>

                {/* Suggested Prompts Grid */}
                <div className="w-full space-y-2">
                  <span className="text-[9px] font-black text-gray-400 font-mono uppercase tracking-widest block mb-1">
                    SUGGESTED PROMPTS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {presetQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="p-3 bg-white hover:bg-blue-50/20 border border-gray-100 hover:border-blue-100/50 rounded-2xl text-left text-xs text-gray-600 hover:text-blue-700 font-medium transition-all shadow-xs hover:shadow-sm flex items-center justify-between group active:scale-[0.99]"
                      >
                        <span className="truncate pr-2">{q}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* FEATURE 6 - BEAUTIFUL CHAT MESSAGES PANEL */
              <div className="space-y-6">
                {messages.map((msg) => {
                  const isAI = msg.sender === 'ai';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 max-w-3xl ${isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                    >
                      {/* Avatar Bubble */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                        isAI 
                          ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white border-blue-400/20' 
                          : 'bg-white border-gray-100 text-gray-700 font-mono font-bold text-xs'
                      }`}>
                        {isAI ? (
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        ) : (
                          <span>ME</span>
                        )}
                      </div>

                      {/* Content Card with Glassmorphism properties */}
                      <div className="space-y-1.5 max-w-[85%]">
                        <div className={`p-5 rounded-3xl border shadow-xs relative transition-all group ${
                          isAI 
                            ? 'bg-white border-gray-100/80 text-gray-800' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700 shadow-md shadow-blue-500/5'
                        }`}>
                          {/* Inner formatting */}
                          {isAI ? (
                            renderFormattedContent(msg.content, msg.id)
                          ) : (
                            <p className="text-xs leading-relaxed select-text font-medium whitespace-pre-wrap">{msg.content}</p>
                          )}

                          {/* Message Footer Actions - Exclusively for AI responses */}
                          {isAI && (
                            <div className="flex gap-2.5 items-center justify-end mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
                              {/* Copy message */}
                              <button
                                onClick={() => handleCopyToClipboard(msg.content, msg.id)}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-all active:scale-90"
                                title="Copy Response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* Regenerate Trigger */}
                              <button
                                onClick={handleRegenerate}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-all active:scale-90"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Regenerate</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp Footer */}
                        <div className={`text-[9px] text-gray-400 font-mono px-2.5 ${!isAI ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* FEATURE 4 - AI IS THINKING LOADING SCREEN */}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 max-w-3xl mr-auto text-left"
                  >
                    {/* Animated pulsing AI avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 border border-blue-400/20 shadow-sm animate-pulse">
                      <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>

                    <div className="space-y-1">
                      <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-xs text-xs text-gray-500 flex flex-col gap-2.5 min-w-[260px]">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-blue-600 font-extrabold tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                          <span>COGNEE GRAPH ENGINE</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="animate-pulse">{thinkingStep}</span>
                          
                          {/* Typing indicator dot animation */}
                          <div className="flex gap-1 shrink-0 px-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* MESSAGE INPUT CONTAINER */}
        <div className="shrink-0 pt-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-3xl p-2.5 shadow-sm focus-within:shadow-md focus-within:border-blue-200 transition-all duration-300"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask HackMate (e.g. 'Describe our project' or 'What decisions were made?')"
              className="flex-1 bg-transparent px-4 py-3 text-xs text-gray-800 focus:outline-none placeholder:text-gray-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-30 disabled:from-blue-600 disabled:to-indigo-600 text-white rounded-2xl shadow-md transition-all active:scale-[0.97]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Interactive Knowledge Graph overview panel */}
      <div className="hidden xl:flex w-80 bg-white border-l border-gray-100 p-6 flex-col shrink-0">
        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-4">
          <Network className="w-4 h-4 text-indigo-500" />
          Active Relationship Engine
        </h3>
        <p className="text-[10.5px] text-gray-500 leading-relaxed mb-6 text-left">
          Cognee extracts named entities from conversations and builds persistent graphs. High-affinity nodes are loaded automatically during user prompts.
        </p>

        <div className="flex-1 border border-dashed border-gray-100 rounded-3xl p-4 flex flex-col justify-center items-center text-center space-y-4 bg-gray-50/40">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500/10 flex items-center justify-center animate-spin" style={{ animationDuration: '12s' }}>
            <Network className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-800 block">Long-Term Memory Map Live</span>
            <span className="text-[9px] font-mono text-gray-400 block mt-1">15 nodes • 9 edges mapped</span>
          </div>
        </div>
      </div>

      {/* FEATURE 1 - CLEAR CONVERSATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl space-y-6 border border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-gray-900">Clear Conversation?</h3>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed">
                This will permanently remove the current conversation from your active chat window. This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-2xl border border-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearHistory}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-500/10 transition-all"
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
