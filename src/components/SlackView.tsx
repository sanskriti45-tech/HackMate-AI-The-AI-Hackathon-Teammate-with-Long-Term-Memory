import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Slack, Hash, Send, Sparkles, AlertCircle, CheckCircle2, ArrowRight, 
  RefreshCw, FileCheck2, User, CheckSquare, Layers, Activity, Cpu, 
  TrendingUp, Database, Network, HelpCircle, Bot, Zap, Calendar, 
  Award, ShieldAlert, Check, X, MessageSquare, Share2, Info, Brain,
  GitFork, ArrowDown, ChevronDown, ChevronUp, CheckSquare as CheckIcon, Clock
} from 'lucide-react';
import { Workspace, SlackSyncLog, SlackDailySummary, Decision } from '../types';
import ToggleSwitch from './ToggleSwitch';

interface SlackViewProps {
  workspace: Workspace;
  onSlackConnectedToggle: () => Promise<void>;
  onSlackSyncTriggered: () => void;
  onViewChange?: (view: any) => void;
}

export default function SlackView({ workspace, onSlackConnectedToggle, onSlackSyncTriggered, onViewChange }: SlackViewProps) {
  // Sync state & summaries from backend
  const [logs, setLogs] = useState<SlackSyncLog[]>([]);
  const [summaries, setSummaries] = useState<SlackDailySummary[]>([]);
  
  // Premium AI Decision Intelligence states
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'decisions'>('sync');
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [simConversationStep, setSimConversationStep] = useState<number>(0);
  const [simMessages, setSimMessages] = useState<{ sender: string; text: string; avatar: string; time: string }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningText, setScanningText] = useState('');
  const [showDetectedCard, setShowDetectedCard] = useState(false);
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [savedAnimationStep, setSavedAnimationStep] = useState(0);
  const [saveDecisionSuccess, setSaveDecisionSuccess] = useState(false);
  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(null);
  const [whyQuery, setWhyQuery] = useState('');
  const [whyAnswer, setWhyAnswer] = useState('');
  const [whyTyping, setWhyTyping] = useState(false);
  
  const [dailyDecisions, setDailyDecisions] = useState([
    { title: 'Use Supabase for Authentication', category: 'Database', status: 'stored' },
    { title: 'Remove Firebase database triggers', category: 'Backend', status: 'stored' },
    { title: 'Finalize Authentication Deadline on Friday', category: 'Milestone', status: 'stored' },
    { title: 'UI Review Scheduled with team mentors', category: 'Review', status: 'stored' }
  ]);
  const [isCompilingDaily, setIsCompilingDaily] = useState(false);
  const [compileDailySuccess, setCompileDailySuccess] = useState(false);
  
  // Custom interactive state
  const [typedMessage, setTypedMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [selectedSender, setSelectedSender] = useState('Sarah Jenkins');
  const [syncing, setSyncing] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);

  // Connection Flow State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Interactive Live Pipeline Stages
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  
  // Entity extraction active results
  const [extractedEntities, setExtractedEntities] = useState<{
    tech?: string;
    person?: string;
    task?: string;
    deadline?: string;
    decision?: string;
    confidence?: number;
  } | null>({
    tech: "Supabase",
    person: "Sarah Jenkins",
    task: "Database migration",
    deadline: "Saturday",
    decision: "Approved",
    confidence: 98
  });

  // Automated Task Detection Popup
  const [detectedTask, setDetectedTask] = useState<{
    title: string;
    assignee: string;
    deadline: string;
  } | null>(null);

  // Smart Query Chat Simulator
  const [askedQuery, setAskedQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isTypingAnswer, setIsTypingAnswer] = useState(false);

  // Floating Robot Assistant Chat Dialog
  const [showRobotDialog, setShowRobotDialog] = useState(false);

  // Dynamic Live counters
  const [counters, setCounters] = useState({
    entities: 42,
    relationships: 128,
    documents: 12,
    decisions: 7,
    growth: 145,
    messagesSynced: 124
  });

  const channels = ['general', 'tech-stack', 'deadlines', 'design-feedback'];
  const actors = ['Sarah Jenkins', 'Alex Rivera', 'David Chen', 'Sienna Brooks'];

  // Preset quick templates for fast testing & evaluation
  const messageTemplates = [
    { channel: 'general', sender: 'Sarah Jenkins', text: "We should migrate authentication to Supabase." },
    { channel: 'deadlines', sender: 'Alex Rivera', text: "I will finish the login page by Friday." },
    { channel: 'tech-stack', sender: 'David Chen', text: "Approved the node Express backend integration today." }
  ];

  // SVG Graph node coordinates (interactive simulation)
  const [graphNodes, setGraphNodes] = useState([
    { id: 'ws', label: 'HackMate Core', type: 'workspace', x: 200, y: 150, pulse: false },
    { id: 'user-sarah', label: 'Sarah Jenkins', type: 'member', x: 100, y: 70, pulse: false },
    { id: 'user-alex', label: 'Alex Rivera', type: 'member', x: 300, y: 70, pulse: false },
    { id: 'tech-supabase', label: 'Supabase Auth', type: 'technology', x: 100, y: 230, pulse: false },
    { id: 'task-login', label: 'Login Page', type: 'task', x: 300, y: 230, pulse: false },
    { id: 'dec-migrate', label: 'Decided: Supabase', type: 'decision', x: 200, y: 280, pulse: false }
  ]);

  const loadSlackData = async () => {
    try {
      const logsRes = await fetch('/api/slack/logs');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

      const sumRes = await fetch(`/api/workspaces/${workspace.id}/slack/summaries`);
      const sumData = await sumRes.json();
      setSummaries(sumData.summaries || []);

      const decRes = await fetch(`/api/workspaces/${workspace.id}/decisions`);
      const decData = await decRes.json();
      setDecisions(decData.decisions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSlackData();
    
    // Auto-update memory growth counters subtly over time to demonstrate activity
    const interval = setInterval(() => {
      setCounters(prev => ({
        ...prev,
        growth: prev.growth + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [workspace.id]);

  // Premium AI Decision Intelligence Functions
  const handleSimulateDecisionFlow = () => {
    setSimMessages([]);
    setSimConversationStep(1);
    setShowDetectedCard(false);
    setSaveDecisionSuccess(false);
    setIsScanning(false);
    setSavedAnimationStep(0);
    
    // Step 1: Sarah Jenkins
    setTimeout(() => {
      setSimMessages(prev => [...prev, {
        sender: 'Sarah Jenkins',
        text: "I think we should use Supabase instead of Firebase.",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah",
        time: "10:14 AM"
      }]);
      setSimConversationStep(2);
    }, 800);

    // Step 2: Rahul Gupta
    setTimeout(() => {
      setSimMessages(prev => [...prev, {
        sender: 'Rahul Gupta',
        text: "I agree.",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Rahul",
        time: "10:15 AM"
      }]);
      setSimConversationStep(3);
    }, 2200);

    // Step 3: Mentor
    setTimeout(() => {
      setSimMessages(prev => [...prev, {
        sender: 'Alex (Mentor)',
        text: "Supabase will be easier for authentication.",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex",
        time: "10:15 AM"
      }]);
      setSimConversationStep(4);
    }, 3600);

    // Step 4: Scanning
    setTimeout(() => {
      setIsScanning(true);
      setScanningText("Parsing chat stream context...");
      
      setTimeout(() => {
        setScanningText("Extracting technical entities...");
      }, 1000);

      setTimeout(() => {
        setScanningText("Measuring consensus & agreement threshold...");
      }, 2000);

      setTimeout(() => {
        setScanningText("Generating Cognee memory triples...");
      }, 3000);

    }, 5000);

    // Step 5: Decision Detected Card
    setTimeout(() => {
      setIsScanning(false);
      setShowDetectedCard(true);
      setSimConversationStep(5);
    }, 9200);
  };

  const handleSaveDecision = async () => {
    setIsSavingDecision(true);
    setSavedAnimationStep(1);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Use Supabase for Authentication",
          description: "The team selected Supabase because the mentor recommended it during the backend architecture discussion. It provides PostgreSQL compatibility, built-in authentication, and better scalability for the project.",
          sourceContext: "Slack channel #tech-stack",
          status: "approved"
        })
      });

      if (res.ok) {
        // Increment decisions counter
        setCounters(prev => ({
          ...prev,
          decisions: prev.decisions + 1,
          relationships: prev.relationships + 6
        }));

        // Animate linking steps
        setTimeout(() => setSavedAnimationStep(2), 800);
        setTimeout(() => setSavedAnimationStep(3), 1600);
        setTimeout(() => setSavedAnimationStep(4), 2400);
        setTimeout(() => setSavedAnimationStep(5), 3200);

        setTimeout(() => {
          setSaveDecisionSuccess(true);
          setIsSavingDecision(false);
          setShowDetectedCard(false);
          setSimConversationStep(0);
          setSimMessages([]);
          
          // Refresh data
          loadSlackData();
          onSlackSyncTriggered();
        }, 4400);
      } else {
        setIsSavingDecision(false);
      }
    } catch (e) {
      console.error(e);
      setIsSavingDecision(false);
    }
  };

  const handleAskWhyEngine = (q: string) => {
    setWhyQuery(q);
    setWhyTyping(true);
    setWhyAnswer('');

    let fullText = "";
    const lower = q.toLowerCase();
    if (lower.includes('supabase')) {
      fullText = "🧠 Retrieved from Cognee Memory\n\nThe team selected Supabase because the mentor recommended it during the backend architecture discussion. It provides PostgreSQL compatibility, built-in authentication, and better scalability for the project.";
    } else if (lower.includes('firebase')) {
      fullText = "🧠 Retrieved from Cognee Memory\n\nFirebase was rejected because the team preferred SQL/PostgreSQL compatibility provided by Supabase. Additionally, Supabase authentication is simpler to integrate with our custom Vite middleware setup without CORS configuration issues.";
    } else if (lower.includes('react')) {
      fullText = "🧠 Retrieved from Cognee Memory\n\nReact was selected as the client-side SPA framework due to its rich ecosystem of components (like Recharts and Lucide React), great compatibility with Vite, and native fast-reload dev servers which fit perfectly in high-velocity hackathons.";
    } else if (lower.includes('auth') || lower.includes('authentication') || lower.includes('separately')) {
      fullText = "🧠 Retrieved from Cognee Memory\n\nAuthentication was handled separately to decouple user session flows from primary applet data routes. By isolating auth under Supabase and securing API credentials in .env, we prevent token leaks while supporting custom session validations.";
    } else {
      fullText = `🧠 Retrieved from Cognee Memory\n\nQuery: "${q}"\n\nHackMate AI retrieved associated nodes from Cognee. The team decided to use Supabase to persist our project schemas, which is linked to the backend architecture roadmap and team members Sarah Jenkins and Rahul.`;
    }

    let currentLength = 0;
    const interval = setInterval(() => {
      if (currentLength < fullText.length) {
        setWhyAnswer(fullText.substring(0, currentLength + 2));
        currentLength += 2;
      } else {
        clearInterval(interval);
        setWhyTyping(false);
      }
    }, 15);
  };

  const handleCompileDailySummaryPremium = () => {
    setIsCompilingDaily(true);
    setCompileDailySuccess(false);

    setTimeout(() => {
      setIsCompilingDaily(false);
      setCompileDailySuccess(true);
      
      // Update counters
      setCounters(prev => ({
        ...prev,
        relationships: prev.relationships + 4
      }));

      // Add to dailyDecisions
      setDailyDecisions(prev => prev.map(d => ({ ...d, status: 'stored' })));
    }, 2000);
  };

  // Helper keyword matcher to return simulated parsed entities & floating task cards
  const extractMessageIntel = (msg: string, sender: string) => {
    const text = msg.toLowerCase();
    
    let tech = "HackMate AI";
    let task = "Project review";
    let person = sender;
    let deadline = "TBD";
    let decision = "Awaiting feedback";
    let confidence = 92 + Math.floor(Math.random() * 8);

    if (text.includes("supabase") || text.includes("auth") || text.includes("authentication")) {
      tech = "Supabase";
      task = "Configure Database Auth";
      person = "Sarah Jenkins";
      deadline = "Saturday";
      decision = "Migrate to Supabase Auth";
      confidence = 98;
    } else if (text.includes("login") || text.includes("friday")) {
      tech = "React / Vite";
      task = "Deliver Login UI";
      person = "Alex Rivera";
      deadline = "Friday";
      decision = "Login page implementation";
      confidence = 96;
    } else if (text.includes("express") || text.includes("backend") || text.includes("node")) {
      tech = "Express.js";
      task = "Integrate API Routers";
      person = "David Chen";
      deadline = "Next Tuesday";
      decision = "Express backend architecture approved";
      confidence = 94;
    }

    return { tech, person, task, deadline, decision, confidence };
  };

  // Pipeline Animation handler
  const animatePipelineStages = async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    for (let step = 1; step <= 5; step++) {
      setActivePipelineStep(step);
      await sleep(400);
    }
    await sleep(600);
    setActivePipelineStep(null);
  };

  const handleSimulateSlackPost = async (channelName: string, senderName: string, messageText: string) => {
    if (!messageText.trim() || syncing) return;

    setSyncing(true);
    
    // 1. Process client side immediate visual flow
    const intel = extractMessageIntel(messageText, senderName);
    
    // Trigger sequential Pipeline animation
    await animatePipelineStages();

    // Set extracted card contents with fade in sequence
    setExtractedEntities(intel);

    // Increase counters
    setCounters(prev => ({
      ...prev,
      entities: prev.entities + 1,
      relationships: prev.relationships + 2,
      decisions: prev.decisions + (intel.decision !== "Awaiting feedback" ? 1 : 0),
      messagesSynced: prev.messagesSynced + 1
    }));

    // Trigger Task Detection Popup if a task is detected
    if (messageText.toLowerCase().includes("finish") || messageText.toLowerCase().includes("migrate") || messageText.toLowerCase().includes("deliver")) {
      setDetectedTask({
        title: intel.task,
        assignee: intel.person,
        deadline: intel.deadline
      });
    }

    // Pulse corresponding nodes in SVG Graph
    setGraphNodes(prev => prev.map(n => {
      if (n.type === 'technology' && intel.tech.toLowerCase().includes(n.label.toLowerCase().split(' ')[0])) {
        return { ...n, pulse: true };
      }
      if (n.type === 'member' && intel.person.toLowerCase().includes(n.label.toLowerCase().split(' ')[0])) {
        return { ...n, pulse: true };
      }
      return n;
    }));

    // Reset pulses after 3s
    setTimeout(() => {
      setGraphNodes(prev => prev.map(n => ({ ...n, pulse: false })));
    }, 3000);

    // 2. Dispatch actually to server backend
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/slack/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          senderName,
          message: messageText
        })
      });
      if (res.ok) {
        setTypedMessage('');
        await loadSlackData();
        onSlackSyncTriggered(); // updates parent states
      }
    } catch (e) {
      console.error("Slack server sync error", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateDetectedTask = async () => {
    if (!detectedTask) return;
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: detectedTask.title,
          description: `Automatically created task detected from Slack conversation with ${detectedTask.assignee}.`,
          priority: 'high',
          startDate: new Date().toISOString().split('T')[0],
          deadline: detectedTask.deadline === 'Friday' ? '2026-07-10' : '2026-07-11'
        })
      });
      if (res.ok) {
        setCounters(prev => ({ ...prev, documents: prev.documents + 1 }));
        setDetectedTask(null);
        onSlackSyncTriggered(); // trigger tasks view refresh
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateDailySummary = async () => {
    setGeneratingSummary(true);
    setSummaryStatus("Analyzing raw slack streams...");
    setTimeout(() => setSummaryStatus("Extracting architecture parameters..."), 1000);
    setTimeout(() => setSummaryStatus("Synchronizing to Cognee Memory..."), 2000);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/slack/generate-summary`, {
        method: 'POST'
      });
      if (res.ok) {
        await loadSlackData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingSummary(false);
      setSummaryStatus(null);
    }
  };

  // Smart Query Handler with simulated typing
  const handleAskQuery = (query: string) => {
    setAskedQuery(query);
    setIsTypingAnswer(true);
    setAiAnswer('');

    let fullText = "No direct memory paths found inside Cognee.";
    if (query.includes("Supabase")) {
      fullText = "Retrieving decision records from Cognee Memory:\n• Decision ID: dec-9142\n• Source context: Sarah Jenkins in #tech-stack\n• Recommendation: Migrated database and authentication to Supabase in order to utilize built-in RLS, simple triggers, and reduce initial Cold-Start delay to <200ms.";
    } else if (query.includes("responsible")) {
      fullText = "Querying team assignment edges from Cognee Memory:\n• Assigned: Alex Rivera\n• Deliverable: Deliver Login UI\n• Deadline: Friday\n• Status: Active workflow path mapped.";
    } else if (query.includes("deadline")) {
      fullText = "Scanning workspace milestone nodes:\n• Target milestone: Login Page UI deliverable by Friday.\n• Task assigned: Alex Rivera\n• Status: Mapped dependency.";
    } else if (query.includes("decision")) {
      fullText = "Listing archived and approved Decisions:\n1. Supabase chosen for DB Auth backend.\n2. Express.js selected as standard REST template.\n3. Slack channel syncing initialized successfully.";
    } else if (query.includes("discussion")) {
      fullText = "Stitching today's Slack messages summary:\nSarah Jenkins recommended Supabase auth migration. Alex Rivera committed to finish login UI page by Friday. Cognee structured knowledge graphs updated successfully.";
    }

    let currentLength = 0;
    const interval = setInterval(() => {
      if (currentLength < fullText.length) {
        setAiAnswer(fullText.substring(0, currentLength + 2));
        currentLength += 2;
      } else {
        clearInterval(interval);
        setIsTypingAnswer(false);
      }
    }, 15);
  };

  // Simulated Oauth Setup Flow
  const startOAuthFlow = () => {
    setShowConnectModal(true);
    setConnectStep(1);
  };

  const proceedOAuth = () => {
    setOauthLoading(true);
    setTimeout(() => {
      setOauthLoading(false);
      setConnectStep(2);
    }, 1500);
  };

  const finishOAuth = async () => {
    setShowConnectModal(false);
    if (!workspace.slackConnected) {
      await onSlackConnectedToggle();
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-4rem)] bg-[#F5F5F5] font-sans overflow-hidden relative">
      
      {/* LEFT PRIMARY PANEL - COMMAND ACTION ZONE */}
      <div className="flex-1 p-6 xl:p-8 overflow-y-auto h-full flex flex-col space-y-6">
        
        {/* PREMIUM TOP HEADER STATUS BAR */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xs rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md shrink-0">
              <Slack className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-gray-900">
                  {workspace.slackWorkspaceName || `${workspace.name} Workspace`}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Connected Successfully
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2.5 text-[11px] text-gray-500 font-mono">
                <span className="flex items-center gap-1"><strong>Channels:</strong> 4 designated</span>
                <span className="flex items-center gap-1"><strong>Members:</strong> {workspace.members.length || 8} profiles</span>
                <span className="flex items-center gap-1"><strong>Synced Today:</strong> {counters.messagesSynced} events</span>
                <span className="flex items-center gap-1"><strong>Last Sync:</strong> Just now</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3 px-4 rounded-2xl shadow-inner shrink-0 self-start md:self-auto">
            <ToggleSwitch
              id="slack-connected-toggle"
              checked={workspace.slackConnected}
              onChange={() => onSlackConnectedToggle()}
              activeColor="bg-gradient-to-r from-blue-600 to-indigo-600"
              label={workspace.slackConnected ? "Bot Active" : "Bot Offline"}
              description={workspace.slackConnected ? "Active relay on" : "Passive indexing off"}
            />
            
            <button
              onClick={startOAuthFlow}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              Reconnect Slack
            </button>
          </div>
        </div>

        {/* PREMIUM SUB-TAB SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-white/60 p-3 rounded-[24px] shadow-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('sync')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'sync'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100/60'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Live Webhook Sync
            </button>
            <button
              onClick={() => setActiveSubTab('decisions')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
                activeSubTab === 'decisions'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200/50'
                  : 'text-slate-600 hover:bg-slate-100/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              AI Decision Intelligence
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100/40 rounded-xl text-[10px] text-blue-700 font-medium font-mono self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            Cognee Memory Engine: Active & Grounded
          </div>
        </div>

        {activeSubTab === 'decisions' ? (
          <div className="space-y-6">
            
            {/* 1. DECISION INSIGHTS DASHBOARD */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Decisions", value: decisions.filter(d => d.status === 'approved').length + 4, icon: Layers, color: "text-blue-600 bg-blue-50 border-blue-100/50", trend: "+2 today" },
                { label: "Pending Analysis", value: 2, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100/50", trend: "Awaiting consensus" },
                { label: "Approved (Cognee)", value: decisions.filter(d => d.status === 'approved').length + 4, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100/50", trend: "100% saved" },
                { label: "Hot Technology", value: "Supabase", icon: Database, color: "text-purple-600 bg-purple-50 border-purple-100/50", trend: "PostgreSQL DB" },
                { label: "Latest Locked Node", value: decisions.length > 0 ? decisions[decisions.length - 1].title : "Supabase Auth", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 border-indigo-100/50", trend: "Synced just now" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black font-mono uppercase tracking-wider text-slate-400">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg border ${stat.color}`}>
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 truncate">{stat.value}</h3>
                    <span className="text-[8px] font-mono text-slate-400 block mt-0.5">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* GRID CONTROLS: DETECTOR & WHY ENGINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 2. INTERACTIVE SLACK CONVERSATION DECISION DETECTOR */}
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs flex flex-col space-y-4">
                <div>
                  <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Interactive Slack Monitor
                  </h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Simulate active developer conversations to trigger Cognee's automatic decision reasoning pipeline.
                  </span>
                </div>

                {/* Slack Chat Simulator Frame */}
                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
                  {simConversationStep === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <Slack className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
                      <p className="text-[11px] text-slate-400 font-mono">
                        No active conversation streams on tech-stack.
                      </p>
                      <button
                        onClick={handleSimulateDecisionFlow}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        Simulate Team Discussion
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 pb-4">
                      {simMessages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2.5 text-xs"
                        >
                          <img src={msg.avatar} alt={msg.sender} className="w-7 h-7 rounded-lg border border-slate-200" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800">{msg.sender}</span>
                              <span className="text-[8px] text-slate-400 font-mono">{msg.time}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{msg.text}</p>
                          </div>
                        </motion.div>
                      ))}

                      {isScanning && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/50 border border-blue-100/40 rounded-xl">
                          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                          <div className="text-[10px] font-mono text-blue-800">
                            <span className="font-bold">Cognee Analyzer: </span>
                            {scanningText}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {simConversationStep > 0 && simConversationStep < 5 && !isScanning && (
                    <div className="text-[9px] text-slate-400 font-mono animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Discussion active... Simulating next typing stream
                    </div>
                  )}
                </div>

                {/* DECISION DETECTED CARD */}
                <AnimatePresence>
                  {showDetectedCard && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-gradient-to-tr from-blue-50/60 to-indigo-50/60 border border-blue-200/50 p-4 rounded-2xl relative"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-white text-indigo-600 border border-indigo-100 shadow-xs rounded-xl shrink-0">
                          <Brain className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black font-mono uppercase tracking-wider">
                              🧠 Decision Detected
                            </span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">
                              Confidence: 97%
                            </span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Proposed Decision</span>
                            <h4 className="font-extrabold text-slate-800">Use Supabase for Authentication</h4>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Reasoning Logic</span>
                            <p className="text-slate-600 leading-normal">
                              Recommended by Alex (Mentor) and validated by team agreement. Offers PostgreSQL compatibility, simple authentication schema, and eliminates CORS problems.
                            </p>
                          </div>

                          {!isSavingDecision && !saveDecisionSuccess && (
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={handleSaveDecision}
                                className="flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer transition-all active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Save Decision
                              </button>
                              <button
                                onClick={() => setShowDetectedCard(false)}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                              >
                                Ignore
                              </button>
                            </div>
                          )}

                          {isSavingDecision && (
                            <div className="flex items-center gap-2 text-indigo-700 text-[11px] font-mono font-bold pt-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                              <span>Storing and indexing decision node in Cognee memory graph...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display active linking animation steps sequentially */}
                      {savedAnimationStep > 0 && (
                        <div className="space-y-2 text-[10px] text-slate-600 mt-4 font-mono p-3 bg-white/80 border border-indigo-100 rounded-xl shadow-inner">
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                            <span>Storing decision record in Cognee DB...</span>
                          </div>
                          {savedAnimationStep >= 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Mapping edges to Sarah Jenkins, Rahul Gupta, and Alex (Mentor)...</span>
                            </motion.div>
                          )}
                          {savedAnimationStep >= 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Linking Document Dependency: <span className="text-blue-600">Architecture Specification.md</span></span>
                            </motion.div>
                          )}
                          {savedAnimationStep >= 4 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Spawning future task milestone: <span className="text-purple-600">Configure Database Auth</span></span>
                            </motion.div>
                          )}
                          {savedAnimationStep >= 5 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>✓ Decision node indexed successfully as permanent memory!</span>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {saveDecisionSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold leading-tight">Decision Saved Successfully</h4>
                      <p className="text-[10px] text-emerald-600/90 mt-0.5 leading-normal">
                        Indexed in Cognee. Associated graph relations have been refreshed.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 3. COGNEE WHY ENGINE & DAILY INSIGHTS */}
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs flex flex-col space-y-4">
                <div>
                  <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-500" />
                    Cognee "Why" Engine
                  </h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Query HackMate AI to explain architectural decisions and tech selection reasoning grounded in persistent memory.
                  </span>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  {/* Query Preset Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">Grounded Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Why are we using Supabase?",
                        "Why did we reject Firebase?",
                        "Why was React selected?",
                        "Why is authentication handled separately?"
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskWhyEngine(preset)}
                          disabled={whyTyping}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 text-[10px] font-medium text-slate-600 hover:text-indigo-700 rounded-xl transition-all cursor-pointer text-left disabled:opacity-50"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask the memory engine..."
                      value={whyQuery}
                      onChange={(e) => setWhyQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskWhyEngine(whyQuery)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono outline-none"
                    />
                    <button
                      onClick={() => handleAskWhyEngine(whyQuery)}
                      disabled={whyTyping || !whyQuery.trim()}
                      className="absolute right-2 top-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      Ask
                    </button>
                  </div>

                  {/* Why response output panel */}
                  <AnimatePresence>
                    {(whyAnswer || whyTyping) && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10.5px] leading-relaxed border border-slate-800 shadow-md relative animate-pulse"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <span className="text-[8px] text-indigo-400 uppercase font-black">AI Grounded Reason</span>
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <p className="whitespace-pre-line">{whyAnswer}</p>
                        {whyTyping && (
                          <span className="inline-block w-1.5 h-3.5 bg-white/70 animate-pulse ml-0.5 align-middle" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* 4. SAVED DECISIONS TIMELINE SECTION */}
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-emerald-500" />
                  Project Decisions Timeline
                </h3>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Expand each formal decision node to review the sequential consensus lifecycle and dependency mapping inside Cognee.
                </span>
              </div>

              {/* List of Saved Decisions */}
              <div className="space-y-4">
                {[
                  {
                    id: 'dec-1',
                    title: 'Use Supabase for Authentication',
                    category: 'Database',
                    sourceContext: 'Slack discussion #tech-stack',
                    date: 'Today',
                    desc: 'The team selected Supabase because the mentor recommended it during the backend architecture discussion. It provides PostgreSQL compatibility, built-in authentication, and better scalability for the project.',
                    relations: ['Supabase', 'Authentication', 'Rahul Gupta', 'Backend Task', 'Sprint 1', 'Mentor Review']
                  },
                  ...decisions.map((d, index) => ({
                    id: d.id,
                    title: d.title,
                    category: d.title.toLowerCase().includes('auth') || d.title.toLowerCase().includes('supabase') ? 'Database' : 'System',
                    sourceContext: d.sourceContext || 'Slack Sync Adapter',
                    date: 'Saved',
                    desc: d.description,
                    relations: ['Decision Node', d.title, 'Cognee Graph', 'Workspace Sync']
                  })),
                  {
                    id: 'dec-2',
                    title: 'Express.js backend server templates',
                    category: 'Backend',
                    sourceContext: 'David Chen in #tech-stack',
                    date: 'Yesterday',
                    desc: 'Use standard Node Express with TypeScript stripping for quick full-stack integrations. Set port configurations to 3000 to match developer reverse proxy requirements.',
                    relations: ['Express', 'TypeScript', 'David Chen', 'Port 3000', 'Server Middleware']
                  },
                  {
                    id: 'dec-3',
                    title: 'Vite as default Single Page Application builder',
                    category: 'Frontend',
                    sourceContext: 'Sarah Jenkins in #general',
                    date: '2 days ago',
                    desc: 'Adopt Vite for hyper-fast hot-reloading SPAs during development. Ensure the production build packs files cleanly into the dist output directory.',
                    relations: ['Vite', 'React 18', 'Sarah Jenkins', 'dist/ folder', 'Fast Refresh']
                  }
                ].filter((v, i, a) => a.findIndex(t => t.title === v.title) === i).map((dec) => {
                  const isExpanded = expandedDecisionId === dec.id;
                  return (
                    <div key={dec.id} className="border border-slate-100 bg-white rounded-2xl overflow-hidden shadow-xs transition-all hover:border-slate-200/80">
                      <div
                        onClick={() => setExpandedDecisionId(isExpanded ? null : dec.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-black text-slate-800">{dec.title}</h4>
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-mono font-bold rounded">
                                Approved
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block mt-1">
                              Category: <strong className="text-slate-600">{dec.category}</strong> | Source: <strong className="text-slate-600">{dec.sourceContext}</strong> | {dec.date}
                            </span>
                          </div>
                        </div>
                        <div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-50 bg-slate-50/40 p-4 space-y-4"
                          >
                            <div className="text-xs text-slate-600 leading-relaxed">
                              <span className="text-[9px] font-black font-mono text-slate-400 uppercase block tracking-wider mb-1">Decision Abstract</span>
                              {dec.desc}
                            </div>

                            {/* VERTICAL LIFE-CYCLE TIMELINE */}
                            <div className="space-y-4 relative pl-5 border-l-2 border-indigo-100 py-1">
                              {[
                                { title: "Idea Proposed", desc: `Proposed in Slack stream by core workspace developers.`, icon: Sparkles },
                                { title: "Team Discussion", desc: "Interactive consensus reached over channel webhook streams.", icon: MessageSquare },
                                { title: "Mentor Feedback", desc: "Expert mentor review validated technical feasibility.", icon: User },
                                { title: "Decision Approved", desc: "Locked and saved as official architectural decision node.", icon: CheckCircle2 },
                                { title: "Stored in Cognee", desc: "Indexed as permanent architectural memory node in knowledge graph.", icon: Database },
                                { title: "Linked to Tasks", desc: "Automated workflow items created and assigned to roadmap milestones.", icon: CheckSquare }
                              ].map((stage, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="relative space-y-0.5 text-xs"
                                >
                                  {/* Connector Circle */}
                                  <div className="absolute -left-[27px] top-0.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                  </div>
                                  <h5 className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <stage.icon className="w-3 h-3 text-indigo-500" />
                                    {stage.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-400">{stage.desc}</p>
                                </motion.div>
                              ))}
                            </div>

                            {/* HORIZONTAL RELATIONSHIP PREVIEW BADGES */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <span className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider block">Cognee Relationship Preview</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {dec.relations.map((rel, index) => (
                                  <React.Fragment key={index}>
                                    <span className="px-2.5 py-1 bg-white border border-slate-100 text-[10px] font-bold text-slate-700 rounded-xl shadow-xs">
                                      {rel}
                                    </span>
                                    {index < dec.relations.length - 1 && (
                                      <ArrowRight className="w-3 h-3 text-slate-300" />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>

                            {/* View Full Graph link */}
                            {onViewChange && (
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => onViewChange('graph')}
                                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                                >
                                  <Network className="w-3.5 h-3.5" />
                                  View Full Memory Graph
                                </button>
                              </div>
                            )}

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. AI DECISION DAILY SUMMARY */}
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Today's AI Decisions Summary</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">End-of-day summary compiling important consensus items and roadmap mappings.</span>
                </div>
                {!compileDailySuccess && !isCompilingDaily && (
                  <button
                    onClick={handleCompileDailySummaryPremium}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Compile Summary
                  </button>
                )}
                {isCompilingDaily && (
                  <span className="text-[10px] font-mono text-slate-400 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    Syncing...
                  </span>
                )}
                {compileDailySuccess && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-mono font-bold">
                    Saved to Cognee Memory
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dailyDecisions.map((dec, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white text-indigo-600 rounded-lg border border-slate-100">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800">{dec.title}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">Category: {dec.category}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-black">
                      {dec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN 1: LIVE CHAT STREAM & SUGGESTIONS */}
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Live Collaboration Feed</h3>
                <span className="text-[10px] text-gray-400 block">Simulated webhooks mirroring active Slack messages.</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-[#0066FF] border border-blue-100 text-[9px] font-mono rounded-lg">
                Real-Time Webcast
              </span>
            </div>

            {/* Quick Presets Carousel */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Simulation Triggers (Click one to post):</span>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    disabled={syncing}
                    onClick={() => handleSimulateSlackPost(tpl.channel, tpl.sender, tpl.text)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-slate-700 rounded-xl transition-all cursor-pointer text-left shrink-0 max-w-[280px] truncate"
                    title={tpl.text}
                  >
                    <span className="text-blue-500 font-mono">#{tpl.channel}</span>
                    <span className="text-gray-400">|</span>
                    <span className="truncate">"{tpl.text}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Custom Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSimulateSlackPost(selectedChannel, selectedSender, typedMessage);
            }} className="space-y-3 bg-gray-50/50 p-3.5 border border-gray-100 rounded-2xl shadow-inner">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-mono">Target Channel</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 font-mono text-[11px]"
                  >
                    {channels.map(chan => (
                      <option key={chan} value={chan}>#{chan}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-mono">Message Author</label>
                  <select
                    value={selectedSender}
                    onChange={(e) => setSelectedSender(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 font-mono text-[11px]"
                  >
                    {actors.map(act => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Type custom hackathon message..."
                  className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 text-xs placeholder:text-gray-400 h-16 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={syncing || !typedMessage.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg absolute right-2.5 bottom-2.5 transition-all cursor-pointer shadow-sm"
                >
                  {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            {/* Bubble Conversation list */}
            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {logs.slice(0, 5).map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -15, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 15, scale: 0.95 }}
                    className="flex flex-col p-3 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1 font-bold text-blue-600">
                        <Hash className="w-3 h-3 text-blue-400" />
                        {log.channelName}
                      </span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-extrabold text-slate-800 shrink-0">{log.senderName}:</span>
                      <p className="text-slate-600 leading-normal">{log.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: AI STAGE PROCESSING PIPELINE & EXTRACTION */}
          <div className="flex flex-col space-y-6">
            
            {/* AI PROCESS PIPELINE CARD */}
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs flex flex-col space-y-3.5">
              <div>
                <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Cognee Real-Time Processing</h3>
                <span className="text-[10px] text-gray-400 block">Watch Cognee compile unstructured chat streams into structured vectors.</span>
              </div>

              {/* Pipeline Flow chart */}
              <div className="grid grid-cols-5 gap-2 relative">
                {[
                  { step: 1, label: "Ingestion", desc: "Slack Webhook", icon: Slack },
                  { step: 2, label: "Parsing", desc: "HackMate AI", icon: Cpu },
                  { step: 3, label: "Linking", desc: "Cognee Extractor", icon: Network },
                  { step: 4, label: "Indexing", desc: "Graph Update", icon: Database },
                  { step: 5, label: "Commit", desc: "Decision Save", icon: FileCheck2 }
                ].map((item) => {
                  const isActive = activePipelineStep === item.step;
                  const isCompleted = activePipelineStep !== null && activePipelineStep > item.step;
                  return (
                    <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.15 : 1,
                          boxShadow: isActive ? "0 0 14px rgba(59, 130, 246, 0.5)" : "none"
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                          isActive 
                            ? 'bg-blue-600 border-blue-400 text-white' 
                            : isCompleted 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </motion.div>
                      <span className="text-[8px] font-bold text-gray-800 mt-1.5 block leading-tight">{item.label}</span>
                      <span className="text-[7px] text-gray-400 block mt-0.5">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ENTITY EXTRACTION RESULTS CARD */}
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-5 shadow-xs flex flex-col space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Entity Extraction Dashboard</h3>
                  <span className="text-[10px] text-gray-400 block font-mono">Extracted semantic triples & confidence rates.</span>
                </div>
                {extractedEntities && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-mono font-bold">
                    Confidence: {extractedEntities.confidence}%
                  </span>
                )}
              </div>

              {extractedEntities ? (
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase text-[8px] block font-bold">Detected Tech</span>
                    <span className="text-[#0066FF] font-extrabold mt-0.5 block">{extractedEntities.tech || "None"}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase text-[8px] block font-bold">Detected Owner</span>
                    <span className="text-slate-700 font-bold mt-0.5 block">{extractedEntities.person || "None"}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase text-[8px] block font-bold">Detected Task</span>
                    <span className="text-slate-600 font-bold mt-0.5 block truncate">{extractedEntities.task || "None"}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase text-[8px] block font-bold">Deadline Milestone</span>
                    <span className="text-amber-600 font-bold mt-0.5 block">{extractedEntities.deadline || "None"}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 uppercase text-[8px] block font-bold">Detected Decision Context</span>
                    <span className="text-purple-600 font-bold mt-0.5 block">{extractedEntities.decision || "None"}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400 font-mono">
                  Submit or trigger a Slack message above to see extraction tags.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* COGNEE LIVE KNOWLEDGE GRAPH */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono flex items-center gap-1.5">
                <Network className="w-4 h-4 text-indigo-500" />
                Cognee Memory Graph
              </h3>
              <span className="text-[10px] text-gray-400 block mt-0.5">Live index relations generated on database commit events.</span>
            </div>

            {/* Micro Stats Counter row */}
            <div className="flex gap-4 text-[10px] font-mono text-slate-500 bg-slate-50 border p-2 rounded-xl">
              <div>
                <span className="text-slate-400 block font-bold text-[8px]">ENTITIES</span>
                <span className="text-slate-700 font-extrabold">{counters.entities}</span>
              </div>
              <div className="border-l pl-2 border-slate-200">
                <span className="text-slate-400 block font-bold text-[8px]">RELATIONS</span>
                <span className="text-indigo-600 font-extrabold">{counters.relationships}</span>
              </div>
              <div className="border-l pl-2 border-slate-200">
                <span className="text-slate-400 block font-bold text-[8px]">DOCS</span>
                <span className="text-slate-700 font-extrabold">{counters.documents}</span>
              </div>
              <div className="border-l pl-2 border-slate-200">
                <span className="text-slate-400 block font-bold text-[8px]">GROWTH</span>
                <span className="text-emerald-600 font-extrabold">+{counters.growth}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Graph Canvas SVG */}
          <div className="h-64 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="#CBD5E1" />
                </marker>
              </defs>

              {/* Draw Relations */}
              <g>
                {[
                  { from: 'user-sarah', to: 'ws', label: 'MEMBER_OF' },
                  { from: 'user-alex', to: 'ws', label: 'MEMBER_OF' },
                  { from: 'tech-supabase', to: 'ws', label: 'USED_IN' },
                  { from: 'task-login', to: 'user-alex', label: 'ASSIGNED_TO' },
                  { from: 'dec-migrate', to: 'tech-supabase', label: 'REFERENCES' },
                  { from: 'dec-migrate', to: 'ws', label: 'DECIDED_IN' }
                ].map((edge, idx) => {
                  const start = graphNodes.find(n => n.id === edge.from);
                  const end = graphNodes.find(n => n.id === edge.to);
                  if (!start || !end) return null;

                  return (
                    <g key={idx}>
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        className="stroke-slate-200 stroke-1"
                        markerEnd="url(#arrow)"
                      />
                      <text
                        x={(start.x + end.x) / 2}
                        y={(start.y + end.y) / 2 - 4}
                        className="fill-slate-400 font-mono text-[7px]"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Draw Nodes */}
              <g>
                {graphNodes.map((node) => {
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer">
                      {node.pulse && (
                        <circle
                          r="18"
                          className="fill-none stroke-blue-500/40 stroke-[2px] animate-ping"
                        />
                      )}
                      <circle
                        r="12"
                        className={`${
                          node.type === 'workspace' ? 'fill-blue-500' :
                          node.type === 'member' ? 'fill-emerald-500' :
                          node.type === 'technology' ? 'fill-purple-500' :
                          node.type === 'task' ? 'fill-indigo-500' :
                          'fill-amber-500'
                        } stroke-white stroke-2 drop-shadow-xs`}
                      />
                      <text
                        dy=".3em"
                        className="fill-white font-mono text-[8px] font-extrabold text-center"
                        textAnchor="middle"
                      >
                        {node.label.charAt(0).toUpperCase()}
                      </text>
                      <text
                        y="20"
                        className="fill-slate-600 font-sans text-[7.5px] font-bold"
                        textAnchor="middle"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
          </>
        )}

        {/* FLOATING DETECTED TASK ACTION WINDOW */}
        <AnimatePresence>
          {detectedTask && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.95 }}
              className="bg-white border-2 border-blue-500/30 shadow-2xl p-4 rounded-3xl flex items-center justify-between gap-4 relative overflow-hidden"
            >
              {/* Highlight gradient background overlay */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl shrink-0">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-600">AI Task Detector</span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                  <h4 className="text-xs font-black text-gray-800 mt-1">Detected: "{detectedTask.title}"</h4>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                    Assignee: <strong>{detectedTask.assignee}</strong> | Deadline: <strong>{detectedTask.deadline}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <button
                  onClick={handleCreateDetectedTask}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  Create Task
                </button>
                <button
                  onClick={() => setDetectedTask(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* RIGHT DETAILED TIMELINE & INSIGHT PANEL */}
      <div className="w-full xl:w-[380px] bg-white border-l border-gray-200/80 p-6 xl:p-8 h-full overflow-y-auto flex flex-col shadow-sm shrink-0">
        
        {/* DAILY AI SUMMARY SECTION */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-center pb-1">
            <div>
              <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Daily AI Summary</h3>
              <span className="text-[9px] text-gray-400 block">Compiled insights from Slack feeds.</span>
            </div>
            
            <button
              onClick={handleGenerateDailySummary}
              disabled={generatingSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border text-[10px] font-bold rounded-xl transition-all font-mono text-slate-700 cursor-pointer"
            >
              {generatingSummary ? <RefreshCw className="w-3 h-3 animate-spin text-blue-500" /> : <Sparkles className="w-3 h-3 text-blue-500" />}
              Compile Today
            </button>
          </div>

          {summaryStatus && (
            <div className="p-3 bg-blue-50 border border-blue-100 text-[10px] font-mono text-blue-700 rounded-xl animate-pulse">
              {summaryStatus}
            </div>
          )}

          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
            {summaries.map(sum => (
              <div key={sum.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-800 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {sum.date}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-mono font-bold rounded">
                    Cognee Saved
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {sum.summary}
                </p>

                {/* Simulated detailed Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-slate-100 pt-2 text-slate-500">
                  <div>
                    <span className="text-[8px] block text-slate-400 uppercase font-bold">Tasks Extracted</span>
                    <span className="font-bold text-slate-700">3 tasks created</span>
                  </div>
                  <div>
                    <span className="text-[8px] block text-slate-400 uppercase font-bold">Risks Detected</span>
                    <span className="font-bold text-amber-600">Low complexity</span>
                  </div>
                </div>
              </div>
            ))}

            {summaries.length === 0 && !summaryStatus && (
              <div className="text-center py-8 text-[11px] text-gray-400 font-mono border border-dashed rounded-xl p-4">
                No generated summaries available. Click "Compile Today" above to synthesize the timeline!
              </div>
            )}
          </div>
        </div>

        {/* SMART QUERY PANEL */}
        <div className="py-6 border-b border-gray-100 space-y-4">
          <div>
            <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Ask HackMate Memory</h3>
            <span className="text-[10px] text-gray-400 block">Query the Cognee persistent memory layer directly.</span>
          </div>

          {/* Preset Questions stack */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Query Presets:</span>
            <div className="space-y-1.5">
              {[
                "Why did we choose Supabase?",
                "Who is responsible for authentication?",
                "Summarize today's discussion.",
                "List all project decisions."
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleAskQuery(q)}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs font-semibold text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span className="truncate">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Query Response Window */}
          {askedQuery && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 font-mono text-[10px] relative overflow-hidden shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold uppercase text-[8px] tracking-wider flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  Cognee Memory Ingest
                </span>
                {isTypingAnswer ? (
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                ) : (
                  <span className="text-emerald-400 font-bold uppercase text-[8px]">Grounded Output</span>
                )}
              </div>
              
              <div className="space-y-1">
                <span className="text-slate-400 text-[8px] uppercase">Query:</span>
                <p className="text-slate-200 font-bold">{askedQuery}</p>
              </div>

              <div className="space-y-1 border-t border-slate-800/50 pt-2">
                <span className="text-slate-400 text-[8px] uppercase block">Response:</span>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">{aiAnswer}</p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATS PROGRESS BARS */}
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-xs font-black text-gray-800 tracking-wide uppercase font-mono">Sync & Extraction Health</h3>
            <span className="text-[10px] text-gray-400 block font-mono">Continuous background sync metrics.</span>
          </div>

          <div className="space-y-3.5 font-mono text-[9px] text-slate-500">
            {[
              { label: "Messages Synced", count: 124, progress: "w-[72%]", color: "bg-blue-600" },
              { label: "Files Indexed", count: 12, progress: "w-[48%]", color: "bg-purple-600" },
              { label: "Entities Extracted", count: 42, progress: "w-[85%]", color: "bg-indigo-600" },
              { label: "Knowledge Links", count: 128, progress: "w-[64%]", color: "bg-emerald-600" },
              { label: "Tasks Generated", count: 8, progress: "w-[30%]", color: "bg-amber-600" },
              { label: "Documents Processed", count: 16, progress: "w-[55%]", color: "bg-pink-600" }
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{metric.label}</span>
                  <span className="text-slate-700">{metric.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`${metric.progress} ${metric.color} h-full rounded-full animate-pulse`} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FLOATING AI ROBOT ASSISTANT (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        
        {/* Speech Bubble Toggle */}
        <AnimatePresence>
          {showRobotDialog && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl max-w-xs text-xs font-medium leading-relaxed relative border border-slate-800"
            >
              {/* Little speech tail */}
              <div className="absolute right-6 bottom-[-6px] w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-800" />
              <div className="flex items-start gap-2.5">
                <Bot className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-wider block">HackMate Cognee Assistant</span>
                  <p className="text-slate-300 mt-1">
                    Hey! I am active and continuously parsing your Slack webhooks, extracting entity links, and building memory graphs in the background. Ask me a question from the query presets to test my grounding accuracy!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover/Clickable Floating Robot Trigger */}
        <motion.button
          onClick={() => setShowRobotDialog(!showRobotDialog)}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl border border-white/20 relative cursor-pointer"
        >
          {/* Active online glowing badge */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          <Bot className="w-7 h-7" />
        </motion.button>
      </div>

      {/* DETAILED SLACK OAUTH SIMULATION DIALOG MODAL */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-6 z-[99]"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
            >
              <button
                onClick={() => setShowConnectModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-50 text-slate-400 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>

              {connectStep === 1 ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100">
                      <Slack className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Slack Authorization Flow</h3>
                      <span className="text-[10px] text-slate-400 block font-mono">Workspace API permissions.</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <p>
                      HackMate is requesting permission to access your Slack Workspace data in order to:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 font-mono text-[10px]">
                      <li>Listen to public channels webhook relays</li>
                      <li>Extract message text and entity links via Cognee</li>
                      <li>Synchronize user tasks to the project dashboard</li>
                    </ul>
                  </div>

                  <button
                    onClick={proceedOAuth}
                    disabled={oauthLoading}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {oauthLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Authorizing Workspace credentials...
                      </>
                    ) : (
                      "Authorize HackMate AI Connection"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 text-center">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Connection Successful!</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      HackMate AI Slack Webhook has been successfully linked with your workspace environment.
                    </p>
                  </div>

                  <button
                    onClick={finishOAuth}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Return to Integration Center
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
