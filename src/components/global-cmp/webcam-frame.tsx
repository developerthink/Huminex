import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '../ui/button';
import { useRecorder } from '../../lib/use-recorder';

// Defining types for component props
interface WebcamFrameProps {
  onRecordingComplete?: (blob: Blob) => void;
  width?: number | string;
  height?: number | string;
  className?: string;
  isVideoOn: boolean;
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>;
  endRecording?: boolean;
  showControls?: boolean;
  audioEnabled?: boolean; // New prop to control audio
}

// Define error/status types
type WebcamStatus =
  | 'ready'
  | 'loading'
  | 'no-permissions'
  | 'not-supported'
  | 'video-off'
  | 'error';

const WebcamFrame: React.FC<WebcamFrameProps> = ({
  onRecordingComplete,
  width = '100%',
  height = 'auto',
  className = '',
  isVideoOn,
  setIsVideoOn,
  endRecording,
  showControls = true,
  audioEnabled = true, // Default to audio enabled
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    isRecording,
    recordedBlob,
    recordingTime,
    recordingError,
    videoURLs,
    startRecording,
    stopRecording,
    downloadRecording,
    formatTime,
    checkBrowserCompatibility,
    videoConstraints,
  } = useRecorder(webcamRef, isVideoOn, setIsVideoOn);

  // Handle recording completion
  useEffect(() => {
    if (recordedBlob && onRecordingComplete) {
      onRecordingComplete(recordedBlob);
    }
  }, [recordedBlob, onRecordingComplete]);

  // Handle endRecording prop
  useEffect(() => {
    if (endRecording) {
      stopRecording();
    } else if (!isRecording && isVideoOn) {
      startRecording();
    }
  }, [endRecording, startRecording, stopRecording, isRecording, isVideoOn]);

  // Auto-download when recording stops
  useEffect(() => {
    if (recordedBlob && !isRecording && endRecording) {
      downloadRecording();
    }
  }, [recordedBlob, isRecording, endRecording, downloadRecording]);

  // Check browser compatibility on mount
  useEffect(() => {
    if (!checkBrowserCompatibility()) {
      setWebcamStatus('not-supported');
      setErrorMessage(
        'Your browser does not support webcam recording. Please try Chrome, Firefox, or Edge.'
      );
      return;
    }
    setWebcamStatus(isVideoOn ? 'ready' : 'video-off');
  }, [checkBrowserCompatibility, isVideoOn]);

  // Update status when video is toggled
  useEffect(() => {
    if (
      webcamStatus !== 'not-supported' &&
      webcamStatus !== 'no-permissions' &&
      webcamStatus !== 'error'
    ) {
      setWebcamStatus(isVideoOn ? 'ready' : 'video-off');
    }
  }, [isVideoOn, webcamStatus]);

  // Handle webcam errors
  const handleWebcamError = (error: string | DOMException) => {
    console.error('Webcam error:', error);
    const errorMsg =
      error instanceof DOMException ? error.message : String(error);

    if (
      errorMsg.includes('Permission denied') ||
      errorMsg.includes('not allowed')
    ) {
      setWebcamStatus('no-permissions');
      setErrorMessage(
        'Camera or microphone access was denied. Please allow access and reload the page.'
      );
    } else {
      setWebcamStatus('error');
      setErrorMessage(`Camera error: ${errorMsg}`);
    }
  };

  // Handle successful webcam initialization
  const handleWebcamUserMedia = (stream: MediaStream) => {
    setWebcamStatus('ready');
    setErrorMessage('');
    if (!audioEnabled && stream.getAudioTracks().length > 0) {
      stream.getAudioTracks().forEach((track) => track.stop());
    }
  };

  // Render status screens
  const renderStatusScreen = () => {
    switch (webcamStatus) {
      case 'loading':
        return (
          <div
            className={`flex flex-col items-center justify-center rounded-lg p-5 bg-gray-800 text-white ${
              typeof width === 'number' ? `w-[${width}px]` : `w-${width}`
            } ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}
          >
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-lg font-semibold">Initializing Camera...</h3>
            <p className="text-sm">Please wait while we set up your camera.</p>
          </div>
        );

      case 'video-off':
        return (
          <div className="absolute inset-0 grid place-items-center bg-gray-800 text-white">
            <h3 className="text-lg font-semibold">Camera is turned off</h3>
            <p className="text-sm">Your camera is currently disabled.</p>
          </div>
        );

      case 'no-permissions':
        return (
          <div
            className={`flex flex-col items-center justify-center bg-gray-800 text-white ${
              typeof width === 'number' ? `w-[${width}px]` : `w-${width}`
            } ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}
          >
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold">Camera Permission Required</h3>
            <p className="text-sm">{errorMessage}</p>
            <br />
            <Button
              className="px-5"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        );

      case 'not-supported':
        return (
          <div
            className={`flex flex-col items-center justify-center mt-3 bg-gray-800 text-white ${
              typeof width === 'number' ? `w-[${width}px]` : `w-${width}`
            } ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold">Browser Not Supported</h3>
            <p className="text-sm">{errorMessage}</p>
          </div>
        );

      case 'error':
        return (
          <div
            className={`flex flex-col mt-3 items-center justify-center bg-gray-800 text-white ${
              typeof width === 'number' ? `w-[${width}px]` : `w-${width}`
            } ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}
          >
            <div className="text-5xl mb-4">🥺</div>
            <h3 className="text-lg font-semibold">Camera Error</h3>
            <p className="text-sm">{errorMessage}</p>
            <br />
            <Button
              className="px-5"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`webcam-frame bg-black grid place-items-center text-white ${className}`}>
      <div
        className={`relative rounded-lg overflow-hidden ${
          typeof width === 'number' ? `w-[${width}px]` : `w-${width}`
        } ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}
      >
        {/* Show status screens when not in ready state or video is off */}
        {webcamStatus !== 'ready' && renderStatusScreen()}

        {/* Webcam feed */}
        {(webcamStatus === 'ready' || webcamStatus === 'video-off') && (
          <Webcam
            audio={true}
            muted={true} // Mute to prevent echo
            ref={webcamRef}
            videoConstraints={videoConstraints}
            onUserMedia={handleWebcamUserMedia}
            onUserMediaError={handleWebcamError}
            mirrored={true}
            className={`w-full h-full object-cover ${webcamStatus === 'ready' ? 'block' : 'hidden'}`}
          />
        )}

        {/* Recording controls */}
        {showControls && webcamStatus === 'ready' && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
            {!isRecording && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={startRecording}
              >
                Record
              </Button>
            )}
            {isRecording && (
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={stopRecording}
              >
                Stop
              </Button>
            )}
            {isRecording && (
              <span className="text-white font-semibold">
                {formatTime(recordingTime)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Audio status */}
      {!audioEnabled && (
        <div className="mt-2 text-yellow-400">
          Audio is disabled. Recordings will be video-only.
        </div>
      )}

      {/* Recorded videos */}
      {videoURLs.length > 0 && (
        <div className="mt-4 w-full">
          <h3 className="text-lg font-semibold text-white">Recorded Videos:</h3>
          <div className="flex overflow-x-auto space-x-4 p-4">
            {videoURLs.map((videoURL, i) => (
              <div key={`video_${i}`} className="flex flex-col items-center">
                <video
                  src={videoURL}
                  className="w-48 h-36 object-cover rounded-lg"
                  autoPlay
                  loop
                  muted
                />
                <div className="mt-2 flex space-x-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => downloadRecording()}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {recordingError && (
        <div className="mt-4 text-red-500">{recordingError}</div>
      )}
    </div>
  );
};

export default WebcamFrame;