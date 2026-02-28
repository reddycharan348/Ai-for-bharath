import { UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";

// Helper: get text content from a UIMessage
export function getMessageText(message: UIMessage): string {
    if (!message.parts) return "";
    return message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
}

// Helper: migrate old-format messages (with `content`) to UIMessage format (with `parts`)
export function migrateMessage(msg: any): UIMessage {
    if (msg.parts && Array.isArray(msg.parts)) return msg as UIMessage;
    return {
        id: msg.id || uuidv4(),
        role: msg.role || "user",
        parts: [{ type: "text" as const, text: msg.content || "" }],
    };
}
