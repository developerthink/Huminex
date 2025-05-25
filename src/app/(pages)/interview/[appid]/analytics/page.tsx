"use client";

import { useQuery } from '@tanstack/react-query';
import { getConversationAnalytics } from '@/actions/checkpointer';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Dynamically import chart components to avoid SSR
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });
const Radar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), { ssr: false });

interface AnalyticsData {
  'Overall Performance Metrics': {
    'Average confidence score': number;
    'Communication fluency score': number;
    'Technical accuracy score': number;
    'Overall interview performance': number;
  };
  'Behavioral Analysis': {
    'Response consistency': string;
    'Problem-solving approach': string;
    'Stress handling capability': string;
    'Professional demeanor': string;
  };
  'Technical Assessment': {
    'Knowledge depth in relevant areas': string;
    'Practical application understanding': string;
    'Learning agility indicators': string;
  };
  'Communication Skills': {
    'Clarity of expression': string;
    'Grammar and language proficiency': string;
    'Structured thinking patterns': string;
    'Question comprehension ability': string;
  };
  'Hiring Recommendation': {
    'Strengths summary': string;
    'Areas for improvement': string;
    'Overall fit assessment': string;
    'Risk factors': string;
    'Final recommendation': string;
  };
  'Interview Quality Metrics': {
    'Question difficulty distribution': string;
    'Response time patterns': string;
    'Interview completion rate': string;
    'Engagement level': string;
  };
  rawData: {
    totalConversations: number;
    analysisTimestamp: string;
    appId: string;
  };
  trends: {
    confidenceTrend: string;
    accuracyTrend: string;
    averageConfidence: number;
    averageAccuracy: number;
  };
}

export default function AnalyticsPage() {
  const params = useParams()
  const appId = params.appid as string;
  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics', appId],
    queryFn: () => getConversationAnalytics(appId),
    enabled: !!appId,
  });

  // const { data: applicationData, isLoading: isApplicationLoading, error: applicationError } = useQuery({
  //   queryKey: ["application", appId],
  //   queryFn: async () => getApplicationDetails(appId as string),
  //   enabled: !!appId,
  // });
  // console.log(applicationData,"applicationData");

  // Performance Metrics Chart
  const performanceChartData = useMemo(() => {
    if (!analyticsData) return null;
    const metrics = analyticsData['Overall Performance Metrics'];
    return {
      labels: ['Confidence', 'Fluency', 'Accuracy', 'Overall'],
      datasets: [
        {
          label: 'Performance Scores',
          data: [
            metrics['Average confidence score'],
            metrics['Communication fluency score'],
            metrics['Technical accuracy score'],
            metrics['Overall interview performance'],
          ],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          borderColor: ['#1e40af', '#047857', '#b45309', '#b91c1c'],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // Question Difficulty Distribution Chart
  const difficultyChartData = useMemo(() => {
    if (!analyticsData) return null;
    const difficulty = analyticsData['Interview Quality Metrics']['Question difficulty distribution'];
    return {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [
        {
          data: difficulty === 'Easy' ? [100, 0, 0] : difficulty === 'Medium' ? [0, 100, 0] : [0, 0, 100],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderColor: ['#047857', '#b45309', '#b91c1c'],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // Behavioral Analysis Radar Chart
  const behavioralChartData = useMemo(() => {
    if (!analyticsData) return null;
    const behavioral = analyticsData['Behavioral Analysis'];
    const scoreMap: { [key: string]: number } = {
      Inconsistent: 1,
      Consistent: 3,
      'Not demonstrated': 0,
      Demonstrated: 3,
      Poor: 1,
      Good: 3,
      Unprofessional: 1,
      Professional: 3,
    };
    return {
      labels: ['Response Consistency', 'Problem Solving', 'Stress Handling', 'Professional Demeanor'],
      datasets: [
        {
          label: 'Behavioral Analysis',
          data: [
            scoreMap[behavioral['Response consistency']] || 0,
            scoreMap[behavioral['Problem-solving approach']] || 0,
            scoreMap[behavioral['Stress handling capability']] || 0,
            scoreMap[behavioral['Professional demeanor']] || 0,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          borderWidth: 2,
        },
      ],
    };
  }, [analyticsData]);

  // Communication Skills Bar Chart
  const communicationChartData = useMemo(() => {
    if (!analyticsData) return null;
    const communication = analyticsData['Communication Skills'];
    const scoreMap: { [key: string]: number } = {
      Unclear: 1,
      Clear: 3,
      'Not assessed': 0,
      Assessed: 3,
      'Not demonstrated': 0,
      Demonstrated: 3,
      Poor: 1,
      Good: 3,
    };
    return {
      labels: ['Clarity', 'Grammar', 'Structured Thinking', 'Question Comprehension'],
      datasets: [
        {
          label: 'Communication Scores',
          data: [
            scoreMap[communication['Clarity of expression']] || 0,
            scoreMap[communication['Grammar and language proficiency']] || 0,
            scoreMap[communication['Structured thinking patterns']] || 0,
            scoreMap[communication['Question comprehension ability']] || 0,
          ],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          borderColor: ['#1e40af', '#047857', '#b45309', '#b91c1c'],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // Technical Assessment Bar Chart
  const technicalChartData = useMemo(() => {
    if (!analyticsData) return null;
    const technical = analyticsData['Technical Assessment'];
    const scoreMap: { [key: string]: number } = {
      'Not assessed': 0,
      Assessed: 3,
    };
    return {
      labels: ['Knowledge Depth', 'Practical Application', 'Learning Agility'],
      datasets: [
        {
          label: 'Technical Scores',
          data: [
            scoreMap[technical['Knowledge depth in relevant areas']] || 0,
            scoreMap[technical['Practical application understanding']] || 0,
            scoreMap[technical['Learning agility indicators']] || 0,
          ],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          borderColor: ['#1e40af', '#047857', '#b45309'],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // Trends Line Chart
  const trendsChartData = useMemo(() => {
    if (!analyticsData) return null;
    return {
      labels: ['Current'],
      datasets: [
        {
          label: 'Confidence',
          data: [analyticsData.trends.averageConfidence],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Accuracy',
          data: [analyticsData.trends.averageAccuracy],
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData]);

  // Insights Generator
  const insights = useMemo(() => {
    if (!analyticsData) return [];
    const metrics = analyticsData['Overall Performance Metrics'];
    const hiring = analyticsData['Hiring Recommendation'];
    const quality = analyticsData['Interview Quality Metrics'];
    const behavioral = analyticsData['Behavioral Analysis'];
    return [
      {
        title: 'Performance Overview',
        description: `The candidate's overall performance score is ${metrics['Overall interview performance']}%, indicating significant room for improvement.`,
        type: metrics['Overall interview performance'] > 50 ? 'positive' : 'negative',
      },
      {
        title: 'Hiring Fit',
        description: `The final recommendation is "${hiring['Final recommendation']}" with risk factors: "${hiring['Risk factors']}".`,
        type: hiring['Final recommendation'].includes('No') ? 'negative' : 'positive',
      },
      {
        title: 'Engagement Insight',
        description: `Engagement level is ${quality['Engagement level'].toLowerCase()} with a ${quality['Interview completion rate']} completion rate, suggesting low candidate involvement.`,
        type: quality['Engagement level'] === 'Low' ? 'negative' : 'positive',
      },
      {
        title: 'Behavioral Concern',
        description: `Behavioral analysis shows "${behavioral['Professional demeanor']}" demeanor and "${behavioral['Stress handling capability']}" stress handling, critical areas for improvement.`,
        type: behavioral['Professional demeanor'] === 'Unprofessional' ? 'negative' : 'positive',
      },
    ];
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-2xl font-semibold text-gray-700 animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-2xl font-semibold text-red-600">Error Loading Analytics</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-2xl font-semibold text-gray-700">No Analytics Data Available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Analytics Dashboard</h1>

        {/* Key Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl shadow-lg ${
                  insight.type === 'positive' ? 'bg-green-50' : 'bg-red-50'
                } transition-transform hover:scale-105`}
              >
                <h3 className="text-lg font-semibold text-gray-800">{insight.title}</h3>
                <p className="text-gray-600 mt-2">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overview and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Overview Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Overview</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <span className="font-medium">Total Conversations:</span>{' '}
                {analyticsData.rawData.totalConversations}
              </p>
              <p>
                <span className="font-medium">Analysis Timestamp:</span>{' '}
                {new Date(analyticsData.rawData.analysisTimestamp).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">App ID:</span> {analyticsData.rawData.appId}
              </p>
            </div>
          </div>

          {/* Performance Metrics Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Performance Metrics</h2>
            {performanceChartData ? (
              <Bar
                data={performanceChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Performance Scores', font: { size: 16 } },
                  },
                  scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)' } } },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>

          {/* Question Difficulty Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Question Difficulty</h2>
            {difficultyChartData ? (
              <Pie
                data={difficultyChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Difficulty Distribution', font: { size: 16 } },
                  },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>

          {/* Behavioral Analysis Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Behavioral Analysis</h2>
            {behavioralChartData ? (
              <Radar
                data={behavioralChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Behavioral Scores', font: { size: 16 } },
                  },
                  scales: {
                    r: { beginAtZero: true, max: 3, ticks: { stepSize: 1 } },
                  },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>

          {/* Communication Skills Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Communication Skills</h2>
            {communicationChartData ? (
              <Bar
                data={communicationChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Communication Scores', font: { size: 16 } },
                  },
                  scales: { y: { beginAtZero: true, max: 3, ticks: { stepSize: 1 } } },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>

          {/* Technical Assessment Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Technical Assessment</h2>
            {technicalChartData ? (
              <Bar
                data={technicalChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Technical Scores', font: { size: 16 } },
                  },
                  scales: { y: { beginAtZero: true, max: 3, ticks: { stepSize: 1 } } },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>

          {/* Trends Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Performance Trends</h2>
            {trendsChartData ? (
              <Line
                data={trendsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Performance Trends', font: { size: 16 } },
                  },
                  scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)' } } },
                }}
              />
            ) : (
              <div className="text-gray-600">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Non-Graphical Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hiring Recommendation */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Hiring Recommendation</h2>
            <div className="space-y-3 text-gray-600">
              {Object.entries(analyticsData['Hiring Recommendation']).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                </p>
              ))}
            </div>
          </div>

          {/* Interview Quality Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Interview Quality Metrics</h2>
            <div className="space-y-3 text-gray-600">
              {Object.entries(analyticsData['Interview Quality Metrics']).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}