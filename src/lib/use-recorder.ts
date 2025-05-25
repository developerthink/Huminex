import { useState, useRef, useCallback, useEffect } from 'react';

// Define video constraints with default values
export const VIDEO_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: 'user',
  aspectRatio: 16/9,
};

// Types for the hook
interface RecorderHookReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordingTime: number;
  recordingError: string | null;
  videoURLs: string[];
  startRecording: () => void;
  stopRecording: () => void;
  downloadRecording: () => void;
  addVideoURL: (blob: Blob) => string;
  formatTime: (seconds: number) => string;
  checkBrowserCompatibility: () => boolean;
  videoConstraints: typeof VIDEO_CONSTRAINTS;
}

/**
 * Custom hook for webcam recording functionality
 * @param webcamRef - React ref for the webcam component
 * @param isVideoOn - Whether the video stream is active
 * @param setIsVideoOn - Function to toggle video stream
 */
export function useRecorder(
  webcamRef: React.RefObject<any>,
  isVideoOn: boolean,
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>
): RecorderHookReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [videoURLs, setVideoURLs] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  // Check if the browser supports recording
  const checkBrowserCompatibility = () => {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.MediaRecorder
    );
  };

  // Format seconds into MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Add video URL from blob and return it
  const addVideoURL = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    setVideoURLs((prev) => [...prev, url]);
    return url;
  }, []);

  // Start recording function
  const startRecording = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.stream) {
      setRecordingError('Webcam stream not available. Ensure the camera is enabled.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      const stream = webcamRef.current.stream;
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      if (!videoTracks.length) {
        setRecordingError('No video track available. Ensure the camera is enabled.');
        return;
      }

      if (!audioTracks.length) {
        console.warn('No audio track available. Recording will be video-only.');
      }

      const mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        setRecordingError('Video codec not supported. Try a different browser.');
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        addVideoURL(blob);
        recordedChunksRef.current = [];
      };

      mediaRecorderRef.current.onerror = (event) => {
        setRecordingError('Recording error occurred');
        console.error('MediaRecorder error:', event);
      };

      mediaRecorderRef.current.start(10);
      setIsRecording(true);

      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
    } catch (error) {
      setRecordingError(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error starting recording:', error);
    }
  }, [webcamRef, addVideoURL]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
  }, [isRecording]);

  // Download the latest recorded video
  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      console.warn('No recorded blob available for download');
    }
  }, [recordedBlob]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      videoURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isRecording, videoURLs]);

  return {
    isRecording,
    recordedBlob,
    recordingTime,
    recordingError,
    videoURLs,
    startRecording,
    stopRecording,
    downloadRecording,
    addVideoURL,
    formatTime,
    checkBrowserCompatibility,
    videoConstraints: VIDEO_CONSTRAINTS,
  };
}

export default useRecorder;