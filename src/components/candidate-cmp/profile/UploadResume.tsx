'use client'
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiGeminiFill } from "react-icons/ri";
import { Upload, Loader2, FileText } from "lucide-react";
import pdfToText from 'react-pdftotext';
import { pdfExtractChat } from '@/actions/action';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegCircleCheck } from "react-icons/fa6";
import { updateUserProfile } from '@/lib/api-functions/home.api';
import { UserData } from '@/types/user';
import PermissionWrapper from "@/components/permission-wrapper";

interface ResumeData {
  rawText: string;
  analysis: string;
}

const UploadResume = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define mutation for updating user profile
  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      console.log("success", data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully with resume data.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update profile with resume data.');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const text = await pdfToText(file);
    console.log(text);
    return text;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      toast.error('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      // Get AI response
      const aiResponse = await pdfExtractChat(extractedText);
      
      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // Parse AI response (JSON string) into UserData
      let parsedData: UserData;
      try {
        parsedData = JSON.parse(aiResponse.response);
      } catch (parseError) {
        throw new Error('Failed to parse AI response');
      }

      // Set resume data for display
      setResumeData({
        rawText: extractedText,
        analysis: aiResponse.response
      });

      // Update user profile in the database
      mutation.mutate(parsedData);

    } catch (err: any) {
      setError(err.message || 'Failed to process resume');
      toast.error(err.message || 'Failed to process resume');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setResumeData(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Resume Extractor</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center flex-col justify-center gap-3">
        {!resumeData ? (
          <>
            <RiGeminiFill className="w-16 h-16 text-gray-400" />
            <p className="text-sm text-gray-600 mt-1 text-center">
              Fill Resume Details Using AI
            </p>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <PermissionWrapper handleSubmit={handleUploadClick}>
            <Button 
              className="rainbowBtn !w-full !px-16 rounded-full text-white !bg-primary" 
              disabled={isProcessing}
              aria-label="Upload resume"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </>
              )}
            </Button>
            </PermissionWrapper>
          </>
        ) : (
          <>
            <FaRegCircleCheck className="w-16 h-16 text-green-500" />
            <p className="text-sm text-green-600 font-medium">
              Resume processed successfully!
            </p>
          
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadResume;