"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, GitBranch, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "system" | "assistant";
    content: string;
    routedTo?: string;
    taskType?: string;
    typing?: boolean;
}

const demoQueries = [
    {
        query: "Write Python code for binary search",
        routedTo: "Claude AI",
        taskType: "Coding",
        response:
            "```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```\nThis implementation runs in O(log n) time complexity with O(1) space.",
    },
    {
        query: "Explain quantum computing simply",
        routedTo: "ChatGPT",
        taskType: "Reasoning",
        response:
            "Quantum computing uses 'qubits' instead of regular bits. While a normal bit is either 0 or 1, a qubit can be both at once (superposition). This lets quantum computers explore many solutions simultaneously, making them incredibly powerful for specific types of problems like cryptography and drug discovery.",
    },
    {
        query: "Latest developments in AI regulation 2025",
        routedTo: "Perplexity AI",
        taskType: "Real-Time Research",
        response:
            "The EU AI Act entered full enforcement in February 2025, establishing risk-based categories for AI systems. The US has proposed the AI Accountability Framework, requiring impact assessments for high-risk applications. India's Digital India Act 2024 introduced AI governance guidelines focusing on responsible AI development.",
    },
    {
        query: "Write a creative story about a time traveler",
        routedTo: "Grok AI",
        taskType: "Creative",
        response:
            "The clock struck thirteen. Maya caught the extra chime like a secret whispered just for her. She pressed the worn brass button on her grandmother's watch, and the café around her folded like origami — past and future collapsing into a doorway only she could see. 'Just five minutes,' she told herself. But time travelers always say that.",
    },
];

export default function DemoSection() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentDemo, setCurrentDemo] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const processQuery = async (query: string) => {
        setShowSuggestions(false);
        setIsProcessing(true);
        const demo = demoQueries.find((d) => d.query === query) || demoQueries[currentDemo % demoQueries.length];

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: query }]);

        // Simulate routing
        await new Promise((r) => setTimeout(r, 800));
        setMessages((prev) => [
            ...prev,
            {
                role: "system",
                content: `Analyzing intent... Routing to ${demo.routedTo}`,
                routedTo: demo.routedTo,
                taskType: demo.taskType,
            },
        ]);

        // Simulate typing
        await new Promise((r) => setTimeout(r, 1200));
        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content: demo.response,
                routedTo: demo.routedTo,
                taskType: demo.taskType,
            },
        ]);

        setIsProcessing(false);
        setCurrentDemo((prev) => prev + 1);
        setInputValue("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;
        processQuery(inputValue.trim());
    };

    // Auto-demo on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messages.length === 0) {
                processQuery(demoQueries[0].query);
            }
        }, 2000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section id="demo" className="section-padding relative">
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-green mb-4 border border-neon-green/20">
                        Live Demo
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        See it in <span className="gradient-text">action</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Try asking a question. Watch Super Agent route it to the best AI.
                    </p>
                </motion.div>

                {/* Chat Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass-strong rounded-3xl overflow-hidden border border-white/10"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Super Agent AI</p>
                                <p className="text-gray-500 text-xs">Intelligent Routing Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-neon-green/60 animate-pulse" />
                            <span className="text-xs text-gray-500">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="min-h-[350px] max-h-[450px] overflow-y-auto p-6 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.role !== "user" && (
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "system"
                                                    ? "bg-neon-orange/10"
                                                    : "bg-gradient-to-br from-neon-blue to-neon-purple"
                                                }`}
                                        >
                                            {msg.role === "system" ? (
                                                <GitBranch className="w-4 h-4 text-neon-orange" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] ${msg.role === "user"
                                                ? "bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl rounded-br-md px-4 py-3"
                                                : msg.role === "system"
                                                    ? "bg-neon-orange/5 border border-neon-orange/20 rounded-2xl rounded-bl-md px-4 py-3"
                                                    : "bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3"
                                            }`}
                                    >
                                        {msg.routedTo && msg.role === "assistant" && (
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                                <span className="text-xs text-neon-blue">
                                                    Routed to: {msg.routedTo}
                                                </span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {msg.taskType}
                                                </span>
                                            </div>
                                        )}
                                        <p
                                            className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "text-white" : msg.role === "system" ? "text-neon-orange text-xs" : "text-gray-300"
                                                }`}
                                        >
                                            {msg.content}
                                        </p>
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && messages.length === 0 && (
                        <div className="px-6 pb-2 flex flex-wrap gap-2">
                            {demoQueries.map((demo) => (
                                <button
                                    key={demo.query}
                                    onClick={() => processQuery(demo.query)}
                                    className="px-3 py-1.5 rounded-xl glass border border-white/5 text-xs text-gray-400 hover:text-white hover:border-neon-blue/30 transition-all duration-300"
                                >
                                    {demo.query}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask anything..."
                                disabled={isProcessing}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-white/5 focus:border-neon-blue/30 focus:outline-none transition-colors duration-300 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isProcessing || !inputValue.trim()}
                                className="w-11 h-11 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center hover:shadow-lg hover:shadow-neon-blue/25 transition-all duration-300 disabled:opacity-50 hover:scale-105"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
