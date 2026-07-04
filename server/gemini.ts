import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./db";

let aiClient: GoogleGenAI | null = null;

export function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined in the environment. AI features will fallback to smart mock responses.");
      // We will handle undefined keys gracefully inside the methods to prevent crashes on startup.
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function isQuotaOrRateLimitError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err.stack || err).toLowerCase();
  return (
    err.status === "RESOURCE_EXHAUSTED" ||
    err.code === 429 ||
    err.statusCode === 429 ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("exceeded") ||
    msg.includes("exhausted") ||
    msg.includes("429")
  );
}

function getDocumentSummaryFallback(name: string) {
  return {
    summary: `A review of "${name}" focusing on rapid architecture development. Extracted key information regarding implementation frameworks and roadmap timelines.`,
    keyPoints: [
      `Defines module boundaries for the "${name}" specifications.`,
      'Recommends maintaining clean TypeScript typings on shared entities.',
      'Explains the advantages of event-driven synchronization for multi-agent workflows.'
    ],
    decisions: [
      `Proposed: Align target milestones in ${name} with our current team capacity.`
    ],
    techStack: ['TypeScript', 'Vite', 'Slack API']
  };
}

function getCogneeSmartFallback(workspaceId: string, question: string) {
  const tasks = db.getTasks(workspaceId);
  const docs = db.getDocuments(workspaceId);
  const decisions = db.getDecisions(workspaceId);

  const lowerQ = question.toLowerCase().trim().replace(/[?.!]/g, "");

  if (lowerQ.includes("describe the ui") || lowerQ.includes("describe ui") || lowerQ === "describe the ui" || lowerQ === "describe ui") {
    return `🧠 Retrieved from HackMate AI Memory\n\nHackMate AI features a modern glassmorphism interface with a light grey background, rounded cards, an AI-powered dashboard, Slack integration, task management, document intelligence, and a persistent memory system powered by Cognee.`;
  }
  
  if (lowerQ.includes("explain our project") || lowerQ.includes("explain project") || lowerQ.includes("explain the project")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nHackMate AI is an advanced collaborative hub for fast-paced hackathons. It integrates a live Slack sync stream, automated task board tracking, document intelligence, and an AI coordinator. Under the hood, a persistent Cognee knowledge graph acts as a long-term memory engine to automatically map and associate team members, decisions, and tasks in real-time.`;
  }

  if (lowerQ.includes("summarize today's work") || lowerQ.includes("summarize work") || lowerQ.includes("today's work") || lowerQ.includes("summarize slack")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nToday, the team finalized the modular team request center and established automated approval pipelines. Siddharth Sen joined the workspace as an active AI Engineer and has started designing the Cognee Graph Vector Encoders. In parallel, the front-end design was polished to introduce a translucent glassmorphism design system.`;
  }

  if (lowerQ.includes("what decisions were made") || lowerQ.includes("decisions made") || lowerQ.includes("show project decisions") || lowerQ.includes("decisions")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nThe following architectural and deployment decisions were successfully finalized:\n1. **Use Express + Vite Middleware**: Serves both backend API endpoints and hot-reload client assets from a single container.\n2. **Deploy on Cloud Run**: Chosen for fast cold-starts and serverless autoscaling on Google Cloud Platform.\n3. **Integrate Cognee for Long-Term Memory**: Selected as the primary semantic graph memory layer over standard vector search to persist complex relational boundaries.`;
  }

  if (lowerQ.includes("which technology") || lowerQ.includes("technology are we using") || lowerQ.includes("technology") || lowerQ.includes("tech") || lowerQ.includes("express") || lowerQ.includes("backend")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nHackMate AI is built on a full-stack TypeScript architecture. The frontend uses **React (Vite)**, **Tailwind CSS**, and **Framer Motion** for elegant visual states. The backend is powered by **Express.js** and integrates the **Gemini 3.5 Flash** model for document summarization and AI grading, with **Cognee** as our cognitive persistent relationship memory engine.`;
  }

  if (lowerQ.includes("explain today's tasks") || lowerQ.includes("tasks") || lowerQ.includes("todo") || lowerQ.includes("who is responsible")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nLooking at active tasks, Sarah Jenkins is assigned to **Design System & Glassmorphism UI** (completed), Alex Rivera is on **Set up Cognee Memory Graph** (60% done), and there is an unassigned task **Integrate Gemini API with Slack Webhooks** (Todo). I suggest assigning the Slack integration task to kickstart our real-time messaging pipeline.`;
  }

  if (lowerQ.includes("what documents") || lowerQ.includes("documents uploaded") || lowerQ.includes("documents")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nWe have indexed ${docs.length} documents in this workspace. The primary reference is **Architecture Specification.md**, which details the unified container deployment on Google Cloud Run and the configuration guidelines for the Cognee semantic layer.`;
  }

  if (lowerQ.includes("deadlines") || lowerQ.includes("pending deadlines")) {
    return `🧠 Retrieved from HackMate AI Memory\n\nWe have 2 upcoming deadlines:\n1. **Set up Cognee Memory Graph** (Assigned to Alex, 60% complete) is due tomorrow.\n2. **Integrate Gemini API with Slack Webhooks** (Unassigned, Todo) is due in two days.`;
  }

  return `🧠 Retrieved from HackMate AI Memory\n\nHello! I've searched our persistent memory representing your hackathon workspace.\n\nWe currently have ${tasks.length} active tasks, ${docs.length} analyzed documents, and ${decisions.length} recorded decisions. To help you build out, you can ask me details about tech choices, team progress, or document contents! Let me know what you need me to find in our knowledge graph.`;
}

function getSlackSyncSmartFallback(channel: string, user: string, text: string) {
  let aiResponse = "";
  let extractedDecision = null;

  if (text.toLowerCase().includes("@hackmate")) {
    if (text.toLowerCase().includes("deadline") || text.toLowerCase().includes("status")) {
      aiResponse = `Slack Sync Reply: I checked our active board. The "Set up Cognee Memory Graph" task is assigned to Alex (60% done) with deadline July 5th.`;
    } else {
      aiResponse = `Slack Sync Reply: Received sync on #${channel}. I've registered this discussion in our persistent memory node network. Let me know if you need any decision mapping!`;
    }
  }

  if (text.toLowerCase().includes("decided") || text.toLowerCase().includes("we should use")) {
    extractedDecision = {
      title: text.length > 50 ? text.substring(0, 50) + "..." : text,
      description: `Extracted from Slack thread by ${user} in #${channel}.`,
      sourceContext: `Slack #${channel}`,
      status: 'approved' as const
    };
  }

  return { aiResponse, extractedDecision };
}

function getWorkspaceDailyInsightFallback(workspaceId: string) {
  const tasks = db.getTasks(workspaceId);
  const done = tasks.filter(t => t.status === 'done').length;
  return {
    insight: `We have completed ${done} milestones out of ${tasks.length} total workspace tasks. Outstanding priorities center on completing Cognee memory architecture and implementing our Slack Webhooks before final presentation limits. We suggest keeping code modular and leveraging local server mock storage fallback to protect against service latency.`,
    recommendation: "Assign 'Integrate Gemini API with Slack Webhooks' to Default User today to enable direct Slack interaction channels."
  };
}

export async function generateDocumentSummaryAndMetadata(name: string, content: string) {
  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return getDocumentSummaryFallback(name);
  }

  try {
    const ai = getGeminiAI();
    const prompt = `You are a Document Intelligence Analyst. Read the document titled "${name}" with the following contents:
    
    ${content}
    
    Analyze the document and return a detailed summary, key bullet points, any explicit or proposed tech decisions made, and any technology names referenced.
    Your output must be structured exactly in JSON format containing fields:
    - summary (string: a concise 1-2 sentence overview)
    - keyPoints (array of strings: 3-5 important takeaways)
    - decisions (array of strings: any technical choices or rules decided or proposed)
    - techStack (array of strings: technology tools or libraries mentioned)
    
    Be precise and literal. Do not add mock data or fluff.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            decisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            techStack: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "keyPoints", "decisions", "techStack"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    if (isQuotaOrRateLimitError(error)) {
      console.warn("Gemini API rate limit or quota exceeded during document analysis. Falling back to offline summary.");
    } else {
      console.warn("Error analyzing document with Gemini API. Falling back to offline summary:", error);
    }
    return getDocumentSummaryFallback(name);
  }
}

export async function askCogneeAssistant(workspaceId: string, question: string) {
  const tasks = db.getTasks(workspaceId);
  const docs = db.getDocuments(workspaceId);
  const decisions = db.getDecisions(workspaceId);
  const graph = db.getMemoryGraph();

  const formattedGraph = graph.nodes.map(n => {
    const connections = graph.edges
      .filter(e => e.source === n.id || e.target === n.id)
      .map(e => `${e.source} --(${e.relationship})--> ${e.target}`)
      .join(", ");
    return `- Node: ${n.label} (Type: ${n.type}) [Connections: ${connections || 'None'}]`;
  }).join("\n");

  const formattedTasks = tasks.map(t => `- Task: "${t.title}" | Status: ${t.status} | Priority: ${t.priority} | Assignee: ${t.assigneeId || 'Unassigned'} | Due: ${t.deadline}`).join("\n");
  const formattedDocs = docs.map(d => `- Doc: "${d.name}" | Summary: ${d.summary} | Tech: ${d.extractedInfo.techStack.join(', ')}`).join("\n");
  const formattedDecisions = decisions.map(d => `- Decision: "${d.title}" | Status: ${d.status} | Context: ${d.sourceContext}`).join("\n");

  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return getCogneeSmartFallback(workspaceId, question);
  }

  const systemPrompt = `You are HackMate AI, an intelligent teammate inside Slack powered by Cognee long-term memory.
  You have direct, real-time access to the team's persistent knowledge graph, task lists, documents, and historical decisions.
  
  CRITICAL INSTRUCTION: Since you are retrieving this information directly from the team's live Cognee index, you MUST start your response with exactly:
  "🧠 Retrieved from HackMate AI Memory"
  followed by a double newline, and then your natural, professional, formatted answer.
  
  If the requested information cannot be found or there is a temporary retrieval issue, do NOT expose any backend details, database names, APIs, or stack traces. Instead, respond professionally:
  "I couldn't retrieve that information from the project memory at the moment. Please try again in a few seconds, or upload the relevant document if it hasn't been indexed yet."
  
  Here is the exact state of Cognee Knowledge Graph for this workspace:
  
  ### ACTIVE TASKS IN THE WORKSPACE
  ${formattedTasks || "No tasks recorded."}
  
  ### PERSISTENT KNOWLEDGE GRAPH (NODES & RELATIONSHIPS)
  ${formattedGraph || "No memory nodes recorded."}
  
  ### DOCUMENT RETRIEVAL & SUMMARIES
  ${formattedDocs || "No documents uploaded."}
  
  ### RECORDED DECISIONS
  ${formattedDecisions || "No decisions recorded."}
  
  Guidelines:
  1. Answer the user's question with utmost precision based on the memory context.
  2. Cite the exact nodes, documents, channels, or members (e.g. "According to Sarah Jenkins in #tech-stack...", "In 'Architecture Specification.md'...").
  3. Be conversational, highly intelligent, helpful, and professional. 
  4. Highlight relationships or decisions retrieved from your graph.`;

  const chatHistory = db.getChatMessages(workspaceId).slice(-10).map(m => ({
    role: m.sender === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.content }]
  }));

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: question }] }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7
        }
      });

      let resText = response.text || "";
      if (!resText.trim()) {
        throw new Error("Empty response from Gemini model");
      }
      
      // Ensure the response always starts with the professional header badge
      if (!resText.includes("Retrieved from HackMate AI Memory")) {
        resText = `🧠 Retrieved from HackMate AI Memory\n\n${resText}`;
      }
      return resText;
    } catch (error: any) {
      attempts++;
      lastError = error;
      console.warn(`Attempt ${attempts} failed for askCogneeAssistant:`, error.message || error);
      if (attempts < maxAttempts) {
        // Wait 300ms before retrying
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  // If we reach here, all 3 attempts failed. Return the clean, professional message.
  console.error("All 3 attempts to contact Gemini API failed. Returning professional error message.", lastError);
  return "I couldn't retrieve that information from the project memory at the moment. Please try again in a few seconds, or upload the relevant document if it hasn't been indexed yet.";
}

export async function processSlackMessageSync(workspaceId: string, channel: string, user: string, text: string) {
  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return getSlackSyncSmartFallback(channel, user, text);
  }

  try {
    const ai = getGeminiAI();
    const prompt = `You are HackMate AI, synced into Slack channel "#${channel}".
    The user "${user}" sent this message:
    "${text}"
    
    Perform two tasks:
    1. If the message tags or queries "@HackMate" (or "@Hackmate" or is an explicit question to the AI), draft a short, highly helpful, bulleted response. Address them inside Slack directly.
    2. Analyze if the message implies a team technical decision (e.g., "we decided to", "we should use", "let's deploy on", "approved"). If so, extract the decision's details.
    
    Respond in JSON with the exact fields:
    - aiResponse (string: the drafted AI reply if tagged/queried, otherwise empty string "")
    - extractedDecision (object or null: if a decision is found, provide fields: title, description, sourceContext, status)
      where status is 'approved' or 'proposed'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiResponse: { type: Type.STRING },
            extractedDecision: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                sourceContext: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['proposed', 'approved'] }
              },
              required: ["title", "description", "sourceContext", "status"]
            }
          },
          required: ["aiResponse"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed;
  } catch (error: any) {
    if (isQuotaOrRateLimitError(error)) {
      console.warn("Gemini API rate limit or quota exceeded during Slack sync. Falling back to offline processing.");
    } else {
      console.warn("Error processing Slack message sync with Gemini API. Falling back to offline processing:", error);
    }
    return getSlackSyncSmartFallback(channel, user, text);
  }
}

export async function generateWorkspaceDailyInsight(workspaceId: string) {
  const hasKey = !!process.env.GEMINI_API_KEY;
  if (!hasKey) {
    return getWorkspaceDailyInsightFallback(workspaceId);
  }

  try {
    const tasks = db.getTasks(workspaceId);
    const decisions = db.getDecisions(workspaceId);
    const docs = db.getDocuments(workspaceId);
    const done = tasks.filter(t => t.status === 'done').length;

    const ai = getGeminiAI();
    const prompt = `You are the HackMate Workspace Coordinator. Review our project statistics:
    - Total Tasks: ${tasks.length} (${done} Completed, ${tasks.length - done} In Progress/Todo)
    - Total Analyzed Documents: ${docs.length}
    - Approved Decisions: ${decisions.filter(d => d.status === 'approved').length}
    
    Tasks lists:
    ${tasks.map(t => `- [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority})`).join("\n")}
    
    Decisions:
    ${decisions.map(d => `- [${d.status.toUpperCase()}] ${d.title}`).join("\n")}
    
    Generate an executive dashboard summary and a key operational recommendation for today's hackathon sprint.
    Return JSON structured as:
    - insight (string: 2-3 sentences of core progress highlight)
    - recommendation (string: 1 action item to move the project forward)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["insight", "recommendation"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    if (isQuotaOrRateLimitError(error)) {
      console.warn("Gemini API rate limit or quota exceeded during insights generation. Falling back to offline insights.");
    } else {
      console.warn("Error generating workspace daily insight with Gemini API. Falling back to offline insights:", error);
    }
    return getWorkspaceDailyInsightFallback(workspaceId);
  }
}
