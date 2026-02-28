import { NextResponse } from "next/server";
import { streamText, generateObject, convertToModelMessages } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
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
            const fallbackGoogleProvider = createGoogleGenerativeAI({
                apiKey: process.env.FALLBACK_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "missing",
            });
            if (process.env.FALLBACK_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                const { object } = await generateObject({
                    model: fallbackGoogleProvider("gemini-2.5-flash"),
                    system: `You are the Super Agent Routing Engine. Analyze the user's latest query and select the BEST AI model to handle it.
Available models:
1. ChatGPT (Reasoning, Problem solving, Natural conversations)
2. Claude (Code generation, Debugging, Technical analysis)
3. Gemini (Deep research, Data analysis, Information synthesis)
4. DeepSeek (Technical problem solving, Math reasoning, Code analysis)
5. Perplexity (Live search, Current events, Cited sources)
6. Grok (Creative writing, Brainstorming, Content creation)

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

        // STEP 1.5: Validate OpenRouter Credits First
        const keyMap: Record<string, string | undefined> = {
            ChatGPT: process.env.OPENAI_API_KEY,
            Claude: process.env.ANTHROPIC_API_KEY,
            DeepSeek: process.env.DEEPSEEK_API_KEY,
            Perplexity: process.env.PERPLEXITY_API_KEY,
            Grok: process.env.GROK_API_KEY,
            Gemini: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        };

        const checkCredits = async (apiKey: string | undefined): Promise<boolean> => {
            if (!apiKey || !apiKey.startsWith("sk-or-")) return true; // not an openrouter key, assume valid
            try {
                const res = await fetch("https://openrouter.ai/api/v1/credits", {
                    headers: { Authorization: `Bearer ${apiKey}` },
                });
                if (!res.ok) return true;
                const data = await res.json();

                const totalCredits = data?.data?.total_credits;
                const totalUsage = data?.data?.total_usage;

                if (totalCredits !== undefined && totalUsage !== undefined) {
                    if (totalCredits === 0) return false;
                    if (totalUsage >= totalCredits) return false;
                }

                return true;
            } catch (e) {
                return true; // proceed if validation api fails
            }
        };

        let ultimateForceFallback = false;

        if (!(await checkCredits(keyMap[routedModel]))) {
            console.log(`${routedModel} credentials completed. Forcing ultimate Gemini fallback directly...`);
            ultimateForceFallback = true;
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
                    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY.startsWith("sk-or-")) {
                        const orClient = createOpenAI({
                            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
                            baseURL: "https://openrouter.ai/api/v1",
                        });
                        modelInstance = orClient("google/gemini-2.5-pro");
                    } else {
                        modelInstance = google("gemini-2.5-pro");
                    }
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

        // STEP 3: Stream the AI Response
        // Convert UIMessage format (with `parts`) to model messages the AI SDK understands
        const modelMessages = await convertToModelMessages(messages);

        const fallbackGoogleProvider = createGoogleGenerativeAI({
            apiKey: process.env.FALLBACK_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "missing",
        });
        const ultimateFallbackModel = fallbackGoogleProvider("gemini-3-flash-preview");

        let chosenModel = modelInstance;
        let customExplicitPrompt = "";

        if (ultimateForceFallback || !modelInstance) {
            chosenModel = ultimateFallbackModel;
            usedFallback = true;
            routedModel = "Gemini 3 Flash Preview";
            if (ultimateForceFallback) {
                customExplicitPrompt = "\n\nCRITICAL INSTRUCTION: You MUST start your response EXACTLY with the phrase 'Actually the respected AI tool credential completed so I am selecting the Gemini 3 Flash Preview model.' and then provide the answer.";
            }
        }

        const systemPrompt = `You are a helpful AI assistant on the Super Agent AI Platform. Respond directly and helpfully to the user's query. Do NOT mention which model you are, do NOT mention fallbacks, credits, API keys, or routing. Just answer the question naturally.

CURRENT CONTEXT:
- Today's Date and Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "long" })} (IST)

IMPORTANT RULES FOR CODE:
- When writing code, ALWAYS provide the COMPLETE, FULL code. NEVER truncate, abbreviate, or use comments like "// ... rest of code" or "// existing code remains".
- Write out every single line of code the user needs. Do not skip sections.
- If the response is long, that is perfectly fine. Always prioritize completeness over brevity.${customExplicitPrompt}`;

        // Try with primary model first; on error, fall back to Gemini
        const tryStream = (model: any, sysPrompt: string, isFallback: boolean) => {
            const result = streamText({
                model,
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

        return tryStream(chosenModel, systemPrompt, usedFallback || ultimateForceFallback);
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error?.message || "An error occurred" },
            { status: 500 }
        );
    }
}
