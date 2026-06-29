import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, FileText, Cpu, Plus, Trash2, MessageSquare, AlertCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  systemPrompt: string;
}

interface Conversation {
  id: string;
  userEmail: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AIHubProps {
  jwtToken: string | null;
  customApiKey: string | null;
}

export const AIHub: React.FC<AIHubProps> = ({ jwtToken, customApiKey }) => {
  const [activeAgentId, setActiveAgentId] = useState('flow-architect');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agents: Agent[] = [
    {
      id: 'flow-architect',
      name: 'Flow Architect',
      role: 'Workflow Optimization Agent',
      desc: 'Expert in automation workflows, task assignment architectures, and operational structure design.',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 text-emerald-400',
      systemPrompt: 'You are the TechSetu Flow Architect. You specialize in software workflows, task prioritization, git branching, and productivity cycles.'
    },
    {
      id: 'system-guardian',
      name: 'System Guardian',
      role: 'Telemetry & Infrastructure Monitor',
      desc: 'Monitors container deployment, server metrics, resource leaks, and server security.',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 text-amber-400',
      systemPrompt: 'You are the TechSetu System Guardian. You specialize in DevOps pipelines, Docker containers, database optimization, and detecting server memory leaks.'
    },
    {
      id: 'content-strategist',
      name: 'Content Strategist',
      role: 'Creative & Technical Copywriting',
      desc: 'Generates product requirement sheets, newsletter templates, documentation outlines, and media plans.',
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/30 text-rose-400',
      systemPrompt: 'You are the TechSetu Content Strategist. You specialize in drafting technical specs, product launch newsletters, and copywriting release notes.'
    }
  ];

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversations list
  const loadConversations = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch('http://localhost:8081/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
  };

  useEffect(() => {
    if (jwtToken) {
      loadConversations();
    }
  }, [jwtToken]);

  // Load messages when active conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!jwtToken || !activeConvId) return;
      try {
        const res = await fetch(`http://localhost:8081/api/chat/conversations/${activeConvId}/messages`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (e) {
        console.error('Failed to load message history:', e);
      }
    };
    loadMessages();
  }, [activeConvId, jwtToken]);

  const handleCreateConversation = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch('http://localhost:8081/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ title: 'New Chat Session' })
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations(prev => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to create conversation:', e);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jwtToken) return;
    try {
      const res = await fetch(`http://localhost:8081/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !jwtToken) return;
    setErrorMessage(null);

    let currentConvId = activeConvId;

    // Create a conversation if none exists
    if (!currentConvId) {
      try {
        const res = await fetch('http://localhost:8081/api/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ title: text.substring(0, 30) })
        });
        if (res.ok) {
          const newConv = await res.json();
          setConversations(prev => [newConv, ...prev]);
          setActiveConvId(newConv.id);
          currentConvId = newConv.id;
        } else {
          setErrorMessage('Could not establish chat session.');
          return;
        }
      } catch (err) {
        setErrorMessage('Server connection error.');
        return;
      }
    }

    // Add User Message local state
    const userMsg: Message = {
      id: Math.random().toString(),
      conversationId: currentConvId || '',
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Initialize blank AI message state to stream into
    const aiMsgId = Math.random().toString();
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      conversationId: currentConvId || '',
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    // Stream from backend
    try {
      // If first message, prefix with persona instructions
      const isFirstMsg = messages.length === 0;
      const finalPrompt = isFirstMsg 
        ? `${activeAgent.systemPrompt}\n\nUser request: ${text}` 
        : text;

      const response = await fetch(`http://localhost:8081/api/chat/conversations/${currentConvId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          ...(customApiKey ? { 'X-Gemini-Key': customApiKey } : {})
        },
        body: JSON.stringify({ prompt: finalPrompt })
      });

      if (!response.ok) {
        setIsTyping(false);
        setMessages(prev => prev.filter(m => m.id !== aiMsgId));
        if (response.status === 400) {
          setErrorMessage('Gemini API key is not configured. Add it in settings.');
        } else {
          setErrorMessage(`API returned error code ${response.status}`);
        }
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsTyping(false);
        return;
      }

      const decoder = new TextDecoder('utf-8');
      let aiContentAccumulator = '';
      let buffer = '';

      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split('\n');
          let eventName = '';
          let dataContent = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              dataContent = line.substring(5).trim();
            }
          }

          if (eventName === 'chunk' && dataContent) {
            aiContentAccumulator += dataContent;
            setMessages(prev =>
              prev.map(m => m.id === aiMsgId ? { ...m, content: aiContentAccumulator } : m)
            );
          } else if (eventName === 'error' && dataContent) {
            setErrorMessage(dataContent);
            setMessages(prev => prev.filter(m => m.id !== aiMsgId));
            return;
          }
        }
      }

      // Sync conversation titles list
      loadConversations();

    } catch (e) {
      console.error(e);
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      setErrorMessage('Server SSE stream disconnected.');
    }
  };

  // Auth gate
  if (!jwtToken) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-card bg-white/2 border border-white/5 rounded-2xl h-[450px]">
        <Bot className="w-16 h-16 text-[var(--accent-primary)] animate-pulse mb-4" />
        <h3 className="text-base font-bold text-[var(--text-primary)]">AI Co-Pilot Hub Locked</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm leading-relaxed">
          Authentication is required to initialize secure chat pipelines with our specialist agents. Please sign in via the workspace controls.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[560px]">
      
      {/* Sidebar - Sessions & Agent selector */}
      <div className="md:col-span-1 flex flex-col space-y-4 overflow-hidden h-full">
        {/* Create chat */}
        <button
          onClick={handleCreateConversation}
          className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 w-full cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Chat
        </button>

        {/* Persona list */}
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider px-1">Selected Persona</span>
          <select
            value={activeAgentId}
            onChange={(e) => setActiveAgentId(e.target.value)}
            className="w-full text-xs bg-black/25 border border-white/5 text-[var(--accent-primary)] font-bold py-1.5 px-2.5 rounded-lg"
          >
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar pb-2">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider px-1 mb-1 block">Active Sessions</span>
          {conversations.length === 0 ? (
            <div className="text-[10px] text-center text-[var(--text-muted)] py-8 border border-dashed border-white/5 rounded-xl">No active sessions</div>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                  activeConvId === c.id 
                    ? 'border-[var(--accent-primary)]/20 bg-white/6 text-[var(--accent-primary)]' 
                    : 'border-transparent bg-white/2 hover:bg-white/4 text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate leading-none font-semibold">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5"
                  style={{ opacity: activeConvId === c.id ? 1 : undefined }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Hub */}
      <div className="md:col-span-3 glass-card bg-white/2 flex flex-col h-full border border-white/5">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-white/5 bg-black/15 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-lg border ${activeAgent.color} bg-white/2`}>
              {activeAgent.icon}
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">{activeAgent.name}</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">{activeAgent.role}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-0.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
            Online
          </span>
        </div>

        {/* Messages display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full text-[var(--text-muted)] space-y-2">
              <Bot className="w-10 h-10 text-[var(--accent-primary)]/40" />
              <p className="text-[11px]">Send a message to initialize developer logs with the {activeAgent.name}.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`p-1.5 rounded-lg border text-xs shrink-0 ${
                  msg.role === 'user' 
                    ? 'border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/5 text-[var(--accent-secondary)]' 
                    : `${activeAgent.color} bg-white/3`
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : activeAgent.icon}
                </div>

                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/15 text-[var(--text-primary)] rounded-tr-none'
                    : 'bg-white/4 border border-white/5 text-[var(--text-secondary)] rounded-tl-none font-mono whitespace-pre-wrap'
                }`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] pl-10">
              <Bot className="w-3.5 h-3.5 animate-bounce text-[var(--accent-primary)]" />
              <span>{activeAgent.name} is streaming response...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 max-w-[90%] mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>

        {/* Send message form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="p-3 border-t border-white/5 bg-black/20 flex gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-black/35 border border-white/8 text-xs py-2 px-3 rounded-lg"
            placeholder={`Message ${activeAgent.name}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary p-2 flex items-center justify-center rounded-lg cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
