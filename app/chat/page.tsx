"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Send, Bot, User, Sparkles, Loader2, Link2, Search, Brain, Code2, Paintbrush, Radio,
    Zap, Plus, ChevronLeft, Mic, MicOff, Volume2, VolumeX, Folder, FolderPlus, MessageSquare, Trash2, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface MessageExtended {
    id: string;
    role: "user" | "assistant" | "system" | "data";
    content: string;
}

interface ChatSession {
    id: string;
    projectId: string | null;
    title: string;
    messages: MessageExtended[];
    updatedAt: number;
}

interface Project {
    id: string;
    name: string;
}

export default function ChatInterface() {
    // Persistence state
    const [projects, setProjects] = useState<Project[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [routedInfo, setRoutedInfo] = useState<{ route: string; taskType: string; simulated: boolean } | null>(null);
    const [conversationalMode, setConversationalMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // Vercel AI SDK hook
    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages, stop } = useChat({
        id: activeSessionId || "default",
        onResponse: (response: Response) => {
            const infoStr = response.headers.get("x-super-agent");
            if (infoStr) {
                try {
                    setRoutedInfo(JSON.parse(infoStr));
                } catch (e) {
                    console.error("Failed to parse routing info", e);
                }
            }
        },
        onFinish: (message) => {
            // Conversational mode (Text to Speech on response finish)
            if (conversationalMode && typeof window !== "undefined" && "speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(message.content);
                window.speechSynthesis.speak(utterance);
            }
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const recognitionRef = useRef<any>(null);

    // 1. Load data from localStorage on mount
    useEffect(() => {
        const storedProjects = localStorage.getItem("superAgentProjects");
        const storedChats = localStorage.getItem("superAgentChats");
        if (storedProjects) setProjects(JSON.parse(storedProjects));

        let loadedChats: ChatSession[] = [];
        if (storedChats) {
            loadedChats = JSON.parse(storedChats);
            setChatSessions(loadedChats);
            if (loadedChats.length > 0) {
                // Load the most recent chat, or top chat
                const recent = loadedChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                setActiveSessionId(recent.id);
                setMessages(recent.messages);
            }
        }

        if (!loadedChats.length) {
            // Create an initial empty chat if none exist
            createNewChat(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Save active chat messages to localStorage whenever they change
    useEffect(() => {
        if (!activeSessionId) return;

        setChatSessions((prev) => {
            const updated = prev.map((session) => {
                if (session.id === activeSessionId) {
                    return {
                        ...session,
                        messages: messages as MessageExtended[],
                        updatedAt: Date.now(),
                        title: messages.length > 0 && session.title === "New Chat"
                            ? (messages[0].content.substring(0, 30) + "...")
                            : session.title,
                    };
                }
                return session;
            });
            localStorage.setItem("superAgentChats", JSON.stringify(updated));
            return updated;
        });
    }, [messages, activeSessionId]);

    // Project management
    const createNewProject = () => {
        const name = prompt("Enter project name:");
        if (!name) return;
        const newProject = { id: uuidv4(), name };
        const updated = [...projects, newProject];
        setProjects(updated);
        localStorage.setItem("superAgentProjects", JSON.stringify(updated));
    };

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete project and all its chats?")) return;
        const updatedProjects = projects.filter((p) => p.id !== id);
        const updatedChats = chatSessions.filter((c) => c.projectId !== id);
        setProjects(updatedProjects);
        setChatSessions(updatedChats);
        localStorage.setItem("superAgentProjects", JSON.stringify(updatedProjects));
        localStorage.setItem("superAgentChats", JSON.stringify(updatedChats));
        if (activeSessionId && updatedChats.find(c => c.id === activeSessionId) === undefined) {
            createNewChat(null);
        }
    };

    // Chat management
    const createNewChat = (projectId: string | null = null) => {
        const newChat: ChatSession = {
            id: uuidv4(),
            projectId,
            title: "New Chat",
            messages: [],
            updatedAt: Date.now(),
        };
        const updated = [...chatSessions, newChat];
        setChatSessions(updated);
        localStorage.setItem("superAgentChats", JSON.stringify(updated));
        setActiveSessionId(newChat.id);
        setMessages([]); // Clear current view
        setRoutedInfo(null);
    };

    const switchChat = (id: string) => {
        if (isLoading) stop();
        const chat = chatSessions.find((c) => c.id === id);
        if (!chat) return;
        setActiveSessionId(id);
        setMessages(chat.messages);
        setRoutedInfo(null);
        if (window.innerWidth < 768) setSidebarOpen(false); // Close sidebar on mobile
    };

    const deleteChat = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedChats = chatSessions.filter((c) => c.id !== id);
        setChatSessions(updatedChats);
        localStorage.setItem("superAgentChats", JSON.stringify(updatedChats));
        if (activeSessionId === id) {
            if (updatedChats.length > 0) switchChat(updatedChats[0].id);
            else createNewChat(null);
        }
    };

    // Scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Speech to text (Voice Input)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechReg = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechReg) {
                recognitionRef.current = new SpeechReg();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let transcript = "";
                    for (let i = 0; i < event.results.length; ++i) {
                        transcript += event.results[i][0].transcript;
                    }
                    setInput(transcript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                    // Auto-submit if in conversational mode
                    if (conversationalMode && formRef.current && input.trim()) {
                        formRef.current.requestSubmit();
                    }
                };
            }
        }
    }, [setInput, conversationalMode, input]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition isn't supported in this browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel(); // Stop talking if listening
            setInput("");
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    // UI Helpers
    const getModelIcon = (model: string) => {
        switch (model) {
            case "ChatGPT": return <Brain className="w-4 h-4" />;
            case "Claude": return <Code2 className="w-4 h-4" />;
            case "Gemini": return <Search className="w-4 h-4" />;
            case "Perplexity": return <Radio className="w-4 h-4" />;
            case "Grok": return <Paintbrush className="w-4 h-4" />;
            case "DeepSeek": return <Code2 className="w-4 h-4" />;
            default: return <Bot className="w-4 h-4" />;
        }
    };

    const getModelColor = (model: string) => {
        switch (model) {
            case "ChatGPT": return "from-[#74aa9c] to-[#10a37f]";
            case "Claude": return "from-[#d97757] to-[#c5694a]";
            case "Gemini": return "from-[#4285f4] to-[#669df6]";
            case "Perplexity": return "from-[#20b2aa] to-[#1abc9c]";
            case "Grok": return "from-[#f43f5e] to-[#e11d48]";
            case "DeepSeek": return "from-blue-500 to-indigo-600";
            default: return "from-neon-blue to-neon-purple";
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => { formRef.current?.requestSubmit(); }, 50);
    };

    // Render logic for sidebar items
    const unassignedChats = chatSessions.filter((c) => !c.projectId).sort((a, b) => b.updatedAt - a.updatedAt);

    return (
        <div className="flex h-screen bg-dark-900 text-gray-200 overflow-hidden font-sans">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed md:relative z-50 md:z-auto w-72 md:w-64 h-full border-r border-white/5 bg-dark-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <a href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">
                            Super Agent <span className="text-neon-blue">AI</span>
                        </span>
                    </a>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Global Controls */}
                <div className="p-3 shrink-0 flex gap-2">
                    <button
                        onClick={() => createNewChat(null)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                    <button
                        onClick={createNewProject}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        title="Create Project Folder"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                </div>

                {/* Sidebar Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6 custom-scrollbar">

                    {/* Projects Folders */}
                    {projects.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] px-2 mb-2 flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" /> Projects
                            </p>
                            <div className="space-y-4">
                                {projects.map(project => (
                                    <div key={project.id} className="space-y-1">
                                        <div className="group flex items-center justify-between text-xs text-gray-300 font-medium px-2 py-1.5 rounded-lg hover:bg-white/5">
                                            <div className="flex items-center gap-2">
                                                <Folder className="w-3.5 h-3.5 text-neon-purple" />
                                                {project.name}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => createNewChat(project.id)} className="p-1 hover:text-white"><Plus className="w-3 h-3" /></button>
                                                <button onClick={(e) => deleteProject(project.id, e)} className="p-1 text-red-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                        {/* Items falling under this project */}
                                        <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3.5">
                                            {chatSessions.filter(c => c.projectId === project.id).sort((a, b) => b.updatedAt - a.updatedAt).map(chat => (
                                                <div
                                                    key={chat.id}
                                                    onClick={() => switchChat(chat.id)}
                                                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${activeSessionId === chat.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                                                        }`}
                                                >
                                                    <span className="truncate flex-1">{chat.title}</span>
                                                    <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 shrink-0">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unassigned Chats */}
                    {unassignedChats.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] px-2 mb-2 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3" /> Recent Chats
                            </p>
                            <div className="space-y-0.5">
                                {unassignedChats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => switchChat(chat.id)}
                                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${activeSessionId === chat.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                                            }`}
                                    >
                                        <span className="truncate flex-1">{chat.title}</span>
                                        <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 shrink-0">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center shrink-0 border border-white/10">
                            <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">Local User</p>
                            <p className="text-[10px] text-neon-blue font-medium">Gemini Engine Active</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 relative bg-dark-900">

                {/* Dynamic header */}
                <header className="h-14 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>

                        {routedInfo ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={routedInfo.route + routedInfo.taskType + activeSessionId}
                                className="flex items-center gap-2"
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${getModelColor(routedInfo.route)} shadow-lg`}>
                                    {getModelIcon(routedInfo.route)}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-white tracking-wide">{routedInfo.route}</span>
                                    <span className="hidden sm:inline-block text-xs text-gray-500 ml-2 bg-white/5 px-2 py-0.5 rounded-full">{routedInfo.taskType}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#10b981] animate-pulse" />
                                <span className="text-sm font-semibold text-gray-300">Gemini Router Ready</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Conversational Mode Toggle */}
                        <button
                            onClick={() => {
                                setConversationalMode(!conversationalMode);
                                if (conversationalMode && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                            }}
                            className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${conversationalMode
                                ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                                : "bg-white/[0.03] border-white/5 text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {conversationalMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Conversational Mode</span>
                        </button>
                        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-semibold ml-2">
                            <Link2 className="w-3 h-3 text-neon-cyan" /> Keys loaded
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                    {/* Conversational mode overlay animation overlay */}
                    <AnimatePresence>
                        {conversationalMode && isRecording && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm z-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="w-32 h-32 rounded-full border-4 border-neon-blue/30 flex items-center justify-center animate-ping" />
                                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple animate-pulse blur-xl" />
                                <Mic className="absolute w-8 h-8 text-white z-10" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 z-10 relative">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-neon-blue/20">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                                        How can I help you today?
                                    </h1>
                                    <p className="text-gray-400 w-full max-w-xl text-sm md:text-base leading-relaxed">
                                        Ask anything. Gemini works in the background to analyze your intent and instantly routes your query to the most capable AI model (ChatGPT, Claude, Gemini, DeepSeek, etc.).
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full"
                                >
                                    {[
                                        { text: "Write a React component for a dashboard", icon: "💻" },
                                        { text: "Explain string theory simply", icon: "🧠" },
                                        { text: "What are the latest AI hardware trends?", icon: "📊" },
                                        { text: "Write a futuristic story about Mars", icon: "🚀" },
                                    ].map((s) => (
                                        <button
                                            key={s.text}
                                            onClick={() => handleSuggestionClick(s.text)}
                                            className="group text-left px-5 py-4 rounded-2xl glass-strong hover:bg-white/5 border border-white/5 hover:border-neon-blue/40 transition-all duration-300"
                                        >
                                            <span className="text-xl mb-2 block">{s.icon}</span>
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{s.text}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {messages.map((message: any) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex gap-3 md:gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role !== "user" && (
                                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${routedInfo ? getModelColor(routedInfo.route) : "from-neon-blue to-neon-purple"} shadow-lg mt-1`}>
                                                {routedInfo ? getModelIcon(routedInfo.route) : <Bot className="w-4 h-4 text-white" />}
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${message.role === "user"
                                                ? "bg-dark-700/80 text-white border border-white/5 rounded-br-sm backdrop-blur-md"
                                                : "bg-white/[0.02] text-gray-200 border border-white/5 rounded-bl-sm"
                                                }`}
                                        >
                                            {message.role === "assistant" && routedInfo && (
                                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5 text-xs font-medium uppercase tracking-wider">
                                                    <span className={`bg-gradient-to-r ${getModelColor(routedInfo.route)} text-transparent bg-clip-text`}>
                                                        {routedInfo.route}
                                                    </span>
                                                    <span className="text-gray-700">•</span>
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Brain className="w-3 h-3" /> {routedInfo.taskType}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-dark-800 prose-pre:border prose-pre:border-white/10 max-w-none">
                                                {message.content}
                                            </div>
                                        </div>

                                        {message.role === "user" && (
                                            <div className="w-8 h-8 rounded-xl bg-dark-700 border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-neon-blue/20">
                                            <Loader2 className="w-4 h-4 text-neon-blue animate-spin" />
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl rounded-bl-sm px-5 py-4 text-[15px] text-gray-400 flex items-center gap-2">
                                            <span className="animate-pulse">{routedInfo ? `Orchestrating using ${routedInfo.route}...` : "Gemini is analyzing intent & routing..."}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="shrink-0 border-t border-white/5 bg-dark-900/90 backdrop-blur-xl p-3 md:p-6 z-20">
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="max-w-4xl mx-auto relative flex items-center gap-2"
                    >
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                className="w-full bg-dark-800/80 border border-white/10 rounded-2xl pl-5 pr-[100px] py-4 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:bg-dark-800 transition-all shadow-inner"
                                placeholder={isRecording ? "Listening..." : "Message Super Agent..."}
                                disabled={isLoading || isRecording}
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {/* Voice Input Button */}
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording
                                        ? "bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse"
                                        : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                    title="Voice Typing (Dictation)"
                                >
                                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !(input || "").trim() || isRecording}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-neon-blue/20 transition-all hover:scale-105"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="text-center mt-3 flex items-center justify-center gap-2">
                        <p className="text-[11px] text-gray-500 font-medium">Gemini Auto-Router Active</p>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <p className="text-[11px] text-gray-500">History saved locally</p>
                    </div>
                </div>
            </main>

            {/* Global overrides for beautiful custom scrollbars just for the chat page */}
            <style dangerouslySetInnerHTML={{
                __html: `
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #24243c; border-radius: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}} />
        </div>
    );
}
