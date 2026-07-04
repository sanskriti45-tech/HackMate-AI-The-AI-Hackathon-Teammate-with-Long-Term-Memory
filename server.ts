import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { 
  generateDocumentSummaryAndMetadata, 
  askCogneeAssistant, 
  processSlackMessageSync, 
  generateWorkspaceDailyInsight 
} from "./server/gemini";
import { User } from "./src/types";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit increased for larger simulated document content
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper middleware to simulate active user session
  let currentUser: User = {
    id: 'user-default',
    email: 'user@hackmate.ai',
    name: 'Default User',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true
  };

  // --- API ROUTES FIRST ---

  // Auth Endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Simulate lookup
    const users = db.getUsers();
    const existing = users.find(u => u.email === email);
    if (existing) {
      currentUser = existing;
      return res.json({ user: existing, message: "Welcome back!" });
    } else {
      // Automatic onboarding for ease of demo
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'owner' as const,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
        verified: true
      };
      db.addUser(newUser);
      currentUser = newUser;
      return res.json({ user: newUser, isNew: true, message: "Account created and verified." });
    }
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    const newUser = {
      id: 'user-' + Date.now(),
      email,
      name,
      role: 'owner' as const,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      verified: false // User needs to verify email!
    };
    db.addUser(newUser);
    currentUser = newUser;
    return res.json({ user: newUser, message: "Verification link sent to your email." });
  });

  app.post("/api/auth/verify-email", (req, res) => {
    if (currentUser) {
      db.updateUser(currentUser.id, { verified: true });
      currentUser.verified = true;
      return res.json({ user: currentUser, message: "Email successfully verified!" });
    }
    res.status(401).json({ error: "No active user session." });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required." });
    res.json({ message: "Password reset instructions sent." });
  });

  app.get("/api/auth/me", (req, res) => {
    res.json({ user: currentUser });
  });

  app.post("/api/auth/logout", (req, res) => {
    currentUser = {
      id: 'user-default',
      email: 'user@hackmate.ai',
      name: 'Default User',
      role: 'owner' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      verified: true
    };
    res.json({ message: "Logged out." });
  });

  // Workspace Endpoints
  app.get("/api/workspaces", (req, res) => {
    res.json({ workspaces: db.getWorkspaces() });
  });

  app.post("/api/workspaces", (req, res) => {
    const { name, description } = req.body;
    const newWs = {
      id: 'ws-' + Date.now(),
      name,
      description,
      slackConnected: false,
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'owner' as const,
          avatar: currentUser.avatar
        }
      ],
      slackChannels: [
        { id: 'chan-gen', name: 'general', synced: false, messageCount: 0 }
      ],
      createdAt: new Date().toISOString(),
      ownerId: currentUser.id
    };
    db.addWorkspace(newWs);
    res.status(201).json(newWs);
  });

  app.post("/api/workspaces/:id/invite", (req, res) => {
    const { id } = req.params;
    const { email, role, name } = req.body;
    const workspace = db.getWorkspaces().find(w => w.id === id);
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const newMemberId = 'user-inv-' + Date.now();
    const newMember = {
      userId: newMemberId,
      name: name || email.split('@')[0],
      email,
      role: (role || 'member') as any,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name || email}`
    };

    workspace.members.push(newMember);
    
    // Add memory node
    db.addMemoryNode({ id: newMemberId, label: newMember.name, type: 'member' });
    db.addMemoryEdge({
      id: 'e-' + Date.now(),
      source: newMemberId,
      target: workspace.id,
      relationship: 'ASSIGNED_TO'
    });

    db.updateWorkspace(id, workspace);
    res.json({ workspace, message: "Member invited successfully." });
  });

  // Tasks Endpoints
  app.get("/api/workspaces/:wsId/tasks", (req, res) => {
    res.json({ tasks: db.getTasks(req.params.wsId) });
  });

  app.post("/api/workspaces/:wsId/tasks", (req, res) => {
    const { title, description, priority, assigneeId, startDate, deadline } = req.body;
    const newTask = {
      id: 'task-' + Date.now(),
      workspaceId: req.params.wsId,
      title,
      description: description || "",
      status: 'todo' as const,
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline: deadline || new Date().toISOString().split('T')[0],
      progress: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    db.addTask(newTask);
    res.status(201).json(newTask);
  });

  app.put("/api/tasks/:id", (req, res) => {
    const updated = db.updateTask(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const deleted = db.deleteTask(req.params.id);
    if (deleted) {
      res.json({ message: "Task deleted", deleted });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.post("/api/tasks/:id/comments", (req, res) => {
    const { content } = req.body;
    const task = db.getWorkspaces().flatMap(w => db.getTasks(w.id)).find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const newComment = {
      id: 'tc-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString()
    };
    task.comments.push(newComment);
    db.updateTask(task.id, { comments: task.comments });
    res.json(newComment);
  });

  // Documents Endpoints
  app.get("/api/workspaces/:wsId/documents", (req, res) => {
    res.json({ documents: db.getDocuments(req.params.wsId) });
  });

  app.post("/api/workspaces/:wsId/documents", async (req, res) => {
    const { name, type, size, fileContent } = req.body;
    if (!name || !fileContent) {
      return res.status(400).json({ error: "Name and fileContent are required" });
    }

    // Call Gemini API to summarize & extract key points/decisions/tech
    const aiData = await generateDocumentSummaryAndMetadata(name, fileContent);

    const newDoc = {
      id: 'doc-' + Date.now(),
      workspaceId: req.params.wsId,
      name,
      type: type || name.split('.').pop() || 'txt',
      size: size || `${(fileContent.length / 1024).toFixed(1)} KB`,
      summary: aiData.summary,
      extractedInfo: {
        keyPoints: aiData.keyPoints || [],
        decisions: aiData.decisions || [],
        techStack: aiData.techStack || []
      },
      fileContent,
      createdAt: new Date().toISOString()
    };

    db.addDocument(newDoc);

    // If any decisions were extracted, add them automatically
    if (aiData.decisions && aiData.decisions.length > 0) {
      aiData.decisions.forEach((decStr: string) => {
        db.addDecision({
          id: 'dec-' + Date.now() + Math.floor(Math.random() * 100),
          workspaceId: req.params.wsId,
          title: decStr.length > 60 ? decStr.substring(0, 60) + '...' : decStr,
          description: decStr,
          sourceContext: `Uploaded document: ${name}`,
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      });
    }

    res.status(201).json(newDoc);
  });

  // Chat Endpoints
  app.get("/api/workspaces/:wsId/chat", (req, res) => {
    res.json({ messages: db.getChatMessages(req.params.wsId) });
  });

  app.post("/api/workspaces/:wsId/chat", async (req, res) => {
    const { content } = req.body;
    const wsId = req.params.wsId;

    if (!content) return res.status(400).json({ error: "Content is required" });

    // Store user message
    const userMsg = {
      id: 'msg-' + Date.now(),
      workspaceId: wsId,
      sender: 'user' as const,
      content,
      createdAt: new Date().toISOString()
    };
    db.addChatMessage(userMsg);

    // Get response from Cognee-grounded Gemini AI
    const aiText = await askCogneeAssistant(wsId, content);

    // Scan response text for referenced nodes (very simple tag-matching)
    const referencedNodes: string[] = [];
    const graph = db.getMemoryGraph();
    graph.nodes.forEach(n => {
      if (aiText.toLowerCase().includes(n.label.toLowerCase())) {
        referencedNodes.push(n.id);
      }
    });

    const aiMsg = {
      id: 'msg-' + (Date.now() + 1),
      workspaceId: wsId,
      sender: 'ai' as const,
      content: aiText,
      graphNodesReferenced: referencedNodes.length > 0 ? referencedNodes : undefined,
      createdAt: new Date().toISOString()
    };
    db.addChatMessage(aiMsg);

    res.json({ userMsg, aiMsg });
  });

  app.delete("/api/workspaces/:wsId/chat", (req, res) => {
    db.clearChatMessages(req.params.wsId);
    res.json({ message: "Chat logs cleared." });
  });

  // Memory Graph Endpoints
  app.get("/api/memory/graph", (req, res) => {
    res.json(db.getMemoryGraph());
  });

  // Decisions Endpoints
  app.get("/api/workspaces/:wsId/decisions", (req, res) => {
    res.json({ decisions: db.getDecisions(req.params.wsId) });
  });

  app.post("/api/workspaces/:wsId/decisions", (req, res) => {
    const { title, description, sourceContext, status } = req.body;
    const newDec = db.addDecision({
      id: 'dec-' + Date.now(),
      workspaceId: req.params.wsId,
      title,
      description,
      sourceContext: sourceContext || "Manual entry",
      status: status || 'proposed',
      createdAt: new Date().toISOString()
    });
    res.status(201).json(newDec);
  });

  app.put("/api/decisions/:id", (req, res) => {
    const updated = db.updateDecision(req.params.id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: "Decision not found" });
  });

  // Slack Integration Endpoints
  app.get("/api/slack/logs", (req, res) => {
    res.json({ logs: db.getSlackLogs() });
  });

  app.get("/api/workspaces/:wsId/slack/summaries", (req, res) => {
    res.json({ summaries: db.getSlackDailySummaries(req.params.wsId) });
  });

  app.post("/api/workspaces/:wsId/slack/sync", async (req, res) => {
    const { channelName, senderName, message } = req.body;
    const wsId = req.params.wsId;

    if (!channelName || !senderName || !message) {
      return res.status(400).json({ error: "channelName, senderName, and message are required." });
    }

    // Call Gemini API to parse message & create smart sync actions
    const syncResult = await processSlackMessageSync(wsId, channelName, senderName, message);

    // Create sync log
    const syncLog = {
      id: 'slog-' + Date.now(),
      channelName,
      senderName,
      message,
      aiResponse: syncResult.aiResponse || undefined,
      createdAt: new Date().toISOString()
    };
    db.addSlackLog(syncLog);

    // Record decision if extracted
    if (syncResult.extractedDecision) {
      db.addDecision({
        id: 'dec-' + Date.now(),
        workspaceId: wsId,
        title: syncResult.extractedDecision.title,
        description: syncResult.extractedDecision.description,
        sourceContext: syncResult.extractedDecision.sourceContext,
        status: syncResult.extractedDecision.status,
        createdAt: new Date().toISOString()
      });
    }

    // Add activity log
    db.addActivityLog({
      id: 'act-' + Date.now(),
      workspaceId: wsId,
      userId: 'system',
      userName: senderName,
      userAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${senderName}`,
      action: `Synced Slack message in #${channelName}`,
      details: message,
      createdAt: new Date().toISOString()
    });

    res.json({ syncLog, syncResult });
  });

  app.post("/api/workspaces/:wsId/slack/generate-summary", (req, res) => {
    const wsId = req.params.wsId;
    const decisions = db.getDecisions(wsId).filter(d => d.status === 'approved').map(d => d.title);
    const tasks = db.getTasks(wsId).filter(t => t.status === 'todo').map(t => `${t.title} (${t.priority})`);

    const summaryStr = "Synced Slack daily notes and summarized architectural decisions. The team successfully resolved design asset delivery and completed full deployment setups.";
    
    const newSummary = db.addSlackDailySummary({
      id: 'dsum-' + Date.now(),
      workspaceId: wsId,
      date: new Date().toISOString().split('T')[0],
      summary: summaryStr,
      decisions: decisions.slice(0, 3),
      nextSteps: tasks.length > 0 ? tasks.slice(0, 3) : ["Configure Gemini models", "Test multi-user threads"]
    });

    res.json(newSummary);
  });

  // KPI Dashboard Insights
  app.get("/api/workspaces/:wsId/ai/insights", async (req, res) => {
    const insights = await generateWorkspaceDailyInsight(req.params.wsId);
    res.json(insights);
  });

  // Recent Activity Feed
  app.get("/api/workspaces/:wsId/activities", (req, res) => {
    res.json({ activities: db.getActivityLogs(req.params.wsId) });
  });

  // Team Join Requests Endpoints
  app.post("/api/join-request", (req, res) => {
    const { workspaceId, fullName, email, role, skills, intro, whyJoin, github, linkedin } = req.body;
    if (!workspaceId || !fullName || !email || !role) {
      return res.status(400).json({ error: "workspaceId, fullName, email, and role are required." });
    }

    // AI recommendation simulation based on skills & role requested
    const defaultStrengths = skills && skills.length > 0 ? skills : ["Frontend", "React"];
    const compScore = 88 + Math.floor(Math.random() * 11);
    
    const newRequest = {
      id: 'jr-' + Date.now(),
      workspaceId,
      fullName,
      email,
      role,
      skills: defaultStrengths,
      intro: intro || "Hello, I would love to build with you!",
      whyJoin: whyJoin || "Interested in cognitive memory systems.",
      github: github || "",
      linkedin: linkedin || "",
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      aiRecommendation: {
        compatibilityScore: compScore,
        recommendedRole: role,
        projectMatch: compScore > 90 ? 'Excellent' : 'Strong Match',
        strengths: defaultStrengths.slice(0, 3),
        suggestedContribution: role === 'Designer' ? 'Translucent dashboard refinements' : 'Cognee entity resolution adapters',
        reason: "This applicant's background and skills are a very strong fit for the active workspace tasks and milestones.",
        confidence: 'High' as const
      }
    };

    db.addJoinRequest(newRequest);

    // Save in Cognee persistent memory
    db.addMemoryNode({ id: newRequest.id, label: `${newRequest.fullName} (Applicant)`, type: 'member' });
    db.addMemoryEdge({
      id: 'e-join-' + Date.now(),
      source: newRequest.id,
      target: workspaceId,
      relationship: 'DISCUSSED_IN'
    });

    // Add activity log
    db.addActivityLog({
      id: 'act-jr-' + Date.now(),
      workspaceId,
      userId: 'system',
      userName: newRequest.fullName,
      userAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newRequest.fullName}`,
      action: 'Submitted join request',
      details: `Requested to join as ${newRequest.role}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: "Your request has been sent to the Team Leader for review.",
      joinRequest: newRequest
    });
  });

  app.get("/api/join-requests", (req, res) => {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId query parameter is required." });
    }
    const requests = db.getJoinRequests(workspaceId as string).filter(jr => jr.status === 'pending');
    res.json({ joinRequests: requests });
  });

  app.get("/api/join-history", (req, res) => {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId query parameter is required." });
    }
    const requests = db.getJoinRequests(workspaceId as string);
    res.json({ joinRequests: requests });
  });

  app.patch("/api/join-request/:id/approve", (req, res) => {
    const { id } = req.params;
    const workspaces = db.getWorkspaces();
    
    // Find request across all joinRequests
    let request: any = null;
    for (const ws of workspaces) {
      const found = db.getJoinRequests(ws.id).find(jr => jr.id === id);
      if (found) {
        request = found;
        break;
      }
    }

    if (!request) return res.status(404).json({ error: "Join request not found" });

    const workspace = workspaces.find(w => w.id === request.workspaceId);
    if (!workspace) return res.status(404).json({ error: "Workspace not found for this request" });

    // Update request
    const updatedRequest = db.updateJoinRequest(id, {
      status: 'approved',
      approver: currentUser.name,
      approvedAt: new Date().toISOString()
    });

    // Generate unique user id
    const newMemberId = 'user-jr-' + Date.now();
    const newMember = {
      userId: newMemberId,
      name: request.fullName,
      email: request.email,
      role: (request.role === 'Admin' || request.role === 'Workspace Owner' ? 'admin' : 'member') as any,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${request.fullName}`
    };

    // Add member to workspace roster
    workspace.members.push(newMember);
    db.updateWorkspace(workspace.id, workspace);

    // Add activity log
    db.addActivityLog({
      id: 'act-appr-' + Date.now(),
      workspaceId: workspace.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'Approved join request',
      details: `${request.fullName} added successfully as ${request.role}`,
      createdAt: new Date().toISOString()
    });

    // Add to Cognee memory
    db.addMemoryNode({ id: newMemberId, label: request.fullName, type: 'member' });
    db.addMemoryEdge({
      id: 'e-appr-mem-' + Date.now(),
      source: newMemberId,
      target: workspace.id,
      relationship: 'ASSIGNED_TO'
    });

    res.json({
      message: `${request.fullName} has successfully joined the workspace.`,
      joinRequest: updatedRequest,
      workspace
    });
  });

  app.patch("/api/join-request/:id/reject", (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const workspaces = db.getWorkspaces();
    let request: any = null;
    for (const ws of workspaces) {
      const found = db.getJoinRequests(ws.id).find(jr => jr.id === id);
      if (found) {
        request = found;
        break;
      }
    }

    if (!request) return res.status(404).json({ error: "Join request not found" });

    const updatedRequest = db.updateJoinRequest(id, {
      status: 'rejected',
      rejectionReason: rejectionReason || "No explanation provided.",
      approver: currentUser.name,
      approvedAt: new Date().toISOString()
    });

    // Add activity log
    db.addActivityLog({
      id: 'act-rej-' + Date.now(),
      workspaceId: request.workspaceId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'Rejected join request',
      details: `Rejected ${request.fullName}: ${rejectionReason || "No explanation provided."}`,
      createdAt: new Date().toISOString()
    });

    // Save rejection event in Cognee memory
    db.addMemoryNode({
      id: 'rej-event-' + id,
      label: `Rejected ${request.fullName}`,
      type: 'decision'
    });

    res.json({
      message: "Join request rejected.",
      joinRequest: updatedRequest
    });
  });

  // --- VITE DEV AND PRODUCTION MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    console.log("Mounting Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in Production Mode. Serving static build assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
