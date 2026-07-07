import { createServerFn } from "@tanstack/react-start";
import { ZodError } from "zod";
import { askRequestSchema } from "../server/lib/validators";
import { runAgent } from "../server/lib/agent";
import { serverConfig } from "../server/config";
import { logError } from "../server/lib/logger";
import type { AgentResponse } from "../server/lib/types";

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => askRequestSchema.parse(data))
  .handler(async ({ data }): Promise<AgentResponse> => {
    // Strip image data when vision is disabled — prevents errors from non-vision models
    const request = !serverConfig.enableVision
      ? { ...data, image: undefined }
      : data;

    try {
      return await runAgent(request);
    } catch (err) {
      // Zod errors from nested validation (shouldn't reach here after inputValidator,
      // but guard anyway in case runAgent does its own parsing)
      if (err instanceof ZodError) {
        const firstIssue = err.issues[0];
        return {
          answer: "",
          answerMode: "short_answer",
          responseLanguage: "en",
          needsClarification: true,
          clarificationQuestion: firstIssue?.message ?? "Your request could not be understood. Please check your inputs and try again.",
          clarificationOptions: ["Try again with a clearer question"],
          confidence: "low",
        };
      }

      // Runtime / network errors — log type only, never the raw message
      logError("ask/runAgent", err instanceof Error ? err.constructor.name : "UnknownError");

      return {
        answer: "Sorry, I could not get an answer right now. Please try again in a moment.",
        answerMode: "short_answer",
        responseLanguage: "en",
        needsClarification: false,
        confidence: "low",
      };
    }
  });
