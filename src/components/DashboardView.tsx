import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, AlertCircle, Clock, 
  Network, Slack, HelpCircle, ArrowUpRight, TrendingUp,
  Code, Cpu, Database, RefreshCw, Layers
} from 'lucide-react';
import { Workspace, Task, Decision, ActivityLog } from '../types';
import ToggleSwitch from './ToggleSwitch';

interface DashboardViewProps {
  workspace: Workspace;
  tasks: Task[];
  decisions: Decision[];
  activities: ActivityLog[];
  onViewChange: (view: 'chat' | 'documents' | 'tasks' | 'slack' | 'graph' | 'team') => void;
}

export default function DashboardView({ 
  workspace, 
  tasks, 
  decisions, 
  activities,
  onViewChange 
}: DashboardViewProps) {
  const [aiInsight, setAiInsight] = useState<string>('Syncing Cognee knowledge graph models...');
  const [aiRec, setAiRec] = useState<string>('Loading recommendation...');
  const [loadingInsight, setLoadingInsight] = useState(true);

  // Toggle & Simulation States
  const [techMode, setTechMode] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexSuccess, setIndexSuccess] = useState(false);

  const handleTriggerIndex = () => {
    setIndexing(true);
    setIndexSuccess(false);
    setTimeout(() => {
      setIndexing(false);
      setIndexSuccess(true);
      setTimeout(() => {
        setIndexSuccess(false);
      }, 3500);
    }, 1200);
  };

  useEffect(() => {
    async function fetchInsights() {
      setLoadingInsight(true);
      try {
        const res = await fetch(`/api/workspaces/${workspace.id}/ai/insights`);
        const data = await res.json();
        setAiInsight(data.insight || 'Ready');
        setAiRec(data.recommendation || 'No recommendation.');
      } catch (e) {
        setAiInsight('Failed to fetch real-time workspace insights.');
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsights();
  }, [workspace.id, tasks.length, decisions.length]);

  // Compute stats
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').slice(0, 3);
  const approvedDecisions = decisions.filter(d => d.status === 'approved');

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-8 font-sans bg-[#F5F5F5] min-h-[calc(100vh-4rem)]">
      
      {/* Top Welcome Title & Pitch */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-gray-100/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Workspace Hub</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Your high-velocity workspace is actively indexed into <span className="font-semibold text-blue-600">Cognee persistent memory</span>.
          </p>
        </div>
        
        {/* Toggle Controls & Main actions */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Toggle Switch Button */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4.5 py-2 shadow-sm">
            <ToggleSwitch
              id="dashboard-tech-mode"
              checked={techMode}
              onChange={setTechMode}
              activeColor="bg-indigo-600"
              icon={<Code className="w-3.5 h-3.5 text-indigo-600" />}
              label="Deep Dive Mode"
            />
          </div>

          {/* Memory Index simulation push-button */}
          <button
            id="index-memory-button"
            onClick={handleTriggerIndex}
            disabled={indexing}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all duration-300 active:scale-[0.98] ${
              indexSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-100 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${indexing ? 'animate-spin text-indigo-600' : indexSuccess ? 'text-emerald-500' : 'text-gray-400'}`} />
            {indexing ? 'Indexing Memory Graph...' : indexSuccess ? 'Graph Fully Synchronized!' : 'Index Workspace Memory'}
          </button>

          <button 
            id="query-ai-button"
            onClick={() => onViewChange('chat')}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Query AI Assistant
          </button>
        </div>
      </div>

      {/* Main KPI Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Task Completion Progress */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">Milestones completed</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-gray-900">{completedTasks}</span>
              <span className="text-sm text-gray-400 font-mono">/ {totalTasks}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                <span>Task Rate</span>
                <span>{taskProgressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${taskProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cognitive Memory Nodes */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">Memory entities</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">15</span>
            <span className="text-[10px] text-gray-500 font-mono block mt-1.5">Connected in Cognee Graph</span>
            <button 
              onClick={() => onViewChange('graph')}
              className="text-[10px] text-indigo-600 font-semibold font-mono hover:underline mt-2 flex items-center gap-1"
            >
              Inspect Knowledge Graph <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Slack Connection status */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">Slack Synced</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Slack className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">
              {workspace.slackConnected ? workspace.slackChannels.filter(c => c.synced).length : '0'}
            </span>
            <span className="text-xs text-gray-400 font-mono block mt-1.5">Synced Slack Channels</span>
            <button 
              onClick={() => onViewChange('slack')}
              className="text-[10px] text-emerald-600 font-semibold font-mono hover:underline mt-2 flex items-center gap-1"
            >
              Connect channels <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Total Decisions */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">Decisions</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">{decisions.length}</span>
            <span className="text-[10px] text-gray-500 font-mono block mt-1.5">{approvedDecisions.length} Approved, {decisions.length - approvedDecisions.length} Proposed</span>
            <span className="text-[10px] text-amber-600 font-semibold font-mono mt-2 block">
              Indexed for semantic search
            </span>
          </div>
        </motion.div>

      </div>

      {/* Mid row: Cognee AI Insights (Vercel Style) */}
      <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50/70 text-[#0066FF] rounded-2xl border border-blue-100/50 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Cognee Daily AI Insight</h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-mono font-medium rounded">Gemini Powered</span>
            </div>
            
            {loadingInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600 leading-relaxed">{aiInsight}</p>
                <div className="pt-2 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#0066FF] font-mono uppercase tracking-wider">Action Recommendation:</span>
                  <span className="text-xs text-gray-700 font-medium">{aiRec}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Technical Telemetry Dashboard (Fades in when techMode is active) */}
      <AnimatePresence>
        {techMode && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-[#121214] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-6 text-gray-300 font-mono text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="font-bold text-gray-100">COGNEE NODE TOPOLOGY DETECTORS</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded font-semibold border border-indigo-500/20 uppercase tracking-wider animate-pulse">
                  SYSTEM ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1 bg-black/30 border border-gray-800/80 rounded-2xl p-4">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Vector Embeddings</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-gray-100 font-bold">1536-dim Text Embeddings</span>
                  </div>
                </div>

                <div className="space-y-1 bg-black/30 border border-gray-800/80 rounded-2xl p-4">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Relational Base</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-gray-100 font-bold">Cloud SQL (PostgreSQL)</span>
                  </div>
                </div>

                <div className="space-y-1 bg-black/30 border border-gray-800/80 rounded-2xl p-4">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Semantic Relations</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Network className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-gray-100 font-bold">24 Active Edges</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800/60 p-4 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold">
                  <span>COGNEE PIPELINE DEPLOYMENT STEPS:</span>
                  <span className="text-emerald-500">100% OPERATIONAL</span>
                </div>
                <div className="space-y-0.5 pt-1 text-[11px] text-gray-400 leading-relaxed font-mono">
                  <div>[10:32:01] Initialized semantic chunk splitter with overlapping bounds (size: 500, overlap: 50)</div>
                  <div>[10:32:02] Completed indexing for {workspace.name} ({tasks.length} tasks, {decisions.length} decisions)</div>
                  <div>[10:32:03] Graph node cluster coordinates stabilized successfully.</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Tasks & Deadlines vs Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Today's Tasks & Urgent Priorities */}
        <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Urgent Project Priorities</h3>
            <button 
              onClick={() => onViewChange('tasks')}
              className="text-[10px] text-blue-600 font-bold hover:underline font-mono"
            >
              See all board
            </button>
          </div>

          <div className="space-y-3.5">
            {urgentTasks.length > 0 ? (
              urgentTasks.map(task => (
                <div key={task.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100/60 transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800">{task.title}</h4>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                      <span>Due: {task.deadline}</span>
                      <span>•</span>
                      <span className="text-red-500 font-semibold tracking-wider uppercase">{task.priority} Priority</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 font-mono">{task.progress}%</span>
                    <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 font-mono">
                No outstanding urgent tasks! Ready for the next sprint.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Logged Decisions */}
        <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Recent Slack/Doc Decisions</h3>
            <button 
              onClick={() => onViewChange('chat')}
              className="text-[10px] text-indigo-600 font-bold hover:underline font-mono"
            >
              Query memory
            </button>
          </div>

          <div className="space-y-3.5">
            {decisions.slice(0, 3).map((dec) => (
              <div key={dec.id} className="p-4 bg-white hover:shadow-md hover:border-gray-200/50 rounded-2xl border border-gray-100 transition-all space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-gray-800 leading-snug">{dec.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono ${dec.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {dec.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">{dec.description}</p>
                <div className="text-[9px] text-gray-400 font-mono">
                  Context: <span className="font-semibold text-gray-600">{dec.sourceContext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom: Team Activity Feed */}
      <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-gray-50">Real-Time Team Activity Feed</h3>
        <div className="space-y-4">
          {activities.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs leading-relaxed">
              <img 
                src={log.userAvatar} 
                alt={log.userName} 
                className="w-7 h-7 rounded-full border border-gray-100"
              />
              <div className="flex-1">
                <p className="text-gray-600">
                  <span className="font-bold text-gray-800">{log.userName}</span>{' '}
                  <span className="text-gray-500">{log.action}:</span>{' '}
                  <span className="font-medium text-gray-900">{log.details}</span>
                </p>
                <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
