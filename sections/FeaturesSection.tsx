"use client";

import { motion } from "framer-motion";
import {
    Layers,
    Brain,
    GitBranch,
    Users,
    FileText,
    Shield,
    MessageSquare,
    Puzzle,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: Layers,
        title: "Unified AI Interface",
        description: "Access multiple specialized AI systems from one platform without switching applications.",
    },
    {
        icon: Brain,
        title: "Intelligent Intent Detection",
        description: "Automatically analyzes user queries to understand the purpose and task type.",
    },
    {
        icon: GitBranch,
        title: "Smart AI Routing Engine",
        description: "Dynamically routes queries to the most suitable AI model based on strengths.",
    },
    {
        icon: Users,
        title: "Multi-AI Collaboration",
        description: "Enables different AI systems to work together instead of functioning independently.",
    },
    {
        icon: FileText,
        title: "Unified Response Aggregation",
        description: "Formats and delivers responses in a consistent, seamless conversational interface.",
    },
    {
        icon: Shield,
        title: "AI Attribution Transparency",
        description: "Clearly indicates which AI model generated the response for trust and clarity.",
    },
    {
        icon: MessageSquare,
        title: "Context-Aware Conversations",
        description: "Maintains conversation history for intelligent follow-up responses.",
    },
    {
        icon: Puzzle,
        title: "Scalable & Modular Architecture",
        description: "Allows integration of future AI models, domain-specific tools, and advanced capabilities.",
    },
    {
        icon: Zap,
        title: "Productivity Optimization",
        description: "Eliminates time loss caused by platform switching and repetitive prompting.",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="section-padding relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-blue mb-4 border border-neon-blue/20">
                        Platform Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Everything you need.{" "}
                        <span className="gradient-text">Nothing you don&apos;t.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Built from the ground up for intelligent AI orchestration and
                        seamless productivity.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-500 group cursor-default"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-5 h-5 text-neon-blue" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
