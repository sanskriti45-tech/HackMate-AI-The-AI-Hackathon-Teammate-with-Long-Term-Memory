import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Search, X, Layers, Link2, Brain, Activity, Sparkles, 
  RefreshCw, Trash2, Archive, Clock, User, FileText, CheckSquare, 
  HelpCircle, CheckCircle2, ArrowRight, CornerDownRight, Database, RefreshCcw, Eye
} from 'lucide-react';
import { MemoryNode, MemoryEdge } from '../types';

interface EnrichedNode extends MemoryNode {
  description: string;
  source: string;
  creator: string;
  timestamp: string;
  confidenceScore: number;
  aiSummary: string;
  reasoning: string;
  lifecycleStatus: 'Remembered' | 'Memified' | 'Recalled' | 'Forgotten';
  lifecycleSource: string;
  lifecycleConverted: string;
  lifecycleRecalls: number;
  lifecycleForgotten: 'Yes' | 'No';
}

const enrichNodeData = (node: MemoryNode): EnrichedNode => {
  const typeMap: Record<string, Partial<EnrichedNode>> = {
    workspace: {
      description: "Primary workspace hub hosting team repositories, tasks, and Slack channels.",
      source: "Workspace Creation",
      creator: "System Root",
      timestamp: "3 days ago",
      confidenceScore: 100,
      aiSummary: "Central index representing the workspace environment. Coordinates data indexing across linked Slack channels.",
      reasoning: "Established as the parent container node for all collaborative telemetry.",
      lifecycleStatus: 'Remembered',
      lifecycleSource: "System Root",
      lifecycleConverted: "Generated root workspace node.",
      lifecycleRecalls: 142,
      lifecycleForgotten: 'No'
    },
    member: {
      description: "Active team member participating in discussions and task assignments.",
      source: "Workspace Invitation",
      creator: "Default User",
      timestamp: "2 days ago",
      confidenceScore: 99,
      aiSummary: "Extracted team profile linked with workspace ownership and specific task delegations.",
      reasoning: "Identified via user lookup and invite triggers as a core collaborator.",
      lifecycleStatus: 'Remembered',
      lifecycleSource: "Auth Invite Database",
      lifecycleConverted: "Synced profile details with related task nodes.",
      lifecycleRecalls: 38,
      lifecycleForgotten: 'No'
    },
    task: {
      description: "Assigned action item with metadata tracking completion milestones.",
      source: "Task Creator",
      creator: "Sarah Jenkins",
      timestamp: "Yesterday",
      confidenceScore: 95,
      aiSummary: "Actionable item tracking project objectives and deadline thresholds.",
      reasoning: "Synthesized from project roadmap specs and Slack task assignment requests.",
      lifecycleStatus: 'Remembered',
      lifecycleSource: "Task View Dashboard",
      lifecycleConverted: "Constructed workflow edges connecting assignee and target milestones.",
      lifecycleRecalls: 14,
      lifecycleForgotten: 'No'
    },
    document: {
      description: "Knowledge asset containing core specifications, architecture docs, or pitch material.",
      source: "Document Upload",
      creator: "Alex Rivera",
      timestamp: "12 hours ago",
      confidenceScore: 97,
      aiSummary: "Semantically parsed text document. Key points and tech stack extracted using Gemini models.",
      reasoning: "Uploaded by user; parsed into key chunks for semantic search grounding.",
      lifecycleStatus: 'Memified',
      lifecycleSource: "Architecture Specification.md",
      lifecycleConverted: "Extracted key-points, decisions, and mapped tech stack tags.",
      lifecycleRecalls: 27,
      lifecycleForgotten: 'No'
    },
    decision: {
      description: "Consolidated team decision regarding architecture, features, or roadmap priorities.",
      source: "Slack Sync",
      creator: "Sarah Jenkins",
      timestamp: "10 hours ago",
      confidenceScore: 94,
      aiSummary: "Structured architectural decision compiled automatically from Slack discussions.",
      reasoning: "Extracted using Gemini 3.5 Flash semantic chunking over 24 conversations in #tech-stack.",
      lifecycleStatus: 'Memified',
      lifecycleSource: "Slack Channel #tech-stack",
      lifecycleConverted: "AI condensed 24 conversations into one structured memory decision.",
      lifecycleRecalls: 9,
      lifecycleForgotten: 'No'
    },
    technology: {
      description: "Technology tag or stack dependency identified across documents and decisions.",
      source: "Entity Extraction",
      creator: "Cognee AI Engine",
      timestamp: "2 days ago",
      confidenceScore: 98,
      aiSummary: "Extracted technology tag linked with tasks, design specifications, and reference documents.",
      reasoning: "Identified as a high-frequency term inside technical documentation.",
      lifecycleStatus: 'Remembered',
      lifecycleSource: "Cognee Entity Parser",
      lifecycleConverted: "Indexed as a central technology hub connected to reference documents.",
      lifecycleRecalls: 41,
      lifecycleForgotten: 'No'
    }
  };

  const defaultMeta = {
    description: "Extracted node representing workspace entity.",
    source: "Cognee Extractor",
    creator: "System",
    timestamp: "1 day ago",
    confidenceScore: 92,
    aiSummary: "Indexed context representing dynamic telemetry.",
    reasoning: "Mapped automatically through context correlation.",
    lifecycleStatus: 'Remembered' as const,
    lifecycleSource: "Semantic Pipeline",
    lifecycleConverted: "Ingested via Cognee.",
    lifecycleRecalls: 5,
    lifecycleForgotten: 'No' as const
  };

  const matched = typeMap[node.type] || defaultMeta;
  return {
    ...node,
    ...defaultMeta,
    ...matched,
    properties: { ...node.properties, ...matched }
  };
};

export default function MemoryGraphView() {
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [edges, setEdges] = useState<MemoryEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Stats Counters
  const [stats, setStats] = useState({
    remembered: 1247,
    recalled: 436,
    memified: 182,
    forgotten: 53
  });

  // Remember simulation states
  const [rememberStep, setRememberStep] = useState<number | null>(null);
  const [rememberTexts, setRememberTexts] = useState<string[]>([]);
  
  // Memify simulation states
  const [memifyActive, setMemifyActive] = useState(false);

  // Recall simulation states
  const [recallPath, setRecallPath] = useState<string[]>([]);
  const [recallText, setRecallText] = useState<string | null>(null);

  // Live Activity feed state
  const [activities, setActivities] = useState([
    { id: '1', type: 'Recalled', time: '03:14 PM', message: 'Answered "Why are we using Express?" using 7 memories.' },
    { id: '2', type: 'Forgotten', time: '02:10 PM', message: 'Removed outdated Firebase local credentials proposal.' },
    { id: '3', type: 'Memified', time: '11:04 AM', message: 'Condensed #tech-stack channel conversations into "Use Express+Vite" decision.' },
    { id: '4', type: 'Remembered', time: '10:25 AM', message: 'Indexed Architecture Specification.md into Cognee semantic vectors.' }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layout parameters
  const width = 800;
  const height = 520;

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await fetch('/api/memory/graph');
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (e) {
        console.error("Failed to load Memory Graph.");
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate deterministic concentric coordinate system
  const getNodeCoordinates = (node: MemoryNode, index: number, total: number) => {
    if (node.type === 'workspace' || node.id === 'ws-core') {
      return { x: width / 2, y: height / 2 };
    }

    let radius = 140;
    if (node.type === 'document' || node.type === 'technology') {
      radius = 210;
    } else if (node.type === 'task' || node.type === 'decision' || node.type === 'milestone') {
      radius = 295;
    }

    const types = ['workspace', 'member', 'channel', 'document', 'technology', 'task', 'decision', 'milestone'];
    const typeIdx = types.indexOf(node.type);
    
    const angle = (index * 2 * Math.PI) / (total - 1 || 1) + (typeIdx * 0.45);
    const x = width / 2 + radius * Math.cos(angle);
    const y = height / 2 + radius * Math.sin(angle);

    return { x, y };
  };

  const coordsMap: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node, idx) => {
    coordsMap[node.id] = getNodeCoordinates(node, idx, nodes.length);
  });

  const getNodeStyles = (type: string, isHighlighted: boolean) => {
    switch (type) {
      case 'workspace':
        return { color: 'fill-blue-500', stroke: 'stroke-blue-200', bg: 'bg-blue-50/80 text-blue-700 border-blue-200/50', r: 24 };
      case 'member':
        return { color: 'fill-emerald-500', stroke: 'stroke-emerald-200', bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/50', r: 18 };
      case 'document':
        return { color: 'fill-amber-500', stroke: 'stroke-amber-200', bg: 'bg-amber-50/80 text-amber-700 border-amber-200/50', r: 18 };
      case 'task':
        return { color: 'fill-indigo-500', stroke: 'stroke-indigo-200', bg: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/50', r: 16 };
      case 'decision':
        return { color: 'fill-purple-500', stroke: 'stroke-purple-200', bg: 'bg-purple-50/80 text-purple-700 border-purple-200/50', r: 16 };
      case 'technology':
        return { color: 'fill-teal-500', stroke: 'stroke-teal-200', bg: 'bg-teal-50/80 text-teal-700 border-teal-200/50', r: 16 };
      default:
        return { color: 'fill-gray-500', stroke: 'stroke-gray-200', bg: 'bg-gray-50 text-gray-700 border-gray-200/50', r: 14 };
    }
  };

  const getEdgeRelationshipLabel = (rel: string) => {
    const map: Record<string, string> = {
      'REFERENCE_FOR': 'REFERENCES',
      'DECIDED_ON': 'DECIDED_FROM',
      'DISCUSSED_IN': 'MENTIONED_IN'
    };
    return map[rel] || rel;
  };

  // Node Selection Neighbors
  const isAnySelected = selectedNode !== null;
  const isRecalling = recallPath.length > 0;

  const neighborIds = isAnySelected
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(e => e.source === selectedNode.id ? e.target : e.source)
    : [];

  const activeHighlightedIds = isRecalling
    ? recallPath
    : isAnySelected 
      ? [selectedNode.id, ...neighborIds]
      : searchQuery.trim() === ''
        ? nodes.map(n => n.id)
        : nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase())).map(n => n.id);

  // Connected Entity Counters
  const connectedNodes = nodes.filter(n => neighborIds.includes(n.id));
  const connectedDocs = connectedNodes.filter(n => n.type === 'document');
  const connectedTasks = connectedNodes.filter(n => n.type === 'task');
  const connectedMembers = connectedNodes.filter(n => n.type === 'member');

  // Active Selected Metadata
  const enriched = selectedNode ? enrichNodeData(selectedNode) : null;

  // Real-time Action pipeline
  const handleAction = (actionType: 'remember' | 'memify' | 'refresh' | 'recall' | 'archive' | 'forget') => {
    if (!selectedNode) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (actionType === 'remember') {
      setStats(prev => ({ ...prev, remembered: prev.remembered + 1 }));
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Remembered', time: timeStr, message: `Reinforced memory nodes for "${selectedNode.label}".` },
        ...prev
      ]);
      triggerToast(`🧠 Node memory reinforced in vector space successfully.`);
    } 
    else if (actionType === 'memify') {
      setStats(prev => ({ ...prev, memified: prev.memified + 1 }));
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Memified', time: timeStr, message: `✨ Synthesized conversations surrounding "${selectedNode.label}" into a structured decision.` },
        ...prev
      ]);
      setMemifyActive(true);
    }
    else if (actionType === 'refresh') {
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Remembered', time: timeStr, message: `🔄 Refreshed TTL cache lease for "${selectedNode.label}" cluster.` },
        ...prev
      ]);
      triggerToast(`🔄 Memory TTL cache refreshed to 100%.`);
    }
    else if (actionType === 'recall') {
      setStats(prev => ({ ...prev, recalled: prev.recalled + 1 }));
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Recalled', time: timeStr, message: `🔍 Recalled related semantic neighbors of "${selectedNode.label}".` },
        ...prev
      ]);
      setRecallPath([selectedNode.id, ...neighborIds]);
      setRecallText(`Answer generated using ${neighborIds.length + 1} connected memories.`);
      triggerToast(`🔍 Recalled ${neighborIds.length + 1} node pathways.`);
    }
    else if (actionType === 'archive') {
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Remembered', time: timeStr, message: `📦 Archived node "${selectedNode.label}" to cold-storage registry.` },
        ...prev
      ]);
      triggerToast(`📦 Node "${selectedNode.label}" archived.`);
    }
    else if (actionType === 'forget') {
      const label = selectedNode.label;
      setStats(prev => ({ ...prev, forgotten: prev.forgotten + 1 }));
      setActivities(prev => [
        { id: Date.now().toString(), type: 'Forgotten', time: timeStr, message: `🗑 Severed relationships & forgot node "${label}".` },
        ...prev
      ]);
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
      setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      triggerToast(`🗑 Memory forgotten successfully.`);
    }
  };

  // Interactive Remember simulation pipeline
  const triggerRememberFlow = () => {
    setRememberStep(0);
    setRememberTexts(['🧠 Remembering...', 'Extracting entities...', 'Building relationships...', 'Memory stored successfully.']);

    const runStep = (stepNum: number) => {
      setTimeout(() => {
        setRememberStep(stepNum);
        if (stepNum === 3) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newId = 'supabase-' + Date.now();
          const newNode: MemoryNode = { id: newId, label: 'Supabase Authentication', type: 'technology' };
          
          setNodes(prev => [...prev, newNode]);
          setEdges(prev => [
            ...prev,
            { id: 'edge-sub-' + Date.now(), source: newId, target: 'ws-core', relationship: 'REFERENCE_FOR' }
          ]);
          setStats(prev => ({ ...prev, remembered: prev.remembered + 1 }));
          setActivities(prev => [
            { id: Date.now().toString(), type: 'Remembered', time: timeStr, message: `🧠 Cognee stored "Supabase Authentication" technology node.` },
            ...prev
          ]);
          setSelectedNode(newNode);
          setTimeout(() => setRememberStep(null), 1500);
        } else {
          runStep(stepNum + 1);
        }
      }, 900);
    };

    runStep(1);
  };

  // Interactive Memify simulation pipeline
  const triggerMemifyFlow = () => {
    setMemifyActive(true);
    setStats(prev => ({ ...prev, memified: prev.memified + 1 }));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [
      { id: Date.now().toString(), type: 'Memified', time: timeStr, message: '✨ AI condensed 24 raw discussions into 1 structured decision memory.' },
      ...prev
    ]);
  };

  // Interactive Recall simulation pipeline
  const triggerRecallFlow = () => {
    setRecallPath([]);
    setRecallText("Answer generated using 7 connected memories.");
    setStats(prev => ({ ...prev, recalled: prev.recalled + 1 }));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [
      { id: Date.now().toString(), type: 'Recalled', time: timeStr, message: '🔍 Ask: "Why Express+Vite?" -> Traversed 7 memory nodes.' },
      ...prev
    ]);

    // Animate pathway highlights sequentially
    const pathIds = ['ws-core', 'chan-tech', 'doc-1', 'dec-1', 'tech-express'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < pathIds.length) {
        setRecallPath(prev => [...prev, pathIds[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setRecallPath([]);
          setRecallText(null);
        }, 5000);
      }
    }, 550);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto h-full flex flex-col space-y-6">
        
        {/* PREMIUM STATS HEADER SECTION */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Remembered', value: stats.remembered, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Recalled', value: stats.recalled, icon: Brain, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Memified', value: stats.memified, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
            { label: 'Forgotten', value: stats.forgotten, icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' }
          ].map((card) => (
            <motion.div
              key={card.label}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase block">{card.label}</span>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight block mt-1">{card.value.toLocaleString()}</span>
              </div>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color} border shadow-xs`}>
                <card.icon className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ACTIVE STAGE BLOCK */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col relative flex-1 min-h-[480px]">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Brain className="w-4.5 h-4.5 text-blue-500" />
                Cognee Memory Lifecycle Center
              </h2>
              <span className="text-[10px] text-slate-400 block mt-0.5">Real-time interaction with the Cognee relational database indexing flow.</span>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={triggerRememberFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Trigger Remember Flow
              </button>
              <button 
                onClick={triggerMemifyFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                Simulate Memify Flow
              </button>
              <button 
                onClick={triggerRecallFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0066FF] border border-blue-100 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Brain className="w-3 h-3" />
                Trigger Recall Pathway
              </button>
            </div>
          </div>

          {/* Subheader Search and recall info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-4 gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fuzzy search memory nodes..."
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-full font-medium text-slate-700"
              />
            </div>
            {recallText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold rounded-xl flex items-center gap-1.5"
              >
                <Brain className="w-3 h-3 animate-pulse" />
                {recallText}
              </motion.div>
            )}
          </div>

          {/* CANVAS GRAPH BOX */}
          <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[380px]">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Network className="w-6 h-6 animate-spin text-blue-500" />
                <span className="font-mono">Loading telemetry graph...</span>
              </div>
            ) : (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[460px]">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#CBD5E1" />
                  </marker>
                  <marker id="arrow-highlighted" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#6366F1" />
                  </marker>
                </defs>

                {/* Draw Edges */}
                <g>
                  {edges.map((edge) => {
                    const start = coordsMap[edge.source];
                    const end = coordsMap[edge.target];
                    if (!start || !end) return null;

                    const isSourceSelected = selectedNode?.id === edge.source;
                    const isTargetSelected = selectedNode?.id === edge.target;
                    const isHighlighted = activeHighlightedIds.includes(edge.source) && activeHighlightedIds.includes(edge.target);

                    let strokeColor = 'stroke-slate-200/40';
                    let strokeWidth = 'stroke-1';
                    let marker = 'url(#arrow)';

                    if (isHighlighted || isSourceSelected || isTargetSelected) {
                      strokeColor = 'stroke-indigo-500';
                      strokeWidth = 'stroke-[2px]';
                      marker = 'url(#arrow-highlighted)';
                    }

                    const opacity = isAnySelected || isRecalling
                      ? (isSourceSelected || isTargetSelected || (isRecalling && isHighlighted)) ? 1 : 0.08
                      : 1;

                    return (
                      <g key={edge.id} className="transition-opacity duration-300" style={{ opacity }}>
                        <line
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          className={`${strokeColor} ${strokeWidth} transition-all duration-300`}
                          markerEnd={marker}
                          strokeDasharray={isHighlighted ? "4 2" : undefined}
                        />
                        {(isHighlighted || isSourceSelected || isTargetSelected) && (
                          <text
                            x={(start.x + end.x) / 2}
                            y={(start.y + end.y) / 2 - 4}
                            className="fill-indigo-600 font-mono text-[8px] font-bold pointer-events-none"
                            textAnchor="middle"
                          >
                            {getEdgeRelationshipLabel(edge.relationship)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Draw Nodes */}
                <g>
                  {nodes.map((node) => {
                    const coord = coordsMap[node.id];
                    if (!coord) return null;

                    const isSelected = selectedNode?.id === node.id;
                    const isHighlighted = activeHighlightedIds.includes(node.id);
                    const styles = getNodeStyles(node.type, isHighlighted);
                    
                    const opacity = (isAnySelected || isRecalling)
                      ? isHighlighted ? 1 : 0.2
                      : 1;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${coord.x}, ${coord.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer group transition-opacity duration-300"
                        style={{ opacity }}
                      >
                        {/* Selected Node Glow Pulse Ring */}
                        {isSelected && (
                          <circle
                            r={styles.r + 8}
                            className="fill-none stroke-blue-500/30 stroke-[3px] animate-ping"
                          />
                        )}

                        {/* Hover Ring */}
                        <circle
                          r={styles.r + 5}
                          className="fill-indigo-50/20 stroke-none group-hover:scale-110 transition-transform duration-300 opacity-0 group-hover:opacity-100"
                        />

                        {/* Center Circle */}
                        <circle
                          r={styles.r}
                          className={`${styles.color} ${isSelected ? 'stroke-slate-900 stroke-[3px]' : 'stroke-white stroke-2'} transition-all duration-300 drop-shadow-sm`}
                        />

                        {/* Letter Icon */}
                        <text
                          dy=".3em"
                          className="fill-white font-mono text-[9px] font-extrabold pointer-events-none"
                          textAnchor="middle"
                        >
                          {node.type === 'workspace' ? '★' : node.label.charAt(0).toUpperCase()}
                        </text>

                        {/* Label */}
                        <text
                          y={styles.r + 13}
                          className={`font-sans text-[9px] pointer-events-none transition-all ${
                            isSelected ? 'fill-slate-900 font-extrabold' : 'fill-slate-500 font-semibold'
                          }`}
                          textAnchor="middle"
                        >
                          {node.label.length > 14 ? node.label.substring(0, 14) + '...' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* Float Simulator Overlay: Remember */}
            <AnimatePresence>
              {rememberStep !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-4 right-4 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl max-w-xs font-mono"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-slate-100">Remember Flow Pipeline</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    {rememberTexts.slice(0, rememberStep + 1).map((text, idx) => (
                      <div key={text} className="flex items-center gap-2">
                        {idx === rememberStep && rememberStep < 3 ? (
                          <div className="w-2.5 h-2.5 rounded-full border border-t-transparent border-white animate-spin shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Float Simulator Overlay: Memify */}
            <AnimatePresence>
              {memifyActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 z-40"
                >
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-md w-full relative">
                    <button 
                      onClick={() => setMemifyActive(false)}
                      className="absolute right-4 top-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-50">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                        <Layers className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Cognee Memification Pipeline</h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Automated context stitching algorithm.</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      ✨ AI successfully consolidated <strong>24 raw Slack discussions</strong> surrounding architecture choices into 1 structured, high-relevance decision.
                    </p>

                    <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 font-mono text-[10px] text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-purple-100 text-purple-700 rounded-md font-bold">RAW</span>
                        <span>24 conversational fragments from #tech-stack</span>
                      </div>
                      <div className="pl-3.5 border-l border-slate-200">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 transform rotate-90 my-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-blue-100 text-blue-700 rounded-md font-bold">STITCH</span>
                        <span>Authentication & Database Decisions mapped</span>
                      </div>
                      <div className="pl-3.5 border-l border-slate-200">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 transform rotate-90 my-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md font-bold">DECIDED</span>
                        <span>"Use Supabase Auth" (Reason: Mentor spec)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMemifyActive(false)}
                      className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 text-center"
                    >
                      Acknowledge & Close Pipeline
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM TIMELINE LIGTHWEIGHT ACTIVITY logs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-extrabold text-slate-800">Memory Pipeline Activity Stream</h3>
            </div>
            <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">Cognee Ledger</span>
          </div>

          <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {activities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between p-2.5 bg-slate-50 border border-slate-100/50 rounded-xl"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`p-1 rounded-lg shrink-0 text-[9px] font-bold mt-0.5 ${
                      act.type === 'Remembered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      act.type === 'Memified' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      act.type === 'Recalled' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {act.type}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 leading-normal">{act.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{act.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE DETAILED COGNITIVE INSPECTOR */}
      <div className="w-full lg:w-85 bg-white border-l border-slate-100 p-6 h-full overflow-y-auto flex flex-col shadow-sm">
        <AnimatePresence mode="wait">
          {enriched ? (
            <motion.div
              key={enriched.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              {/* Type and Name */}
              <div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase border ${getNodeStyles(enriched.type, true).bg}`}>
                  {enriched.type} Node
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-3 leading-snug">{enriched.label}</h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ID: {enriched.id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pb-3 border-b border-slate-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Description</span>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{enriched.description}</p>
              </div>

              {/* Node Metadata Parameters */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-b border-slate-50 pb-3">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Source Stream</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{enriched.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Index Creator</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{enriched.creator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Indexed Timestamp</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{enriched.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Confidence Score</span>
                  <span className="text-emerald-600 font-bold mt-0.5 block">{enriched.confidenceScore}%</span>
                </div>
              </div>

              {/* AI Insight Summaries */}
              <div className="space-y-2 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold text-slate-700 uppercase font-mono tracking-wider">AI Memory Summary</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{enriched.aiSummary}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-mono block uppercase font-bold text-[8px]">AI Decision Logic</span>
                  <p className="text-slate-500 mt-0.5 leading-normal">{enriched.reasoning}</p>
                </div>
              </div>

              {/* Related Connected Entities */}
              <div className="space-y-3 pb-3 border-b border-slate-50 text-[10px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Connected Entities</span>
                
                <div className="space-y-2 font-mono">
                  {/* Documents */}
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[8px] block">Documents ({connectedDocs.length})</span>
                      {connectedDocs.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connectedDocs.map(d => (
                            <span key={d.id} className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[8px] font-bold">{d.label}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 mt-0.5 block text-[9px]">No related files indexed.</span>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[8px] block">Tasks ({connectedTasks.length})</span>
                      {connectedTasks.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connectedTasks.map(t => (
                            <span key={t.id} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[8px] font-bold">{t.label}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 mt-0.5 block text-[9px]">No associated tasks.</span>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-start gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[8px] block">Team Members ({connectedMembers.length})</span>
                      {connectedMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connectedMembers.map(m => (
                            <span key={m.id} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[8px] font-bold">{m.label}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 mt-0.5 block text-[9px]">No linked assignees.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* COGNEE LIFECYCLE SUB-CARD */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Database className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">🧠 Memory Lifecycle</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Pipeline Status</span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold text-[9px]">
                      {enriched.lifecycleStatus === 'Remembered' && '✅ Remembered'}
                      {enriched.lifecycleStatus === 'Memified' && '✨ Memified'}
                      {enriched.lifecycleStatus === 'Recalled' && '🔍 Recalled'}
                      {enriched.lifecycleStatus === 'Forgotten' && '🗑 Forgotten'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Forgotten</span>
                    <span className="font-extrabold text-slate-700 mt-1 block">{enriched.lifecycleForgotten}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 block uppercase font-bold text-[8px] mb-0.5">Telemetry Origin</span>
                    <span className="text-slate-600 font-bold leading-normal block">{enriched.lifecycleSource}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 block uppercase font-bold text-[8px] mb-0.5">Memification Step</span>
                    <span className="text-slate-500 leading-relaxed block">{enriched.lifecycleConverted}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 block uppercase font-bold text-[8px] mb-0.5">Retrieve Counter</span>
                    <span className="text-slate-600 font-bold block">
                      Recalled <span className="text-indigo-600 font-extrabold">{enriched.lifecycleRecalls} times</span> in AI chats.
                    </span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE ACTION PANEL */}
              <div className="space-y-2.5 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">AI Memory Operations</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleAction('remember')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-100 hover:border-emerald-200 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Remember Again
                  </button>
                  <button 
                    onClick={() => handleAction('memify')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-100 hover:border-purple-200 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Memify Node
                  </button>
                  <button 
                    onClick={() => handleAction('refresh')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-blue-50 hover:text-[#0066FF] text-slate-600 border border-slate-100 hover:border-blue-200 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Refresh Memory
                  </button>
                  <button 
                    onClick={() => handleAction('recall')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-600 border border-slate-100 hover:border-amber-200 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Brain className="w-3 h-3" />
                    Recall Related
                  </button>
                  <button 
                    onClick={() => handleAction('archive')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer col-span-2"
                  >
                    <Archive className="w-3 h-3" />
                    Archive Memory Registry
                  </button>
                  <button 
                    onClick={() => handleAction('forget')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer col-span-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Forget Memory (Admin)
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="p-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-3xl shadow-xs">
                <Brain className="w-8 h-8 animate-pulse text-indigo-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Select a Cognitive Node</span>
                <span className="text-[10px] text-slate-400 block mt-1.5 max-w-[210px] mx-auto leading-relaxed">
                  Click any node in the Cognee Memory Graph to inspect its metadata, source parameters, and execute lifecycle pipeline operations.
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOAT GENERAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 max-w-sm font-mono"
          >
            <Brain className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
