"use client";

import { motion } from "framer-motion";
import { UIMessage } from "ai";
import { Bot, User, Brain, Copy, RefreshCw, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { RoutedInfo } from "./types";

interface MessageBubbleProps {
    message: UIMessage;
    routedInfo: RoutedInfo | null;
    getModelIcon: (model: string) => React.ReactNode;
    getModelColor: (model: string) => string;
    onRegenerate: () => void;
    responseTime?: string;
}

export function MessageBubble({
    message,
    routedInfo,
    getModelIcon,
    getModelColor,
    onRegenerate,
    responseTime
}: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || "";
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: message.role === "user" ? 20 : -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex gap-3 md:gap-4 relative group ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
            {message.role !== "user" && (
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${routedInfo ? getModelColor(routedInfo.route) : "from-neon-blue to-neon-purple"} shadow-lg mt-1`}>
                    {routedInfo ? getModelIcon(routedInfo.route) : <Bot className="w-4 h-4 text-white" />}
                </div>
            )}

            <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm relative ${message.role === "user"
                    ? "bg-dark-700/80 text-white border border-white/5 rounded-br-sm backdrop-blur-md whitespace-pre-wrap"
                    : "bg-white/[0.02] text-gray-200 border border-white/5 rounded-bl-sm"
                    }`}
            >
                {/* Action Buttons */}
                <div className={`absolute -bottom-3 ${message.role === "user" ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-dark-800 border border-white/10 rounded-lg p-1 shadow-lg z-10 translate-y-2 group-hover:translate-y-0`}>
                    <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors" title="Copy Message">
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    {message.role === "assistant" && (
                        <button onClick={onRegenerate} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors" title="Regenerate Response">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {message.role === "assistant" && routedInfo && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5 text-xs font-medium uppercase tracking-wider">
                        <span className={`bg-gradient-to-r ${getModelColor(routedInfo.route)} text-transparent bg-clip-text font-bold`}>
                            {routedInfo.route}
                        </span>
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-500 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> {routedInfo.taskType}
                        </span>
                        {responseTime && (
                            <>
                                <span className="text-gray-700">•</span>
                                <span className="text-gray-500 text-[10px]">{responseTime}</span>
                            </>
                        )}
                    </div>
                )}
                <div className="max-w-none text-gray-200">
                    {message.role === "user"
                        ? message.parts?.map((part: any, i) => {
                            if (part.type === "text") {
                                return <span key={i}>{part.text}</span>;
                            }
                            return null;
                        })
                        : message.parts?.map((part: any, i) => {
                            if (part.type === "text") {
                                return <MarkdownRenderer key={i} content={part.text} />;
                            }
                            return null;
                        })
                    }
                </div>
            </div>

            {message.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-dark-700 border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                </div>
            )}
        </motion.div>
    );
}
