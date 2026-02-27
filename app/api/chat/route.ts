import { NextResponse } from "next/server";
import { streamText, generateObject, convertToModelMessages } from "ai";
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

        // Extract text from the latest message (handle both UIMessage `parts` and legacy `content` format)
        const lastMsg = messages[messages.length - 1];
        const latestMessage = lastMsg.content
            || (lastMsg.parts
                ? lastMsg.parts
                    .filter((p: any) => p.type === "text")
                    .map((p: any) => p.text)
                    .join("")
                : "");

        // STEP 1: Intent Detection & Routing
        let routedModel = "ChatGPT"; // Default fallback
        let taskType = "Reasoning";

        try {
            if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                const { object } = await generateObject({
                    model: google("gemini-2.5-flash"),
                    system: `You are the Super Agent Routing Engine. Analyze the user's latest query and select the BEST AI model to handle it.
Available models:
1. ChatGPT (Reasoning, logic, general conversation)
2. Claude (Coding, technical tasks, deep analysis)
3. Gemini (Research, multimodality, Google data)
4. DeepSeek (Advanced technical problem solving, open source alternative coding)
5. Perplexity (Real-time information, current events, live news)
6. Grok (Creative writing, humor, brainstorming)

CRITICAL RULE: If the user explicitly asks for a VERY SPECIFIC model (e.g., "Hey Claude", "Ask Gemini", "Can DeepSeek...", "Use ChatGPT"), you MUST route to that explicitly requested model regardless of the task intent!
If no specific model is requested, route based on the task intent.

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
        }

        // STEP 2: Call the appropriate provider
        let modelInstance;
        let fallbackWarning = "";
        let usedFallback = false;

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
                    modelInstance = google("gemini-3-flash-preview");
                } else {
                    fallbackWarning = " (Simulated: Missing Google Key)";
                    modelInstance = null;
                }
                break;
            case "DeepSeek":
                if (process.env.DEEPSEEK_API_KEY) {
                    if (process.env.DEEPSEEK_API_KEY.startsWith("sk-or-")) {
                        const orClient = createOpenAI({
                            apiKey: process.env.DEEPSEEK_API_KEY,
                            baseURL: "https://openrouter.ai/api/v1",
                        });
                        modelInstance = orClient("deepseek/deepseek-chat");
                    } else {
                        modelInstance = deepseek("deepseek-chat");
                    }
                } else {
                    fallbackWarning = " (Simulated: Missing DeepSeek Key)";
                    modelInstance = null;
                }
                break;
            case "Perplexity":
                if (process.env.PERPLEXITY_API_KEY) {
                    if (process.env.PERPLEXITY_API_KEY.startsWith("sk-or-")) {
                        const orClient = createOpenAI({
                            apiKey: process.env.PERPLEXITY_API_KEY,
                            baseURL: "https://openrouter.ai/api/v1",
                        });
                        modelInstance = orClient("perplexity/sonar-pro");
                    } else {
                        modelInstance = perplexity("sonar-pro");
                    }
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

        // If the model instance is null (missing key), fall back to Gemini
        if (!modelInstance && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            modelInstance = google("gemini-3-flash-preview");
            usedFallback = true;
        }

        // STEP 3: Stream the AI Response
        // Convert UIMessage format (with `parts`) to model messages the AI SDK understands
        const modelMessages = await convertToModelMessages(messages);

        const geminiFlashModel = google("gemini-3-flash-preview");
        const chosenModel = modelInstance || geminiFlashModel;

        const systemPrompt = `You are a helpful AI assistant on the Super Agent AI Platform. Respond directly and helpfully to the user's query. Do NOT mention which model you are, do NOT mention fallbacks, credits, API keys, or routing. Just answer the question naturally.`;

        // Try with primary model first; on error, fall back to Gemini
        const tryStream = (model: any, sysPrompt: string, isFallback: boolean) => {
            const result = streamText({
                model,
                maxTokens: 2048,
                system: sysPrompt,
                messages: modelMessages,
                onError: async ({ error }) => {
                    console.error(`Model stream error (fallback=${isFallback}):`, error);
                },
            });

            const agentInfo = JSON.stringify({
                route: isFallback ? `Gemini (fallback from ${routedModel})` : routedModel,
                taskType: taskType,
                simulated: !modelInstance,
            });

            return result.toUIMessageStreamResponse({
                headers: {
                    "x-super-agent": agentInfo,
                },
            });
        };

        // If the chosen model is NOT Gemini and is using an OpenRouter key, pre-validate
        if (routedModel !== "Gemini" && !usedFallback) {
            // Check if the relevant key is an OpenRouter key — these may have credit limits
            const keyMap: Record<string, string | undefined> = {
                ChatGPT: process.env.OPENAI_API_KEY,
                Claude: process.env.ANTHROPIC_API_KEY,
                DeepSeek: process.env.DEEPSEEK_API_KEY,
                Perplexity: process.env.PERPLEXITY_API_KEY,
                Grok: process.env.GROK_API_KEY,
            };
            const relevantKey = keyMap[routedModel];
            if (relevantKey?.startsWith("sk-or-")) {
                // OpenRouter key detected — try a quick validation
                try {
                    const testRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
                        headers: { Authorization: `Bearer ${relevantKey}` },
                    });
                    const keyInfo = await testRes.json();
                    const credits = keyInfo?.data?.limit_remaining ?? keyInfo?.data?.usage_remaining ?? 0;
                    if (credits !== null && credits <= 0) {
                        console.log(`OpenRouter key for ${routedModel} has no credits, falling back to Gemini`);
                        const fallbackPrompt = `You are a helpful AI assistant on the Super Agent AI Platform. Respond directly and helpfully to the user's query. Do NOT mention which model you are, do NOT mention fallbacks, credits, API keys, or routing. Just answer the question naturally.`;
                        return tryStream(geminiFlashModel, fallbackPrompt, true);
                    }
                } catch (e) {
                    // If validation fails, proceed with the original model anyway
                    console.warn("OpenRouter key validation failed, proceeding with original model:", e);
                }
            }
        }

        return tryStream(chosenModel, systemPrompt, usedFallback);
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error?.message || "An error occurred" },
            { status: 500 }
        );
    }
}
