"use client";

import dynamic from "next/dynamic";

const ChatInterface = dynamic(() => import("./ChatComponent"), {
    ssr: false,
});

export default function ChatPage() {
    return <ChatInterface />;
}
