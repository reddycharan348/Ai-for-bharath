"use client";

import { useState } from "react";
import { Copy, Check, Code2, Play, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Component for rendering code blocks with a copy button and language badge
export function CodeBlock({ language, children }: { language: string; children: string }) {
    const [copied, setCopied] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [viewMode, setViewMode] = useState<"code" | "preview">("code");

    // Languages we can safely sandbox preview
    const isPreviewable = ["html", "svg", "xml"].includes((language || "").toLowerCase());

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getIframeContent = () => {
        if (language === "html" || language === "svg") {
            // Inject tailwind for standard styling within the preview
            return `
                <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>body { margin: 0; padding: 16px; color: #333; background: #fff; font-family: sans-serif; }</style>
                    </head>
                    <body>${children}</body>
                </html>
            `;
        }
        return children;
    };

    return (
        <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e2e]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 font-mono">{language || "code"}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isPreviewable && (
                        <div className="flex bg-white/5 rounded-lg p-0.5 overflow-hidden">
                            <button
                                onClick={() => setViewMode("code")}
                                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium transition-colors ${viewMode === "code" ? "bg-white/10 text-white rounded-md shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                            >
                                <Terminal className="w-3 h-3" /> Code
                            </button>
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium transition-colors ${viewMode === "preview" ? "bg-white/10 text-white rounded-md shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                            >
                                <Play className="w-3 h-3" /> Preview Sandbox
                            </button>
                        </div>
                    )}
                    {/* Optional line number toggle - hidden for clean UI, but easily enabled */}
                    {/* <button
                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                        className="text-xs text-gray-500 hover:text-gray-300 px-2 transition-colors"
                    >
                        #
                    </button> */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>

            {viewMode === "preview" && isPreviewable ? (
                <div className="w-full bg-white rounded-b-xl overflow-hidden h-[400px]">
                    <iframe
                        className="w-full h-full border-none"
                        srcDoc={getIframeContent()}
                        sandbox="allow-scripts"
                    />
                </div>
            ) : (
                <SyntaxHighlighter
                    language={language || "text"}
                    style={oneDark}
                    customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.85rem" }}
                    wrapLongLines
                    showLineNumbers={showLineNumbers}
                    lineNumberStyle={{ minWidth: "1.5em", paddingRight: "1em", color: "#6a737d", textAlign: "right" }}
                >
                    {children}
                </SyntaxHighlighter>
            )}
        </div>
    );
}
