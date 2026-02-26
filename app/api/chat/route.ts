import { NextResponse } from "next/server";
import { streamText, generateObject } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 60;

// Setup Custom OpenAI compatible providers
const perplexity = createOpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY || "missing",
    baseURL: "https://api.perplexity.ai",
});
const deepseek = createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || "missing",
    baseURL: "https://api.deepseek.com/v1",
});
const grok = createOpenAI({
    apiKey: process.env.GROK_API_KEY || "missing",
    baseURL: "https://api.x.ai/v1",
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "Missing messages" }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1].content;

        // STEP 1: Intent Detection & Routing
        // We use a fast model (gemini-1.5-flash) to analyze the intent if an API key is provided
        let routedModel = "ChatGPT"; // Default fallback
        let taskType = "Reasoning";

        try {
            if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                const { object } = await generateObject({
                    model: google("gemini-1.5-flash"),
                    system: `You are the Super Agent Routing Engine. Analyze the user's latest query and select the BEST AI model to handle it.
Available models:
1. ChatGPT (Reasoning, logic, general conversation)
2. Claude (Coding, technical tasks, deep analysis)
3. Gemini (Research, multimodality, Google data)
4. DeepSeek (Advanced technical problem solving, open source alternative coding)
5. Perplexity (Real-time information, current events, live news)
6. Grok (Creative writing, humor, brainstorming)

Return a strictly formatted JSON with "route" and "taskType".`,
                    prompt: latestMessage,
                    schema: z.object({
                        route: z.enum([
                            "ChatGPT",
                            "Claude",
                            "Gemini",
                            "DeepSeek",
                            "Perplexity",
                            "Grok",
                        ]),
                        taskType: z.string().describe("A 1-3 word description of the detected task type (e.g., 'Code Generation', 'Real-Time News', 'Reasoning')."),
                    }),
                });
                routedModel = object.route;
                taskType = object.taskType;
            }
        } catch (e) {
            console.error("Routing detection failed, falling back to default.", e);
            // Let it use the fallback
        }

        // STEP 2: Call the appropriate provider
        // In this MVP, we pass dummy responses if API keys are missing to ensure the demo always works!
        let modelInstance;
        let fallbackWarning = "";

        switch (routedModel) {
            case "Claude":
                if (process.env.ANTHROPIC_API_KEY) {
                    if (process.env.ANTHROPIC_API_KEY.startsWith("sk-or-")) {
                        const orClient = createOpenAI({
                            apiKey: process.env.ANTHROPIC_API_KEY,
                            baseURL: "https://openrouter.ai/api/v1",
                        });
                        modelInstance = orClient("anthropic/claude-3-5-sonnet");
                    } else {
                        modelInstance = anthropic("claude-3-5-sonnet-20240620");
                    }
                } else {
                    fallbackWarning = " (Simulated: Missing Anthropic Key)";
                    modelInstance = null;
                }
                break;
            case "Gemini":
                if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                    modelInstance = google("gemini-1.5-pro");
                } else {
                    fallbackWarning = " (Simulated: Missing Google Key)";
                    modelInstance = null;
                }
                break;
            case "DeepSeek":
                if (process.env.DEEPSEEK_API_KEY) {
                    modelInstance = deepseek("deepseek-chat");
                } else {
                    fallbackWarning = " (Simulated: Missing DeepSeek Key)";
                    modelInstance = null;
                }
                break;
            case "Perplexity":
                if (process.env.PERPLEXITY_API_KEY) {
                    modelInstance = perplexity("sonar-pro");
                } else {
                    fallbackWarning = " (Simulated: Missing Perplexity Key)";
                    modelInstance = null;
                }
                break;
            case "Grok":
                if (process.env.GROK_API_KEY) {
                    modelInstance = grok("grok-beta");
                } else {
                    fallbackWarning = " (Simulated: Missing Grok Key)";
                    modelInstance = null;
                }
                break;
            case "ChatGPT":
            default:
                if (process.env.OPENAI_API_KEY) {
                    if (process.env.OPENAI_API_KEY.startsWith("sk-or-")) {
                        const orClient = createOpenAI({
                            apiKey: process.env.OPENAI_API_KEY,
                            baseURL: "https://openrouter.ai/api/v1",
                        });
                        modelInstance = orClient("openai/gpt-4o");
                    } else {
                        modelInstance = openai("gpt-4o");
                    }
                } else {
                    fallbackWarning = " (Simulated: Missing OpenAI Key)";
                    modelInstance = null;
                }
                break;
        }

        // Prepare response header string to tell the frontend what was chosen:
        const selectedAgentInfo = JSON.stringify({
            route: routedModel,
            taskType: taskType,
            simulated: !modelInstance,
        });

        if (!modelInstance) {
            // Return a simulated response if API key is not provided for the routed model.
            return new NextResponse(
                `[SIMULATED - Please add API key in .env.local to get real answers]\n\nThe Super Agent successfully analyzed your query: "${latestMessage}".\nIt detected the intent as **${taskType}** and intelligently routed this request to **${routedModel}**.\n\nBecause the ${routedModel} API key is missing from your environment variables, this is a placeholder response. To see the true power of the platform, add your API keys!`,
                {
                    headers: {
                        "x-super-agent": selectedAgentInfo,
                    },
                }
            );
        }

        // STEP 3: Stream the real AI Response
        const result = await streamText({
            model: modelInstance,
            system: `You are answering on behalf of the Super Agent AI Platform, functioning as the specialized model: ${routedModel}. The user queried you for a task categorized as ${taskType}.`,
            messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content,
            })),
        });

        return result.toTextStreamResponse({
            headers: {
                "x-super-agent": selectedAgentInfo,
            },
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error?.message || "An error occurred" },
            { status: 500 }
        );
    }
}
