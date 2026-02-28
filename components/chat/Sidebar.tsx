"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderPlus, Folder, Trash2, LayoutGrid, MessageSquare, User, Zap, ChevronLeft, Search } from "lucide-react";
import { Project, ChatSession } from "./types";
import { useState } from "react";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    projects: Project[];
    chatSessions: ChatSession[];
    activeSessionId: string | null;
    createNewChat: (projectId: string | null) => void;
    createNewProject: () => void;
    deleteProject: (id: string, e: React.MouseEvent) => void;
    switchChat: (id: string) => void;
    deleteChat: (id: string, e: React.MouseEvent) => void;
}

export function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    projects,
    chatSessions,
    activeSessionId,
    createNewChat,
    createNewProject,
    deleteProject,
    switchChat,
    deleteChat
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = chatSessions.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some(msg =>
            msg.parts?.some((p: any) => p.type === "text" && p.text.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    const unassignedChats = filteredChats.filter((c) => !c.projectId).sort((a, b) => b.updatedAt - a.updatedAt);

    return (
        <>
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

            <aside
                className={`fixed md:relative z-50 md:z-auto w-72 md:w-64 h-full border-r border-white/5 bg-dark-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Header */}
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

                {/* Search Bar */}
                <div className="px-3 pb-3 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/30"
                        />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6 custom-scrollbar">
                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] px-2 mb-2 flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" /> Projects
                            </p>
                            <div className="space-y-4">
                                {projects.map(project => {
                                    const projectChats = filteredChats.filter(c => c.projectId === project.id).sort((a, b) => b.updatedAt - a.updatedAt);
                                    if (searchQuery && projectChats.length === 0) return null;

                                    return (
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
                                            <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3.5">
                                                {projectChats.map(chat => (
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
                                    );
                                })}
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

                {/* Footer */}
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
        </>
    );
}
