"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function CTASection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitted(true);
    };

    return (
        <section id="cta" className="section-padding relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-cyan/10 rounded-full blur-3xl" />

            <div className="max-w-3xl mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-blue/20 mb-8">
                        <Sparkles className="w-4 h-4 text-neon-blue" />
                        <span className="text-sm text-gray-300">Join the Future</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Ready to stop{" "}
                        <span className="gradient-text">switching AIs?</span>
                    </h2>

                    <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
                        Be among the first to experience the future of AI interaction. One
                        interface, every intelligence, zero friction.
                    </p>

                    {!submitted ? (
                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue/40 focus:outline-none transition-colors text-sm"
                            />
                            <button
                                type="submit"
                                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-xl hover:shadow-neon-blue/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Join Waitlist
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-3 text-neon-green"
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-lg font-semibold">
                                You&apos;re on the list! We&apos;ll be in touch soon.
                            </span>
                        </motion.div>
                    )}

                    <p className="text-xs text-gray-600 mt-4">
                        No spam. Unsubscribe anytime. We respect your privacy.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
