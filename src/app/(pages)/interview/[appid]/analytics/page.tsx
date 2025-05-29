"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getAnalyticsData } from "@/actions/checkpointer";
import Analytics from "@/components/candidate-cmp/analytics";
import AnalyticsProfile from "@/components/candidate-cmp/analytics-profile";

const AnalyticsPage = () => {
  const router = useRouter();
  const params = useParams();
  const appId = params.appid as string;
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", appId],
    queryFn: async () => getAnalyticsData(appId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-screen flex flex-col items-center justify-center">
            <span className="analyLoader"></span>
            <br />
            <h2 className="text-2xl">Loading interview analytics...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
              <p className="text-gray-600">
                Unable to load interview analytics data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    applicationData,
    conversationsData,
    analyticsData: analytics,
  } = data.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Interview Analytics
                </h1>
                <p className="text-sm text-gray-500">
                  Comprehensive performance analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  navigator.share({
                    title: "Interview Analytics",
                    text: "Check out this interview analytics report!",
                    url: window.location.href,
                  });
                }}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AnalyticsProfile applicationData={applicationData} />

      <div className="max Cun-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <Analytics analytics={analytics} />
          </TabsContent>
          <TabsContent value="conversation">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {conversationsData.map((entry: any, index: number) => (
                    <div key={index} className="border-b pb-2">
                      <p
                        className={`font-medium ${
                          entry.speaker === "Interviewer"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {entry.speaker === "Interviewer"
                          ? `${entry.questionNumber}. ${entry.speaker}`
                          : entry.intendedQuestion === "[Unmatched response]"
                          ? "Unmatched Response"
                          : `${entry.speaker}`}
                      </p>
                      <p className="text-gray-700">{entry.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;
