'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionResult {
  interimTranscript: string;
  finalTranscript: string;
  setFinalTranscript: (transcript: string) => void;
  isListening: boolean;
  startListening: () => void;
  isMicOn: boolean;
  stopListening: () => void;
  resetTranscript: (time?: number) => void;
  error: string | null;
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStartingRef = useRef(false);
  const [isMicOn, setIsMicOn] = useState(false)

  const checkMicPermission = async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permission.state === 'denied') {
        setError('Microphone access denied');
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Permission API not available');
      return true;
    }
  };

  // Init recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not available in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      console.log('Speech Recognition Started');
      setIsListening(true);
      setIsMicOn(true)
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.warn('Speech Recognition Error:', errorEvent.error);
      setError(errorEvent.error);
      setIsListening(false);
      
      if (errorEvent.error !== 'not-allowed' && errorEvent.error !== 'audio-capture') {
        restartTimerRef.current = setTimeout(() => safeStartRecognition(), 1000);
      }
    };

    recognition.onend = () => {
      console.log('Speech Recognition Ended');
      setIsListening(false);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscript;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      
      setFinalTranscript(final);
      setInterimTranscript(interim);
    };

    speechRecognitionRef.current = recognition;

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
    };
  }, [finalTranscript]);

  // Handle final transcript update
  const resetTranscript = (time?: number) => {
    if (!finalTranscript.trim()) return;
    setFinalTranscript('');
    setInterimTranscript('');
    setIsListening(false);
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  };

  const safeStartRecognition = () => {
    if (!speechRecognitionRef.current || isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    } catch (e) {
      console.log('Safe stop (possibly already stopped)');
    }

    setTimeout(() => {
      try {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.start();
          console.log('Recognition started');
        }
      } catch (e) {
        // Handle errors
      } finally {
        isStartingRef.current = false;
      }
    }, 200);
  };

  const startListening = useCallback(async () => {
    if (await checkMicPermission()) {
      safeStartRecognition();
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      setIsMicOn(false)
      console.log('Stopped manually');
    } catch (e) {
      console.error('Error stopping manually:', e);
    }
  }, []);

  return {
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isMicOn,
  };
}
