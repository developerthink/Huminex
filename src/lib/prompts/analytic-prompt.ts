export const analyticsPrompt = (conversationText: string)=>{
return  `
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
    `
}