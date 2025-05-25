// lib/useTextToSpeech.ts
"use client";
import { generateSpeech } from "@/actions/action";
import { useState, useRef } from "react";

interface SpeechSynthesisVoice {
  name: string;
  lang: string;
}

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceId?: string;
  modelId?: string;
}

export const useTextToSpeech = () => {
  const [voices] = useState<SpeechSynthesisVoice[]>([
    { name: "Default Voice", lang: "en-US" },
  ]);
  const [apiKeyIndex, setApiKeyIndex] = useState(0);
  const [selectedVoice] = useState<SpeechSynthesisVoice | null>({
    name: "Default Voice",
    lang: "en-US",
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultVoiceId = "m5qndnI7u4OAdXhH0Mr5";
  const defaultModelId = "eleven_flash_v2_5";

  const speak = async (
    text: string,
    options: TextToSpeechOptions = {},
    onEnded?: () => void
  ): Promise<{ error?: string }> => {
    if (!text) {
      console.warn("No text provided");
      if (onEnded) onEnded();
      return { error: "No text provided" };
    }

    try {
      setIsSpeaking(true);
      stopSpeaking();
      const result = await generateSpeech({
        text,
        voiceId: options.voiceId || defaultVoiceId,
        modelId: options.modelId || defaultModelId,
        apiKeyIndex
      });
      const audioSrc = `data:audio/mpeg;base64,${result.audioBase64}`;
      const audio = new Audio(audioSrc);
      audio.volume = options.volume || 1.0;
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        setIsSpeaking(false);
        URL.revokeObjectURL(audio.src);
        if (onEnded) onEnded();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        audioRef.current = null;
        setIsSpeaking(false);
        URL.revokeObjectURL(audio.src);
        if (onEnded) onEnded();
      };

      await audio.play();
      setApiKeyIndex(result.apiKeyIndex as number);
      return {};
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      setIsSpeaking(false);
      if (onEnded) onEnded();
      return { error: String(error) };
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  const getAudioElement = () => {
    return audioRef.current;
  };

  const changeVoice = (voiceId: string) => {
    console.log(`Voice ID set to: ${voiceId}`);
  };

  return {
    speak,
    stopSpeaking,
    getAudioElement,
    changeVoice,
    voices,
    selectedVoice,
    isSpeaking,
  };
};