
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Users, Github, Linkedin, Globe, Twitter } from "lucide-react";
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
  Cell,
  PieChart,
  Pie,
} from "recharts";
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
  PieChart as PieChartIcon,
  TrendingUp as LineChartIcon,
  MapPin,
  Clock,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getAnalyticsData } from "@/actions/checkpointer";
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const Analytics = ({ analytics }: { analytics: any }) => {
 

    const radarData = [
      {
        subject: "Communication",
        score: analytics.radarChartData.communicationClarity,
      },
      {
        subject: "Technical Knowledge",
        score: analytics.radarChartData.technicalKnowledge,
      },
      { subject: "Relevance", score: analytics.radarChartData.responseRelevance },
      {
        subject: "Vocabulary",
        score: analytics.radarChartData.professionalVocabulary,
      },
      {
        subject: "Problem Solving",
        score: analytics.radarChartData.problemSolvingApproach,
      },
    ];
  
    const questionData = Object.entries(analytics.questionPerformance).map(
      ([question, score]) => ({
        question,
        score,
      })
    );
  
    const detailedMetricsData = Object.entries(analytics.detailedMetrics).map(
      ([metric, score]) => ({
        metric: metric
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        score,
      })
    );
  
    const performanceTimeData =
      analytics.performanceOverTime.technicalAccuracy.map(
        (_: any, index: any) => ({
          question: `Q${index + 1}`,
          technical: analytics.performanceOverTime.technicalAccuracy[index],
          communication:
            analytics.performanceOverTime.communicationClarity[index],
          relevance: analytics.performanceOverTime.responseRelevance[index],
          vocabulary: analytics.performanceOverTime.professionalVocabulary[index],
        })
      );
  
    const getScoreColor = (score: any) => {
      if (score >= 80) return "text-green-600";
      if (score >= 60) return "text-yellow-600";
      return "text-red-600";
    };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Overall Score
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  analytics.overallScore
                )}`}
              >
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
              <p className="text-sm font-medium text-gray-600">
                Communication
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  analytics.communicationScore
                )}`}
              >
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
              <p className="text-sm font-medium text-gray-600">
                Technical Knowledge
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  analytics.technicalKnowledgeScore
                )}`}
              >
                {analytics.technicalKnowledgeScore}%
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Progress
            value={analytics.technicalKnowledgeScore}
            className="mt-3"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Problem Solving
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  analytics.problemSolvingScore
                )}`}
              >
                {analytics.problemSolvingScore}%
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <Progress
            value={analytics.problemSolvingScore}
            className="mt-3"
          />
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2" />
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
            <PieChart>
              <Pie
                data={detailedMetricsData}
                dataKey="score"
                nameKey="metric"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {detailedMetricsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
              <Line
                type="monotone"
                dataKey="technical"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="communication"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="relevance"
                stroke="#f59e0b"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="vocabulary"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Keywords Detected</CardTitle>
          <CardDescription>
            Technical and professional terms used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.keywordsDetected.map((keyword: any, index: any) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analytics.strengths.map((strength: any, index: any) => (
              <li key={index} className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analytics.areasForImprovement.map((area: any, index: any) => (
              <li key={index} className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <p className="text-sm font-medium text-gray-600">
              Technical Competency
            </p>
            <p className="text-sm text-gray-900">
              {analytics.hrInsights.technicalCompetencyLevel}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Experience Level
            </p>
            <p className="text-sm text-gray-900">
              {analytics.hrInsights.experienceLevelEstimation}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Cultural Fit
            </p>
            <p className="text-sm text-gray-900">
              {analytics.hrInsights.culturalFitIndicators}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Learning Potential
            </p>
            <p className="text-sm text-gray-900">
              {analytics.hrInsights.learningPotentialAssessment}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Interview Readiness
            </p>
            <div className="flex items-center space-x-2">
              <Progress
                value={analytics.hrInsights.interviewReadinessScore}
                className="flex-1"
              />
              <span className="text-sm font-medium">
                {analytics.hrInsights.interviewReadinessScore}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Interviewer Notes
          </CardTitle>
          <CardDescription>Comprehensive analysis summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">
            {analytics.aiInterviewerNotes}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}

export default Analytics