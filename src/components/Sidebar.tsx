import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, MessageSquareCode, FileText, CheckSquare, 
  GitMerge, Users, Network, Settings, Slack, LogOut,
  ChevronDown, Check, Plus, Sparkles, FolderOpen, AlertCircle
} from 'lucide-react';
import { Workspace } from '../types';

export type ActiveView = 
  | 'dashboard' 
  | 'chat' 
  | 'documents' 
  | 'tasks' 
  | 'timeline' 
  | 'team' 
  | 'graph' 
  | 'settings' 
  | 'slack';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onWorkspaceSelect: (ws: Workspace) => void;
  onCreateWorkspace: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  activeWorkspace, 
  workspaces, 
  onWorkspaceSelect, 
  onCreateWorkspace, 
  onLogout,
  isCollapsed,
  onToggleSidebar
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as const, label: 'AI Chat Memory', icon: MessageSquareCode },
    { id: 'documents' as const, label: 'Documents AI', icon: FileText },
    { id: 'tasks' as const, label: 'Tasks Board', icon: CheckSquare },
    { id: 'slack' as const, label: 'Slack Sync', icon: Slack },
    { id: 'graph' as const, label: 'Memory Graph', icon: Network },
    { id: 'team' as const, label: 'Team Setup', icon: Users },
  ];

  // Helper to resolve workspace avatars
  const getWorkspaceDetails = (name: string) => {
    if (name.includes('ISRO')) {
      return { bg: 'bg-amber-500', text: 'text-white', letter: 'I', emoji: '🚀' };
    }
    if (name.includes('Slack')) {
      return { bg: 'bg-purple-500', text: 'text-white', letter: 'S', emoji: '💬' };
    }
    if (name.includes('Design')) {
      return { bg: 'bg-emerald-500', text: 'text-white', letter: 'D', emoji: '🎨' };
    }
    return { bg: 'bg-blue-600', text: 'text-white', letter: name.charAt(0).toUpperCase(), emoji: '🧠' };
  };

  const currentWorkspaceName = activeWorkspace ? activeWorkspace.name : 'HackMate AI Devs';
  const currentDetails = getWorkspaceDetails(currentWorkspaceName);

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-30 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.015)] overflow-hidden"
    >
      {/* Brand Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between gap-3'} pb-4 border-b border-gray-50/80`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-blue-50 text-[#0066FF] rounded-xl border border-blue-100/50 shadow-sm shrink-0">
            <svg viewBox="0 0 100 100" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="20" y="35" width="60" height="48" rx="12" />
              <circle cx="50" cy="15" r="7" className="fill-blue-500 stroke-none" />
              <line x1="50" y1="22" x2="50" y2="35" strokeWidth="5" />
            </svg>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold text-gray-900 tracking-tight text-xs block leading-tight">HackMate AI</span>
              <span className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block leading-none">Cognee Engine</span>
            </motion.div>
          )}
        </div>

        {/* Toggle Menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-[#0066FF] rounded-xl border border-gray-100/60 shadow-xs transition-all duration-300 active:scale-95 cursor-pointer shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4 flex items-center justify-center text-sm font-bold"
          >
            ☰
          </motion.div>
        </button>
      </div>

      {/* Premium Interactive Workspace Selector Toggle */}
      <div className={`px-4 py-4 border-b border-gray-50/80 relative flex justify-center`}>
        <button
          id="sidebar-workspace-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between transition-all duration-300 text-left cursor-pointer border shadow-sm group ${
            isCollapsed 
              ? 'p-2 rounded-xl justify-center bg-gray-50 hover:bg-gray-100 border-gray-100' 
              : 'w-full p-3 rounded-2xl ' + (isOpen ? 'bg-blue-50/40 border-blue-100/60 ring-2 ring-blue-500/5' : 'bg-gray-50/40 hover:bg-gray-50 border-gray-100/70 hover:border-gray-200/60')
          }`}
          title={isCollapsed ? currentWorkspaceName : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Custom Workspace Avatar Icon */}
            <div className={`w-7 h-7 rounded-xl ${currentDetails.bg} ${currentDetails.text} flex items-center justify-center text-xs font-bold shrink-0 shadow-md shadow-blue-500/10 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs leading-none z-10">{currentDetails.letter}</span>
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="min-w-0"
              >
                <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase block leading-none font-mono">Active Hub</span>
                <span className="text-xs font-bold text-gray-800 truncate block mt-1 leading-tight group-hover:text-[#0066FF] transition-colors duration-200">
                  {currentWorkspaceName}
                </span>
              </motion.div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className={`w-4.5 h-4.5 text-gray-400 transition-all duration-300 shrink-0 ${isOpen ? 'rotate-180 text-[#0066FF]' : 'group-hover:text-gray-600'}`} />}
        </button>

        {/* Floating Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backscreen click blocker to dismiss dropdown */}
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                onClick={() => setIsOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${isCollapsed ? 'left-2 w-64' : 'left-4 right-4'} mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[20px] shadow-2xl z-50 py-3 font-sans overflow-hidden`}
                style={{ transformOrigin: 'top center' }}
              >
                {/* 🧠 Current Workspace Section */}
                <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">
                  <span>🧠 Current Workspace</span>
                </div>
                
                <div className="px-2.5 pb-2">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-blue-50/40 border border-blue-100/20 text-[#0066FF] font-medium text-xs shadow-inner">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg ${currentDetails.bg} ${currentDetails.text} flex items-center justify-center text-[10px] font-extrabold shadow-sm shrink-0`}>
                        {currentDetails.letter}
                      </div>
                      <span className="font-bold truncate">{currentWorkspaceName}</span>
                    </div>
                    <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                  </div>
                </div>

                <div className="border-t border-gray-100/80 my-1.5" />

                {/* Recent Workspaces Section */}
                <div className="px-4 py-1 flex items-center justify-between text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">
                  <span>Recent Workspaces</span>
                </div>

                <div className="px-2 space-y-0.5 max-h-[160px] overflow-y-auto">
                  {workspaces
                    .filter(w => !activeWorkspace || w.id !== activeWorkspace.id)
                    .map(ws => {
                      const details = getWorkspaceDetails(ws.name);
                      return (
                        <button
                          key={ws.id}
                          onClick={() => {
                            onWorkspaceSelect(ws);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-50/80 rounded-xl text-left text-xs text-gray-600 hover:text-gray-900 group transition-all duration-250 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-lg ${details.bg} ${details.text} flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm opacity-90 group-hover:opacity-100 transition-all duration-200 group-hover:scale-105`}>
                              {details.letter}
                            </div>
                            <span className="font-semibold truncate">{ws.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#0066FF] opacity-0 group-hover:opacity-100 transition-all duration-200 pr-1">Switch</span>
                        </button>
                      );
                    })}
                  
                  {workspaces.filter(w => !activeWorkspace || w.id !== activeWorkspace.id).length === 0 && (
                    <div className="text-center py-4 text-[10px] text-gray-400 italic">No recent hubs active.</div>
                  )}
                </div>

                <div className="border-t border-gray-100/80 my-1.5" />

                {/* Core Actions */}
                <div className="px-2 space-y-0.5">
                  <button
                    onClick={() => {
                      onCreateWorkspace();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#0066FF] hover:bg-blue-50/30 text-left group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-100/50 group-hover:text-[#0066FF] transition-all duration-200">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Create New Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      onViewChange('team');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#0066FF] hover:bg-blue-50/30 text-left group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-100/50 group-hover:text-[#0066FF] transition-all duration-200">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>Manage Members</span>
                  </button>

                  <button
                    onClick={() => {
                      onViewChange('team'); // Redirect to Team/Settings View 
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#0066FF] hover:bg-blue-50/30 text-left group transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-100/50 group-hover:text-[#0066FF] transition-all duration-200">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <span>Workspace Settings</span>
                  </button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Options */}
      <div className={`flex-1 px-4 py-6 space-y-1.5 overflow-y-auto ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center transition-all duration-300 cursor-pointer group relative ${
                isCollapsed 
                  ? 'p-3 rounded-xl justify-center w-12 h-12' 
                  : 'w-full gap-3 px-4 py-3 rounded-2xl text-xs font-medium'
              } ${
                isActive 
                  ? 'bg-blue-50/60 text-[#0066FF] border border-blue-100/20 shadow-sm font-semibold' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 border border-transparent'
              }`}
            >
              {/* Animated Icon */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="shrink-0"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0066FF]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </motion.div>
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {item.id === 'slack' && (
                <span className={`absolute ${isCollapsed ? 'top-2 right-2' : 'right-4'} w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
              )}

              {/* Tooltip on hover when collapsed */}
              {isCollapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Log out footer */}
      <div className={`p-4 border-t border-gray-100 mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onLogout}
          className={`flex items-center transition-all duration-300 cursor-pointer group relative ${
            isCollapsed 
              ? 'p-3 rounded-xl justify-center w-12 h-12 text-gray-400 hover:text-red-500 hover:bg-red-50/40' 
              : 'w-full gap-3 px-4 py-3 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50/40 rounded-2xl'
          }`}
        >
          <motion.div whileHover={{ scale: 1.15 }}>
            <LogOut className="w-4 h-4" />
          </motion.div>
          {!isCollapsed && <span>Log Out Session</span>}
          
          {isCollapsed && (
            <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md z-50 pointer-events-none">
              Log Out Session
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
