"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot, Clock, Calendar, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning! ☀️";
        if (hour < 18) return "Good afternoon! 🌤️";
        return "Good evening! 🌙";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-neon-blue/20">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                    {getGreeting()}
                </h1>
                <h2 className="text-xl md:text-2xl font-medium text-gray-300 mb-4">
                    How can I help you today?
                </h2>
                <p className="text-gray-400 w-full max-w-xl text-sm md:text-base leading-relaxed">
                    Ask anything. Gemini works in the background to analyze your intent and instantly routes your query to the most capable AI model.
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
                        onClick={() => onSuggestionClick(s.text)}
                        className="group text-left px-5 py-4 rounded-2xl glass-strong hover:bg-white/5 border border-white/5 hover:border-neon-blue/40 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <span className="text-xl mb-2 block">{s.icon}</span>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{s.text}</span>
                    </button>
                ))}
            </motion.div>
        </div>
    );
}

export function TypingIndicator({ routedInfo }: { routedInfo: any }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-neon-blue/20">
                <Bot className="w-4 h-4 text-neon-blue animate-pulse" />
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl rounded-bl-sm px-5 py-4 text-[15px] flex flex-col gap-2 min-w-[200px]">
                {routedInfo ? (
                    <span className="text-neon-blue text-xs font-medium uppercase tracking-wider animate-pulse">
                        {routedInfo.route} is typing...
                    </span>
                ) : (
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider animate-pulse">
                        Analyzing intent & routing...
                    </span>
                )}

                {/* Skeleton Shimmer Animation */}
                <div className="flex flex-col gap-3 mt-1">
                    <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                    <div className="h-2 bg-white/10 rounded-full w-4/5 overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }}
                        />
                    </div>
                    <div className="h-2 bg-white/10 rounded-full w-2/3 overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function SessionTimeTracker() {
    const [timeData, setTimeData] = useState({ dateStr: "", timeStr: "" });
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    // Date & Time Tick (Independent of session stopwatch)
    useEffect(() => {
        setHasMounted(true);
        const updateTick = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
            const timeStr = now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true, hour: "numeric", minute: "2-digit" });
            setTimeData({ dateStr, timeStr });
        };

        updateTick();
        const interval = setInterval(updateTick, 1000);
        return () => clearInterval(interval);
    }, []);

    // Session Stopwatch Tick
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatSessionTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!hasMounted || !timeData.dateStr) return <div className="hidden lg:flex min-w-[300px]" />;

    return (
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-medium text-gray-400 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5" title="Indian Standard Time">
                <Calendar className="w-3.5 h-3.5 text-neon-blue" />
                <span>{timeData.dateStr}</span>
                <span className="text-gray-600 px-0.5">•</span>
                <span className="text-white">{timeData.timeStr} <span className="text-[9px] text-gray-500">IST</span></span>
            </div>

            <div className="w-px h-3.5 bg-white/10" />

            <div className="flex items-center gap-2" title="Session Duration">
                <Clock className="w-3.5 h-3.5 text-neon-purple" />
                <span className="text-neon-purple/80 tracking-widest font-mono min-w-[55px]">
                    {formatSessionTime(elapsedSeconds)}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                        title={isRunning ? "Pause" : "Play"}
                    >
                        {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => {
                            setIsRunning(false);
                            setElapsedSeconds(0);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
