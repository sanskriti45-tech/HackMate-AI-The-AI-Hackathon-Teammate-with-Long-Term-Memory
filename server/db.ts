import fs from 'fs';
import path from 'path';
import { 
  User, Workspace, Task, Document, ChatMessage, Decision, ActivityLog, 
  MemoryNode, MemoryEdge, SlackChannel, SlackSyncLog, SlackDailySummary,
  JoinRequest
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  tasks: Task[];
  documents: Document[];
  chatMessages: ChatMessage[];
  decisions: Decision[];
  activityLogs: ActivityLog[];
  memoryNodes: MemoryNode[];
  memoryEdges: MemoryEdge[];
  slackSyncLogs: SlackSyncLog[];
  slackDailySummaries: SlackDailySummary[];
  joinRequests: JoinRequest[];
}

const DEFAULT_MEMBERS = [
  { userId: 'sarah_jenkins', name: 'Sarah Jenkins', email: 'sarah@hackmate.ai', role: 'admin' as const, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { userId: 'alex_rivera', name: 'Alex Rivera', email: 'alex@hackmate.ai', role: 'member' as const, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { userId: 'maya_lin', name: 'Maya Lin', email: 'maya@hackmate.ai', role: 'member' as const, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' }
];

function getInitialData(): DatabaseSchema {
  return {
    users: [],
    workspaces: [
      {
        id: 'ws-core',
        name: 'HackMate AI Devs',
        description: 'Building the future of team memory graphs inside Slack.',
        slackConnected: true,
        slackWorkspaceName: 'HackMate AI Slack',
        createdAt: new Date().toISOString(),
        ownerId: 'user-default',
        members: [
          {
            userId: 'user-default',
            name: 'Default User',
            email: 'user@hackmate.ai',
            role: 'owner',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          },
          ...DEFAULT_MEMBERS
        ],
        slackChannels: [
          { id: 'chan-gen', name: 'general', synced: true, messageCount: 142, lastSyncedAt: new Date().toISOString() },
          { id: 'chan-tech', name: 'tech-stack', synced: true, messageCount: 88, lastSyncedAt: new Date().toISOString() },
          { id: 'chan-design', name: 'design-assets', synced: false, messageCount: 12 },
          { id: 'chan-marketing', name: 'marketing', synced: false, messageCount: 5 }
        ]
      },
      {
        id: 'ws-isro',
        name: 'ISRO Hackathon',
        description: 'Developing real-time telemetry algorithms and multi-satellite trajectory trackers.',
        slackConnected: false,
        slackWorkspaceName: 'ISRO Telemetry Slack',
        createdAt: new Date().toISOString(),
        ownerId: 'user-default',
        members: [
          {
            userId: 'user-default',
            name: 'Default User',
            email: 'user@hackmate.ai',
            role: 'owner',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          },
          ...DEFAULT_MEMBERS
        ],
        slackChannels: [
          { id: 'chan-isro-gen', name: 'general', synced: true, messageCount: 94, lastSyncedAt: new Date().toISOString() },
          { id: 'chan-isro-orbit', name: 'orbital-math', synced: false, messageCount: 45 }
        ]
      },
      {
        id: 'ws-slack-ai',
        name: 'Slack AI Team',
        description: 'Leveraging large language models for natural language knowledge graphs inside Slack streams.',
        slackConnected: true,
        slackWorkspaceName: 'Slack AI Enterprise',
        createdAt: new Date().toISOString(),
        ownerId: 'user-default',
        members: [
          {
            userId: 'user-default',
            name: 'Default User',
            email: 'user@hackmate.ai',
            role: 'owner',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          },
          ...DEFAULT_MEMBERS
        ],
        slackChannels: [
          { id: 'chan-slack-gen', name: 'general', synced: true, messageCount: 120, lastSyncedAt: new Date().toISOString() },
          { id: 'chan-slack-nlp', name: 'nlp-pipeline', synced: true, messageCount: 78, lastSyncedAt: new Date().toISOString() }
        ]
      },
      {
        id: 'ws-design-sprint',
        name: 'Design Sprint',
        description: 'Rapid prototyping of next-gen interactive glassmorphism UI interfaces and sleek micro-interactions.',
        slackConnected: false,
        slackWorkspaceName: 'Design Sprint Slack',
        createdAt: new Date().toISOString(),
        ownerId: 'user-default',
        members: [
          {
            userId: 'user-default',
            name: 'Default User',
            email: 'user@hackmate.ai',
            role: 'owner',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          },
          ...DEFAULT_MEMBERS
        ],
        slackChannels: [
          { id: 'chan-design-gen', name: 'general', synced: true, messageCount: 60, lastSyncedAt: new Date().toISOString() },
          { id: 'chan-design-boards', name: 'moodboards', synced: false, messageCount: 30 }
        ]
      }
    ],
    tasks: [
      {
        id: 'task-1',
        workspaceId: 'ws-core',
        title: 'Design System & Glassmorphism UI',
        description: 'Create a high-fidelity glassmorphic design theme with light background panels, blue accent colors, elastic transitions, and circular micro-animations inspired by Linear.',
        status: 'done',
        priority: 'high',
        assigneeId: 'sarah_jenkins',
        startDate: '2026-07-01',
        deadline: '2026-07-03',
        progress: 100,
        comments: [
          {
            id: 'tc-1',
            userId: 'sarah_jenkins',
            userName: 'Sarah Jenkins',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
            content: 'Finished the design assets in Figma and exported them! Integrating them with Tailwind CSS now.',
            createdAt: '2026-07-02T14:30:00Z'
          },
          {
            id: 'tc-2',
            userId: 'alex_rivera',
            userName: 'Alex Rivera',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
            content: 'This layout looks super clean and premium. Perfect match for the mood guidelines!',
            createdAt: '2026-07-02T16:15:00Z'
          }
        ],
        createdAt: '2026-07-01T09:00:00Z'
      },
      {
        id: 'task-2',
        workspaceId: 'ws-core',
        title: 'Set up Cognee Memory Graph & Node schemas',
        description: 'Define cognitive architecture with schemas for Tasks, Documents, and Decisions. Ensure proper node relationship mapping.',
        status: 'in_progress',
        priority: 'high',
        assigneeId: 'alex_rivera',
        startDate: '2026-07-02',
        deadline: '2026-07-05',
        progress: 60,
        comments: [
          {
            id: 'tc-3',
            userId: 'alex_rivera',
            userName: 'Alex Rivera',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
            content: 'Mapped the entities: Workspace -> has_member -> User, Document -> references -> Technology, Decision -> made_in -> SlackChannel.',
            createdAt: '2026-07-03T10:00:00Z'
          }
        ],
        createdAt: '2026-07-02T10:00:00Z'
      },
      {
        id: 'task-3',
        workspaceId: 'ws-core',
        title: 'Integrate Gemini API with Slack Webhooks',
        description: 'Build a server-side route that listens to Slack events, extracts queries with `@HackMate`, retrieves background context from Cognee memory, and responds directly inside the Slack thread.',
        status: 'todo',
        priority: 'medium',
        assigneeId: 'user-default',
        startDate: '2026-07-03',
        deadline: '2026-07-06',
        progress: 0,
        comments: [],
        createdAt: '2026-07-03T11:00:00Z'
      },
      {
        id: 'task-4',
        workspaceId: 'ws-core',
        title: 'Extract Entities & Build Relational Graph',
        description: 'Leverage Gemini 3.5 Flash for natural language processing on chat logs to identify technical decisions, assign tasks, and populate Cognee knowledge graph automatically.',
        status: 'review',
        priority: 'medium',
        assigneeId: 'maya_lin',
        startDate: '2026-07-02',
        deadline: '2026-07-04',
        progress: 90,
        comments: [
          {
            id: 'tc-4',
            userId: 'maya_lin',
            userName: 'Maya Lin',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
            content: 'Entity extraction working with 94% accuracy. Ready to review on pull request #4.',
            createdAt: '2026-07-03T20:00:00Z'
          }
        ],
        createdAt: '2026-07-02T15:00:00Z'
      },
      {
        id: 'task-isro-1',
        workspaceId: 'ws-isro',
        title: 'Optimize Space Telemetry Parser Algorithm',
        description: 'Improve JSON telemetry streaming parsing efficiency from 250ms to sub-10ms for multi-satellite coordinate arrays.',
        status: 'in_progress',
        priority: 'high',
        assigneeId: 'sarah_jenkins',
        startDate: '2026-07-02',
        deadline: '2026-07-05',
        progress: 45,
        comments: [],
        createdAt: '2026-07-02T10:00:00Z'
      },
      {
        id: 'task-isro-2',
        workspaceId: 'ws-isro',
        title: 'Calibrate Orbital Trajectory Vectors',
        description: 'Verify 3D coordinates using Keplerian elements and update satellite orbital edges in the central telemetry graph.',
        status: 'todo',
        priority: 'medium',
        assigneeId: 'alex_rivera',
        startDate: '2026-07-04',
        deadline: '2026-07-07',
        progress: 0,
        comments: [],
        createdAt: '2026-07-03T12:00:00Z'
      },
      {
        id: 'task-slack-1',
        workspaceId: 'ws-slack-ai',
        title: 'Optimize NLP Semantic Thread Chunker',
        description: 'Develop custom heuristic overlap patterns for high-frequency Slack channels to avoid context leakage in summarization.',
        status: 'in_progress',
        priority: 'high',
        assigneeId: 'maya_lin',
        startDate: '2026-07-03',
        deadline: '2026-07-06',
        progress: 75,
        comments: [],
        createdAt: '2026-07-03T09:00:00Z'
      },
      {
        id: 'task-slack-2',
        workspaceId: 'ws-slack-ai',
        title: 'Interactive Slack Slash Commands Layout',
        description: 'Design beautiful block-kit layout templates for displaying the current Cognee memory graph directly in-channel.',
        status: 'done',
        priority: 'low',
        assigneeId: 'sarah_jenkins',
        startDate: '2026-07-01',
        deadline: '2026-07-03',
        progress: 100,
        comments: [],
        createdAt: '2026-07-01T15:00:00Z'
      },
      {
        id: 'task-design-1',
        workspaceId: 'ws-design-sprint',
        title: 'Animate Workspace Switcher Dropdown',
        description: 'Build a premium interactive workspace picker using Framer Motion with ease-in-out scaling, rotation, and spring physics.',
        status: 'done',
        priority: 'high',
        assigneeId: 'sarah_jenkins',
        startDate: '2026-07-03',
        deadline: '2026-07-04',
        progress: 100,
        comments: [],
        createdAt: '2026-07-03T08:00:00Z'
      },
      {
        id: 'task-design-2',
        workspaceId: 'ws-design-sprint',
        title: 'Glassmorphic Sidebar Overhaul',
        description: 'Apply ultra-modern translucent visual backdrops and custom micro-interactions to navigation toggles.',
        status: 'in_progress',
        priority: 'medium',
        assigneeId: 'maya_lin',
        startDate: '2026-07-03',
        deadline: '2026-07-05',
        progress: 30,
        comments: [],
        createdAt: '2026-07-03T11:00:00Z'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        workspaceId: 'ws-core',
        name: 'Architecture Specification.md',
        type: 'md',
        size: '12.4 KB',
        summary: 'Technical architecture specification of the HackMate AI workspace platform, describing the data sync flow and Cognitive memory pipeline.',
        extractedInfo: {
          keyPoints: [
            'Express server serves as the full-stack routing controller and hosts static production files.',
            'Gemini 3.5 Flash handles automated summary generation, document analysis, and conversational assistant features.',
            'Cognee acts as the primary cognitive memory layer mapping relationships between documents, decisions, and tasks.',
            'Slack synchronization listens for channel logs and parses keywords for instant relational graph updates.'
          ],
          decisions: [
            'Approved: Use Express and Vite Dev Middleware instead of dual server setup to streamline container resources.',
            'Approved: Implement local storage JSON fallback for immediate reliability before migrating to persistent database.'
          ],
          techStack: ['Express', 'TypeScript', 'React', 'Tailwind CSS', 'Gemini API', 'Cognee', 'Framer Motion']
        },
        createdAt: '2026-07-02T09:12:00Z'
      },
      {
        id: 'doc-2',
        workspaceId: 'ws-core',
        name: 'Pitch Deck Outline.pdf',
        type: 'pdf',
        size: '4.8 MB',
        summary: 'Strategic presentation deck framing HackMate AI as a key teammate for high-performance engineering groups to minimize knowledge loss.',
        extractedInfo: {
          keyPoints: [
            'Teams lose up to 30% of critical decisions in high-velocity projects due to fragmented Slack discussions.',
            'Onboarding new developers takes days instead of seconds due to outdated documentation.',
            'HackMate AI offers cognitive thread stitching, providing zero-effort instant onboarding.'
          ],
          decisions: [
            'Proposed: Charge $15/user/month for professional plans.'
          ],
          techStack: ['Figma', 'Slack SDK']
        },
        createdAt: '2026-07-03T14:45:00Z'
      }
    ],
    chatMessages: [
      {
        id: 'msg-1',
        workspaceId: 'ws-core',
        sender: 'user',
        content: 'Why did we decide to use Express instead of FastAPI for our backend?',
        createdAt: '2026-07-04T01:30:00Z'
      },
      {
        id: 'msg-2',
        workspaceId: 'ws-core',
        sender: 'ai',
        content: 'Based on the discussion yesterday in Slack channel **#tech-stack** and the **Architecture Specification.md** document, we chose **Express** instead of FastAPI because:\n\n1. It allows us to integrate **Vite Development Middleware** directly into a single unified Express server running on port `3000`, bypassing complex CORS setups.\n2. Native Node.js supports TypeScript type stripping in our dev environment seamlessly.\n3. It simplifies full-stack container builds on Cloud Run.\n\nI have retrieved this decision from our **Cognee memory graph** where it is linked to the `#tech-stack` channel and task `Set up Cognee Memory Graph`.',
        graphNodesReferenced: ['doc-1', 'dec-1', 'chan-tech'],
        createdAt: '2026-07-04T01:31:00Z'
      }
    ],
    decisions: [
      {
        id: 'dec-1',
        workspaceId: 'ws-core',
        title: 'Use Express + Vite Middleware for full-stack integration',
        description: 'Configure a unified Express server to serve both backend APIs and Vite assets dynamically, ensuring local state preservation.',
        sourceContext: 'Slack channel #tech-stack (discussed by Alex & Sarah)',
        status: 'approved',
        createdAt: '2026-07-02T11:00:00Z'
      },
      {
        id: 'dec-2',
        workspaceId: 'ws-core',
        title: 'Deploy on Cloud Run instead of AWS ECS',
        description: 'Deploy our unified container onto Google Cloud Run to exploit rapid container cold-starts and serverless scalability.',
        sourceContext: 'Slack channel #general',
        status: 'approved',
        createdAt: '2026-07-03T16:00:00Z'
      }
    ],
    activityLogs: [
      {
        id: 'act-1',
        workspaceId: 'ws-core',
        userId: 'sarah_jenkins',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        action: 'Completed task',
        details: 'Design System & Glassmorphism UI',
        createdAt: '2026-07-03T18:22:00Z'
      },
      {
        id: 'act-2',
        workspaceId: 'ws-core',
        userId: 'alex_rivera',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        action: 'Uploaded document',
        details: 'Architecture Specification.md',
        createdAt: '2026-07-02T09:12:00Z'
      },
      {
        id: 'act-3',
        workspaceId: 'ws-core',
        userId: 'system',
        userName: 'Slack Bot',
        userAvatar: 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
        action: 'Synced Slack messages',
        details: '#tech-stack synced with 12 new discussions',
        createdAt: '2026-07-04T02:00:00Z'
      }
    ],
    memoryNodes: [
      { id: 'ws-core', label: 'HackMate AI Devs', type: 'milestone' },
      { id: 'user-default', label: 'Default User', type: 'member' },
      { id: 'sarah_jenkins', label: 'Sarah Jenkins', type: 'member' },
      { id: 'alex_rivera', label: 'Alex Rivera', type: 'member' },
      { id: 'maya_lin', label: 'Maya Lin', type: 'member' },
      { id: 'task-1', label: 'Glassmorphism UI', type: 'task' },
      { id: 'task-2', label: 'Cognee Memory Graph', type: 'task' },
      { id: 'doc-1', label: 'Architecture Spec', type: 'document' },
      { id: 'doc-2', label: 'Pitch Deck Outline', type: 'document' },
      { id: 'dec-1', label: 'Use Express+Vite', type: 'decision' },
      { id: 'dec-2', label: 'Deploy on Cloud Run', type: 'decision' },
      { id: 'tech-express', label: 'Express.js', type: 'technology' },
      { id: 'tech-cognee', label: 'Cognee Memory', type: 'technology' },
      { id: 'tech-gemini', label: 'Gemini 3.5 AI', type: 'technology' },
      { id: 'chan-tech', label: '#tech-stack', type: 'channel' }
    ],
    memoryEdges: [
      { id: 'e1', source: 'task-1', target: 'sarah_jenkins', relationship: 'ASSIGNED_TO' },
      { id: 'e2', source: 'task-2', target: 'alex_rivera', relationship: 'ASSIGNED_TO' },
      { id: 'e3', source: 'doc-1', target: 'tech-express', relationship: 'REFERENCE_FOR' },
      { id: 'e4', source: 'doc-1', target: 'tech-cognee', relationship: 'REFERENCE_FOR' },
      { id: 'e5', source: 'dec-1', target: 'tech-express', relationship: 'DECIDED_ON' },
      { id: 'e6', source: 'dec-1', target: 'chan-tech', relationship: 'DISCUSSED_IN' },
      { id: 'e7', source: 'doc-1', target: 'chan-tech', relationship: 'DISCUSSED_IN' },
      { id: 'e8', source: 'task-2', target: 'tech-cognee', relationship: 'REFERENCE_FOR' },
      { id: 'e9', source: 'user-default', target: 'ws-core', relationship: 'ASSIGNED_TO' }
    ],
    slackSyncLogs: [
      {
        id: 'slog-1',
        channelName: 'tech-stack',
        senderName: 'Alex Rivera',
        message: 'I think we should use Express rather than FastAPI. It aligns better with our React/Vite development container and streamlines type safety.',
        aiResponse: 'Recorded decision proposed by Alex Rivera: "Use Express + Vite Middleware for full-stack integration" in Cognee memory.',
        createdAt: '2026-07-02T10:45:00Z'
      },
      {
        id: 'slog-2',
        channelName: 'tech-stack',
        senderName: 'Sarah Jenkins',
        message: 'Agreed! Express is perfect. Let\'s make sure we bundle it nicely with esbuild for production.',
        aiResponse: 'Recorded agreement on decision "Use Express + Vite Middleware for full-stack integration". Status updated to APPROVED.',
        createdAt: '2026-07-02T11:00:00Z'
      },
      {
        id: 'slog-3',
        channelName: 'general',
        senderName: 'Maya Lin',
        message: '@HackMate AI do we have any pending deadlines for the Design System?',
        aiResponse: 'Responding inside Slack channel general: Sarah Jenkins is assigned to "Design System & Glassmorphism UI" which is due on 2026-07-03. Current status is IN_PROGRESS.',
        createdAt: '2026-07-03T11:30:00Z'
      }
    ],
    slackDailySummaries: [
      {
        id: 'dsum-1',
        workspaceId: 'ws-core',
        date: '2026-07-02',
        summary: 'The team discussed and finalized the backend technology stack. They approved Express.js coupled with Vite development middleware to power the unified full-stack server.',
        decisions: [
          'Approved: Use Express + Vite Middleware for full-stack integration'
        ],
        nextSteps: [
          'Alex to set up Cognee memory graph node schemas',
          'Sarah to finalize glassmorphic design specifications'
        ]
      }
    ],
    joinRequests: [
      {
        id: 'jr-1',
        workspaceId: 'ws-core',
        fullName: 'Rahul Sharma',
        email: 'rahul@hackmate.ai',
        role: 'Developer',
        skills: ['Backend', 'AI/ML', 'DevOps'],
        intro: 'Fullstack developer focusing on API design and machine learning pipeline integration. Have experience with fast-paced hackathons and real-time streams.',
        whyJoin: 'I am highly fascinated by the Cognee persistent graph memory design. I want to build out modular webhook listeners for Slack and expand node relationships!',
        github: 'github.com/rahul-sharma-dev',
        linkedin: 'linkedin.com/in/rahul-sharma-backend',
        status: 'pending',
        aiRecommendation: {
          compatibilityScore: 94,
          recommendedRole: 'Backend Developer',
          projectMatch: 'Excellent',
          strengths: ['Python', 'React', 'FastAPI'],
          suggestedContribution: 'Authentication Module & Slack API router',
          reason: 'This applicant\'s skills closely match the current project requirements.',
          confidence: 'High'
        },
        createdAt: '2026-07-04T02:10:00-07:00'
      },
      {
        id: 'jr-2',
        workspaceId: 'ws-core',
        fullName: 'Siddharth Sen',
        email: 'siddharth@hackmate.ai',
        role: 'AI Engineer',
        skills: ['AI/ML', 'Backend'],
        intro: 'Research scholar in NLP and vector embeddings. Built multiple custom semantic caching systems and fine-tuned smaller models.',
        whyJoin: 'To research optimal chunk boundaries for the Cognee Memory Engine.',
        status: 'approved',
        approver: 'Default User',
        approvedAt: '2026-07-03T18:00:00-07:00',
        aiRecommendation: {
          compatibilityScore: 97,
          recommendedRole: 'AI Engineer',
          projectMatch: 'Excellent',
          strengths: ['PyTorch', 'Vector DBs', 'Gemini SDK'],
          suggestedContribution: 'Cognee Graph Vector Encoders',
          reason: 'Unmatched experience with relational graph schemas and transformer embeddings.',
          confidence: 'High'
        },
        createdAt: '2026-07-03T10:00:00-07:00'
      },
      {
        id: 'jr-3',
        workspaceId: 'ws-core',
        fullName: 'Ananya Roy',
        email: 'ananya@hackmate.ai',
        role: 'Designer',
        skills: ['UI/UX'],
        intro: 'Digital product artist. Focused entirely on clean web designs, accessibility, and playful retro styling.',
        whyJoin: 'To design a gorgeous, custom playground for the knowledge graph view.',
        status: 'rejected',
        rejectionReason: 'The project is currently focusing on backend and AI engine developers. We have saved your contact details for future design iterations.',
        approver: 'Default User',
        approvedAt: '2026-07-03T19:30:00-07:00',
        aiRecommendation: {
          compatibilityScore: 82,
          recommendedRole: 'UI/UX Designer',
          projectMatch: 'Good',
          strengths: ['Figma', 'Illustrator'],
          suggestedContribution: 'Mockups for chat canvas',
          reason: 'While highly creative, current immediate requirements lean towards implementation engineers.',
          confidence: 'Medium'
        },
        createdAt: '2026-07-03T11:15:00-07:00'
      }
    ]
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = getInitialData();
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...getInitialData(), ...parsed };
        
        // Ensure our core set of workspaces is always present and active
        const initial = getInitialData();
        initial.workspaces.forEach(ws => {
          if (!this.data.workspaces.some(w => w.id === ws.id || w.name === ws.name)) {
            this.data.workspaces.push(ws);
          }
        });
        
        // Ensure the seeded tasks are also present
        initial.tasks.forEach(task => {
          if (!this.data.tasks.some(t => t.id === task.id)) {
            this.data.tasks.push(task);
          }
        });
        this.save();
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading db.json, resetting database.', e);
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json', e);
    }
  }

  // Auth Helpers
  getUsers() { return this.data.users; }
  addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Workspaces Helpers
  getWorkspaces() { return this.data.workspaces; }
  addWorkspace(ws: Workspace) {
    this.data.workspaces.push(ws);
    this.save();
    return ws;
  }
  updateWorkspace(id: string, updates: Partial<Workspace>) {
    const idx = this.data.workspaces.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.data.workspaces[idx] = { ...this.data.workspaces[idx], ...updates };
      this.save();
      return this.data.workspaces[idx];
    }
    return null;
  }

  // Tasks Helpers
  getTasks(workspaceId: string) {
    return this.data.tasks.filter(t => t.workspaceId === workspaceId);
  }
  addTask(task: Task) {
    this.data.tasks.push(task);
    
    // Add activity log
    this.addActivityLog({
      id: 'act-' + Date.now(),
      workspaceId: task.workspaceId,
      userId: task.assigneeId || 'system',
      userName: task.assigneeId ? (this.getMemberName(task.assigneeId)) : 'System',
      userAvatar: task.assigneeId ? (this.getMemberAvatar(task.assigneeId)) : 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
      action: 'Created task',
      details: task.title,
      createdAt: new Date().toISOString()
    });

    // Add Memory Node and Edges
    this.addMemoryNode({ id: task.id, label: task.title, type: 'task' });
    if (task.assigneeId) {
      this.addMemoryEdge({
        id: 'e-' + Date.now(),
        source: task.id,
        target: task.assigneeId,
        relationship: 'ASSIGNED_TO'
      });
    }

    this.save();
    return task;
  }
  updateTask(id: string, updates: Partial<Task>) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const prev = this.data.tasks[idx];
      const updated = { ...prev, ...updates };
      this.data.tasks[idx] = updated;

      // Handle activity logging
      if (updates.status && updates.status !== prev.status) {
        this.addActivityLog({
          id: 'act-' + Date.now(),
          workspaceId: updated.workspaceId,
          userId: updated.assigneeId || 'system',
          userName: updated.assigneeId ? this.getMemberName(updated.assigneeId) : 'System',
          userAvatar: updated.assigneeId ? this.getMemberAvatar(updated.assigneeId) : 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
          action: `Moved task to ${updates.status.toUpperCase().replace('_', ' ')}`,
          details: updated.title,
          createdAt: new Date().toISOString()
        });

        // Toggle Done Confetti Milestone in Cognee Graph
        if (updates.status === 'done') {
          this.addMemoryNode({ id: 'done-' + id, label: `${updated.title} Completed`, type: 'milestone' });
          this.addMemoryEdge({ id: 'e-done-' + id, source: id, target: 'done-' + id, relationship: 'REFERENCE_FOR' });
        }
      }

      // Handle assignee changes in Memory Graph
      if (updates.assigneeId && updates.assigneeId !== prev.assigneeId) {
        // Remove old edge
        this.data.memoryEdges = this.data.memoryEdges.filter(
          e => !(e.source === id && e.relationship === 'ASSIGNED_TO')
        );
        // Add new edge
        this.addMemoryEdge({
          id: 'e-' + Date.now(),
          source: id,
          target: updates.assigneeId,
          relationship: 'ASSIGNED_TO'
        });
      }

      this.save();
      return updated;
    }
    return null;
  }
  deleteTask(id: string) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = this.data.tasks[idx];
      this.data.tasks.splice(idx, 1);
      // Clean memory node/edges
      this.data.memoryNodes = this.data.memoryNodes.filter(n => n.id !== id);
      this.data.memoryEdges = this.data.memoryEdges.filter(e => e.source !== id && e.target !== id);
      this.save();
      return task;
    }
    return null;
  }

  // Documents Helpers
  getDocuments(workspaceId: string) {
    return this.data.documents.filter(d => d.workspaceId === workspaceId);
  }
  addDocument(doc: Document) {
    this.data.documents.push(doc);

    // Activity Log
    this.addActivityLog({
      id: 'act-' + Date.now(),
      workspaceId: doc.workspaceId,
      userId: 'user-default',
      userName: 'Default User',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      action: 'Uploaded document',
      details: doc.name,
      createdAt: new Date().toISOString()
    });

    // Cognee memory inserts
    this.addMemoryNode({ id: doc.id, label: doc.name.replace(/\.[^/.]+$/, ""), type: 'document' });
    
    // Add tech nodes referenced
    if (doc.extractedInfo.techStack) {
      doc.extractedInfo.techStack.forEach(tech => {
        const techId = 'tech-' + tech.toLowerCase().replace(/[^a-z0-9]/g, '');
        this.addMemoryNode({ id: techId, label: tech, type: 'technology' });
        this.addMemoryEdge({
          id: 'e-' + doc.id + '-' + techId,
          source: doc.id,
          target: techId,
          relationship: 'REFERENCE_FOR'
        });
      });
    }

    this.save();
    return doc;
  }

  // Decisions Helpers
  getDecisions(workspaceId: string) {
    return this.data.decisions.filter(d => d.workspaceId === workspaceId);
  }
  addDecision(decision: Decision) {
    this.data.decisions.push(decision);

    // Cognee insertion
    this.addMemoryNode({ id: decision.id, label: decision.title, type: 'decision' });
    this.save();
    return decision;
  }
  updateDecision(id: string, updates: Partial<Decision>) {
    const idx = this.data.decisions.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.decisions[idx] = { ...this.data.decisions[idx], ...updates };
      this.save();
      return this.data.decisions[idx];
    }
    return null;
  }

  // Chats Helpers
  getChatMessages(workspaceId: string) {
    return this.data.chatMessages.filter(c => c.workspaceId === workspaceId);
  }
  addChatMessage(msg: ChatMessage) {
    this.data.chatMessages.push(msg);
    this.save();
    return msg;
  }
  clearChatMessages(workspaceId: string) {
    this.data.chatMessages = this.data.chatMessages.filter(c => c.workspaceId !== workspaceId);
    this.save();
  }

  // Slack Integration Helpers
  getSlackLogs() {
    return this.data.slackSyncLogs;
  }
  addSlackLog(log: SlackSyncLog) {
    this.data.slackSyncLogs.unshift(log); // newest first
    this.save();
    return log;
  }
  getSlackDailySummaries(workspaceId: string) {
    return this.data.slackDailySummaries.filter(s => s.workspaceId === workspaceId);
  }
  addSlackDailySummary(summary: SlackDailySummary) {
    this.data.slackDailySummaries.push(summary);
    this.save();
    return summary;
  }

  // Memory Graph Helpers
  getMemoryGraph() {
    return {
      nodes: this.data.memoryNodes,
      edges: this.data.memoryEdges
    };
  }
  addMemoryNode(node: MemoryNode) {
    if (!this.data.memoryNodes.some(n => n.id === node.id)) {
      this.data.memoryNodes.push(node);
    }
  }
  addMemoryEdge(edge: MemoryEdge) {
    if (!this.data.memoryEdges.some(e => e.id === edge.id)) {
      this.data.memoryEdges.push(edge);
    }
  }

  // Activities
  getActivityLogs(workspaceId: string) {
    return this.data.activityLogs
      .filter(l => l.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  addActivityLog(log: ActivityLog) {
    this.data.activityLogs.push(log);
  }

  // Join Request Helpers
  getJoinRequests(workspaceId: string) {
    if (!this.data.joinRequests) {
      this.data.joinRequests = [];
    }
    return this.data.joinRequests.filter(jr => jr.workspaceId === workspaceId);
  }
  addJoinRequest(req: JoinRequest) {
    if (!this.data.joinRequests) {
      this.data.joinRequests = [];
    }
    this.data.joinRequests.push(req);
    this.save();
    return req;
  }
  updateJoinRequest(id: string, updates: Partial<JoinRequest>) {
    if (!this.data.joinRequests) {
      this.data.joinRequests = [];
    }
    const idx = this.data.joinRequests.findIndex(jr => jr.id === id);
    if (idx !== -1) {
      this.data.joinRequests[idx] = { ...this.data.joinRequests[idx], ...updates };
      this.save();
      return this.data.joinRequests[idx];
    }
    return null;
  }

  // Helper getters
  private getMemberName(userId: string) {
    if (userId === 'user-default') return 'Default User';
    const m = DEFAULT_MEMBERS.find(member => member.userId === userId);
    return m ? m.name : userId;
  }
  private getMemberAvatar(userId: string) {
    if (userId === 'user-default') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80';
    const m = DEFAULT_MEMBERS.find(member => member.userId === userId);
    return m ? m.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  }
}

export const db = new Database();
