import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileText, Sparkles, Check, 
  HelpCircle, AlertCircle, RefreshCw, Layers, BookOpen, Terminal, Code, Cpu, ExternalLink
} from 'lucide-react';
import { Workspace, Document } from '../types';

interface DocumentsViewProps {
  workspace: Workspace;
  documents: Document[];
  onUploadSuccess: (newDoc: Document) => void;
}

const COGNEE_OFFICIAL_DOCS = [
  {
    id: 'cognee-quickstart',
    workspaceId: 'cognee-system',
    name: 'Cognee Python Quickstart Guide.md',
    type: 'md',
    category: 'Quickstart',
    size: '4.2 KB',
    summary: 'The official quickstart guide for Cognee. Explains how to install cognee, initialize vector/graph databases, add raw data, and run .cognify() to construct cognitive layers.',
    extractedInfo: {
      keyPoints: [
        "Cognee introduces a systematic .add() and .cognify() design pattern for LLM memory.",
        "Pipelines ingest textual data, map nodes and edges, and store them automatically.",
        "Offers multi-vector database and multi-graph database integrations.",
        "Allows direct querying via GRAPH, SIMILARITY, or HYBRID search strategies."
      ],
      decisions: [
        "Use .cognify() immediately after .add() to process queue items and structure the network.",
        "Configure search_type='HYBRID' for high-accuracy RAG workflows."
      ],
      techStack: ["Python", "Cognee", "OpenAI", "Gemini", "Milvus", "Qdrant", "Neo4j"]
    },
    fileContent: `## Cognee Python Quickstart

Cognee is an open-source framework designed to help AI applications build a **Cognitive Memory Layer**. It allows LLMs to automatically ingest raw textual or structured data, extract entities, identify semantic relationships, and store them inside a hybrid vector-and-graph memory architecture.

### 1. Installation
Install cognee using your preferred Python package manager:
\`\`\`bash
pip install cognee
\`\`\`

### 2. Configure Environment & API Keys
Cognee utilizes LLMs for extracting cognitive schemas and vector databases for similarity search. Configure your keys:
\`\`\`bash
export OPENAI_API_KEY="your-openai-api-key"
# Or configure other LLM providers (Gemini, Anthropic, Ollama, etc.)
export GEMINI_API_KEY="your-gemini-api-key"
\`\`\`

### 3. Build Your First Memory
Create a simple script to add facts and cognify them into memory:

\`\`\`python
import asyncio
import cognee

async def main():
    # 1. Add raw text to Cognee persistent repository
    await cognee.add(
        data = "Team Memory Leak is building HackMate AI, a developer teammate synced with Slack.",
        dataset_name = "hackmate_project"
    )
    
    # 2. Ingest, analyze, extract schemas, and build hybrid graph database
    await cognee.cognify()
    
    # 3. Search and query the memory graph using semantic similarity
    results = await cognee.search(
        query = "What is Team Memory Leak building?",
        search_type = "SIMILARITY"
    )
    
    for result in results:
        print(f"Retrieved node context: {result}")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

### 4. Running the Search Pipeline
Cognee supports different search types depending on your retrieval strategy:
- \`SIMILARITY\`: Pure semantic vector search for matching raw chunk context.
- \`GRAPH\`: Traverses extracted entity edges inside graph databases (Neo4j/FalkorDB).
- \`HYBRID\`: Merges graph paths with similarity scores for dense, hyper-grounded context.`,
    createdAt: '2026-07-04T00:00:00Z'
  },
  {
    id: 'cognee-vector-graph',
    workspaceId: 'cognee-system',
    name: 'Cognitive Infrastructure Settings.md',
    type: 'md',
    size: '5.8 KB',
    summary: 'Developer guide detailing how to customize Cognee backends. Demonstrates setting up Qdrant, Milvus, Neo4j, FalkorDB, and local PostgreSQL as target graph/vector stores.',
    extractedInfo: {
      keyPoints: [
        "Cognee abstracts DB providers allowing hot-swapping vector and graph engines.",
        "Supports Neo4j, FalkorDB, and local NetworkX out of the box.",
        "Qdrant and LanceDB are optimized for sub-millisecond retrieval.",
        "Runs an offline-first pipeline containing parsers, chunkers, and extractors."
      ],
      decisions: [
        "Use LanceDB for zero-dependency local embedded storage during hackathons.",
        "Enable NetworkX as the local graph model to avoid running a full Neo4j docker container."
      ],
      techStack: ["Qdrant", "Milvus", "Neo4j", "FalkorDB", "LanceDB", "PostgreSQL", "SQLite"]
    },
    fileContent: `## Cognee Hybrid Storage Architecture

Cognee is entirely database-agnostic. It coordinates:
1. **Vector Database**: For fast, high-density similarity indexing.
2. **Graph Database**: For mapping multi-hop relational schemas (e.g. \`User --[MADE_DECISION]--> TechChoice\`).
3. **Relational Database**: For local system-level storage, queues, and document tracking (defaulting to SQLite or PostgreSQL).

### 1. Database Configuration Syntax
You can configure Cognee database backends in Python:

\`\`\`python
import cognee

# Set graph database provider
cognee.config.set_graph_database_provider("neo4j")
cognee.config.set_graph_database_url("bolt://localhost:7687")
cognee.config.set_graph_database_username("neo4j")
cognee.config.set_graph_database_password("your-secure-password")

# Set vector database provider (Qdrant, Milvus, LanceDB, PGVector, etc.)
cognee.config.set_vector_db_provider("qdrant")
cognee.config.set_vector_db_url("http://localhost:6333")

# Set relational metadata database (PostgreSQL, SQLite)
cognee.config.set_relational_db_provider("postgresql")
\`\`\`

### 2. Available Integration Matrix
- **Graph Engines**: Neo4j, FalkorDB, NetworkX (in-memory python graph representation for fast serverless environments).
- **Vector Engines**: Qdrant, Milvus, LanceDB (highly recommended for local embedded memory), Weaviate, PGVector.
- **LLM Embeddings**: OpenAI Ada, Gemini Text Embeddings, Cohere, local HuggingFace transformers.

### 3. Pipeline Lifecycle Management
Every execution of \`await cognee.cognify()\` executes six distinct micro-services:
1. **Parser**: Translates PDF, TXT, or markdown into semantic paragraphs.
2. **Chunker**: Splits documents using token limits and overlapping margins.
3. **Embedder**: Generates mathematical vector matrices for each chunk.
4. **Entity Extractor**: Leverages Gemini/OpenAI to discover real-world nouns & objects.
5. **Relationship Linker**: Discovers parent-child or sibling links.
6. **Graph Publisher**: Deploys the completed schema to your graph store.`,
    createdAt: '2026-07-04T00:00:00Z'
  },
  {
    id: 'cognee-custom-schemas',
    workspaceId: 'cognee-system',
    name: 'Pydantic Graph Modeling.md',
    type: 'md',
    size: '6.5 KB',
    summary: 'Advanced Cognee modeling guide. Demonstrates how to register custom Pydantic models with Cognee to extract strictly structured user-defined entity networks.',
    extractedInfo: {
      keyPoints: [
        "Cognee matches unstructured text with python Pydantic classes during entity extraction.",
        "Pydantic descriptions direct Gemini on what attributes to map onto graph nodes.",
        "Prevents unorganized graph layouts and guarantees structured schema outputs.",
        "Perfect for translating conversations into clear relational maps."
      ],
      decisions: [
        "Implement Pydantic BaseModel wrappers to guide the entity extraction agent.",
        "Standardize on TechnicalDecision models to guarantee clear Slack-thread analytics."
      ],
      techStack: ["Pydantic", "Python", "LLMs", "Cognee"]
    },
    fileContent: `## Defining Custom Cognitive Graphs with Pydantic

One of Cognee's most powerful capabilities is **Schema-driven Entity Extraction**. Instead of relying on LLMs to invent arbitrary relationships, you can feed Cognee standard **Python Pydantic classes** to enforce strict structural graph models.

### 1. Building your Custom Models
Define your nodes and properties using standard Pydantic. Cognee translates fields into node attributes:

\`\`\`python
from pydantic import BaseModel, Field
from typing import List, Optional
import cognee

# 1. Define a specific Node representer
class DevTeammate(BaseModel):
    name: str = Field(description="The full name of the software engineer")
    skills: List[str] = Field(default=[], description="Coding languages or framework competencies")
    slack_handle: Optional[str] = Field(None, description="The user's Slack handle")

class TechnicalDecision(BaseModel):
    title: str = Field(description="The technical decision title or choice")
    rationale: str = Field(description="The primary technical reason behind this decision")
    author: DevTeammate = Field(description="The developer who proposed or decided this")
    technologies: List[str] = Field(default=[], description="List of libraries involved")

# 2. Register your models with Cognee Configuration
cognee.config.register_schema(TechnicalDecision)
\`\`\`

### 2. Processing Data with Custom Schemas
When you upload documents, Cognee will instruct Gemini to extract nodes that fit *only* your registered Pydantic models:

\`\`\`python
import asyncio
import cognee

async def process_docs():
    # Load architectural document
    await cognee.add(
        data = "Sarah Jenkins (skills: React, Framer Motion) decided to deploy on Google Cloud Run instead of AWS ECS because of cold starts.",
        dataset_name = "architecture_doc"
    )
    
    # Run the cognify engine matching the registered TechnicalDecision schema
    await cognee.cognify()
    
    # Retrieve strictly structured results
    decisions = await cognee.search(
        query = "Cloud Run decisions",
        search_type = "GRAPH"
    )
    
    print(decisions)
\`\`\`

### 3. Benefits of Strict Cognitive Schemas
- **Deterministic Schema**: Eliminates hallucinated relationship predicates (no more mismatched \`is_using\`, \`uses_tech\`, \`utilizes\` edges).
- **Interoperability**: Extracted entities map 1:1 with frontend TypeScript models or relational database tables.
- **Easy Visualization**: Graph layouts like D3 or Recharts can render clean, normalized nodes representing Teammates and Decisions.`,
    createdAt: '2026-07-04T00:00:00Z'
  }
];

export default function DocumentsView({ workspace, documents, onUploadSuccess }: DocumentsViewProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'cognee'>('workspace');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [detailTab, setDetailTab] = useState<'metadata' | 'content'>('metadata');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default selection when switching views
  useEffect(() => {
    if (activeTab === 'cognee') {
      setSelectedDoc(COGNEE_OFFICIAL_DOCS[0] as any);
      setDetailTab('content');
    } else {
      setSelectedDoc(documents[0] || null);
      setDetailTab('metadata');
    }
  }, [activeTab]);

  const simulatedTemplates = [
    {
      name: 'Cloud Run Configuration.yaml',
      content: 'apiVersion: serving.knative.dev/v1\nkind: Service\nmetadata:\n  name: hackmate-app\nspec:\n  template:\n    spec:\n      containers:\n        - image: gcr.io/hackmate-prod/server:latest\n          ports:\n            - containerPort: 3000\n          env:\n            - name: NODE_ENV\n              value: "production"\n            - name: COGNEE_MEMORY_LAYER\n              value: "enabled"',
      type: 'yaml',
      size: '1.2 KB'
    },
    {
      name: 'Presentation Pitch Roadmap.txt',
      content: 'HackMate AI Hackathon Pitch Outline:\n- Slide 1: Team Memory Leak. Problem description. Teams lose up to 30% of technical constraints.\n- Slide 2: The Solution. Relational memory graph inside Slack.\n- Slide 3: Tech Stack. React, Express, Cognee vector nodes, Gemini 3.5 models.\n- Slide 4: Growth Roadmap. SaaS pricing model at $15 per user/seat.',
      type: 'txt',
      size: '2.5 KB'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      await uploadDocumentToServer(file.name, file.name.split('.').pop() || 'txt', `${(file.size / 1024).toFixed(1)} KB`, text);
    };
    reader.readAsText(file);
  };

  const uploadDocumentToServer = async (name: string, type: string, size: string, fileContent: string) => {
    setUploading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, size, fileContent })
      });
      const data = await res.json();
      if (res.ok) {
        onUploadSuccess(data);
        setSelectedDoc(data);
        setDetailTab('metadata');
      } else {
        alert(data.error || 'Failed to upload document.');
      }
    } catch (e) {
      alert('Error connecting to backend server.');
    } finally {
      setUploading(false);
    }
  };

  const indexOfficialDocToWorkspace = async (doc: any) => {
    await uploadDocumentToServer(doc.name, 'md', doc.size, doc.fileContent);
  };

  // Helper to determine if a selected document is already indexed in the workspace
  const isDocIndexed = (docName: string) => {
    return documents.some(d => d.name === docName);
  };

  // Filter documents or Cognee docs
  const filteredWorkspaceDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCogneeDocs = COGNEE_OFFICIAL_DOCS.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F5F5F5] font-sans" id="documents-view-container">
      
      {/* Left panel: File Managers */}
      <div className="flex-1 p-8 overflow-y-auto h-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 tracking-tight">
              <FileText className="w-5 h-5 text-blue-500" />
              Document Intelligence Hub
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Build semantic long-term memory for your teammate graph by providing technical contexts.</p>
          </div>

          {/* Segmented Controller Tab Switcher */}
          <div className="flex bg-gray-200/60 p-1 rounded-2xl shrink-0 self-start sm:self-center border border-gray-100 shadow-inner">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-white text-[#0066FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📂 Workspace Hub
            </button>
            <button
              onClick={() => setActiveTab('cognee')}
              className={`py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cognee'
                  ? 'bg-white text-[#0066FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Cognee Developer Docs
            </button>
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'workspace' ? "Search indexed team files..." : "Search official Cognee framework guides..."}
            className="w-full px-4.5 py-3.5 bg-white border border-gray-100 rounded-2.5xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all text-gray-800 font-medium"
          />
        </div>

        {activeTab === 'workspace' ? (
          <>
            {/* Drag and drop upload block */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/20' 
                  : 'border-gray-200/80 hover:border-blue-500/30 hover:bg-blue-50/5 bg-white shadow-sm'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".txt,.md,.yaml,.yml,.json,.pdf"
              />

              {uploading ? (
                <div className="space-y-3 py-2">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-gray-700">Gemini is parsing & structuring document...</p>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide">Registering nodes & mapping relationships into Cognee Graph</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Drag & Drop Document Here</span>
                    <span className="text-[10px] text-gray-400 block mt-1">Supports TXT, MD, YAML, JSON, PDF (Max 10MB)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rapid Testing Presets */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <span className="block text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider mb-3">Simulate Workspace Document Upload</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {simulatedTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadDocumentToServer(tmpl.name, tmpl.type, tmpl.size, tmpl.content);
                    }}
                    disabled={uploading}
                    className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100/80 rounded-2xl text-left text-xs font-medium text-gray-600 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-gray-800 block truncate">{tmpl.name}</span>
                      <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{tmpl.size} • {tmpl.type.toUpperCase()}</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Indexed document list */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Indexed Team Knowledge ({filteredWorkspaceDocs.length})</h3>
              {filteredWorkspaceDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredWorkspaceDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-4 rounded-3xl border text-left cursor-pointer transition-all duration-300 ${
                        selectedDoc?.id === doc.id 
                          ? 'border-[#0066FF] bg-blue-50/15 shadow-sm shadow-blue-500/5' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl text-gray-500 ${selectedDoc?.id === doc.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-50'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-xs font-bold text-gray-800 truncate">{doc.name}</h4>
                          <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">{doc.size} • {doc.type.toUpperCase()}</span>
                        </div>
                        {doc.name.includes("Cognee") && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold font-mono rounded shrink-0">Official</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-3 leading-relaxed line-clamp-2">{doc.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-gray-100 rounded-3xl">
                  <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">No documents uploaded to this workspace yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Cognee Framework Documentation Tab */
          <div className="space-y-5">
            <div className="p-4 bg-blue-50/40 border border-blue-100/50 rounded-2.5xl flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-800 block">Interactive SDK Guides</span>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Browse official python API commands, hybrid configuration guidelines, and strict pydantic schemas. 
                  Click <strong>Index into Workspace Graph</strong> to feed any guide to your local active memory graph in real-time.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Official Documentation Guides ({filteredCogneeDocs.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCogneeDocs.map((guide) => {
                  const indexed = isDocIndexed(guide.name);
                  return (
                    <div
                      key={guide.id}
                      onClick={() => {
                        setSelectedDoc(guide as any);
                        setDetailTab('content');
                      }}
                      className={`p-5 rounded-3xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        selectedDoc?.id === guide.id 
                          ? 'border-[#0066FF] bg-blue-50/15 shadow-sm shadow-blue-500/5' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                              <Code className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">{guide.name}</h4>
                              <span className="text-[9px] font-bold text-blue-500 uppercase font-mono tracking-wider mt-0.5 block">{guide.category}</span>
                            </div>
                          </div>
                          {indexed ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-extrabold font-mono rounded-full shrink-0 flex items-center gap-1 border border-emerald-100">
                              <Check className="w-2.5 h-2.5" /> Indexed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-extrabold font-mono rounded-full shrink-0 border border-gray-100">
                              Not Synced
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{guide.summary}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-50/60 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-gray-400 font-mono">{guide.size}</span>
                        <span className="text-blue-500 flex items-center gap-1 hover:underline">
                          Read Document &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Gemini Analysis Details */}
      <div className="w-full lg:w-100 bg-white border-l border-gray-100 p-8 h-full overflow-y-auto flex flex-col shadow-sm">
        <AnimatePresence mode="wait">
          {selectedDoc ? (
            <motion.div
              key={selectedDoc.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Header Title Card */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${
                    selectedDoc.workspaceId === 'cognee-system'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {selectedDoc.workspaceId === 'cognee-system' ? 'Cognee Documentation File' : 'Active Workspace File'}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">{selectedDoc.size}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-2 leading-snug">{selectedDoc.name}</h3>
                <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">Last Synced: {new Date(selectedDoc.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Indexing Callout Banner if not indexed */}
              {selectedDoc.workspaceId === 'cognee-system' && !isDocIndexed(selectedDoc.name) && (
                <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 border border-blue-200/40 rounded-2.5xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Unindexed Document</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Connect this official guide with your active Workspace <strong>{workspace.name}</strong> memory. It will trigger Gemini entity indexing to feed vectors and graph nodes to your search agent.
                  </p>
                  <button
                    onClick={() => indexOfficialDocToWorkspace(selectedDoc)}
                    disabled={uploading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all duration-300 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Cognifying data structures...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5" />
                        <span>Index into Workspace Graph</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Already Indexed Indicator */}
              {selectedDoc.workspaceId === 'cognee-system' && isDocIndexed(selectedDoc.name) && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Success! Guide indexed into workspace memory.</span>
                </div>
              )}

              {/* Detail Sub-Tabs (Metadata Analysis vs Raw Content) */}
              <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 text-[11px] font-bold">
                <button
                  onClick={() => setDetailTab('metadata')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    detailTab === 'metadata' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📊 Graph Metadata
                </button>
                <button
                  onClick={() => setDetailTab('content')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    detailTab === 'content' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📖 Full Document
                </button>
              </div>

              {detailTab === 'metadata' ? (
                /* Metadata view */
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Summary */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">AI Structured Summary</span>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/60 border border-gray-100/50 rounded-2xl p-4">
                      {selectedDoc.summary}
                    </p>
                  </div>

                  {/* Key points extracted */}
                  {selectedDoc.extractedInfo.keyPoints && selectedDoc.extractedInfo.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Extracted Takeaways</span>
                      <div className="space-y-2">
                        {selectedDoc.extractedInfo.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-gray-600 leading-relaxed items-start">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decisions proposed/approved */}
                  {selectedDoc.extractedInfo.decisions && selectedDoc.extractedInfo.decisions.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100/80 pt-4">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Extracted Decisions</span>
                      <div className="space-y-2">
                        {selectedDoc.extractedInfo.decisions.map((decision, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50 border border-gray-100/60 rounded-xl text-xs text-gray-600 leading-relaxed">
                            <span className="font-bold text-blue-600 block text-[10px] font-mono tracking-wider uppercase mb-0.5">Approved Rules</span>
                            {decision}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies referenced */}
                  {selectedDoc.extractedInfo.techStack && selectedDoc.extractedInfo.techStack.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100/80 pt-4">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Cognitive Node Technologies</span>
                      <div className="flex gap-2 flex-wrap">
                        {selectedDoc.extractedInfo.techStack.map((tech, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-[10px] font-mono font-medium rounded-full text-gray-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Raw text view with beautiful typography and code blocks */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                    <span>Source Text (Markdown)</span>
                    <Terminal className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="bg-gray-950 text-gray-100 font-mono text-xs p-5 rounded-2.5xl overflow-x-auto max-h-[450px] overflow-y-auto leading-relaxed border border-gray-800 shadow-inner scrollbar-thin">
                    <pre className="whitespace-pre-wrap font-mono text-[11px] selection:bg-blue-500/30">
                      {selectedDoc.fileContent || "No raw content exists for this document."}
                    </pre>
                  </div>
                  {selectedDoc.workspaceId === 'cognee-system' && (
                    <p className="text-[10px] text-gray-400 leading-snug italic text-center">
                      Tip: Use these parameters directly in your workspace codes to interact with your graph nodes.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="p-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">Select a Document</span>
                <span className="text-[10px] text-gray-400 block mt-1">Choose any file from the workspace index or the Cognee developer guides to start reading.</span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
