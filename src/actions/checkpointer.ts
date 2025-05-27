"use server";

import connectDB from "@/config/db";
import Conversation from "@/models/conversation";
import Application from "@/models/application";
import { auth } from "@/auth";
import OpenAI from "openai";

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

    console.log(parsedResponse);
    if (parsedResponse.isEnded) {
      await Application.findByIdAndUpdate("683433e47fc08198d18478ec", {
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

// Helper function to safely parse JSON strings
const safeJsonParse = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    console.error("Original string:", jsonString);
    return null;
  }
};

const openai = new OpenAI({
  apiKey: JSON.parse(process.env.OPENAI_API_KEY as string)[0],
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 10000, // 10 second timeout
});

const chatOpenAI = async (analyticsData: any) => {
  // Format the conversation from the fetched data
  let conversationText = "";
  analyticsData.forEach((entry: any, index: number) => {
    // Parse interviewer response
    const interviewerData = safeJsonParse(entry.interviewerResponse);
    const interviewerResponse = interviewerData?.aiResponse || "";
    
    // Parse candidate response
    const candidateData = safeJsonParse(entry.candidateResponse);
    const candidateResponse = candidateData?.candidateResponse || "";

    // Interviewer speaks first, as per simulation
    conversationText += `${index + 1}. Interviewer: "${interviewerResponse}"\n`;
    if (candidateResponse) {
      conversationText += `${index + 1}. Candidate: "${candidateResponse}"\n`;
    }
  });

  const systemPrompt = `
  You are an AI system designed to analyze interview conversations and generate comprehensive analytics data for a frontend dashboard. The conversation to analyze is as follows:
  
  **Conversation**:
  ${conversationText}
  
  **Task**: Analyze the conversation and generate detailed analytics data in JSON format that matches the dashboard requirements. Generate comprehensive metrics for all the following categories:
  
  **Required Analytics Structure**:
  
  1. **Overall Performance Metrics**:
     - Overall Score (0-100)
     - Communication Score (0-100) 
     - Technical Knowledge Score (0-100)
     - Problem Solving Score (0-100)
  
  2. **Radar Chart Data** (for pentagon visualization):
     - Communication Clarity (0-100)
     - Technical Knowledge (0-100) 
     - Response Relevance (0-100)
     - Professional Vocabulary (0-100)
     - Problem Solving Approach (0-100)
  
  3. **Question Performance**: Individual scores for each question (Q1, Q2, Q3, etc.) scored 0-100
  
  4. **Detailed Metrics** (for bar chart):
     - Response Completeness (0-10)
     - Technical Vocabulary Usage (0-10)
     - Answer Relevance (0-10)
     - Explanation Clarity (0-10)
     - Example Provision (0-10)
     - Professional Tone (0-10)
     - Response Structure (0-10)
     - Domain Knowledge (0-10)
  
  5. **Performance Over Time** (line chart data):
     - Arrays of scores showing progression across questions for:
       - Technical accuracy progression
       - Communication clarity progression
       - Response relevance progression
       - Professional vocabulary progression
  
  6. **Keywords Detected**: Array of unique technical and professional keywords actually used by the candidate in their responses (e.g., "React", "GraphQL", "API", "database", "authentication", "scalability", "performance", "optimization", etc.)
  
  7. **Comprehensive Feedback**:
     - Strengths (4-6 detailed points based on actual conversation)
     - Areas for Improvement (4-6 detailed points with specific recommendations)
     - HR Insights for decision making
  
  8. **Advanced HR Analytics**:
     - Communication Style Assessment
     - Technical Competency Level
     - Cultural Fit Indicators
     - Experience Level Estimation
     - Learning Potential Assessment
     - Red Flags (if any)
     - Interview Readiness Score
  
  **Guidelines**:
  - Base all analysis strictly on the actual conversation content
  - Extract only keywords that were genuinely mentioned by the candidate
  - Evaluate technical knowledge demonstration through actual examples given
  - Assess communication through response structure and clarity
  - Provide practical insights that help HR make informed decisions
  - Include specific quotes or examples from the conversation to justify scores
  - Generate progression data showing realistic performance changes across questions
  - Ensure all metrics are backed by observable conversation patterns
  
  **Expected Output Format**:
  {
    "overallScore": <integer 0-100>,
    "communicationScore": <integer 0-100>,
    "technicalKnowledgeScore": <integer 0-100>,
    "problemSolvingScore": <integer 0-100>,
    "radarChartData": {
      "communicationClarity": <integer 0-100>,
      "technicalKnowledge": <integer 0-100>,
      "responseRelevance": <integer 0-100>,
      "professionalVocabulary": <integer 0-100>,
      "problemSolvingApproach": <integer 0-100>
    },
    "questionPerformance": {
      "Q1": <integer 0-100>,
      "Q2": <integer 0-100>,
      "Q3": <integer 0-100>
    },
    "detailedMetrics": {
      "responseCompleteness": <integer 0-10>,
      "technicalVocabularyUsage": <integer 0-10>,
      "answerRelevance": <integer 0-10>,
      "explanationClarity": <integer 0-10>,
      "exampleProvision": <integer 0-10>,
      "professionalTone": <integer 0-10>,
      "responseStructure": <integer 0-10>,
      "domainKnowledge": <integer 0-10>
    },
    "performanceOverTime": {
      "technicalAccuracy": [<int>, <int>, <int>],
      "communicationClarity": [<int>, <int>, <int>],
      "responseRelevance": [<int>, <int>, <int>],
      "professionalVocabulary": [<int>, <int>, <int>]
    },
    "keywordsDetected": [<technical/professional keywords actually used by candidate>],
    "strengths": [
      <detailed strength with specific example from conversation>,
      <detailed strength with specific example from conversation>,
      <detailed strength with specific example from conversation>,
      <detailed strength with specific example from conversation>
    ],
    "areasForImprovement": [
      <detailed improvement area with specific recommendation and example>,
      <detailed improvement area with specific recommendation and example>,
      <detailed improvement area with specific recommendation and example>,
      <detailed improvement area with specific recommendation and example>
    ],
    "hrInsights": {
      "communicationStyleAssessment": <detailed assessment>,
      "technicalCompetencyLevel": <junior/mid/senior level assessment with reasoning>,
      "culturalFitIndicators": <assessment based on communication style and responses>,
      "experienceLevelEstimation": <estimated years of experience with justification>,
      "learningPotentialAssessment": <assessment of candidate's learning attitude>,
      "redFlags": [<any concerning patterns or responses>],
      "interviewReadinessScore": <integer 0-100>
    },
    "aiInterviewerNotes": <comprehensive professional summary with specific observations and recommendations for HR>
  }
    `;
  

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

export const fetchAllConversations = async (appId: string) => {
  try {
    const conversations = await Conversation.find({
      appId: appId,
    });
    const serializeData = JSON.parse(JSON.stringify(conversations));
    clg
    return {
      data: serializeData,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return {
      data: [],
      error: error,
    };
  }
};

export const getAnalyticsData = async (appId: string) => {
  try {
    // Step 1: Fetch all conversations
    const { data: conversations, error: fetchError } = await fetchAllConversations(appId);
    if (fetchError || !conversations || conversations.length === 0) {
      throw new Error("No conversations found or error fetching conversations");
    }

    // Step 2: Format the conversation into a proper dialogue
    let formattedConversation = [];
    let questionCounter = 1;

    for (let i = 0; i < conversations.length; i++) {
      const entry = conversations[i];
      
      // Parse interviewer response safely
      const interviewerData = safeJsonParse(entry.interviewerResponse);
      const interviewerResponse = interviewerData?.aiResponse || "";
      
      // Parse candidate response safely
      const candidateData = safeJsonParse(entry.candidateResponse);
      const candidateResponse = candidateData?.candidateResponse || "";

      // Add interviewer response with question number
      if (interviewerResponse) {
        formattedConversation.push({
          speaker: "Interviewer",
          message: interviewerResponse,
          questionNumber: `Q${questionCounter}`
        });
        questionCounter++;
      }

      // Add candidate response if it exists, without question number
      if (candidateResponse) {
        formattedConversation.push({
          speaker: "Candidate",
          message: candidateResponse
        });
      }
    }

    // Step 3: Send the formatted conversation to chatOpenAI for analytics
    const analyticsResponse = await chatOpenAI(formattedConversation);

    // Step 4: Parse the response and return the analytics data
    let analyticsData;
    try {
      analyticsData = JSON.parse(analyticsResponse.choices[0].message.content);
    } catch (error) {
      console.error("Error parsing analytics response:", error);
      throw new Error("Invalid JSON response from AI: " + analyticsResponse.choices[0].message.content);
    }

    return {
      data: { analyticsData, conversationsData: formattedConversation },
      error: null,
    };
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    return {
      data: null,
      error: error.message || "Error generating analytics data",
    };
  }
};