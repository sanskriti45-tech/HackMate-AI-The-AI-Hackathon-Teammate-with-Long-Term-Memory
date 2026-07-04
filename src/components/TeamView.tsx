import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Mail, Plus, ShieldCheck, X, Briefcase, Sparkles, Terminal, 
  CheckCircle2, AlertCircle, Github, Linkedin, Clock, UserCheck, UserX, 
  Info, ChevronRight, HelpCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, JoinRequest } from '../types';

interface TeamViewProps {
  workspace: Workspace;
  onInviteTeammate: (email: string, name: string, role: string) => Promise<void>;
  onRefreshWorkspace?: () => Promise<void>;
}

type SimulationRole = 'owner' | 'visitor';
type SubTab = 'roster' | 'requests' | 'history' | 'logs';

export default function TeamView({ workspace, onInviteTeammate, onRefreshWorkspace }: TeamViewProps) {
  // Simulation Role State: Owner (sanskritimaheshwari407@gmail.com) or Visitor
  const [roleMode, setRoleMode] = useState<SimulationRole>('owner');
  const [activeTab, setActiveTab] = useState<SubTab>('roster');

  // Existing invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);

  // States for join requests
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<JoinRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Visitor form states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Developer');
  const [formIntro, setFormIntro] = useState('');
  const [formWhy, setFormWhy] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formSkills, setFormSkills] = useState<string[]>([]);
  
  // Visitor pipeline simulation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // Rejection states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestToReject, setRequestToReject] = useState<JoinRequest | null>(null);

  // Logs stream state
  const [logs, setLogs] = useState<string[]>([
    `[09:12:00] COGNEE INITIALIZE: Loaded 15 nodes and 9 edges from db.json.`,
    `[10:00:15] COGNEE WRITE: Created candidate node "Siddharth Sen (Applicant)"`,
    `[10:00:16] COGNEE EDGE: Connected "Siddharth Sen" -[DISCUSSED_IN]-> "${workspace.id}"`,
    `[10:00:18] GEMINI ASSISTANT: Scanned resume of Siddharth Sen. Compatibility Score: 97%`,
    `[11:15:30] COGNEE WRITE: Created candidate node "Ananya Roy (Applicant)"`,
    `[11:15:32] COGNEE EDGE: Connected "Ananya Roy" -[DISCUSSED_IN]-> "${workspace.id}"`,
    `[11:15:35] GEMINI ASSISTANT: Scanned resume of Ananya Roy. Compatibility Score: 82%`,
    `[18:00:00] TEAM LEADER: Approved Siddharth Sen join request.`,
    `[18:00:01] COGNEE UPDATE: Upgraded Siddharth Sen node from (Applicant) to active (member)`,
    `[18:00:02] COGNEE EDGE: Added "Siddharth Sen" -[ASSIGNED_TO]-> "${workspace.id}"`,
    `[19:30:00] TEAM LEADER: Rejected Ananya Roy join request.`,
    `[19:30:01] COGNEE UPDATE: Marked Ananya Roy node status as REJECTED`,
    `[19:30:02] COGNEE WRITE: Recorded decision node "Rejected Ananya Roy" with reason.`
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Available skills tags
  const skillsList = ['Frontend', 'Backend', 'AI/ML', 'UI/UX', 'DevOps', 'Product Management', 'Data Engineering'];

  // Add a log message
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch join requests
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      // Fetch pending
      const pendingRes = await fetch(`/api/join-requests?workspaceId=${workspace.id}`);
      const pendingData = await pendingRes.json();
      setPendingRequests(pendingData.joinRequests || []);
      
      if (pendingData.joinRequests && pendingData.joinRequests.length > 0) {
        setSelectedRequest(pendingData.joinRequests[0]);
      } else {
        setSelectedRequest(null);
      }

      // Fetch all history
      const historyRes = await fetch(`/api/join-history?workspaceId=${workspace.id}`);
      const historyData = await historyRes.json();
      setHistoryRequests(historyData.joinRequests || []);
    } catch (e) {
      console.error("Error fetching join requests", e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [workspace.id]);

  // Handle standard teammate invite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setInviteLoading(true);
    try {
      await onInviteTeammate(inviteEmail, inviteName, inviteRole);
      addLog(`MEMBER INVITED: Invited "${inviteName}" as ${inviteRole}.`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('member');
      setShowInviteModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setInviteLoading(false);
    }
  };

  // Toggle skills checkbox
  const toggleSkill = (skill: string) => {
    setFormSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Submit join request as visitor
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setIsSubmitting(true);
    setPipelineStep(0);

    const steps = [
      "Validating input credentials...",
      "Simulating Cognee cognitive write logic: Mapping Applicant Node...",
      "Invoking Gemini 3.5 Flash: Evaluating resume & matching target milestones...",
      "Cognee Edge resolution: Connecting applicant -[DISCUSSED_IN]-> workspace...",
      "Request published successfully!"
    ];

    // Pipeline step simulation
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPipelineStep(i + 1);
      if (i === 1) {
        addLog(`COGNEE WRITE: Generated candidate memory node "${formName} (Applicant)".`);
      } else if (i === 2) {
        addLog(`GEMINI MODEL: Analyzing compatibilities for applicant "${formName}"...`);
      } else if (i === 3) {
        addLog(`COGNEE EDGE: Created relationship "${formName}" -[DISCUSSED_IN]-> "${workspace.id}".`);
      }
    }

    try {
      const res = await fetch('/api/join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          fullName: formName,
          email: formEmail,
          role: formRole,
          skills: formSkills,
          intro: formIntro,
          whyJoin: formWhy,
          github: formGithub,
          linkedin: formLinkedin
        })
      });

      if (res.ok) {
        addLog(`SUCCESS: Join request for "${formName}" successfully written.`);
        
        // Clear forms
        setFormName('');
        setFormEmail('');
        setFormIntro('');
        setFormWhy('');
        setFormGithub('');
        setFormLinkedin('');
        setFormSkills([]);
        
        // Refresh requests lists
        await fetchRequests();
        if (onRefreshWorkspace) await onRefreshWorkspace();
        
        // Close modal and switch role so they can immediately see the pending request
        setShowJoinModal(false);
        setRoleMode('owner');
        setActiveTab('requests');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve a request
  const handleApprove = async (request: JoinRequest) => {
    try {
      addLog(`APPROVING: Processing join request for "${request.fullName}"...`);
      const res = await fetch(`/api/join-request/${request.id}/approve`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`SUCCESS: Approved "${request.fullName}". Member successfully merged with Workspace roster.`);
        addLog(`COGNEE MEMORY: Upgraded node "${request.fullName}" from Applicant status to active Member.`);
        addLog(`COGNEE EDGE: Created relationship "${request.fullName}" -[ASSIGNED_TO]-> "${workspace.id}".`);
        
        await fetchRequests();
        if (onRefreshWorkspace) await onRefreshWorkspace();
      }
    } catch (e) {
      console.error("Error approving request", e);
    }
  };

  // Initiate Reject Dialog
  const handleRejectClick = (request: JoinRequest) => {
    setRequestToReject(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Submit Rejection
  const handleRejectSubmit = async () => {
    if (!requestToReject) return;
    try {
      addLog(`REJECTING: Processing join rejection for "${requestToReject.fullName}"...`);
      const res = await fetch(`/api/join-request/${requestToReject.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) {
        addLog(`REJECTED: Rejection processed successfully. Reason recorded: "${rejectionReason || 'No explanation provided.'}"`);
        addLog(`COGNEE WRITE: Created decision event node "Rejected ${requestToReject.fullName}".`);
        
        setShowRejectModal(false);
        setRequestToReject(null);
        setRejectionReason('');
        await fetchRequests();
        if (onRefreshWorkspace) await onRefreshWorkspace();
      }
    } catch (e) {
      console.error("Error rejecting request", e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-[9px] text-green-600 font-mono font-semibold bg-green-50/50 border border-green-200 py-0.5 px-2 rounded-full uppercase">Approved</span>;
      case 'rejected':
        return <span className="text-[9px] text-red-600 font-mono font-semibold bg-red-50/50 border border-red-200 py-0.5 px-2 rounded-full uppercase">Rejected</span>;
      default:
        return <span className="text-[9px] text-amber-600 font-mono font-semibold bg-amber-50/50 border border-amber-200 py-0.5 px-2 rounded-full uppercase">Pending</span>;
    }
  };

  return (
    <div id="team-view-container" className="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#F5F5F5] min-h-[calc(100vh-4rem)] relative">
      
      {/* SIMULATION ROLE CONTROLLER */}
      <div id="simulation-role-controller" className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-gray-800">HackMate AI Simulator Context</span>
            <p className="text-[10px] text-gray-400 font-mono">Simulate user journeys to test the Cognee memory pipeline.</p>
          </div>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full sm:w-auto">
          <button
            onClick={() => {
              setRoleMode('owner');
              setActiveTab('roster');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              roleMode === 'owner' 
                ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/10' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Owner (sanskritimaheshwari407@gmail.com)
          </button>
          <button
            onClick={() => {
              setRoleMode('visitor');
              setActiveTab('roster');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              roleMode === 'visitor' 
                ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/10' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            External Visitor (Applicant)
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER FOR OWNER */}
      {roleMode === 'owner' && pendingRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50/80 border border-blue-100/50 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-100/80 p-2.5 rounded-2xl text-blue-600 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900">🔔 Join Requests Requiring Review</h4>
              <p className="text-[11px] text-blue-700/80 mt-1">
                There are <span className="font-extrabold text-blue-900">{pendingRequests.length} pending join request(s)</span> for this workspace. 
                Our Cognee + Gemini compatibility pipeline graded candidate <span className="font-extrabold text-blue-900">"{pendingRequests[0].fullName}"</span> with a score of <span className="font-extrabold text-blue-900">{pendingRequests[0].aiRecommendation?.compatibilityScore}%</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] shrink-0"
          >
            Review Request
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* TOP HEADER SECTION */}
      <div id="team-view-header" className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Workspace Assembly Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {roleMode === 'owner' 
              ? 'Review team rosters, manage pending join requests, inspect AI grading, and review Cognee memory edges.'
              : 'Submit a join request, preview team members, and check out Cognee logging streams.'
            }
          </p>
        </div>

        {/* SUB VIEW TABS */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-[10px] font-bold rounded-xl font-mono uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'roster' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            👥 Team Roster
          </button>
          
          {roleMode === 'owner' && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-[10px] font-bold rounded-xl font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'requests' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              📩 Join Requests
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-sans font-extrabold animate-bounce">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}

          {roleMode === 'owner' && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-[10px] font-bold rounded-xl font-mono uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'history' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              📜 History
            </button>
          )}

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-[10px] font-bold rounded-xl font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            🧠 Cognee Logs
          </button>
        </div>
      </div>

      {/* --- RENDER VIEW CHUNKS --- */}

      {/* 1. TAB: ROSTER */}
      {activeTab === 'roster' && (
        <div id="subtab-roster-content" className="space-y-6">
          {/* VISITOR JOIN BANNER */}
          {roleMode === 'visitor' && (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono w-fit">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                  Building something epic?
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">Want to build with Team {workspace.name}?</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Join our fast-paced hackathon workspace. Click below to submit your details. 
                  Our Cognee + Gemini AI pipeline evaluates all applicant files and maps them directly 
                  to current team requirements in real-time.
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-1.5 px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 text-xs font-black rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  Request to Join Workspace
                </button>
              </div>
            </div>
          )}

          {/* TEAM Roster Title */}
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">Workspace Members ({workspace.members.length})</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Active participants registered in this hack space.</p>
            </div>
            {roleMode === 'owner' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[10.5px] font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                Invite Teammate
              </button>
            )}
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspace.members.map((member) => (
              <div key={member.userId} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:scale-[1.01]">
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} 
                  alt={member.name} 
                  className="w-12 h-12 rounded-full border border-gray-100 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{member.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5 truncate">{member.email}</span>
                  
                  <div className="mt-3 flex items-center gap-1 text-[9px] text-[#0066FF] font-mono font-semibold bg-blue-50/50 border border-blue-100/30 py-0.5 px-2 rounded-full w-fit uppercase">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TAB: JOIN REQUESTS */}
      {activeTab === 'requests' && roleMode === 'owner' && (
        <div id="subtab-requests-content" className="space-y-6">
          {requestsLoading ? (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400 font-mono text-[11px] gap-2">
              <Plus className="w-5 h-5 animate-spin text-blue-500" />
              <span>Scanning requests database...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <div className="bg-blue-50/50 p-4 rounded-full w-14 h-14 flex items-center justify-center text-blue-500 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-sm font-bold text-gray-800">Roster Requests Clean!</h3>
                <p className="text-xs text-gray-400">All submitted requests have been reviewed. Nice job keeping the pipeline empty!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* REQUESTS LIST - LEFT (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">Candidate Feed ({pendingRequests.length})</span>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 border rounded-3xl cursor-pointer text-left transition-all duration-200 ${
                        selectedRequest?.id === req.id
                          ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-md shadow-blue-500/10'
                          : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold leading-snug">{req.fullName}</h4>
                          <p className={`text-[9px] font-mono mt-0.5 ${selectedRequest?.id === req.id ? 'text-blue-100' : 'text-gray-400'}`}>
                            {req.email}
                          </p>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          selectedRequest?.id === req.id
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {req.role}
                        </span>
                      </div>
                      
                      {/* Skills listed */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {req.skills.slice(0, 3).map(skill => (
                          <span key={skill} className={`text-[8px] px-1.5 py-0.5 rounded-md ${
                            selectedRequest?.id === req.id
                              ? 'bg-white/15 text-white/90'
                              : 'bg-gray-50 text-gray-500'
                          }`}>
                            {skill}
                          </span>
                        ))}
                        {req.skills.length > 3 && (
                          <span className={`text-[8px] font-bold ${selectedRequest?.id === req.id ? 'text-blue-200' : 'text-gray-400'}`}>
                            +{req.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DETAILS & AI RECOMMENDATIONS CARD - RIGHT (7 COLS) */}
              <div className="lg:col-span-7">
                {selectedRequest ? (
                  <div className="space-y-6">
                    <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">Candidate Evaluation Profile</span>
                    
                    <div className="bg-white border border-gray-100 rounded-3xl p-6.5 shadow-sm space-y-6 text-left">
                      
                      {/* Name / Contact Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-50">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{selectedRequest.fullName}</h3>
                          <span className="text-[10.5px] text-gray-400 font-mono block mt-0.5">{selectedRequest.email}</span>
                        </div>
                        
                        {/* Social Profile Links */}
                        <div className="flex gap-2 shrink-0">
                          {selectedRequest.github && (
                            <a href={`https://${selectedRequest.github}`} target="_blank" rel="noreferrer" className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {selectedRequest.linkedin && (
                            <a href={`https://${selectedRequest.linkedin}`} target="_blank" rel="noreferrer" className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Cover Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-gray-50 p-4 rounded-2xl">
                          <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Role Requested</span>
                          <p className="text-gray-700 font-semibold">{selectedRequest.role}</p>
                        </div>
                        <div className="space-y-1 bg-gray-50 p-4 rounded-2xl">
                          <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Requested At</span>
                          <p className="text-gray-700 font-mono">{new Date(selectedRequest.createdAt).toLocaleDateString()} {new Date(selectedRequest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      {/* Candidate Statement */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Short Introduction</span>
                          <p className="text-[11px] text-gray-600 bg-gray-50 p-4 rounded-2xl leading-relaxed">{selectedRequest.intro}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Why join {workspace.name}?</span>
                          <p className="text-[11px] text-gray-600 bg-gray-50 p-4 rounded-2xl leading-relaxed">{selectedRequest.whyJoin}</p>
                        </div>
                      </div>

                      {/* Skills Badge List */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Core Capabilities</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedRequest.skills.map(skill => (
                            <span key={skill} className="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200/50 px-2.5 py-1 rounded-xl">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* --- COGNEE AI RECOMMENDATION SHIMMER BOX --- */}
                      {selectedRequest.aiRecommendation && (
                        <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/60 to-purple-50/40 border border-blue-200/50 rounded-3xl p-5 shadow-inner space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                          
                          <div className="flex justify-between items-center pb-2.5 border-b border-blue-100/50">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                              <span className="text-[10px] font-black text-indigo-950 font-mono uppercase tracking-wider">Cognee + Gemini Grading Analysis</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-[9px] font-bold text-indigo-800 font-mono bg-indigo-100 px-2 py-0.5 rounded-md">
                                Confidence: {selectedRequest.aiRecommendation.confidence}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-5">
                            
                            {/* Score circular indicator */}
                            <div className="flex flex-col items-center justify-center bg-white border border-blue-100 rounded-3xl p-4.5 shadow-sm sm:w-28 shrink-0">
                              <span className="text-2xl font-black text-indigo-600 leading-none">
                                {selectedRequest.aiRecommendation.compatibilityScore}%
                              </span>
                              <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-wider mt-1.5 leading-none">Compat Score</span>
                            </div>

                            {/* Recommendations detail */}
                            <div className="flex-1 space-y-2 text-xs">
                              <div>
                                <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider block">Recommended Assignment</span>
                                <p className="text-indigo-900 font-bold mt-0.5">{selectedRequest.aiRecommendation.recommendedRole}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                  <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-wider block">Strengths</span>
                                  <p className="text-gray-700 font-semibold text-[10.5px] mt-0.5 truncate">{selectedRequest.aiRecommendation.strengths.join(', ')}</p>
                                </div>
                                <div>
                                  <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-wider block">Proposed Contribution</span>
                                  <p className="text-gray-700 font-semibold text-[10.5px] mt-0.5 truncate">{selectedRequest.aiRecommendation.suggestedContribution}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/80 border border-blue-50 p-4 rounded-2xl text-[10.5px] text-gray-600 leading-relaxed">
                            <span className="text-[8px] font-bold text-gray-400 uppercase font-mono tracking-wider block mb-1">Compatibility Verdict</span>
                            {selectedRequest.aiRecommendation.reason}
                          </div>

                        </div>
                      )}

                      {/* DECISION ACTION CONTROLS */}
                      <div className="flex gap-3 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => handleRejectClick(selectedRequest)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98]"
                        >
                          <UserX className="w-4 h-4 text-red-500" />
                          Reject Request
                        </button>
                        <button
                          onClick={() => handleApprove(selectedRequest)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98]"
                        >
                          <UserCheck className="w-4 h-4 text-white" />
                          Approve Candidate
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    Please select a request from the list to preview details.
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* 3. TAB: REQUEST HISTORY */}
      {activeTab === 'history' && roleMode === 'owner' && (
        <div id="subtab-history-content" className="space-y-4">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block text-left">Previous Workspace Requests</span>
          
          {historyRequests.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-2 shadow-sm">
              <p className="text-xs text-gray-400">No requests in history database yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Timestamp</th>
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Applicant</th>
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Role</th>
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Status</th>
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Processed By</th>
                      <th className="p-4 font-bold text-gray-400 uppercase tracking-wider font-mono text-[9px]">Feedback / Rejection Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historyRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-800">{req.fullName}</span>
                            <span className="block text-[10px] text-gray-400 font-mono">{req.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10.5px] text-gray-600">{req.role}</td>
                        <td className="p-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                        <td className="p-4 font-mono text-[11px] text-gray-500">{req.approver || 'system'}</td>
                        <td className="p-4 text-gray-500 text-[11px] max-w-xs truncate">
                          {req.status === 'rejected' ? req.rejectionReason : 'Successfully added to team'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: TERMINAL LOGS */}
      {activeTab === 'logs' && (
        <div id="subtab-logs-content" className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">Cognee Memory Logs Terminal</span>
            <button
              onClick={() => setLogs([])}
              className="text-[9px] font-mono font-bold text-[#0066FF] hover:underline"
            >
              Clear Buffer
            </button>
          </div>

          <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 font-mono text-[11px] text-green-400/90 shadow-2xl space-y-2 h-[450px] overflow-y-auto text-left relative scrollbar-thin">
            <div className="absolute top-3 right-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>

            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed hover:bg-white/5 px-2 py-0.5 rounded transition-colors duration-150">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* --- MODAL POPUPS --- */}

      {/* Standard Invite Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Invite Workspace Teammate</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Teammate Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all font-mono"
                >
                  <option value="member">Workspace Member</option>
                  <option value="owner">Workspace Owner</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300"
              >
                {inviteLoading ? 'Sending Invitation...' : 'Send Invitation Mail'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Request to Join Multi-step Form Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative my-8">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Submit Join Request to {workspace.name}
              </h3>
              <button 
                onClick={() => {
                  if(!isSubmitting) setShowJoinModal(false);
                }} 
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmitting ? (
              /* Pipeline Simulator Stepper */
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-gray-800">Processing Cognee API Memory Insertion...</span>
                  <p className="text-[10px] text-gray-400 font-mono">Connecting to Cognee persistent graph database & model APIs</p>
                </div>

                <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-2xl p-4 font-mono text-[10px] text-gray-500 space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className={pipelineStep >= 1 ? 'text-green-500' : 'text-gray-300 animate-pulse'}>
                      {pipelineStep >= 1 ? '✓' : '●'}
                    </span>
                    <span>Validating input credentials...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={pipelineStep >= 2 ? 'text-green-500' : 'text-gray-300 animate-pulse'}>
                      {pipelineStep >= 2 ? '✓' : '●'}
                    </span>
                    <span>Simulating Cognee memory payload generation...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={pipelineStep >= 3 ? 'text-green-500' : 'text-gray-300 animate-pulse'}>
                      {pipelineStep >= 3 ? '✓' : '●'}
                    </span>
                    <span>Invoking Gemini 3.5 compatibility grading parameters...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={pipelineStep >= 4 ? 'text-green-500' : 'text-gray-300 animate-pulse'}>
                      {pipelineStep >= 4 ? '✓' : '●'}
                    </span>
                    <span>Cognee persistent graph: Constructing member workspace edges...</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Actual form inputs */
              <form onSubmit={handleJoinSubmit} className="space-y-5 mt-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Desired Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm font-mono"
                    >
                      <option value="Developer">Developer</option>
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Designer">Designer</option>
                      <option value="Product Lead">Product Lead</option>
                      <option value="DevOps Specialist">DevOps Specialist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Skills (Select Core Tags)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-[9px] px-2 py-1 rounded-xl border transition-all duration-150 ${
                            formSkills.includes(skill)
                              ? 'bg-[#0066FF] border-[#0066FF] text-white'
                              : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Short Introduction</label>
                  <textarea
                    value={formIntro}
                    onChange={(e) => setFormIntro(e.target.value)}
                    placeholder="Provide a quick snapshot of your professional/hackathon background..."
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all h-16"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Why do you want to join this project?</label>
                  <textarea
                    value={formWhy}
                    onChange={(e) => setFormWhy(e.target.value)}
                    placeholder="How can your skills fuel our current Cognee persistent memory roadmap?"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all h-16"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">GitHub Profile (Optional)</label>
                    <input
                      type="text"
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      placeholder="github.com/your-username"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">LinkedIn Profile (Optional)</label>
                    <input
                      type="text"
                      value={formLinkedin}
                      onChange={(e) => setFormLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/your-username"
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3.5 bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-500/10"
                  >
                    Submit Join Proposal
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Reject Custom Feedback Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Reject Join Proposal
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <p className="text-xs text-gray-500">
                Are you sure you want to decline <span className="font-bold text-gray-800">"{requestToReject?.fullName}"</span>'s join request? 
                Please enter a constructive reason to submit back into Cognee's request logs and history.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Current milestone needs immediate backend developers. We will keep you registered for future design tasks."
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 h-24"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-150 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-500/10"
                >
                  Decline Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
