'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  RadarChart, 
  Radar, 
  RadialBar,
  RadialBarChart,
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts'
import { 
  User, 
  MessageSquare, 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Download,
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp as LineChartIcon
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { getAnalyticsData } from '@/actions/checkpointer'


const AnalyticsPage = () => {
  // Uncomment and use your actual query
  const params = useParams()
  const appId = params.appid as string;
  const {data, isLoading, error} = useQuery({
    queryKey: ["analytics", appId],
    queryFn: async () => getAnalyticsData(appId)
  })

  console.log(data)


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Analyzing interview data...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
              <p className="text-gray-600">Unable to load interview analytics data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const analytics = data.data.analyticsData
console.log(data.data.conversationsData)
  // Prepare chart data
  const radarData = [
    { subject: 'Communication', score: analytics.radarChartData.communicationClarity },
    { subject: 'Technical Knowledge', score: analytics.radarChartData.technicalKnowledge },
    { subject: 'Relevance', score: analytics.radarChartData.responseRelevance },
    { subject: 'Vocabulary', score: analytics.radarChartData.professionalVocabulary },
    { subject: 'Problem Solving', score: analytics.radarChartData.problemSolvingApproach }
  ]

  const questionData = Object.entries(analytics.questionPerformance).map(([question, score]) => ({
    question,
    score
  }))

  const detailedMetricsData = Object.entries(analytics.detailedMetrics).map(([metric, score]) => ({
    metric: metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    score
  }))

  const performanceTimeData = analytics.performanceOverTime.technicalAccuracy.map((_, index) => ({
    question: `Q${index + 1}`,
    technical: analytics.performanceOverTime.technicalAccuracy[index],
    communication: analytics.performanceOverTime.communicationClarity[index],
    relevance: analytics.performanceOverTime.responseRelevance[index],
    vocabulary: analytics.performanceOverTime.professionalVocabulary[index]
  }))

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Interviews
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Interview Analytics</h1>
                <p className="text-sm text-gray-500">Comprehensive performance analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.overallScore)}`}>
                    {analytics.overallScore}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <Progress value={analytics.overallScore} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Communication</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.communicationScore)}`}>
                    {analytics.communicationScore}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <Progress value={analytics.communicationScore} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Technical Knowledge</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.technicalKnowledgeScore)}`}>
                    {analytics.technicalKnowledgeScore}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <Progress value={analytics.technicalKnowledgeScore} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Problem Solving</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.problemSolvingScore)}`}>
                    {analytics.problemSolvingScore}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <Progress value={analytics.problemSolvingScore} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Multi-dimensional performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Question Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Question Performance
              </CardTitle>
              <CardDescription>
                Individual question scores breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={questionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics & Performance Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Detailed Metrics
              </CardTitle>
              <CardDescription>
                Comprehensive skill assessment (0-10 scale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={detailedMetricsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="metric" type="category" width={140} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="w-5 h-5 mr-2" />
                Performance Progression
              </CardTitle>
              <CardDescription>
                Score evolution throughout the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="technical" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="communication" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="relevance" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="vocabulary" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Keywords & Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Keywords Detected</CardTitle>
              <CardDescription>
                Technical and professional terms used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.keywordsDetected.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analytics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analytics.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* HR Insights & AI Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* HR Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                HR Insights
              </CardTitle>
              <CardDescription>
                Professional assessment for hiring decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Technical Competency</p>
                <p className="text-sm text-gray-900">{analytics.hrInsights.technicalCompetencyLevel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Experience Level</p>
                <p className="text-sm text-gray-900">{analytics.hrInsights.experienceLevelEstimation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cultural Fit</p>
                <p className="text-sm text-gray-900">{analytics.hrInsights.culturalFitIndicators}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Potential</p>
                <p className="text-sm text-gray-900">{analytics.hrInsights.learningPotentialAssessment}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interview Readiness</p>
                <div className="flex items-center space-x-2">
                  <Progress value={analytics.hrInsights.interviewReadinessScore} className="flex-1" />
                  <span className="text-sm font-medium">{analytics.hrInsights.interviewReadinessScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Interviewer Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Interviewer Notes
              </CardTitle>
              <CardDescription>
                Comprehensive analysis summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analytics.aiInterviewerNotes}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage