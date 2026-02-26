"use client";

import { motion } from "framer-motion";
import { MessageSquare, Brain, GitBranch, Layers } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: MessageSquare,
        title: "Ask Anything",
        description:
            "Type your question naturally — whether it's about code, research, creative writing, or analysis. One input, infinite possibilities.",
        color: "text-neon-cyan",
        borderColor: "border-neon-cyan/20",
        bgColor: "bg-neon-cyan/5",
    },
    {
        number: "02",
        icon: Brain,
        title: "Intelligent Intent Detection",
        description:
            "Our NLU engine analyzes your query in real-time, identifying the task type — reasoning, coding, research, real-time info, or creative generation.",
        color: "text-neon-blue",
        borderColor: "border-neon-blue/20",
        bgColor: "bg-neon-blue/5",
    },
    {
        number: "03",
        icon: GitBranch,
        title: "Smart AI Routing",
        description:
            "The routing engine selects the optimal AI model — ChatGPT for reasoning, Claude for coding, Gemini for research, Perplexity for live data.",
        color: "text-neon-purple",
        borderColor: "border-neon-purple/20",
        bgColor: "bg-neon-purple/5",
    },
    {
        number: "04",
        icon: Layers,
        title: "Unified Response",
        description:
            "The selected AI generates the response, which is formatted consistently and delivered with clear AI attribution for full transparency.",
        color: "text-neon-green",
        borderColor: "border-neon-green/20",
        bgColor: "bg-neon-green/5",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="section-padding relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-cyan mb-4 border border-neon-cyan/20">
                        How It Works
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Four steps to{" "}
                        <span className="gradient-text">perfect answers</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        From question to answer in milliseconds. Here&apos;s the intelligence
                        behind every response.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`glass rounded-2xl p-8 border ${step.borderColor} hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden`}
                        >
                            {/* Subtle bg number */}
                            <span className="absolute -top-4 -right-2 text-[120px] font-black text-white/[0.02] leading-none select-none pointer-events-none group-hover:text-white/[0.04] transition-colors duration-500">
                                {step.number}
                            </span>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <step.icon className={`w-6 h-6 ${step.color}`} />
                                    </div>
                                    <span className={`text-sm font-mono ${step.color} opacity-60`}>
                                        Step {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
