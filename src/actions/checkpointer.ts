"use server";

import connectDB from "@/config/db";
import Conversation from "@/models/conversation";
import Application from "@/models/application";
import { auth } from "@/auth";
import OpenAI from "openai";

export async function createConversation(appId: string, body: any) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await connectDB();

    // Check if candidate has applied for this job
    const application = await Application.findById(appId);

    if (!application) {
      throw new Error("You have not applied for this job");
    }

    // Create a new conversation
    const newConversation = await Conversation.create({
      appId: appId,
      currentQuestion: body.currentQuestion,
      previousUserResponseAnalysis: JSON.stringify(
        body.previousUserResponseAnalysis
      ),
    });

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
    console.log(application);
    // Convert ObjectId and other non-serializable fields to strings
    const serializedData = JSON.parse(JSON.stringify(application));
    return serializedData;
  } catch (error) {
    console.error("Error in getApplicationDetails:", error);
    throw error;
  }
};

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 10000, // 30 second timeout
});
const chatOpenAI = async (analyticsData: any) => {
  const systemPrompt = `You are an expert AI interview analyst. Analyze the provided interview conversation data and provide comprehensive insights.

Your analysis should include:

1. *Overall Performance Metrics*:
   - Average confidence score (0-100)
   - Communication fluency score (0-100)
   - Technical accuracy score (0-100)
   - Overall interview performance (0-100)

2. *Behavioral Analysis*:
   - Response consistency
   - Problem-solving approach
   - Stress handling capability
   - Professional demeanor

3. *Technical Assessment*:
   - Knowledge depth in relevant areas
   - Practical application understanding
   - Learning agility indicators

4. *Communication Skills*:
   - Clarity of expression
   - Grammar and language proficiency
   - Structured thinking patterns
   - Question comprehension ability

5. *Hiring Recommendation*:
   - Strengths summary
   - Areas for improvement
   - Overall fit assessment
   - Risk factors (if any)
   - Final recommendation (Strong Hire/Hire/No Hire/Strong No Hire)

6. *Interview Quality Metrics*:
   - Question difficulty distribution
   - Response time patterns
   - Interview completion rate
   - Engagement level

Provide specific examples from the conversation data to support your analysis. Return the response in JSON format with clear sections and numerical scores where applicable.`;

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
      model: "gemma2-9b-it",
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

export const getConversationAnalytics = async (appId: string) => {
  try {
    await connectDB();

    // Fetch all conversations for the given appId
    const conversations = await Conversation.find({ appId }).sort({
      createdAt: 1,
    });

    if (!conversations || conversations.length === 0) {
      throw new Error("No conversations found for this application");
    }

    // Process and prepare data for analysis
    const processedData = conversations.map((conv : any, index : number) => {
      const analysisData = conv.previousUserResponseAnalysis
        ? JSON.parse(conv.previousUserResponseAnalysis)
        : {};

      return {
        conversationId: conv._id,
        questionNumber: index + 1,
        question: conv.currentQuestion,
        userResponse: conv.userResponse || "No response recorded",
        analysis: analysisData,
        timestamp: conv.createdAt,
        timeTaken: conv.responseTime || null,
      };
    });

    // Additional metadata for context
    const interviewMetadata = {
      totalQuestions: conversations.length,
      interviewDuration:
        conversations.length > 0
          ? new Date(
              (conversations[conversations.length - 1] as any).createdAt
            ).getTime() - new Date((conversations[0] as any).createdAt).getTime()
          : 0,
      completionRate:
        (conversations.filter((c : any) => c.userResponse).length /
          conversations.length) *
        100,
    };

    const analyticsPayload = {
      metadata: interviewMetadata,
      conversations: processedData,
      appId: appId,
    };

    // Convert ObjectId and other non-serializable fields to strings
    const serializedData = JSON.parse(JSON.stringify(analyticsPayload));

    const response = await chatOpenAI(serializedData);

    // Parse the AI response
    const aiAnalysis = JSON.parse(response.choices[0].message.content as string);

    // Add some computed metrics
    const enhancedAnalysis = {
      ...aiAnalysis,
      rawData: {
        totalConversations: conversations.length,
        analysisTimestamp: new Date().toISOString(),
        appId: appId,
      },
      trends: calculateTrends(processedData),
    };
    console.log(enhancedAnalysis, "hello");
    return enhancedAnalysis;
  } catch (error) {
    console.error("Error in getConversationAnalytics:", error);
    throw error;
  }
};

// Helper function to calculate trends across the interview
const calculateTrends = (conversations: any[]) => {
  const confidenceScores = conversations
    .map((c) => c.analysis?.confidence || 0)
    .filter((score) => score > 0);

  const accuracyScores = conversations
    .map((c) => c.analysis?.accuracy || 0)
    .filter((score) => score > 0);

  return {
    confidenceTrend: calculateTrend(confidenceScores),
    accuracyTrend: calculateTrend(accuracyScores),
    averageConfidence:
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0,
    averageAccuracy:
      accuracyScores.length > 0
        ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
        : 0,
  };
};

// Calculate if scores are improving, declining, or stable
const calculateTrend = (scores: number[]) => {
  if (scores.length < 2) return "insufficient_data";

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 5) return "improving";
  if (difference < -5) return "declining";
  return "stable";
};

// Additional utility function to get analytics summary
export const getAnalyticsSummary = async (appId: string) => {
  try {
    const fullAnalytics = await getConversationAnalytics(appId);

    return {
      overallScore: fullAnalytics.overallPerformance || 0,
      recommendation:
        fullAnalytics.hiringRecommendation?.finalRecommendation ||
        "No recommendation",
      keyStrengths: fullAnalytics.hiringRecommendation?.strengths || [],
      improvementAreas:
        fullAnalytics.hiringRecommendation?.areasForImprovement || [],
      riskFactors: fullAnalytics.hiringRecommendation?.riskFactors || [],
    };
  } catch (error) {
    console.error("Error in getAnalyticsSummary:", error);
    throw error;
  }
};