"use client";

import { UIMessage } from "ai";

export interface ChatSession {
    id: string;
    projectId: string | null;
    title: string;
    messages: UIMessage[];
    updatedAt: number;
}

export interface Project {
    id: string;
    name: string;
}

export interface RoutedInfo {
    route: string;
    taskType: string;
    simulated: boolean;
}
