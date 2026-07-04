import React, { useState } from 'react';
import { Search, Bell, ExternalLink, HelpCircle, User as UserIcon } from 'lucide-react';
import { User, Workspace } from '../types';

interface HeaderProps {
  currentUser: User;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onWorkspaceSelect: (ws: Workspace) => void;
  onCreateWorkspace: () => void;
}

export default function Header({ 
  currentUser, 
  activeWorkspace, 
  workspaces, 
  onWorkspaceSelect, 
  onCreateWorkspace 
}: HeaderProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const notifications = [
    { id: '1', title: 'Cognee memory synchronized', desc: 'Knowledge graph extracted 14 new technology terms.', time: '5m ago' },
    { id: '2', title: 'Task completed by Sarah', desc: '"Design System & Glassmorphism UI" is verified.', time: '2h ago' },
    { id: '3', title: 'Slack Sync alert', desc: 'Decision proposal detected in Slack thread #tech-stack.', time: '1d ago' },
  ];

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20 font-sans">
      {/* Left: Workspace Selector */}
      <div className="relative">
        <button 
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="flex items-center gap-2 px-3.5 py-1.5 hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm text-xs font-semibold text-gray-800 transition-all duration-300"
        >
          <span>{activeWorkspace ? activeWorkspace.name : 'Choose Workspace'}</span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showWorkspaceMenu && (
          <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
            <span className="block px-4 py-1.5 text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">Switch Workspace</span>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  onWorkspaceSelect(ws);
                  setShowWorkspaceMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 flex items-center justify-between ${activeWorkspace?.id === ws.id ? 'text-[#0066FF] bg-blue-50/20' : 'text-gray-700'}`}
              >
                <span>{ws.name}</span>
                {activeWorkspace?.id === ws.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </button>
            ))}
            <div className="border-t border-gray-50 mt-1.5 pt-1.5 px-2">
              <button
                onClick={() => {
                  onCreateWorkspace();
                  setShowWorkspaceMenu(false);
                }}
                className="w-full text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-all"
              >
                + Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Help docs linking */}
        <a 
          id="header-cognee-docs-link"
          href="https://github.com/topoteretes/cognee" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-mono"
        >
          <HelpCircle id="header-cognee-help-icon" className="w-3.5 h-3.5" />
          <span id="header-cognee-docs-label">Cognee Docs</span>
          <ExternalLink id="header-cognee-external-icon" className="w-2.5 h-2.5" />
        </a>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/60 rounded-full font-mono text-[10px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Slack Active</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm relative transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-3 z-50">
              <div className="flex justify-between items-center px-4 pb-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-900">Notifications</span>
                <button className="text-[10px] text-blue-500 font-mono hover:underline">Clear all</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-semibold text-gray-800">{notif.title}</h4>
                      <span className="text-[9px] text-gray-400 font-mono shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
          />
          <div className="hidden md:block">
            <span className="text-xs font-semibold text-gray-800 block leading-tight">{currentUser.name}</span>
            <span className="text-[9px] font-mono text-gray-400 block tracking-wider uppercase">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
