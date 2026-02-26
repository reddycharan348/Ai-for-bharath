"use client";

import { motion } from "framer-motion";
import { User, Zap, Brain, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
    { icon: User, label: "User", sublabel: "Ask anything", color: "from-neon-cyan to-neon-blue" },
    { icon: Zap, label: "Super Agent", sublabel: "Intent Analysis", color: "from-neon-blue to-neon-purple" },
    { icon: Brain, label: "Best AI", sublabel: "Smart Routing", color: "from-neon-purple to-neon-pink" },
    { icon: CheckCircle2, label: "Answer", sublabel: "Unified Response", color: "from-neon-pink to-neon-orange" },
];

export default function SolutionSection() {
    return (
        <section id="solution" className="section-padding relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-neon-blue mb-4 border border-neon-blue/20">
                        The Solution
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        One question.{" "}
                        <span className="gradient-text">Best AI. Instantly.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Super Agent automatically understands what you need and routes your
                        query to the most capable AI — no switching, no guessing.
                    </p>
                </motion.div>

                {/* Flow Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
                    {steps.map((step, i) => (
                        <div key={step.label} className="flex items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="relative group"
                            >
                                <div className={`w-36 h-36 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br ${step.color} p-[1px]`}>
                                    <div className="w-full h-full rounded-2xl bg-dark-800 flex flex-col items-center justify-center gap-3 group-hover:bg-dark-700 transition-colors duration-300">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                                            <step.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-sm">{step.label}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{step.sublabel}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Arrow */}
                            {i < steps.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 + 0.3 }}
                                    className="hidden md:flex items-center mx-3"
                                >
                                    <div className="w-8 h-[1px] bg-gradient-to-r from-white/20 to-white/5" />
                                    <ArrowRight className="w-4 h-4 text-white/30" />
                                </motion.div>
                            )}
                            {i < steps.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 + 0.3 }}
                                    className="flex md:hidden items-center my-2"
                                >
                                    <ArrowRight className="w-4 h-4 text-white/30 rotate-90" />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
