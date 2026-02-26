"use client";

import { motion } from "framer-motion";

const nodes = [
    { id: "user", x: 400, y: 50, label: "User", sublabel: "Ask anything...", color: "#06b6d4", w: 140, h: 50 },
    { id: "ui", x: 400, y: 145, label: "User Interface", sublabel: "Unified Chat", color: "#3b82f6", w: 160, h: 50 },
    { id: "core", x: 400, y: 255, label: "Super Agent Core", sublabel: "Intent Analysis & NLU", color: "#8b5cf6", w: 210, h: 55 },
    { id: "classify", x: 400, y: 360, label: "Task Classification", sublabel: "Categorize Query Type", color: "#a855f7", w: 200, h: 50 },
    { id: "router", x: 400, y: 465, label: "AI Routing Engine", sublabel: "Smart Model Selection", color: "#6366f1", w: 200, h: 50 },
    // AI Models — 6 total, arranged in 2 rows of 3
    { id: "chatgpt", x: 140, y: 590, label: "ChatGPT", sublabel: "Reasoning", color: "#10a37f", w: 120, h: 45 },
    { id: "claude", x: 300, y: 590, label: "Claude", sublabel: "Coding", color: "#d97757", w: 110, h: 45 },
    { id: "gemini", x: 460, y: 590, label: "Gemini", sublabel: "Research", color: "#4285f4", w: 110, h: 45 },
    { id: "deepseek", x: 200, y: 665, label: "DeepSeek", sublabel: "Technical", color: "#3b82f6", w: 120, h: 45 },
    { id: "perplexity", x: 400, y: 665, label: "Perplexity", sublabel: "Live Data", color: "#20b2aa", w: 125, h: 45 },
    { id: "grok", x: 600, y: 665, label: "Grok", sublabel: "Creative", color: "#f43f5e", w: 100, h: 45 },
    // Aggregator
    { id: "aggregator", x: 400, y: 775, label: "Response Aggregator", sublabel: "Format + Attribution", color: "#ec4899", w: 210, h: 50 },
    { id: "response", x: 400, y: 870, label: "User", sublabel: "Unified Response", color: "#06b6d4", w: 140, h: 50 },
];

const edges = [
    { from: "user", to: "ui" },
    { from: "ui", to: "core" },
    { from: "core", to: "classify" },
    { from: "classify", to: "router" },
    { from: "router", to: "chatgpt" },
    { from: "router", to: "claude" },
    { from: "router", to: "gemini" },
    { from: "router", to: "deepseek" },
    { from: "router", to: "perplexity" },
    { from: "router", to: "grok" },
    { from: "chatgpt", to: "aggregator" },
    { from: "claude", to: "aggregator" },
    { from: "gemini", to: "aggregator" },
    { from: "deepseek", to: "aggregator" },
    { from: "perplexity", to: "aggregator" },
    { from: "grok", to: "aggregator" },
    { from: "aggregator", to: "response" },
];

function getNode(id: string) {
    return nodes.find((n) => n.id === id)!;
}

export default function ArchitectureSection() {
    return (
        <section id="architecture" className="section-padding relative overflow-hidden">
            <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-3xl" />

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-pink mb-4 border border-neon-pink/20">
                        System Architecture
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Under the <span className="gradient-text">hood</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A simplified view of how Super Agent orchestrates multiple AI systems
                        from input to output.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="glass-strong rounded-3xl p-4 md:p-8 border border-white/10"
                >
                    <svg viewBox="0 0 800 940" className="w-full h-auto" fill="none">
                        {/* Edges */}
                        {edges.map((edge, i) => {
                            const from = getNode(edge.from);
                            const to = getNode(edge.to);
                            return (
                                <motion.line
                                    key={i}
                                    x1={from.x}
                                    y1={from.y + from.h / 2}
                                    x2={to.x}
                                    y2={to.y - to.h / 2}
                                    stroke="url(#archGrad)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 0.4 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.05 }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node, i) => (
                            <motion.g
                                key={node.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <rect
                                    x={node.x - node.w / 2}
                                    y={node.y - node.h / 2}
                                    width={node.w}
                                    height={node.h}
                                    rx="12"
                                    fill={`${node.color}10`}
                                    stroke={node.color}
                                    strokeWidth="1"
                                    strokeOpacity="0.5"
                                />
                                <text
                                    x={node.x}
                                    y={node.y - 3}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="12"
                                    fontWeight="600"
                                    fontFamily="Inter, sans-serif"
                                >
                                    {node.label}
                                </text>
                                <text
                                    x={node.x}
                                    y={node.y + 13}
                                    textAnchor="middle"
                                    fill={node.color}
                                    fontSize="9"
                                    fontFamily="Inter, sans-serif"
                                    opacity="0.8"
                                >
                                    {node.sublabel}
                                </text>
                            </motion.g>
                        ))}

                        <defs>
                            <linearGradient id="archGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>
            </div>
        </section>
    );
}
