"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function VisionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={sectionRef}
            className="relative py-32 md:py-48 overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <motion.div
                style={{ y }}
                className="absolute inset-0"
            >
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-3xl" />
            </motion.div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <motion.div style={{ opacity }} className="text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-neon-purple text-sm font-semibold tracking-[0.3em] uppercase mb-8"
                    >
                        Our Vision
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8"
                    >
                        The AI{" "}
                        <span className="gradient-text">Operating System</span>
                        <br />
                        for the Future
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12"
                    >
                        We believe the future isn&apos;t about one AI to rule them all — it&apos;s
                        about{" "}
                        <span className="text-white font-semibold">
                            intelligent coordination
                        </span>{" "}
                        between many. Super Agent is building that coordination layer.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-8 text-center"
                    >
                        {[
                            { value: "5+", label: "AI Models Integrated" },
                            { value: "< 100ms", label: "Routing Latency" },
                            { value: "99.9%", label: "Accuracy Target" },
                            { value: "∞", label: "Scalable" },
                        ].map((stat) => (
                            <div key={stat.label} className="px-4">
                                <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
