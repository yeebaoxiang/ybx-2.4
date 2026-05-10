
"use client";

import React, { useRef, useEffect, useState } from "react";
import { CameraOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraViewProps {
  onFrame: (dataUri: string) => void;
  isProcessing: boolean;
  isAiEnabled: boolean;
  isRateLimited?: boolean;
}

export function CameraView({ onFrame, isProcessing, isAiEnabled, isRateLimited }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Motion-Triggered Analysis Logic (Every 2 seconds during active journey)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming && isAiEnabled && !isProcessing && !isRateLimited) {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = 480; // Scale down for speed
          canvas.height = (480 * video.videoHeight) / video.videoWidth;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL("image/jpeg", 0.6);
            onFrame(dataUri);
          }
        }
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [isStreaming, isAiEnabled, isProcessing, isRateLimited, onFrame]);

  return (
    <div className="viewfinder-container h-full">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <CameraOff className="w-16 h-16 text-destructive" />
          <p className="text-xl font-bold">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="scan-line" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-primary/20">
            <div className={cn("pulsing-dot", (!isStreaming || !isAiEnabled || isRateLimited) && "bg-muted animate-none")} />
            <span className="text-sm font-black tracking-widest">
              {isRateLimited ? "QUOTA" : (isStreaming ? (isAiEnabled ? "JOURNEY ACTIVE" : "STANDBY") : "BOOTING")}
            </span>
          </div>

          {isProcessing && (
            <div className="absolute top-6 right-6 p-4 bg-primary text-black rounded-full shadow-2xl">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
