"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/lib/speech-to-txt";
import { useTextToSpeech } from "@/lib/txt-speech";
import { toast } from "sonner";
import { marked } from "marked";
import { chatAction } from "@/actions/action";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, VideoOff } from "lucide-react";
import { IoLanguageSharp } from "react-icons/io5";
import { MdBusinessCenter, MdMic, MdMicOff } from "react-icons/md";
import { BsBuildingFillCheck, BsThreeDotsVertical } from "react-icons/bs";
import { Card } from "@/components/ui/card";
import { FaRegComment } from "react-icons/fa";
import { RiVoiceAiFill } from "react-icons/ri";
import { FiPhoneOff } from "react-icons/fi";
import WebcamFrame from "@/components/global-cmp/webcam-frame";
import { createConversation, getApplicationDetails } from "@/actions/checkpointer";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "ai";
  text: string;
}

const CHAT_LIMIT = 100; // Maximum allowed chats

const AgentModel = () => {
  const params = useParams()

  const { appid } = params;
  
  const {
    interimTranscript,
    finalTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isMicOn,
    error: speechError,
  } = useSpeechRecognition();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatCount, setChatCount] = useState<number>(0);
  const [interviewState, setInterviewState] = useState<
    "idle" | "starting" | "active" | "ended"
  >("idle");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const [context, setContext] = useState<{ role: string; content: string }[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const { speak, stopSpeaking, isSpeaking, getAudioElement } = useTextToSpeech();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [isBrave, setIsBrave] = useState(false);
  const [endRecording, setEndRecording] = useState(false);
  const [openaiApiKeyIndex, setOpenaiApiKeyIndex] = useState<number>(0);
  const [isWebCamOn, setIsWebCamOn] = useState(false);

  // Fetch job details using useQuery
  const { data: applicationData, isLoading: isApplicationLoading, error: applicationError } = useQuery({
    queryKey: ["application", appid],
    queryFn: async () => getApplicationDetails(appid as string),
    enabled: !!appid,
  });

  useEffect(() => {
    const storedCount = localStorage.getItem("chatCount");
    if (storedCount) {
      setChatCount(parseInt(storedCount, 10));
    }
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (conversationEndRef.current) {
        conversationEndRef.current.scrollTo({
          top: conversationEndRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    setTimeout(scrollToBottom, 0);
  }, [conversation]);

  useEffect(() => {
    if (!finalTranscript.trim()) return;
    const userText = finalTranscript.trim();
    handleAIConversation(userText);
  }, [finalTranscript]);

  const handleAIConversation = async (userText: string) => {
    if (!userText?.trim()) return;

    if (chatCount >= CHAT_LIMIT) {
      toast.error("Chat limit reached!", {
        position: "top-center",
        duration: 5000,
      });
      stopListening();
      stopSpeaking();
      resetTranscript();
      return;
    }

    if (isLoading) {
      console.log("Request already in progress, ignoring...");
      return;
    }

    const newCount = chatCount + 1;
    setChatCount(newCount);
    localStorage.setItem("chatCount", newCount.toString());

    setConversation((prev) => [...prev, { role: "user", text: userText }]);
    stopListening();
    stopSpeaking();
    resetTranscript();
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatAction(
        userText,
        context as { role: "user" | "assistant" | "system"; content: string }[],
        openaiApiKeyIndex
      );

      if (result.error && retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        toast.warning(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          handleAIConversation(userText);
        }, 2000);
        return;
      }

      setRetryCount(0);
      const newContext = result.context;
      setContext(newContext);

      const assistantResponse = newContext[newContext.length - 1].content;
      let aiText: string;
      let parsedResponse: any;

      try {
        parsedResponse = JSON.parse(assistantResponse);
        setOpenaiApiKeyIndex(result.apiKeyIndex as number);

        try {
          await createConversation(appid as string, parsedResponse);
        } catch (convError) {
          console.error("Failed to save conversation:", convError);
        }

        aiText =
          parsedResponse.currentQuestion ||
          "I'm sorry, could you please repeat that?";

        if (parsedResponse.interviewStage) {
          setInterviewState(
            parsedResponse.interviewStage === "closing" ? "ended" : "active"
          );
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        aiText =
          "I apologize for the technical difficulty. Let's continue with the interview. Could you please tell me about your experience?";
      }

      setConversation((prev) => [...prev, { role: "ai", text: aiText }]);

      try {
        await speak(aiText, { rate: 1.0, pitch: 1.0, volume: 1.0 }, () => {
          if (interviewState !== "ended") {
            startListening();
          }
        });
      } catch (speakError) {
        console.error("Text-to-speech error:", speakError);
        startListening();
      }
    } catch (err) {
      console.error("AI Error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      const errorText =
        retryCount >= MAX_RETRIES
          ? "I'm experiencing technical difficulties. Please continue with your response."
          : "I apologize for the interruption. Please continue with your response.";

      setConversation((prev) => [...prev, { role: "ai", text: errorText }]);

      try {
        await speak(errorText, { rate: 1.0, pitch: 1.0, volume: 1.0 }, () => {
          if (retryCount < MAX_RETRIES) {
            startListening();
          }
        });
      } catch (speakError) {
        startListening();
      }
    } finally {
      setIsLoading(false);
    }
  };

  function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Edg") !== -1) {
      return "Microsoft Edge";
    }
    if (userAgent.indexOf("Chrome") !== -1) {
      if (
        (navigator as any).brave &&
        (navigator as any).brave.isBrave.name === "isBrave"
      ) {
        return "Brave";
      }
      return "Google Chrome";
    } else {
      return "Unknown Browser";
    }
  }

  useEffect(() => {
    setTimeout(() => {
      const browser = detectBrowser();
      if (browser === "Brave") {
        toast.warning(
          "Not supported | Please use Google Chrome or Microsoft Edge",
          {
            position: "top-center",
            duration: Infinity,
          }
        );
        setIsBrave(true);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const chatCount = localStorage.getItem("chatCount");
    if (chatCount === "30") {
      toast.error("Chat limit reached!", {
        position: "top-center",
        duration: 5000,
      });
    }
  }, [chatCount]);

  useEffect(() => {
    const initializeInterview = async () => {
      if (interviewState === "idle" && conversation.length === 0) {
        setInterviewState("starting");

        try {
          const result = await chatAction("", [], openaiApiKeyIndex);
          const parsedResponse = JSON.parse(result.response);

          setConversation([
            { role: "ai", text: parsedResponse.currentQuestion },
          ]);
          setContext(result.context);
          setInterviewState("active");
          setTimeout(() => {
            setIsWebCamOn(true);
          }, 2000);
          await speak(
            parsedResponse.currentQuestion,
            { rate: 1.0, pitch: 1.0, volume: 1.0 },
            () => {
              startListening();
            }
          );
        } catch (error) {
          console.error("Failed to initialize interview:", error);
          const fallbackGreeting =
            "Hello! Welcome to your AI interview. Let's get started. Could you please tell me about yourself?";
          setConversation([{ role: "ai", text: fallbackGreeting }]);
          setInterviewState("active");

          await speak(
            fallbackGreeting,
            { rate: 1.0, pitch: 1.0, volume: 1.0 },
            () => {
              startListening();
            }
          );
        }
      }
    };

    if (!isBrave) {
      initializeInterview();
    }
  }, [interviewState, isBrave]);

  // Handle loading and error states for job data
  if (isApplicationLoading) {
    return <div>Loading job details...</div>;
  }
  if (applicationError) {
    return <div>Error loading job details: {(applicationError as Error).message}</div>;
  }
  if (!applicationData) {
    return <div>No job details available</div>;
  }
  const router = useRouter();

  const handleEndInterview = () => {
    setEndRecording(true);
    stopListening();
    router.push(`/interview/${appid}/analytics`);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => router.back()}
            aria-label="Back to previous page"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1
            className="text-xl border-r pr-2 font-semibold"
            aria-label="AI Interview Title"
          >
            AI Interview
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <IoLanguageSharp />
              {applicationData.jobId?.interviewSettings?.language || "English"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <MdBusinessCenter className="w-4 h-4" />
              {applicationData.jobId?.title || "Gen AI Developer"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <BsBuildingFillCheck />
              {applicationData.jobId?.employerId?.companyDetails?.name || "Unknown Company"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Interview Duration: {applicationData.jobId?.interviewSettings?.interviewDuration || 10} min
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden lg:flex-row gap-4">
        {/* Video Section by webcam */}
        <Card
          className="flex-1 relative grid place-items-center overflow-hidden rounded-lg h-96 lg:h-auto"
          aria-label="Video Feed"
        >
          <WebcamFrame
            endRecording={endRecording}
            isVideoOn={isWebCamOn}
            setIsVideoOn={setIsWebCamOn}
            width="100%"
            height="400px"
            showControls={true}
          />

          {finalTranscript ||
            (interimTranscript && (
              <div className="p-2 px-3 bottom-2 absolute bg-black/50 text-white rounded-lg mb-4">
                <span className="font-bold">{finalTranscript}</span>
                <span className="font-normal"> {interimTranscript}</span>
              </div>
            ))}
        </Card>

        {/* Right Panel */}
        <div className="lg:w-1/3 grid grid-rows-2 gap-4 overflow-hidden">
          {/* Current Question */}
          <Card className="p-4 gap-2 bg-white rounded-lg shadow">
            <div className="flex border-b justify-between items-center pb-4">
              <h2
                className="text-lg font-semibold flex items-center gap-2"
                aria-label="Interviewer Transcript"
              >
                <FaRegComment />
                Interviewer Transcript
              </h2>
              <button
                className="bg-primary/20 p-1 rounded-full text-primary text-xl"
                onClick={() => {
                  const lastAIMessage = conversation.find(msg => msg.role === "ai")?.text;
                  if (lastAIMessage) speak(lastAIMessage);
                }}
                aria-label="Listen to Question"
                disabled={interviewState !== "active"}
              >
                <RiVoiceAiFill className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={conversationEndRef}
              className="overflow-hidden overflow-y-auto space-y-2 max-h-[calc(100vh-400px)]"
            >
              {conversation.map(
                (msg, index) =>
                  msg.role === "ai" && (
                    <div
                      key={index}
                      className={`p-2 border-b rounded-lg flex gap-2 bg-primary/20 text-primary w-full`}
                    >
                      <h3 className="font-semibold">AI:</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.text),
                        }}
                      />
                    </div>
                  )
              )}
            </div>
          </Card>

          {/* AI Interviewer */}
          <Card className="w-full grid place-items-center text-2xl text-white bg-primary relative">
            <h2>AI Interviewer</h2>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center bg-white shadow rounded-full p-2 w-fit mx-auto gap-3 mt-4">
        <Button
          className="size-12 hover:bg-destructive/30 !text-destructive"
          variant="outline"
          size={"icon"}
          onClick={handleEndInterview}
          aria-label="End Interview"
        >
          <FiPhoneOff className="size-5" />
        </Button>
        <Button
          className={
            !isMicOn
              ? "size-12 !bg-destructive !text-white"
              : "size-12 !bg-primary !text-white"
          }
          size={"icon"}
          onClick={() => {
            isMicOn ? stopListening() : startListening();
          }}
        >
          {isMicOn ? (
            <MdMic className="size-6" />
          ) : (
            <MdMicOff className="size-6" />
          )}
        </Button>
        <Button
          className={
            isWebCamOn
              ? "size-12 !bg-primary !text-white"
              : "size-12 !bg-destructive !text-white"
          }
          size={"icon"}
          onClick={() => setIsWebCamOn(!isWebCamOn)}
        >
          {isWebCamOn ? (
            <Video className="size-6" />
          ) : (
            <VideoOff className="size-6" />
          )}
        </Button>

        <Button
          className="size-12"
          variant="outline"
          size={"icon"}
          aria-label="More Options"
        >
          <BsThreeDotsVertical className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default AgentModel;