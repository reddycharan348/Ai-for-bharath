"use client";

import { motion } from "framer-motion";
import { Shuffle, Clock, AlertTriangle, Layers } from "lucide-react";

const problems = [
    {
        icon: Shuffle,
        title: "AI Fragmentation",
        description: "Dozens of AI tools, each excelling at different tasks. No single model does everything well.",
        color: "text-neon-orange",
        glowColor: "group-hover:shadow-neon-orange/20",
    },
    {
        icon: Clock,
        title: "Constant Switching",
        description: "Users waste hours switching between ChatGPT, Claude, Gemini, and others for different tasks.",
        color: "text-neon-pink",
        glowColor: "group-hover:shadow-neon-pink/20",
    },
    {
        icon: AlertTriangle,
        title: "Workflow Interruption",
        description: "Context is lost between platforms. Copy-pasting prompts kills creativity and momentum.",
        color: "text-neon-orange",
        glowColor: "group-hover:shadow-neon-orange/20",
    },
    {
        icon: Layers,
        title: "Decision Fatigue",
        description: "Which AI is best for this task? Users shouldn't need to be AI experts to use AI.",
        color: "text-neon-pink",
        glowColor: "group-hover:shadow-neon-pink/20",
    },
];

export default function ProblemSection() {
    return (
        <section id="problem" className="section-padding relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-orange mb-4 border border-neon-orange/20">
                        The Problem
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        AI is powerful. But it&apos;s{" "}
                        <span className="gradient-text-warm">fragmented.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Today, getting the best AI answer means juggling multiple platforms,
                        losing context, and making decisions you shouldn&apos;t have to make.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {problems.map((problem, i) => (
                        <motion.div
                            key={problem.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`group glass rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-500 cursor-default hover:shadow-xl ${problem.glowColor}`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${problem.color} group-hover:scale-110 transition-transform duration-300`}>
                                <problem.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{problem.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{problem.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
