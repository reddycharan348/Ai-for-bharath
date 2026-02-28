"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    if (match) {
                        return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
                    }
                    return (
                        <code className="bg-white/10 text-[#e2b714] px-1.5 py-0.5 rounded-md text-[0.85em] font-mono" {...props}>
                            {children}
                        </code>
                    );
                },
                p({ children }) {
                    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                },
                h1({ children }) {
                    return <h1 className="text-xl font-bold mb-3 mt-4 text-white">{children}</h1>;
                },
                h2({ children }) {
                    return <h2 className="text-lg font-bold mb-2 mt-3 text-white">{children}</h2>;
                },
                h3({ children }) {
                    return <h3 className="text-base font-semibold mb-2 mt-3 text-white">{children}</h3>;
                },
                ul({ children }) {
                    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                },
                li({ children }) {
                    return <li className="leading-relaxed">{children}</li>;
                },
                blockquote({ children }) {
                    return <blockquote className="border-l-2 border-neon-blue/50 pl-4 my-3 italic text-gray-400">{children}</blockquote>;
                },
                a({ href, children }) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">{children}</a>;
                },
                table({ children }) {
                    return <div className="overflow-x-auto my-3"><table className="min-w-full border border-white/10 rounded-lg text-sm">{children}</table></div>;
                },
                thead({ children }) {
                    return <thead className="bg-white/5">{children}</thead>;
                },
                th({ children }) {
                    return <th className="px-3 py-2 text-left font-medium text-gray-300 border-b border-white/10">{children}</th>;
                },
                td({ children }) {
                    return <td className="px-3 py-2 border-b border-white/5">{children}</td>;
                },
                hr() {
                    return <hr className="my-4 border-white/10" />;
                },
                strong({ children }) {
                    return <strong className="font-semibold text-white">{children}</strong>;
                },
                em({ children }) {
                    return <em className="italic text-gray-300">{children}</em>;
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
