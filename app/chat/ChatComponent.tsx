"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { get, set } from "idb-keyval";
import { Sparkles, Loader2, Link2, Search, Brain, Code2, Paintbrush, Radio, Bot, Volume2, VolumeX, Mic, MicOff, Send, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Components
import { Project, ChatSession, RoutedInfo } from "../../components/chat/types";
import { getMessageText, migrateMessage } from "../../components/chat/helpers";
import { Sidebar } from "../../components/chat/Sidebar";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { EmptyState, TypingIndicator, SessionTimeTracker } from "../../components/chat/UIComponents";

export default function ChatInterface() {
    // -------------------------------------
    // 1. Core State
    // -------------------------------------
    const [projects, setProjects] = useState<Project[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    const [routedInfo, setRoutedInfo] = useState<RoutedInfo | null>(null);
    const [conversationalMode, setConversationalMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [localInput, setLocalInput] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    // Performance tracking state
    const [responseTimes, setResponseTimes] = useState<Record<string, string>>({});
    const startTimeRef = useRef<number | null>(null);

    // -------------------------------------
    // 2. Custom Transport to capture headers
    // -------------------------------------
    const customFetch: typeof fetch = useCallback(async (input: any, init?: any) => {
        const response = await fetch(input, init);
        const infoStr = response.headers.get("x-super-agent");
        if (infoStr) {
            try {
                setRoutedInfo(JSON.parse(infoStr));
            } catch (e) {
                console.error("Failed to parse routing info", e);
            }
        }
        return response;
    }, []);

    const transport = useMemo(
        () => new DefaultChatTransport({ api: "/api/chat", fetch: customFetch }),
        [customFetch]
    );

    // -------------------------------------
    // 3. AI SDK hook setup
    // -------------------------------------
    const recognitionRef = useRef<any>(null);

    const { messages, sendMessage, status, setMessages, stop } = useChat({
        id: activeSessionId || "default",
        transport,
        onFinish: ({ message }) => {
            // Calculate Response Time
            if (startTimeRef.current) {
                const duration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
                setResponseTimes(prev => ({ ...prev, [message.id]: `${duration}s` }));
                startTimeRef.current = null;
            }

            // Text-to-Speech handling
            if (conversationalMode && typeof window !== "undefined" && "speechSynthesis" in window) {
                const textContent = getMessageText(message);
                if (textContent) {
                    const utterance = new SpeechSynthesisUtterance(textContent);
                    utterance.onend = () => {
                        // Once finished speaking, turn mic back on to listen to user! (Duplex loop)
                        if (conversationalMode && recognitionRef.current) {
                            setTimeout(() => {
                                setIsRecording(true);
                                setLocalInput("");
                                try { recognitionRef.current.start(); } catch (e) { console.error("Mic restart failed", e); }
                            }, 500);
                        }
                    };
                    window.speechSynthesis.speak(utterance);
                }
            }
        },
        onError: (error) => console.error("Chat error:", error),
    });

    const isLoading = status === "submitted" || status === "streaming";

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const chatSessionsRef = useRef<ChatSession[]>([]);

    useEffect(() => { chatSessionsRef.current = chatSessions; }, [chatSessions]);

    // -------------------------------------
    // 4. Keyboard Shortcuts
    // -------------------------------------
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case "k":
                        e.preventDefault();
                        (document.querySelector('input[placeholder="Search chats..."]') as HTMLInputElement)?.focus();
                        break;
                    case "n":
                        e.preventDefault();
                        createNewChat(null);
                        break;
                }
            }
            if (e.key === "Escape" && isLoading) {
                stop();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    // -------------------------------------
    // 5. IndexedDB / LocalStorage Hydration
    // -------------------------------------
    useEffect(() => {
        const loadMemory = async () => {
            // First try IDB, fallback to localStorage migration if empty
            let storedProjects = await get("superAgentProjects");
            let storedChats = await get("superAgentChats");

            if (!storedProjects) {
                const ls = localStorage.getItem("superAgentProjects");
                if (ls) { storedProjects = JSON.parse(ls); set("superAgentProjects", storedProjects); }
            }
            if (!storedChats) {
                const ls = localStorage.getItem("superAgentChats");
                if (ls) { storedChats = JSON.parse(ls); set("superAgentChats", storedChats); }
            }

            if (storedProjects) setProjects(storedProjects);

            let loadedChats: ChatSession[] = [];
            if (storedChats) {
                loadedChats = storedChats.map((chat: any) => ({
                    ...chat,
                    messages: (chat.messages || []).map(migrateMessage),
                }));
                setChatSessions(loadedChats);
                chatSessionsRef.current = loadedChats;
                if (loadedChats.length > 0) {
                    const recent = loadedChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                    setActiveSessionId(recent.id);
                    setMessages(recent.messages);
                }
            }
            if (!loadedChats.length) createNewChat(null);
        };
        loadMemory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------------------------------------
    // 6. Save State Debounce
    // -------------------------------------
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!activeSessionId) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            const currentSessions = chatSessionsRef.current;
            const updated = currentSessions.map((session) => {
                if (session.id === activeSessionId) {
                    const firstMsgText = messages.length > 0 ? getMessageText(messages[0]) : "";
                    return {
                        ...session,
                        messages: messages as UIMessage[],
                        updatedAt: Date.now(),
                        title: messages.length > 0 && session.title === "New Chat"
                            ? (firstMsgText.substring(0, 30) + "...")
                            : session.title,
                    };
                }
                return session;
            });
            chatSessionsRef.current = updated;
            setChatSessions(updated);
            set("superAgentChats", updated);
        }, 500);
        return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
    }, [messages, activeSessionId]);

    // -------------------------------------
    // 7. Project & Chat Handlers 
    // -------------------------------------
    const createNewProject = () => {
        const name = prompt("Enter project name:");
        if (!name) return;
        const newProject = { id: uuidv4(), name };
        const updated = [...projects, newProject];
        setProjects(updated);
        set("superAgentProjects", updated);
    };

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete project and all its chats?")) return;
        const updatedProjects = projects.filter((p) => p.id !== id);
        const updatedChats = chatSessions.filter((c) => c.projectId !== id);
        setProjects(updatedProjects);
        setChatSessions(updatedChats);
        set("superAgentProjects", updatedProjects);
        set("superAgentChats", updatedChats);
        if (activeSessionId && updatedChats.find(c => c.id === activeSessionId) === undefined) {
            createNewChat(null);
        }
    };

    const createNewChat = (projectId: string | null = null) => {
        const newChat: ChatSession = { id: uuidv4(), projectId, title: "New Chat", messages: [], updatedAt: Date.now() };
        const updated = [...chatSessions, newChat];
        setChatSessions(updated);
        set("superAgentChats", updated);
        setActiveSessionId(newChat.id);
        setMessages([]);
        setRoutedInfo(null);
    };

    const switchChat = (id: string) => {
        if (isLoading) stop();
        const chat = chatSessions.find((c) => c.id === id);
        if (!chat) return;
        setActiveSessionId(id);
        setMessages(chat.messages);
        setRoutedInfo(null);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const deleteChat = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedChats = chatSessions.filter((c) => c.id !== id);
        setChatSessions(updatedChats);
        set("superAgentChats", updatedChats);
        if (activeSessionId === id) {
            if (updatedChats.length > 0) switchChat(updatedChats[0].id);
            else createNewChat(null);
        }
    };

    // -------------------------------------
    // 8. Auto-scroll
    // -------------------------------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // -------------------------------------
    // 9. Speech to Text
    // -------------------------------------
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechReg = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechReg) {
                recognitionRef.current = new SpeechReg();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.onresult = (event: any) => {
                    let transcript = "";
                    for (let i = 0; i < event.results.length; ++i) {
                        transcript += event.results[i][0].transcript;
                    }
                    setLocalInput(transcript);
                };
                recognitionRef.current.onerror = () => setIsRecording(false);
                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                    if (conversationalMode && formRef.current && localInput.trim()) {
                        formRef.current.requestSubmit();
                    }
                };
            }
        }
    }, [conversationalMode, localInput]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return alert("Speech recognition isn't supported in this browser.");
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setLocalInput("");
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    // -------------------------------------
    // 10. Form Submit and Model Visuals
    // -------------------------------------
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!localInput.trim() && !files?.length) || isLoading || isRecording) return;
        const message = localInput.trim() || "Analyze this file";
        setLocalInput("");
        const currentFiles = files; // capture current state
        setFiles(null);
        startTimeRef.current = Date.now();
        sendMessage({ text: message, files: currentFiles || undefined });
    };

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

    // -------------------------------------
    // 11. Render
    // -------------------------------------
    return (
        <div className="flex h-screen bg-dark-900 text-gray-200 overflow-hidden font-sans">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                projects={projects}
                chatSessions={chatSessions}
                activeSessionId={activeSessionId}
                createNewChat={createNewChat}
                createNewProject={createNewProject}
                deleteProject={deleteProject}
                switchChat={switchChat}
                deleteChat={deleteChat}
            />

            <main className="flex-1 flex flex-col min-w-0 relative bg-dark-900">
                {/* Header */}
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
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                key={routedInfo.route + routedInfo.taskType + activeSessionId}
                                className="flex items-center gap-2"
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${getModelColor(routedInfo.route)} shadow-lg`}>
                                    {getModelIcon(routedInfo.route)}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold bg-gradient-to-r ${getModelColor(routedInfo.route)} text-transparent bg-clip-text`}>
                                        {routedInfo.route}
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#10b981] animate-pulse" />
                                <span className="text-sm font-semibold text-gray-300">Super Agent AI</span>
                            </div>
                        )}
                    </div>

                    {/* Middle: Data & Time Tracker */}
                    <SessionTimeTracker />

                    <div className="flex items-center gap-3">
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
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
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
                            <EmptyState onSuggestionClick={(text) => { setLocalInput(""); startTimeRef.current = Date.now(); sendMessage({ text }); }} />
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {messages.map((message: UIMessage) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        routedInfo={routedInfo}
                                        getModelIcon={getModelIcon}
                                        getModelColor={getModelColor}
                                        onRegenerate={() => { }} // Not supported by current useChat hook without custom reload Logic
                                        responseTime={responseTimes[message.id]}
                                    />
                                ))}

                                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                                    <TypingIndicator routedInfo={routedInfo} />
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
                        onSubmit={handleFormSubmit}
                        className="max-w-4xl mx-auto relative flex items-center gap-2"
                    >
                        <div className="relative flex-1 group">
                            {files && files.length > 0 && (
                                <div className="absolute -top-16 left-0 flex items-center gap-2 bg-dark-800 p-2 rounded-lg border border-white/10 overflow-x-auto max-w-full">
                                    {Array.from(files).map((file, i) => (
                                        <div key={i} className="relative w-12 h-12 shrink-0 bg-dark-900 rounded border border-white/5 flex items-center justify-center overflow-hidden">
                                            {file.type.startsWith('image/') ? (
                                                <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-mono truncate px-1">{file.name.split('.').pop()}</span>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFiles(null)}
                                        className="w-6 h-6 ml-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <textarea
                                value={localInput}
                                onChange={(e) => setLocalInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (localInput.trim() && !isLoading && !isRecording) handleFormSubmit(e);
                                    }
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "56px";
                                    target.style.height = Math.min(target.scrollHeight, 200) + "px";
                                }}
                                rows={1}
                                style={{ minHeight: "56px" }}
                                className="w-full bg-dark-800/80 border border-white/10 rounded-2xl pl-5 pr-[100px] py-4 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:bg-dark-800 transition-all shadow-inner resize-none overflow-y-auto custom-scrollbar"
                                placeholder={isRecording ? "Listening..." : "Message Super Agent..."}
                                disabled={isLoading || isRecording}
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                <label className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-transparent text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer">
                                    <Paperclip className="w-4 h-4" />
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles(e.target.files)}
                                        className="hidden"
                                        accept="image/*,.pdf,.txt"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? "bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse" : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"}`}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || (!localInput.trim() && !files?.length) || isRecording}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-neon-blue/20 transition-all hover:scale-105"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="text-center mt-3 flex items-center justify-center gap-2">
                        <p className="text-[11px] text-gray-500 font-medium tracking-wide">Ctrl/Cmd + K to search • Ctrl/Cmd + N for new chat</p>
                    </div>
                </div>
            </main>

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
