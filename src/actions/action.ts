"use server";

import Job from "@/models/job";
import { jobSchema } from "@/app/api/job/schema";
import { fromZodError } from "zod-validation-error";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import connectDB from "@/config/db";
import type { JobInput } from "@/app/api/job/schema";
import OpenAI from "openai";
import { systemPrompt } from "@/lib/system-prompt";

type CreateJobResponse = {
  error: string | null;
  data: any | null;
  status?: number;
};

export async function getJobs(): Promise<CreateJobResponse> {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: "Unauthorized",
        data: null,
        status: 401,
      };
    }

    await connectDB();
    const jobs = await Job.find({ employerId: session.user.id }).populate(
      "employerId",
      "name email image companyDetails"
    );

    return {
      error: null,
      data: jobs,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return {
      error: "Failed to fetch jobs",
      data: null,
      status: 500,
    };
  }
}

export async function createJob(data: JobInput): Promise<CreateJobResponse> {
  const session = await auth();

  if (!session) {
    return {
      error: "Unauthorized",
      data: null,
      status: 401,
    };
  }

  // if(session.user.role !== "employer") {
  //   return {
  //     error: "Unauthorized",
  //     data: null,
  //     status: 401
  //   };
  // }

  try {
    await connectDB();

    // Validate request body
    const validationResult = jobSchema.safeParse(data);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return {
        error: validationError.message,
        data: null,
        status: 400,
      };
    }

    // Create job with employer ID from session
    const job = await Job.create({
      ...validationResult.data,
      price: 100,
      employerId: session.user.id,
    });

    // Populate employer details in response
    const populatedJob = await job.populate(
      "employerId",
      "name email image companyDetails"
    );

    // Revalidate the jobs page to update the UI
    revalidatePath("/employer/dashboard/jobs");

    return {
      error: null,
      data: populatedJob,
      status: 200,
    };
  } catch (error) {
    console.error("Error creating job:", error);
    return {
      error: "Internal server error",
      data: null,
      status: 500,
    };
  }
}

// Array of Groq API keys

const openaiApiKeys = JSON.parse(process.env.OPENAI_API_KEY as string);
let openaiLastSuccessfulKeyIndex: number = 0;

type ChatResponse = {
  response: string;
  context: { role: "user" | "assistant" | "system"; content: string }[];
  apiKeyIndex?: number;
  error?: string;
  isInitialGreeting?: boolean;
};

interface InterviewState {
  currentQuestion: string;
  previousUserResponseAnalysis?: string;
  interviewStage: "greeting" | "technical" | "behavioral" | "closing";
  questionCount: number;
  candidateResponses: string[];
}


// Utility to clean and validate JSON response
function parseAndValidateResponse(responseText: string): InterviewState | null {
  try {
    // Remove any markdown formatting or extra text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;

    const parsed = JSON.parse(cleanJson);

    // Validate required fields
    if (!parsed.currentQuestion || typeof parsed.currentQuestion !== "string") {
      throw new Error("Invalid or missing currentQuestion");
    }

    // Set defaults for missing fields
    return {
      currentQuestion: parsed.currentQuestion.trim(),
      previousUserResponseAnalysis: parsed.previousUserResponseAnalysis || "",
      interviewStage: parsed.interviewStage || "greeting",
      questionCount: parsed.questionCount || 1,
      candidateResponses: parsed.candidateResponses || [],
    };
  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
}

// Generate fallback response for error scenarios
function generateFallbackResponse(
  context: any[],
  query: string
): InterviewState {
  const isFirstMessage = context.length <= 1;

  if (isFirstMessage) {
    return {
      currentQuestion:
        "Hello! Welcome to your AI interview. I'm excited to learn more about you today. Let's start with a simple question: Could you please tell me a bit about yourself and your background?",
      previousUserResponseAnalysis: "",
      interviewStage: "greeting",
      questionCount: 1,
      candidateResponses: [],
    };
  }

  return {
    currentQuestion:
      "I apologize, but I didn't quite catch that. Could you please repeat or elaborate on your response?",
    previousUserResponseAnalysis: "Technical difficulty encountered",
    interviewStage: "technical",
    questionCount: context.length,
    candidateResponses: [],
  };
}

export async function chatAction(
  query: string,
  context: { role: "user" | "assistant" | "system"; content: string }[],
  apiKeyIndex?: number
): Promise<ChatResponse> {
  // Handle initial greeting
  if (!query || query.trim().length === 0) {
    const greeting = generateFallbackResponse([], "");
    return {
      response: JSON.stringify(greeting),
      context: [
        { role: "system", content: systemPrompt() },
        { role: "assistant", content: JSON.stringify(greeting) },
      ],
      isInitialGreeting: true,
    };
  }

  // Prevent context from getting too large (memory management)
  const MAX_CONTEXT_LENGTH = 50;
  let trimmedContext = context;
  if (context.length > MAX_CONTEXT_LENGTH) {
    // Keep system prompt and recent messages
    const systemPrompt = context.find((msg) => msg.role === "system");
    const recentMessages = context.slice(-MAX_CONTEXT_LENGTH + 1);
    trimmedContext = systemPrompt
      ? [systemPrompt, ...recentMessages]
      : recentMessages;
  }

  const newContext = [
    { role: "system", content: systemPrompt() },
    ...trimmedContext.filter((msg) => msg.role !== "system"), // Remove duplicate system messages
    { role: "user", content: query.trim() },
  ];

  // Determine starting API key
  const startIndex =
    apiKeyIndex !== undefined &&
    apiKeyIndex >= 0 &&
    apiKeyIndex < openaiApiKeys.length
      ? apiKeyIndex
      : openaiLastSuccessfulKeyIndex;

  let lastError: any = null;

  // Try all API keys with exponential backoff
  for (let attempt = 0; attempt < openaiApiKeys.length; attempt++) {
    const keyIndex = (startIndex + attempt) % openaiApiKeys.length;
    const apiKey = openaiApiKeys[keyIndex];

    try {
      const openai = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
        timeout: 10000, // 30 second timeout
      });

      const response = await openai.chat.completions.create({
        model: "gemma2-9b-it",
        messages: newContext as any,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = response.choices[0].message.content;

      if (!responseText) {
        throw new Error("Empty response from API");
      }

      // Parse and validate the response
      const parsedResponse = parseAndValidateResponse(responseText);

      if (!parsedResponse) {
        throw new Error("Invalid JSON response format");
      }

      const updatedContext = [
        ...newContext,
        { role: "assistant", content: responseText },
      ];

      // Success: update last successful key index
      openaiLastSuccessfulKeyIndex = keyIndex;

      return {
        response: responseText,
        context: updatedContext as any,
        apiKeyIndex: keyIndex,
      };
    } catch (error: any) {
      console.error(
        `API key ${keyIndex} failed (attempt ${attempt + 1}):`,
        error.message
      );
      lastError = error;

      // Check for rate limiting
      if (
        error.status === 429 ||
        error.message?.includes("rate_limit_exceeded")
      ) {
        // Wait before trying next key for rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // For other errors, try next key immediately
      if (attempt < openaiApiKeys.length - 1) {
        continue;
      }
    }
  }

  // All API keys failed - use fallback
  console.error("All API keys exhausted, using fallback response");
  const fallbackResponse = generateFallbackResponse(trimmedContext, query);
  const fallbackContext = [
    ...newContext,
    { role: "assistant", content: JSON.stringify(fallbackResponse) },
  ];

  return {
    response: JSON.stringify(fallbackResponse),
    context: fallbackContext as any,
    error: `API temporarily unavailable: ${
      lastError?.message || "Unknown error"
    }`,
  };
}

// Array of ElevenLabs API keys
const elevenlabsApiKeys = JSON.parse(process.env.ELEVENLABS_API_KEY as string);
let elevenlabsLastSuccessfulKeyIndex: number = 0; // Start with first key

export async function textToSpeech({
  text,
  voiceId = "m5qndnI7u4OAdXhH0Mr5",
  modelId = "eleven_flash_v2_5",
  apiKeyIndex,
}: {
  text: string;
  voiceId?: string;
  modelId?: string;
  apiKeyIndex?: number;
}): Promise<{
  audioData?: ArrayBuffer;
  apiKeyIndex?: number;
  error?: string;
}> {
  // Validate input
  if (!text || typeof text !== "string") {
    return { error: "Text is required" };
  }
  console.log("Elevenlabs apiKeyIndex", apiKeyIndex);
  // Prepare the request to ElevenLabs
  const voiceSettings = { stability: 0.5, similarity_boost: 0.5 };
  const requestBody = {
    text,
    model_id: modelId,
    output_format: "mp3_44100_128",
    voice_settings: voiceSettings,
  };

  // Determine starting key: provided apiKeyIndex or last successful key
  const startIndex =
    apiKeyIndex !== undefined &&
    apiKeyIndex >= 0 &&
    apiKeyIndex < elevenlabsApiKeys.length
      ? apiKeyIndex
      : elevenlabsLastSuccessfulKeyIndex;

  // Try keys: start with specified or last successful, then try others if needed
  for (let i = 0; i < elevenlabsApiKeys.length; i++) {
    const keyIndex = (startIndex + i) % elevenlabsApiKeys.length;
    const apiKey = elevenlabsApiKeys[keyIndex];

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Check for quota exceeded (HTTP 429 or specific error)
      if (response.status === 429) {
        continue; // Try next key
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData?.detail?.status === "quota_exceeded") {
          continue; // Try next key
        }
        return { error: `HTTP ${response.status}: ${response.statusText}` };
      }

      // Success: update last successful key index and return result
      elevenlabsLastSuccessfulKeyIndex = keyIndex;
      const audioData = await response.arrayBuffer();
      return { audioData, apiKeyIndex: keyIndex };
    } catch (error) {
      console.error(`API key ${keyIndex} failed:`, error);
      continue; // Try next key
    }
  }

  return { error: "All API keys exhausted or request failed" };
}

export async function generateSpeech({
  text,
  voiceId,
  modelId,
  apiKeyIndex,
}: {
  text: string;
  voiceId?: string;
  modelId?: string;
  apiKeyIndex?: number;
}) {
  const result = await textToSpeech({ text, voiceId, modelId, apiKeyIndex });

  if (result.error) {
    throw new Error(result.error);
  }

  const audioBuffer = Buffer.from(result.audioData!);
  const audioBase64 = audioBuffer.toString("base64");
  return { audioBase64, apiKeyIndex: result.apiKeyIndex };
}

interface PdfChatResponse {
  response: string;
  error?: string;
}

export async function pdfExtractChat(
  pdfData: string
): Promise<PdfChatResponse> {
  if (!pdfData || pdfData.trim().length === 0) {
    return {
      response: "",
      error: "No PDF data provided.",
    };
  }

  if (!pdfData || pdfData.trim().length === 0) {
    return {
      response: "",
      error: "No PDF data provided.",
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: JSON.parse(process.env.OPENAI_API_KEY as string)[0],
      baseURL: "https://api.groq.com/openai/v1",
    });

    const messages = [
      {
        role: "system",
        content: `You are an expert in extracting and structuring data from resumes. Your task is to analyze the provided resume content and generate a JSON object that strictly adheres to the following schema. Ensure all fields are included, using null, empty strings, or empty arrays for missing or unavailable data. Follow the schema's constraints exactly, including enum values and data formats.

Schema:
{
  "skill": ["array of skills as strings, e.g., 'React', 'JavaScript'. Use empty array if no skills are listed."],
  "state": "location as a string, e.g., 'India, Mumbai'. Use empty string if not specified.",
  "educationDetails": [
    {
      "collegeName": "college/university name as string, or empty string if not specified",
      "yearOfGraduation": "graduation year as a number (e.g., 2024), or null if not specified",
      "fieldOfStudy": "field of study as string, or empty string if not specified",
      "degree": "degree name as string, e.g., 'BSC', or empty string if not specified"
    }
  ],
  "experience": [
    {
      "companyName": "company name as string, or empty string if not specified",
      "companyWebsite": "company website URL as string, or empty string if not specified",
      "jobType": "job type, must be one of ['full-time', 'part-time', 'contract', 'freelance', 'internship'], or empty string if not specified",
      "jobTitle": "job title as string, or empty string if not specified",
      "startDate": "start date in ISO format (YYYY-MM-DD, e.g., '2023-01-15'), or null if not specified",
      "endDate": "end date in ISO format (YYYY-MM-DD, e.g., '2024-06-30'), or null if not specified or ongoing",
      "description": "job description as string, or empty string if not specified",
      "location": "job location as string, or empty string if not specified",
      "technologies": ["array of technologies used, e.g., 'React', 'Node.js'. Use empty array if not specified"],
      "isCurrent": "boolean, true if the job is ongoing, false otherwise, or false if not specified"
    }
  ],
  "projects": [
    {
      "title": "project title as string, or empty string if not specified",
      "link": "project URL as string, or empty string if not specified",
      "description": "project description as string, or empty string if not specified",
      "technologies": ["array of technologies used, e.g., 'React', 'AWS'. Use empty array if not specified"]
    }
  ],
  "socialLinks": {
    "linkedin": "LinkedIn URL as string (e.g., 'https://linkedin.com/in/username'), or empty string if not specified",
    "github": "GitHub URL as string (e.g., 'https://github.com/username'), or empty string if not specified",
    "x": "X/Twitter URL as string (e.g., 'https://x.com/username'), or empty string if not specified",
    "portfolio": "Portfolio URL as string (e.g., 'https://username.com'), or empty string if not specified"
  },
  "summary": "professional summary as string, or empty string if not specified",
  "tagline": "professional tagline as string, or empty string if not specified"
}

Rules:
1. **Strict Schema Adherence**: Include all fields exactly as defined in the schema, even if data is missing. Use null for missing dates or numbers, empty strings for missing strings, and empty arrays for missing arrays.
2. **Enum Validation**: For ' jobType', only use values from ['full-time', 'part-time', 'contract', 'freelance', 'internship']. If the resume uses a different term (e.g., 'Freelancer'), map it to the closest valid value (e.g., 'freelance'). If unclear, use an empty string.
3. **Date Format**: Convert any date formats in the resume (e.g., 'Jan 2023', 'January 2023') to ISO format (YYYY-MM-DD). If dates are ambiguous or missing, use null.
4. **Technologies and Skills**: Extract technologies and skills accurately, ensuring they are relevant (e.g., 'React', 'Node.js', not generic terms like 'coding'). Use empty arrays if not specified.
5. **Location**: Format 'state' and 'location' consistently, combining city and state/country if available (e.g., 'India, Mumbai'). Use empty string if not specified.
6. **Boolean Logic**: Set 'isCurrent' to true only if the resume explicitly indicates the job is ongoing (e.g., 'Present', 'Current'). Otherwise, set to false.
7. **URL Validation**: Ensure URLs in 'socialLinks' and 'projects.link' are valid and include the protocol (e.g., 'https://'). Remove any spaces or invalid characters. Use empty string if not specified.
8. **No Extra Fields**: Do not include any fields not defined in the schema.
9. **Empty Resume Handling**: If the resume lacks certain sections (e.g., no projects), return empty arrays or appropriate default values as specified.
10. **Output Format**: Return *only* the JSON object, with no additional text, comments, or formatting (e.g., no json markers). Ensure the JSON is valid and parseable.

Analyze the provided resume content carefully and return the JSON object matching the schema.`,
      },
      {
        role: "user",
        content: `Here is the PDF content to analyze:\n\n${pdfData}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gemma2-9b-it",
      messages: messages as any,
      response_format: {
        type: "json_object",
      },
    });

    const responseText =
      response.choices[0].message.content || "No response received.";

    return {
      response: responseText,
    };
  } catch (error: any) {
    console.error("PDF extraction chat failed:", error);
    return {
      response: "",
      error: "Failed to analyze PDF content. Please try again.",
    };
  }
}
