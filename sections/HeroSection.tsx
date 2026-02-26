"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
                {/* Orbs */}
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/8 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -30, 20, 0], y: [0, 30, -40, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/8 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, 20, -20, 0], y: [0, -20, 30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-3xl"
                />
            </div>

            {/* Network nodes animation */}
            <div className="absolute inset-0">
                <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800">
                    {/* Connection lines */}
                    <motion.line
                        x1="200" y1="300" x2="600" y2="400"
                        stroke="url(#lineGrad1)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                    />
                    <motion.line
                        x1="1000" y1="200" x2="600" y2="400"
                        stroke="url(#lineGrad2)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.8 }}
                    />
                    <motion.line
                        x1="300" y1="600" x2="600" y2="400"
                        stroke="url(#lineGrad1)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.1 }}
                    />
                    <motion.line
                        x1="900" y1="600" x2="600" y2="400"
                        stroke="url(#lineGrad2)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.4 }}
                    />
                    <motion.line
                        x1="150" y1="150" x2="600" y2="400"
                        stroke="url(#lineGrad1)" strokeWidth="0.5"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, delay: 1.7 }}
                    />
                    <motion.line
                        x1="1050" y1="500" x2="600" y2="400"
                        stroke="url(#lineGrad2)" strokeWidth="0.5"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, delay: 2.0 }}
                    />

                    {/* Nodes */}
                    {[
                        { cx: 200, cy: 300, d: 0.3 },
                        { cx: 1000, cy: 200, d: 0.6 },
                        { cx: 300, cy: 600, d: 0.9 },
                        { cx: 900, cy: 600, d: 1.2 },
                        { cx: 150, cy: 150, d: 1.5 },
                        { cx: 1050, cy: 500, d: 1.8 },
                        { cx: 600, cy: 400, d: 0 },
                    ].map((node, i) => (
                        <motion.circle
                            key={i}
                            cx={node.cx} cy={node.cy}
                            r={i === 6 ? 8 : 4}
                            fill={i === 6 ? "#3b82f6" : "#8b5cf6"}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: i === 6 ? 0.8 : 0.5 }}
                            transition={{ duration: 0.5, delay: node.d }}
                        />
                    ))}

                    <defs>
                        <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-blue/20 mb-8"
                >
                    <Sparkles className="w-4 h-4 text-neon-blue" />
                    <span className="text-sm text-gray-300">
                        Intelligent AI Orchestration Platform
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
                >
                    <span className="text-white">One Interface.</span>
                    <br />
                    <span className="gradient-text">Every AI.</span>
                    <br />
                    <span className="text-white">Perfect Answers.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Ask once. Get the best intelligence automatically. Super Agent
                    analyzes your intent and routes to the perfect AI — seamlessly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <a
                        href="/chat"
                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold text-lg hover:shadow-xl hover:shadow-neon-blue/25 transition-all duration-300 hover:scale-105"
                    >
                        Go to Platform
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                        href="#demo"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-white font-semibold text-lg hover:border-neon-blue/30 hover:bg-white/5 transition-all duration-300"
                    >
                        See Live Demo
                    </a>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
