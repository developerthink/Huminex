"use server";

import connectDB from "@/config/db";
import Conversation from "@/models/conversation";
import Application from "@/models/application";
import { auth } from "@/auth";
import OpenAI from "openai";
import mongoose from "mongoose";
import { analyticsPrompt } from "@/lib/prompts/analytic-prompt";

const ensureModelsRegistered = async () => {
  try {
    // Check if Job model exists, if not, import it
    if (!mongoose.models.Job) {
      await import("@/models/job");
    }
    // Add other models as needed
    if (!mongoose.models.User) {
      await import("@/models/user/user"); // if you have a User model for employerId
    }
  } catch (error) {
    console.error("Error registering models:", error);
  }
};

export const endConversation = async (appId: string) => {
  try {
    await connectDB();
    const application = await Application.findByIdAndUpdate(appId, {
      interviewstatus: "COMPLETED",
    });
    if (!application) {
      throw new Error("Application not found");
    }
    return {
      error: null,
      data: application,
    };
  } catch (error) {
    console.error("Error in endConversation:", error);
    throw error;
  }
};

export async function createConversation({
  appId,
  interviewerResponse,
  candidateResponse,
}: {
  appId: string;
  interviewerResponse: string;
  candidateResponse: string;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await connectDB();
    const application = await Application.findById(appId);

    if (!application) {
      throw new Error("You have not applied for this job");
    }

    const parsedResponse = JSON.parse(interviewerResponse);
    // Create a new conversation
    const newConversation = await Conversation.create({
      appId: appId,
      interviewerResponse: interviewerResponse,
      candidateResponse: candidateResponse,
    });
    console.log(
      parsedResponse,
      "This is parsed response",
      parsedResponse.isEnded
    );
    if (parsedResponse.isEnded) {
      await Application.findByIdAndUpdate(appId, {
        interviewstatus: "COMPLETED",
      });
    }

    return {
      error: null,
      data: newConversation,
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

export const getApplicationDetails = async (appId: string) => {
  try {
    await connectDB();
    await ensureModelsRegistered();
    const application = await Application.findById(appId)
      .populate({
        path: "jobId",
        populate: { path: "employerId" }, // Nested population for employerId inside jobId
      })
      .populate("candidateId")
      .lean(); // Add .lean() for better performance
    if (!application) {
      throw new Error("Application not found");
    }
    // console.log(application);
    // Convert ObjectId and other non-serializable fields to strings
    const serializedData = JSON.parse(JSON.stringify(application));
    return serializedData;
  } catch (error) {
    console.error("Error in getApplicationDetails:", error);
    throw error;
  }
};

// Helper function to safely parse JSON strings
// const safeJsonParse = (jsonString: string): any => {
//   try {
//     console.log(jsonString);
//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error("Error parsing JSON:", error);
//     console.error("Original string:", jsonString);
//     return null;
//   }
// };

const openai = new OpenAI({
  apiKey: JSON.parse(process.env.OPENAI_API_KEY as string)[1],
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  timeout: 30000, // Increased to 30 seconds
});

const chatOpenAI = async (analyticsData: any) => {
  // Format the conversation from the fetched data
  let conversationText = "";
  analyticsData.forEach((entry: any, index: number) => {
    // Parse interviewer response
    const interviewerData = entry.interviewerResponse;
    const interviewerResponse = interviewerData?.aiResponse || "";

    // Parse candidate response
    const candidateData = entry.candidateResponse;
    const candidateResponse = candidateData?.candidateResponse || "";

    // Interviewer speaks first, as per simulation
    conversationText += `${index + 1}. Interviewer: "${interviewerResponse}"\n`;
    if (candidateResponse) {
      conversationText += `${index + 1}. Candidate: "${candidateResponse}"\n`;
    }
  });

  const systemPrompt = analyticsPrompt(conversationText);

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Please analyze this interview conversation data and provide comprehensive insights: ${JSON.stringify(
        analyticsData
      )}`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000, // Increased for comprehensive analysis
    });
    return response;
  } catch (error) {
    console.error("Error in chatOpenAI:", error);
    throw error;
  }
};

export const fetchAllConversations = async (appId: string) => {
  try {
    // Ensure database connection with better error handling
    await connectDB();

    // Add timeout and better error handling for the query
    const conversations: any = await Promise.race([
      Conversation.find({ appId: appId }).lean().maxTimeMS(10000), // 20 second timeout
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 15000)
      ),
    ]);

    if (!conversations || conversations.length === 0) {
      console.log(`No conversations found for appId: ${appId}`);
      return {
        data: [],
        error: null,
      };
    }

    const serializeData = JSON.parse(JSON.stringify(conversations));
    return {
      data: serializeData,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching conversations:", error);

    // More specific error handling
    if (
      error.message?.includes("timeout") ||
      error.message?.includes("buffering timed out")
    ) {
      return {
        data: [],
        error: "Database connection timeout. Please try again.",
      };
    }

    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getAnalyticsData = async (appId: string) => {
  try {
    await connectDB();
    console.log(`Starting analytics data generation for appId: ${appId}`);

    // Step 1: Fetch all conversations
    const { data: conversations, error: fetchError } = await fetchAllConversations(appId);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return {
        data: null,
        error: `Error fetching conversations: ${fetchError}`,
      };
    }

    if (!conversations || conversations.length === 0) {
      console.log("No conversations found");
      return {
        data: null,
        error: "No conversations found for this application. Please complete the interview first.",
      };
    }

    console.log(`Found ${conversations.length} conversations`);

    // Step 2: Format and correct the conversation into a proper dialogue
    let formattedConversation = [];
    let pendingResponses = []; // Store candidate responses temporarily
    let questionNumber = 1;

    for (let i = 0; i < conversations.length; i++) {
      const entry = conversations[i];

      // Parse interviewer response
      let interviewerData;
      try {
        interviewerData =
          typeof entry.interviewerResponse === "string"
            ? JSON.parse(entry.interviewerResponse)
            : entry.interviewerResponse;
      } catch (error) {
        console.error(`Error parsing interviewer response for conversation ${i}:`, error);
        interviewerData = { aiResponse: entry.interviewerResponse || "" };
      }
      const interviewerResponse = interviewerData?.aiResponse || interviewerData?.response || "";

      // Parse candidate response
      let candidateData;
      try {
        candidateData =
          typeof entry.candidateResponse === "string"
            ? JSON.parse(entry.candidateResponse)
            : entry.candidateResponse;
      } catch (error) {
        console.error(`Error parsing candidate response for conversation ${i}:`, error);
        candidateData = { candidateResponse: entry.candidateResponse || "" };
      }
      const candidateResponse = candidateData?.candidateResponse || candidateData?.response || "";

      // Add interviewer response
      if (interviewerResponse) {
        formattedConversation.push({
          speaker: "Interviewer",
          message: interviewerResponse,
          questionNumber: `Q${questionNumber}`,
        });

        // Store candidate response if it exists
        if (candidateResponse) {
          pendingResponses.push({
            message: candidateResponse,
            intendedQuestion: `Q${questionNumber}`,
          });
        }
        questionNumber++;
      }
    }

    // Step 3: Correct the response alignment
    let correctedConversation = [];
    let responseIndex = 0;

    for (let i = 0; i < formattedConversation.length; i++) {
      const interviewerEntry = formattedConversation[i];
      correctedConversation.push(interviewerEntry);

      // Find the matching candidate response for this question
      if (responseIndex < pendingResponses.length) {
        let candidateResponse = pendingResponses[responseIndex];
        const questionText = interviewerEntry.message.toLowerCase();

        // Basic heuristic: Check if response matches the question's context
        // For example, if question asks for "name," look for name-related words
        let isMatch = true;
        if (questionText.includes("name") && !candidateResponse.message.toLowerCase().includes("name")) {
          isMatch = false;
        } else if (questionText.includes("motivated") && !candidateResponse.message.toLowerCase().includes("motivat")) {
          isMatch = false;
        } // Add more heuristics as needed

        // If the response doesn't match, try the next response (handles shift)
        if (!isMatch && responseIndex + 1 < pendingResponses.length) {
          candidateResponse = pendingResponses[responseIndex + 1];
          responseIndex++;
        }

        // Add the candidate response
        correctedConversation.push({
          speaker: "Candidate",
          message: candidateResponse.message,
          intendedQuestion: interviewerEntry.questionNumber,
        });
        responseIndex++;
      } else {
        // No response available for this question
        correctedConversation.push({
          speaker: "Candidate",
          message: "[No response provided]",
          intendedQuestion: interviewerEntry.questionNumber,
        });
      }
    }

    // Handle any remaining responses (e.g., responses without a corresponding question)
    while (responseIndex < pendingResponses.length) {
      correctedConversation.push({
        speaker: "Candidate",
        message: pendingResponses[responseIndex].message,
        intendedQuestion: "[Unmatched response]",
      });
      responseIndex++;
    }

    if (correctedConversation.length === 0) {
      return {
        data: null,
        error: "No valid conversation data found to analyze.",
      };
    }

    console.log(`Formatted and corrected ${correctedConversation.length} conversation entries`);

    // Step 4: Send the corrected conversation to chatOpenAI for analytics
    let analyticsResponse;
    try {
      console.log("Sending corrected data to AI for analysis...");
      analyticsResponse = await Promise.race([
        chatOpenAI(correctedConversation),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI analysis timeout")), 45000)
        ),
      ]);
      console.log("AI analysis completed");
    } catch (error: any) {
      console.error("Error in AI analysis:", error);
      return {
        data: null,
        error: `Error generating AI analysis: ${error.message}`,
      };
    }

    // Step 5: Parse the response and return the analytics data
    let analyticsData;
    try {
      const responseContent = (analyticsResponse as any).choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Empty response from AI");
      }
      analyticsData = JSON.parse(responseContent);
      console.log("Analytics data parsed successfully");
    } catch (error) {
      console.error("Error parsing analytics response:", error);
      console.error("Raw response:", (analyticsResponse as any).choices[0]?.message?.content);
      return {
        data: null,
        error: "Error parsing AI analysis response. Please try again.",
      };
    }

    const applicationData = await getApplicationDetails(appId);
    return {
      data: {
        analyticsData,
        applicationData,
        conversationsData: correctedConversation,
        totalConversations: correctedConversation.length / 2, // Approximate number of question-response pairs
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error in getAnalyticsData:", error);
    return {
      data: null,
      error:
        error.message?.includes("timeout")
          ? "Request timed out. Please check your internet connection and try again."
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred while generating analytics data.",
    };
  }
};
