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
import { createConversation } from "./checkpointer";

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

const openai = new OpenAI({
  apiKey: JSON.parse(process.env.OPENAI_API_KEY as string)[0],
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 30000, // 30 second timeout (increased from 10s)
});

export const chatAction = async ({
  query,
  context,
  appData,
}: {
  query: string;
  context: { role: "user" | "assistant"; content: string }[];
  appData: any;
}) => {
  try {
    // Build messages array with proper system prompt
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content:systemPrompt(appData)
      },
    ];

    // Add context messages
    context.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current query if provided
    if (query && query.trim()) {
      messages.push({
        role: "user",
        content: query,
      });
    }

    //isEnding:

    const response = await openai.chat.completions.create({
      model: "gemma2-9b-it",
      messages,
      temperature: 0.7, 
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response content received from AI");
    }
    const cleanContent = content.replace(/^```json\s*|\s*```$/gm, "").trim();
    console.log(cleanContent, content, "This is actual content");
    
    await createConversation({ appId: appData._id as string, interviewerResponse:cleanContent, candidateResponse:query});

    return {
      data: cleanContent,
      error: null,
    };
  } catch (error) {
    console.error("Chat action error:", error);

    let errorMessage = "Internal server error";

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "Request timeout - please try again";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded - please wait a moment";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      data: null,
      error: errorMessage,
    };
  }
};

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
