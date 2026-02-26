"use client";

import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
    Product: ["Features", "Demo", "Architecture", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-dark-900">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <a href="#" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                Super Agent <span className="gradient-text">AI</span>
                            </span>
                        </a>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                            The intelligent AI orchestration platform. One interface, multiple
                            intelligences, perfect answers — automatically.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Github, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Mail, href: "#" },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-300"
                                    aria-label={`Social link ${i + 1}`}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-500 hover:text-white transition-colors duration-300"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} Super Agent AI. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600">
                        Built with ❤️ for the future of AI interaction.
                    </p>
                </div>
            </div>
        </footer>
    );
}
