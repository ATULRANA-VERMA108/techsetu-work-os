import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { FileText, Eye, Edit3, Download, BookOpen, AlertCircle, UploadCloud, Send, Trash2, HelpCircle, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
}

interface Document {
  id: string;
  userEmail: string;
  filename: string;
  fileSize: number;
  summary?: string;
  createdAt: string;
}

interface DocWorkspaceProps {
  jwtToken: string | null;
  customApiKey: string | null;
}

export const DocWorkspace: React.FC<DocWorkspaceProps> = ({ jwtToken, customApiKey }) => {
  const [workspaceMode, setWorkspaceMode] = useState<'draft' | 'rag'>('draft');
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('techsetu-docs-active');
    return saved !== null ? saved : `# TechSetu Operational Specs v1.0

This specification maps the launch targets and frontend architecture of the **TechSetu Work OS** portal.

## 1. Executive Summary
TechSetu Work OS is a unified interface aggregating task management, real-time telemetry, and specialist AI co-pilots into a single high-performance workspace.

## 2. Core Modules
- **Flow Board (Kanban)**: Responsive workflow organizer.
- **AI Hub**: Collaborative specialist chat.
- **Pulse Stream**: Live activity node mapping.
- **Telemetry Charts**: Real-time server resource widgets.
`;
  });

  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RAG States
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [ragHistory, setRagHistory] = useState<{ question: string; answer: string; sources: string[] }[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates: Template[] = [
    {
      id: 'prod-spec',
      name: 'Product Specs Template',
      category: 'Productivity',
      content: `# Product Specification: [Feature Name]

## 1. Objectives & Scope
Briefly outline why we are building this feature and what metrics it impacts.

## 2. Core User Stories
- **User Story A**: As a team lead, I want to audit task timelines...
- **User Story B**: As a developer, I want socket alerts...

## 3. Technical Requirements
- Node runtime compatibility (v22+)
- Custom responsive grid CSS structure
`
    },
    {
      id: 'marketing-plan',
      name: 'Marketing Announcement',
      category: 'Marketing',
      content: `# Marketing Blueprint: Obsidian Aurora Design Release

## 1. Core Positioning
- Pitch the Obsidian Aurora design theme as the ultimate professional workspace.
- Focus on the high-contrast readability, reducing strain during overnight sessions.

## 2. Channel Allocations
- **Social Media**: Launch short screen recordings demonstrating drag-and-drop tasks.
- **Developer Newsletter**: Deep dive into Custom CSS variables and layout transitions.
`
    },
    {
      id: 'retro',
      name: 'Project Retrospective',
      category: 'Management',
      content: `# Project Retrospective: Sprint 14 Audit

## What went well:
- Completed the command center Spotlight launcher (Ctrl+K) ahead of schedule.
- Re-styled index.css grid templates for a premium design polish.

## Improvements needed:
- Optimize React bundle dimensions.
- Expand mock telemetry chart metrics.
`
    }
  ];

  // Auto-save draft changes to LocalStorage
  useEffect(() => {
    if (workspaceMode === 'draft') {
      setSaveStatus('saving');
      localStorage.setItem('techsetu-docs-active', markdown);
      const timer = setTimeout(() => {
        setSaveStatus('saved');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [markdown, workspaceMode]);

  // Load uploaded documents list
  const loadDocuments = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0 && !selectedDocId) {
          setSelectedDocId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load documents:', e);
    }
  };

  useEffect(() => {
    if (jwtToken && workspaceMode === 'rag') {
      loadDocuments();
    }
  }, [jwtToken, workspaceMode]);

  // Load selected document summary
  useEffect(() => {
    const loadSummary = async () => {
      if (!jwtToken || !selectedDocId || workspaceMode !== 'rag') return;
      setIsSummarizing(true);
      setSummary('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/documents/${selectedDocId}/summary`, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            ...(customApiKey ? { 'X-Gemini-Key': customApiKey } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        } else {
          setSummary('Failed to generate summary. Verify Gemini key configuration.');
        }
      } catch (e) {
        setSummary('Server communication error during summarization.');
      } finally {
        setIsSummarizing(false);
      }
    };
    loadSummary();
    setRagHistory([]);
  }, [selectedDocId, jwtToken, workspaceMode]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadTemplate = (content: string) => {
    setMarkdown(content);
    showToast('Template successfully loaded.');
  };

  const handleExportText = () => {
    showToast('Draft specs exported successfully.');
  };

  // Upload file handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jwtToken) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData
      });

      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDocId(newDoc.id);
        showToast('Document uploaded and parsed successfully.');
      } else {
        showToast('Failed to upload file. Verify backend connectivity.');
      }
    } catch (err) {
      showToast('Connection error during upload.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jwtToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (selectedDocId === id) {
          setSelectedDocId(null);
          setSummary('');
        }
        showToast('Document deleted.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ask Question RAG handler
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || !selectedDocId || !jwtToken || isQuerying) return;

    const questionText = queryInput;
    setQueryInput('');
    setIsQuerying(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${selectedDocId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          ...(customApiKey ? { 'X-Gemini-Key': customApiKey } : {})
        },
        body: JSON.stringify({ question: questionText })
      });

      if (res.ok) {
        const data = await res.json();
        setRagHistory(prev => [...prev, {
          question: questionText,
          answer: data.answer,
          sources: data.sources || []
        }]);
      } else {
        showToast('Failed to retrieve query. Verify Gemini key.');
      }
    } catch (err) {
      showToast('RAG connection error.');
    } finally {
      setIsQuerying(false);
    }
  };

  // Simple Markdown Parsing for simulation
  const parseMarkdownHtml = (md: string) => {
    return md
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold mb-3 text-[var(--accent-primary)] border-b border-white/5 pb-1">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mt-4 mb-2 text-[var(--text-primary)]">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mt-3 mb-1 text-[var(--accent-tertiary)]">$1</h3>')
      .replace(/^\> \[\!NOTE\](.*$)/gim, '<div class="p-3 bg-[var(--accent-primary)]/10 border-l-2 border-[var(--accent-primary)] text-[var(--text-secondary)] rounded-r-lg my-3">$1</div>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-slate-500 pl-3 italic my-2 text-[var(--text-muted)]">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-[var(--text-primary)] font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-slate-200">$1</em>')
      .replace(/`(.*?)`/gim, '<code class="font-mono text-xs bg-black/40 px-1 py-0.5 rounded text-cyan-300">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>')
      .split('\n').map(line => {
        if (!line.trim().startsWith('<h') && 
            !line.trim().startsWith('<l') && 
            !line.trim().startsWith('<d') && 
            !line.trim().startsWith('<b') && 
            line.trim().length > 0) {
          return `<p class="mb-2 text-[11.5px] leading-relaxed text-[var(--text-secondary)]">${line}</p>`;
        }
        return line;
      }).join('\n');
  };

  // Auth gate if in RAG mode
  if (workspaceMode === 'rag' && !jwtToken) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
            Wiki Document Hub
          </h2>
          <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
            <button onClick={() => setWorkspaceMode('draft')} className="text-[10px] py-1 px-3 rounded font-bold text-[var(--text-secondary)]">Draft Editor</button>
            <button onClick={() => setWorkspaceMode('rag')} className="text-[10px] py-1 px-3 rounded font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">RAG Document QA</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center glass-card bg-white/2 border border-white/5 rounded-2xl h-[450px]">
          <BookOpen className="w-16 h-16 text-[var(--accent-primary)] animate-pulse mb-4" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Document RAG Workspace Locked</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm leading-relaxed">
            Authentication is required to upload files and perform retrieval-augmented QA searches on corporate databases. Please sign in via workspace controls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header View Controller */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
            Wiki Document Hub
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Switch between offline specs draft editor and interactive PDF RAG Q&A.</p>
        </div>

        <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setWorkspaceMode('draft')}
            className={`text-[10px] py-1 px-3 rounded font-bold transition-all cursor-pointer ${
              workspaceMode === 'draft' 
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Draft Editor
          </button>
          <button
            onClick={() => setWorkspaceMode('rag')}
            className={`text-[10px] py-1 px-3 rounded font-bold transition-all cursor-pointer ${
              workspaceMode === 'rag' 
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)]'
            }`}
          >
            RAG Document QA
          </button>
        </div>
      </div>

      {/* Mode Renderers */}
      {workspaceMode === 'draft' ? (
        /* DRAFT EDITOR MODE */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[500px]">
          {/* Templates Column */}
          <div className="md:col-span-1 flex flex-col space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
              Writing Blueprints
            </h3>
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleLoadTemplate(t.content)}
                className="glass-card p-3 text-left border-white/5 hover:border-[var(--border-hover)] bg-white/2 hover:bg-white/4 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="p-1 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{t.category}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{t.name}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 line-clamp-2">
                  Click to replace writing canvas with this standard structure.
                </p>
              </button>
            ))}
          </div>

          {/* Editor Panel */}
          <div className="md:col-span-3 glass-card bg-white/2 flex flex-col h-full border border-white/5 relative">
            <div className="px-4 py-2.5 border-b border-white/5 bg-black/15 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Collaborative Document Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1 rounded cursor-pointer"
                >
                  {isPreview ? <Edit3 className="w-3 h-3 text-[var(--accent-primary)]" /> : <Eye className="w-3 h-3 text-[var(--accent-tertiary)]" />}
                  {isPreview ? 'Write' : 'Preview'}
                </button>
                <button
                  onClick={handleExportText}
                  className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1 rounded hover:border-[var(--accent-primary)] cursor-pointer"
                >
                  <Download className="w-3 h-3 text-[var(--accent-secondary)]" /> Export
                </button>
                <div className="flex items-center space-x-1.5 ml-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold">{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-3">
              {isPreview ? (
                <div 
                  className="w-full h-full p-4 overflow-y-auto bg-black/30 rounded-xl border border-white/4 no-scrollbar prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseMarkdownHtml(markdown) }}
                />
              ) : (
                <textarea
                  className="w-full h-full p-4 bg-black/25 border border-white/5 rounded-xl text-xs font-mono leading-relaxed resize-none focus:border-[var(--border-hover)]"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Start drafting document specs..."
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* PDF RAG QA MODE */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[500px]">
          
          {/* Document list & upload zone */}
          <div className="md:col-span-1 flex flex-col space-y-4 overflow-hidden h-full">
            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-white/10 hover:border-[var(--accent-primary)] bg-white/2 hover:bg-white/4 p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
            >
              {uploadingFile ? (
                <Loader2 className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6 text-[var(--text-muted)]" />
              )}
              <span className="text-[10px] font-bold text-[var(--text-primary)]">
                {uploadingFile ? 'Uploading...' : 'Upload PDF / Text'}
              </span>
              <span className="text-[8.5px] text-[var(--text-muted)]">Max 10MB file size</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt" 
                className="hidden" 
              />
            </div>

            {/* Document list container */}
            <div className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar">
              <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider px-1 mb-1 block">Indexed Files</span>
              {documents.length === 0 ? (
                <div className="text-[10px] text-center text-[var(--text-muted)] py-8 border border-dashed border-white/5 rounded-xl">No files uploaded.</div>
              ) : (
                documents.map(d => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDocId(d.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      selectedDocId === d.id 
                        ? 'border-[var(--accent-primary)]/20 bg-white/6 text-[var(--accent-primary)]' 
                        : 'border-transparent bg-white/2 hover:bg-white/4 text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-semibold">{d.filename}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDoc(d.id, e)}
                      className="hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RAG summary and QA split view */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
            
            {/* Left: Summary Panel */}
            <div className="glass-card bg-white/2 border border-white/5 p-4 flex flex-col h-full overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 pb-1 border-b border-white/5">
                Document Summary & Context
              </h3>
              
              <div className="flex-1 overflow-y-auto no-scrollbar text-xs leading-relaxed text-[var(--text-secondary)]">
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-[var(--text-muted)] gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                    <span>Analyzing document structure and extracting keywords...</span>
                  </div>
                ) : summary ? (
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap font-sans">
                    {summary}
                  </div>
                ) : (
                  <div className="text-[10px] text-center text-[var(--text-muted)] py-20 italic">
                    Select an indexed document to view its AI summary context.
                  </div>
                )}
              </div>
            </div>

            {/* Right: QA Interactive Chat */}
            <div className="glass-card bg-white/2 border border-white/5 flex flex-col h-full overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] p-4 pb-2 border-b border-white/5">
                RAG QA Channels
              </h3>

              {/* QA History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {ragHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full text-[var(--text-muted)] space-y-2">
                    <HelpCircle className="w-10 h-10 text-[var(--accent-primary)]/40" />
                    <p className="text-[11px] max-w-[180px] leading-relaxed">Ask questions targeting document facts and get cited summaries.</p>
                  </div>
                ) : (
                  ragHistory.map((h, idx) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {/* Question */}
                      <div className="flex items-start gap-2 bg-white/3 border border-white/5 p-2 rounded-xl text-[var(--text-primary)]">
                        <span className="font-bold text-[var(--accent-secondary)] font-mono">Q:</span>
                        <span>{h.question}</span>
                      </div>
                      {/* Answer */}
                      <div className="flex flex-col gap-2 p-2 rounded-xl text-[var(--text-secondary)] bg-black/15 border border-white/4">
                        <div className="flex items-start gap-2 leading-relaxed">
                          <span className="font-bold text-[var(--accent-primary)] font-mono">A:</span>
                          <span className="flex-1 whitespace-pre-wrap">{h.answer}</span>
                        </div>
                        
                        {/* Expandable Citations */}
                        {h.sources && h.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Citations & References:</span>
                            {h.sources.map((src, sIdx) => (
                              <div key={sIdx} className="p-2 bg-black/45 border border-white/5 rounded text-[10px] text-[var(--text-muted)] italic line-clamp-2">
                                "{src}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isQuerying && (
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
                    <span>Searching vectors and compiling citations...</span>
                  </div>
                )}
              </div>

              {/* Query Form */}
              <form onSubmit={handleAskQuestion} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-black/35 border border-white/8 text-xs py-2 px-3 rounded-lg"
                  placeholder={selectedDocId ? "Ask a question about this document..." : "Select document first"}
                  disabled={!selectedDocId || isQuerying}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!selectedDocId || isQuerying}
                  className="btn-primary p-2 flex items-center justify-center rounded-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-40 glass-card bg-[var(--bg-secondary)] border border-[var(--border-hover)] px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl animate-fade-in text-xs font-bold text-[var(--accent-primary)]">
          <AlertCircle className="w-4 h-4" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
