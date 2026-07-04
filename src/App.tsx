import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import AuthScreen from './components/AuthScreen';
import Sidebar, { ActiveView } from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import DocumentsView from './components/DocumentsView';
import TasksView from './components/TasksView';
import MemoryGraphView from './components/MemoryGraphView';
import SlackView from './components/SlackView';
import TeamView from './components/TeamView';
import BotAssistant from './components/BotAssistant';
import { User, Workspace, Task, Document, Decision, ActivityLog } from './types';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Sidebar navigation view
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Sub-entity states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Workspace Creation Dialog
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [loadingCreateWs, setLoadingCreateWs] = useState(false);

  // Collapsible Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Initialize: Check session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user && data.user.id !== 'user-default') {
          setCurrentUser(data.user);
        }
      } catch (e) {
        console.error("Session check error. Defaulting...");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  // Fetch workspaces after auth
  useEffect(() => {
    if (currentUser) {
      fetchWorkspaces();
    }
  }, [currentUser]);

  // Fetch sub-entities when workspace updates
  useEffect(() => {
    if (activeWorkspace) {
      fetchWorkspaceDetails();
    }
  }, [activeWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspace(data.workspaces[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkspaceDetails = async () => {
    if (!activeWorkspace) return;
    try {
      // Fetch tasks
      const tasksRes = await fetch(`/api/workspaces/${activeWorkspace.id}/tasks`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData.tasks || []);

      // Fetch docs
      const docsRes = await fetch(`/api/workspaces/${activeWorkspace.id}/documents`);
      const docsData = await docsRes.json();
      setDocuments(docsData.documents || []);

      // Fetch decisions
      const decsRes = await fetch(`/api/workspaces/${activeWorkspace.id}/decisions`);
      const decsData = await decsRes.json();
      setDecisions(decsData.decisions || []);

      // Fetch activities
      const actRes = await fetch(`/api/workspaces/${activeWorkspace.id}/activities`);
      const actData = await actRes.json();
      setActivities(actData.activities || []);
    } catch (e) {
      console.error("Error updating workspace states: ", e);
    }
  };

  const handleAuthSuccess = (user: User, onboarding: boolean) => {
    setCurrentUser(user);
    setIsNewUser(onboarding);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
      setActiveView('dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setLoadingCreateWs(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName, description: newWsDesc })
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(prev => [...prev, data]);
        setActiveWorkspace(data);
        setNewWsName('');
        setNewWsDesc('');
        setShowCreateWsModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCreateWs(false);
    }
  };

  const handleSlackConnectedToggle = async () => {
    if (!activeWorkspace) return;
    const isConn = !activeWorkspace.slackConnected;
    // Simulate updating workspace connection details
    try {
      const updatedWs = { ...activeWorkspace, slackConnected: isConn };
      if (isConn) {
        // Automatically mark channel gen as synced for rich interactive testing
        updatedWs.slackChannels = updatedWs.slackChannels.map(c => c.name === 'general' ? { ...c, synced: true } : c);
      }
      setActiveWorkspace(updatedWs);
      setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updatedWs : w));
    } catch (e) {
      console.error(e);
    }
  };

  // Task actions wrappers
  const handleAddTask = async (taskData: any) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(prev => [...prev, data]);
        await fetchWorkspaceDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchWorkspaceDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchWorkspaceDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Team actions wrapper
  const handleInviteTeammate = async (email: string, name: string, role: string) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveWorkspace(data.workspace);
        setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? data.workspace : w));
        await fetchWorkspaceDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#ECECEC] flex flex-col items-center justify-center p-6 text-gray-500 font-mono text-xs gap-3.5">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Authenticating HackMate session credentials...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-800 antialiased overflow-x-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => setActiveView(view)} 
        activeWorkspace={activeWorkspace}
        workspaces={workspaces}
        onWorkspaceSelect={(ws) => setActiveWorkspace(ws)}
        onCreateWorkspace={() => setShowCreateWsModal(true)}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main viewport */}
      <motion.div 
        animate={{ marginLeft: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col min-h-screen"
      >
        <Header 
          currentUser={currentUser}
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          onWorkspaceSelect={(ws) => setActiveWorkspace(ws)}
          onCreateWorkspace={() => setShowCreateWsModal(true)}
        />

        {/* Dynamic Inner views */}
        <div className="flex-1">
          {activeWorkspace ? (
            <>
              {activeView === 'dashboard' && (
                <DashboardView 
                  workspace={activeWorkspace}
                  tasks={tasks}
                  decisions={decisions}
                  activities={activities}
                  onViewChange={(view) => setActiveView(view)}
                />
              )}
              {activeView === 'chat' && (
                <ChatView workspace={activeWorkspace} />
              )}
              {activeView === 'documents' && (
                <DocumentsView 
                  workspace={activeWorkspace} 
                  documents={documents}
                  onUploadSuccess={(newDoc) => {
                    setDocuments(prev => [...prev, newDoc]);
                    fetchWorkspaceDetails();
                  }}
                />
              )}
              {activeView === 'tasks' && (
                <TasksView 
                  workspace={activeWorkspace}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
              {activeView === 'graph' && (
                <MemoryGraphView />
              )}
              {activeView === 'slack' && (
                <SlackView 
                  workspace={activeWorkspace} 
                  onSlackConnectedToggle={handleSlackConnectedToggle}
                  onSlackSyncTriggered={fetchWorkspaceDetails}
                  onViewChange={setActiveView}
                />
              )}
              {activeView === 'team' && (
                <TeamView 
                  workspace={activeWorkspace} 
                  onInviteTeammate={handleInviteTeammate}
                  onRefreshWorkspace={async () => {
                    await fetchWorkspaces();
                    await fetchWorkspaceDetails();
                  }}
                />
              )}
            </>
          ) : (
            <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center h-[calc(100vh-8rem)] space-y-4">
              <span className="text-sm font-semibold text-gray-500">No active workspace has been chosen yet.</span>
              <button 
                onClick={() => setShowCreateWsModal(true)}
                className="px-4.5 py-2 bg-[#0066FF] text-white text-xs font-semibold rounded-xl"
              >
                + Create New Workspace
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Robot Assistant Component */}
      <BotAssistant 
        onSendMessage={(msg) => {
          setActiveView('chat');
        }} 
        isNewUser={isNewUser}
      />

      {/* Create Workspace Modal */}
      {showCreateWsModal && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Initialize Hackathon Workspace
              </h3>
              <button onClick={() => setShowCreateWsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Team Memory Leak"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Description</label>
                <textarea
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Summarize the core theme or problem space of the hack..."
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all h-20"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCreateWs || !newWsName.trim()}
                className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300"
              >
                {loadingCreateWs ? 'Spinning up models...' : 'Create Hack Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
