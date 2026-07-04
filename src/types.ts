export type Role = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  verified: boolean;
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  slackConnected: boolean;
  slackWorkspaceName?: string;
  slackChannels: SlackChannel[];
  members: WorkspaceMember[];
  createdAt: string;
  ownerId: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  startDate: string;
  deadline: string;
  progress: number; // 0 to 100
  comments: TaskComment[];
  createdAt: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  name: string;
  type: string; // pdf, docx, ppt, txt, readme
  size: string;
  summary: string;
  extractedInfo: {
    keyPoints: string[];
    decisions: string[];
    techStack: string[];
  };
  fileContent?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  sender: 'user' | 'ai';
  content: string;
  graphNodesReferenced?: string[];
  createdAt: string;
}

export interface Decision {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  sourceContext: string; // e.g. "Slack channel #tech-stack" or "Document architecture.pdf"
  status: 'proposed' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface MemoryNode {
  id: string;
  label: string;
  type: 'workspace' | 'task' | 'document' | 'decision' | 'member' | 'technology' | 'milestone' | 'channel';
  properties?: Record<string, any>;
}

export interface MemoryEdge {
  id: string;
  source: string;
  target: string;
  relationship: string; // ASSIGNED_TO, CONTAINS, DECIDED_ON, DISCUSSED_IN, REFERENCE_FOR
}

export interface SlackChannel {
  id: string;
  name: string;
  synced: boolean;
  messageCount: number;
  lastSyncedAt?: string;
}

export interface SlackSyncLog {
  id: string;
  channelName: string;
  senderName: string;
  message: string;
  aiResponse?: string;
  createdAt: string;
}

export interface SlackDailySummary {
  id: string;
  workspaceId: string;
  date: string;
  summary: string;
  decisions: string[];
  nextSteps: string[];
}

export interface JoinRequest {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string;
  role: string;
  skills: string[];
  intro: string;
  whyJoin: string;
  github?: string;
  linkedin?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approver?: string;
  approvedAt?: string;
  aiRecommendation?: {
    compatibilityScore: number;
    recommendedRole: string;
    projectMatch: string;
    strengths: string[];
    suggestedContribution: string;
    reason: string;
    confidence: 'Low' | 'Medium' | 'High';
  };
  createdAt: string;
}
