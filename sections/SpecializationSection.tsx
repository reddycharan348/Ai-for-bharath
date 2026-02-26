"use client";

import { motion } from "framer-motion";
import { Brain, Code2, Search, Radio, Palette, Cpu } from "lucide-react";

const models = [
    {
        name: "ChatGPT",
        specialty: "Reasoning & Conversations",
        description: "Complex reasoning, problem solving, and natural conversations with deep contextual understanding.",
        icon: Brain,
        color: "from-[#74aa9c] to-[#10a37f]",
        textColor: "text-[#10a37f]",
        tasks: ["Complex reasoning", "Problem solving", "Natural conversations"],
    },
    {
        name: "Claude",
        specialty: "Coding & Technical Logic",
        description: "Code generation, debugging, technical analysis, and structured logical thinking.",
        icon: Code2,
        color: "from-[#d97757] to-[#c5694a]",
        textColor: "text-[#d97757]",
        tasks: ["Code generation", "Debugging", "Technical analysis"],
    },
    {
        name: "Gemini",
        specialty: "Deep Research & Analysis",
        description: "Multi-modal research, data analysis, scientific reasoning, and comprehensive information synthesis.",
        icon: Search,
        color: "from-[#4285f4] to-[#669df6]",
        textColor: "text-[#4285f4]",
        tasks: ["Deep research", "Data analysis", "Information synthesis"],
    },
    {
        name: "DeepSeek",
        specialty: "Advanced Technical Solving",
        description: "Advanced technical problem solving, open-source alternative for deep code reasoning and mathematical analysis.",
        icon: Cpu,
        color: "from-blue-500 to-indigo-600",
        textColor: "text-blue-400",
        tasks: ["Technical problem solving", "Math reasoning", "Code analysis"],
    },
    {
        name: "Perplexity",
        specialty: "Real-Time Information",
        description: "Live web search, current events, real-time data retrieval with cited sources.",
        icon: Radio,
        color: "from-[#20b2aa] to-[#1abc9c]",
        textColor: "text-[#20b2aa]",
        tasks: ["Live search", "Current events", "Cited sources"],
    },
    {
        name: "Grok",
        specialty: "Creative Generation",
        description: "Creative writing, brainstorming, storytelling, and innovative content creation.",
        icon: Palette,
        color: "from-[#f43f5e] to-[#e11d48]",
        textColor: "text-[#f43f5e]",
        tasks: ["Creative writing", "Brainstorming", "Content creation"],
    },
];

export default function SpecializationSection() {
    return (
        <section id="specialization" className="section-padding relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-purple mb-4 border border-neon-purple/20">
                        AI Specializations
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Every AI has a{" "}
                        <span className="gradient-text">superpower</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        We don&apos;t replace AI models — we orchestrate them. Each model is
                        chosen for what it does best.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model, i) => (
                        <motion.div
                            key={model.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="gradient-border group cursor-default"
                        >
                            <div className="bg-dark-800 rounded-2xl p-7 h-full hover:bg-dark-700 transition-colors duration-500 relative overflow-hidden">
                                {/* Hover glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <model.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{model.name}</h3>
                                            <p className={`text-xs ${model.textColor}`}>{model.specialty}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                        {model.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {model.tasks.map((task) => (
                                            <span
                                                key={task}
                                                className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5"
                                            >
                                                {task}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
