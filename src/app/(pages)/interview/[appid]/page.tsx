"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSpeechRecognition } from "@/lib/speech-to-txt";
import { useTextToSpeech } from "@/lib/txt-speech";
import { toast } from "sonner";
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
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { endConversation, getApplicationDetails } from "@/actions/checkpointer";
import PermissionRequest from "@/components/global-cmp/permission";
import { createNotificationAction } from "@/actions/notification";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "aiResponse" | "candidateResponse";
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const AgentModel = () => {
  const params = useParams();
  const router = useRouter();
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
  const [interviewState, setInterviewState] = useState<
    "idle" | "requesting" | "countdown" | "starting" | "active" | "ended"
  >("idle");
  const [context, setContext] = useState<Message[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [isBrave, setIsBrave] = useState(false);
  const [endRecording, setEndRecording] = useState(false);
  const [isWebCamOn, setIsWebCamOn] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [duration, setDuration] = useState(5 * 60 * 1000); // Default to 5 minutes in milliseconds
  const [startTiming, setStartTiming] = useState<number | null>(null);
  const [isNearEnd, setIsNearEnd] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration); // Remaining time in milliseconds
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false,
  });
  const [countdown, setCountdown] = useState(5);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const {
    data: applicationData,
    isLoading: isApplicationLoading,
    error: applicationError,
  } = useQuery({
    queryKey: ["application", appid],
    queryFn: async () => getApplicationDetails(appid as string),
    enabled: !!appid,
  });

  // Debounced toast to prevent multiple renders
  const showToast = useCallback((message: string) => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    toastIdRef.current = toast.error(message, {
      position: "top-center",
      duration: 5000,
    });
  }, []);

  // Request camera and microphone permissions
  const requestPermissions = useCallback(async () => {
    setInterviewState("requesting");
    setPermissionError(null);
    try {
      // Request camera permission
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      // Request microphone permission
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      setPermissionsGranted({ camera: true, microphone: true });
      // Stop the streams as we only need permission check
      videoStream.getTracks().forEach((track) => track.stop());
      audioStream.getTracks().forEach((track) => track.stop());
      setInterviewState("countdown");
    } catch (err) {
      console.error("Permission error:", err);
      setPermissionError("Camera and microphone permissions are required.");
      showToast(
        "Camera and microphone permissions are required to start the interview."
      );
      setInterviewState("idle");
    }
  }, [showToast]);

  // Handle countdown
  useEffect(() => {
    if (interviewState !== "countdown") return;

    if (countdown === 0) {
      setInterviewState("starting");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, countdown]);

  // Set interview duration from applicationData and store start time in localStorage
  useEffect(() => {
    if (
      applicationData?.jobId?.interviewSettings?.interviewDuration &&
      interviewState === "starting"
    ) {
      const durationInMinutes =
        applicationData.jobId.interviewSettings.interviewDuration;
      const durationInMs = durationInMinutes * 60 * 1000; // Convert to milliseconds
      setDuration(durationInMs);
      const startTime = Date.now();
      setStartTiming(startTime);
      // Store start time in localStorage with appid-time as key
      localStorage.setItem(`${appid}-time`, startTime.toString());
      setRemainingTime(durationInMs);
    }
  }, [applicationData, interviewState, appid]);

  // Real-time timer to check duration and update isNearEnd
  useEffect(() => {
    if (interviewState !== "active" || !startTiming) return;

    const timer = setInterval(() => {
      const currentTime = Date.now();
      const storedStartTime = parseInt(
        localStorage.getItem(`${appid}-time`) || "0"
      );
      const elapsedTime = currentTime - (storedStartTime || startTiming);
      const newRemainingTime = Math.max(0, duration - elapsedTime);
      setRemainingTime(newRemainingTime);

      // Set isNearEnd when 30 seconds or less remain
      if (newRemainingTime <= 30 * 1000 && !isNearEnd) {
        setIsNearEnd(true);
      }

      // End interview when time is up
      if (newRemainingTime <= 0) {
        setInterviewState("ended");
        setEndRecording(true);
        stopListening();
        stopSpeaking();
        localStorage.removeItem(`${appid}-time`); // Clean up localStorage
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [
    interviewState,
    startTiming,
    duration,
    isNearEnd,
    appid,
    stopListening,
    stopSpeaking,
  ]);

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    const scrollToBottom = () => {
      if (conversationEndRef.current) {
        conversationEndRef.current.scrollTo({
          top: conversationEndRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    setTimeout(scrollToBottom, 100);
  }, [context]);

  // Handle final transcript
  useEffect(() => {
    if (!finalTranscript.trim() || interviewState !== "active") return;
    const userText = finalTranscript.trim();
    handleAIConversation(userText);
  }, [finalTranscript, interviewState]);

  // Sleep utility for retries
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleAIConversation = async (userText: string, isRetry = false) => {
    if (!userText?.trim()) return;

    if (isLoading && !isRetry) {
      console.log("Request already in progress, ignoring...");
      return;
    }

    // Add user message to conversation if not a retry
    if (!isRetry) {
      stopListening();
      stopSpeaking();
      resetTranscript();

      setContext((prev) => [
        ...prev,
        {
          role: "user",
          content: userText,
        },
      ]);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare context for API call
      const apiContext = context.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content:
          msg.role === "user"
            ? `{candidateResponse: "${msg.content}", isNearEnd: ${isNearEnd}}`
            : msg.content,
      }));

      // Add current user message if not a retry
      if (!isRetry) {
        apiContext.push({
          role: "user" as const,
          content: `{candidateResponse: "${userText}", isNearEnd: ${isNearEnd}}`,
        });
      }

      const result = await chatAction({
        query: `{"candidateResponse": "${userText}", "isNearEnd": ${isNearEnd}}`,
        context: apiContext,
        appData: applicationData,
      });

      if (!result.data) {
        throw new Error(result.error || "Failed to get response");
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(result.data);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        parsedResponse = {
          aiResponse: result.data,
          editorQuestion: null,
          isEnded: false,
        };
      }

      const { aiResponse, isEditorQuestion, isEnded } = parsedResponse;

      // Add AI response to conversation
      setContext((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.data,
        },
      ]);

      // Check if interview should end
      if (isEnded) {
        handleEndInterview();
      }

      // Reset retry count on success
      setRetryCount(0);

      // Speak the response
      try {
        await speak(aiResponse, { rate: 1.0, pitch: 1.0, volume: 1.0 }, () => {
          if (interviewState === "active" && !isEnded) {
            setTimeout(() => startListening(), 500);
          }
        });
      } catch (speakError) {
        console.error("Text-to-speech error:", speakError);
        if (interviewState === "active" && !isEnded) {
          setTimeout(() => startListening(), 500);
        }
      }
    } catch (error) {
      console.error("AI conversation error:", error);

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${MAX_RETRIES}`);
        setRetryCount((prev) => prev + 1);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return handleAIConversation(userText, true);
      }

      setError(
        error instanceof Error ? error.message : "Failed to get AI response"
      );
      showToast("Failed to get response from AI. Please try again.");

      if (interviewState === "active" && !isNearEnd) {
        setTimeout(() => startListening(), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Browser detection
  function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Edg") !== -1) {
      return "Microsoft Edge";
    }
    if (userAgent.indexOf("Chrome") !== -1) {
      if (
        (navigator as any).brave &&
        (navigator as any).brave.isBrave?.name === "isBrave"
      ) {
        return "Brave";
      }
      return "Google Chrome";
    }
    return "Unknown Browser";
  }

  // Check browser compatibility
  useEffect(() => {
    const checkBrowser = () => {
      const browser = detectBrowser();
      if (browser === "Brave") {
        toast.error(
          "Brave Browser is not supported. Please use Google Chrome or Microsoft Edge."
        );
        setIsBrave(true);
      }
    };

    const timer = setTimeout(checkBrowser, 1000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Initialize interview
  useEffect(() => {
    const initializeInterview = async () => {
      if (
        hasInitialized ||
        isBrave ||
        interviewState !== "starting" ||
        !applicationData ||
        isApplicationLoading ||
        applicationData.interviewstatus === "COMPLETED"
      ) {
        return;
      }

      setHasInitialized(true);

      try {
        const initialQuery = `{"candidateResponse": "Hello", "isNearEnd": false}`;
        const result = await chatAction({
          query: initialQuery,
          context: [],
          appData: applicationData,
        });
        console.log(result.data, "This is aiResponse");

        if (!result.data) {
          throw new Error(result.error || "Failed to initialize interview");
        }

        const parsedResponse = JSON.parse(result.data);
        const { aiResponse } = parsedResponse;
        console.log(aiResponse, "This is aiResponse");
        setContext([{ role: "assistant", content: result.data }]);
        setInterviewState("active");

        speak(aiResponse, { rate: 1.0, pitch: 1.0, volume: 1.0 }, () => {
          if (!isNearEnd) {
            setTimeout(() => startListening(), 500);
          }
        });

        setTimeout(() => {
          setIsWebCamOn(true);
        }, 2000);
      } catch (error) {
        console.error("Failed to initialize interview:", error);
        setError(
          "Failed to start the interview. Please refresh and try again."
        );
        showToast(
          "Failed to start the interview. Please refresh and try again."
        );
        setInterviewState("idle");
      }
    };

    initializeInterview();
  }, [
    isBrave,
    hasInitialized,
    interviewState,
    applicationData,
    isApplicationLoading,
    showToast,
  ]);

  // Handle completed interview status
  useEffect(() => {
    if (applicationData?.interviewstatus === "COMPLETED") {
      console.log("Interview Completed");
      setInterviewState("ended");
      setEndRecording(true);
      stopListening();
      stopSpeaking();
      localStorage.removeItem(`${appid}-time`); // Clean up localStorage
    }
  }, [applicationData, appid, stopListening, stopSpeaking]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        "You will lose all entered data if you refresh or leave this page. Are you sure?";
      e.preventDefault();
      e.returnValue = message;
      showToast("This may lead to loss of interview data");
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showToast]);

  // Handle loading and error states for job data
  if (isApplicationLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <span className="intvLoader"></span>
        <h2 className="text-2xl">Scheduling interview...</h2>
      </div>
    );
  }

  if (applicationError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            Error loading interview details:{" "}
            {(applicationError as Error).message}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">No interview details available</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleEndInterview = async () => {
    setEndRecording(true);
    setInterviewState("ended");
    stopListening();
    stopSpeaking();
    await createNotificationAction({
      title: "Interview Completed",
      email: applicationData.jobId?.employerId?.email,
      content: `<p>Hi ${applicationData.jobId?.employerId?.name},</p>
      <p>Interview with <b style="color: blue;">${applicationData?.candidateId?.name}</b> is completed.</p>
      <p style="color: blue; text-decoration: underline;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/interview/${appid}/analytics">View Detailed Report</a></p>`,
      receiver_id: applicationData.jobId?.employerId?._id,
    });
    localStorage.removeItem(`${appid}-time`); // Clean up localStorage
    await endConversation(appid as string);
    router.push(`/interview/${appid}/analytics`);
  };

  const handleMicToggle = () => {
    if (isMicOn) {
      stopListening();
    } else {
      if (interviewState === "active") {
        startListening();
      }
    }
  };

  const repeatLastResponse = () => {
    const lastAIMessage = context
      .slice()
      .reverse()
      .find((msg) => msg.role === "assistant")?.content;

    if (lastAIMessage && !isSpeaking) {
      const parsedResponse = JSON.parse(lastAIMessage);
      speak(parsedResponse.aiResponse, { rate: 1.0, pitch: 1.0, volume: 1.0 });
    }
  };

  if (applicationData.interviewstatus === "COMPLETED") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-3">
        <Image
          src="/interview-completed.png"
          alt="Interview Completed"
          width={300}
          height={300}
        />
        <div className="text-center">
          <h2 className="text-xl">Interview Completed</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isBrave) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-3">
        <Image
          src="/brave-nosupport.png"
          alt="Browser Not Supported"
          width={500}
          height={500}
        />
        <div className="text-center">
          <h2 className="text-xl">
            Brave Browser is not supported. <br /> Please use Google Chrome or
            Microsoft Edge.
          </h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (interviewState === "idle" || interviewState === "requesting") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <PermissionRequest
          permissions={permissionsGranted}
          permissionError={permissionError || ""}
          onPermissionToggle={requestPermissions}
        />
      </div>
    );
  }

  if (interviewState === "countdown") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <Image
          src="/intvstart.png"
          alt="Interview Starting"
          width={500}
          height={500}
        />
        <h2 className="text-2xl">Interview Starting in</h2>
        <div className="text-5xl font-bold">{countdown}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <Image
            className="rounded-lg object-cover"
            src={
              applicationData.jobId?.employerId?.companyDetails?.logo ||
              "/logo.png"
            }
            alt="Company Logo"
            width={50}
            height={50}
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <IoLanguageSharp />
              {applicationData.jobId?.interviewSettings?.language || "English"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <MdBusinessCenter className="w-4 h-4" />
              {applicationData.jobId?.title || "Position"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <BsBuildingFillCheck />
              {applicationData.jobId?.employerId?.companyDetails?.name ||
                "Company"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Duration: {formatTime(remainingTime)}
            </span>
          </div>
          {interviewState === "starting" && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-primary">
                Starting interview...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg flex items-center gap-2">
          {error}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden lg:flex-row gap-4">
        {/* Video Section */}
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
          {(finalTranscript || interimTranscript) && (
            <div className="p-2 px-3 bottom-2 absolute bg-black/80 text-white rounded-lg mb-4 max-w-[90%]">
              <span className="font-bold">{finalTranscript}</span>
              <span className="font-normal opacity-70">
                {" "}
                {interimTranscript}
              </span>
            </div>
          )}
        </Card>

        {/* Right Panel */}
        <div className="lg:w-1/3 grid grid-rows-2 gap-4 overflow-hidden">
          {/* Conversation Panel */}
          <Card className="p-4 gap-2 bg-white rounded-lg shadow">
            <div className="flex border-b justify-between items-center pb-4">
              <h2
                className="text-lg font-semibold flex items-center gap-2"
                aria-label="Interview Conversation"
              >
                <FaRegComment />
                Interview Conversation
              </h2>
              <button
                className="bg-primary/20 p-1 rounded-full text-primary text-xl hover:bg-primary/30 transition-colors"
                onClick={repeatLastResponse}
                aria-label="Repeat Last Response"
                disabled={interviewState !== "active" || isSpeaking}
              >
                <RiVoiceAiFill className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={conversationEndRef}
              className="overflow-hidden overflow-y-auto space-y-2 max-h-[calc(100vh-400px)]"
            >
              {context.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg flex gap-2 ${
                    msg.role === "assistant"
                      ? "bg-primary/20 text-primary border-l-4 border-primary"
                      : "bg-gray-100 text-gray-700 border-l-4 border-gray-400"
                  }`}
                >
                  <h3 className="font-semibold min-w-fit">
                    {msg.role === "assistant"
                      ? "AI Interviewer:"
                      : "Candidate:"}
                  </h3>
                  {msg.role === "assistant" ? (
                    <div>{JSON.parse(msg.content).aiResponse}</div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Interviewer Status */}
          <Card className="w-full grid place-items-center text-2xl text-white bg-primary relative">
            <div className="text-center">
              <h2 className="mb-2">AI Interviewer</h2>
              <div className="text-sm opacity-80">
                {interviewState === "starting" && "Initializing..."}
                {interviewState === "active" &&
                  (isSpeaking
                    ? "Speaking..."
                    : isListening
                    ? "Listening..."
                    : "Ready")}
                {interviewState === "ended" && "Interview Ended"}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center bg-white shadow rounded-full p-2 w-fit mx-auto gap-3 mt-4">
        <Button
          className="size-12 hover:bg-destructive/30 !text-destructive"
          variant="outline"
          size="icon"
          onClick={handleEndInterview}
          aria-label="End Interview"
          disabled={interviewState === "ended"}
        >
          <FiPhoneOff className="size-5" />
        </Button>

        <Button
          className={
            !isMicOn
              ? "size-12 !bg-destructive !text-white"
              : "size-12 !bg-primary !text-white"
          }
          size="icon"
          onClick={handleMicToggle}
          disabled={interviewState !== "active"}
          aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
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
          size="icon"
          onClick={() => setIsWebCamOn(!isWebCamOn)}
          aria-label={isWebCamOn ? "Turn Off Camera" : "Turn On Camera"}
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
          size="icon"
          aria-label="More Options"
        >
          <BsThreeDotsVertical className="size-5" />
        </Button>
      </div>
      <br />
      <div className="p-0.5 bgGrad text-center fixed bottom-0 inset-x-0 text-white">
        <span>Powered by Huminex</span>
      </div>
    </div>
  );
};

export default AgentModel;
