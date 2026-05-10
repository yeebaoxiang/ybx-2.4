
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Languages, Volume2, ShieldCheck, Zap, PowerOff, Navigation, AlertTriangle } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { CameraView } from "@/components/camera-view";
import { detectAndAnnounceObjects } from "@/ai/flows/object-detection-announcement";
import { PreferencesDialog } from "@/components/preferences-dialog";
import { cn } from "@/lib/utils";

export function EleosUI() {
  const { 
    languageLabel, speak, cycleLanguage, vibrateWarning, playBlip,
    voiceGender, setVoiceGender, vibrationAggression, setVibrationAggression
  } = useSpeech();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [isJourneyMode, setIsJourneyMode] = useState(false);
  const [sensitivity, setSensitivity] = useState(3);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>("");
  const [isIntensiveWarning, setIsIntensiveWarning] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (isRateLimited) {
      const timer = setTimeout(() => setIsRateLimited(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [isRateLimited]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) { console.error("Wake Lock error:", err); }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const handleFrame = useCallback(async (dataUri: string) => {
    if (isProcessing || !isAiActive || isRateLimited) return;
    setIsProcessing(true);
    
    try {
      const result = await detectAndAnnounceObjects({ imageDataUri: dataUri, sensitivity });
      
      if (result.urgentStop) {
        setIsIntensiveWarning(true);
        vibrateWarning(2); // Double intensity for danger
        speak("STOP. Obstacle directly ahead.");
        setIsProcessing(false);
        return;
      }
      
      setIsIntensiveWarning(false);

      if (result.detectedObjects && result.detectedObjects.length > 0) {
        const best = result.detectedObjects[0];
        // Spatial Clock mapping: 0.5 is 12 o'clock
        const clockPositions = ["9", "10", "11", "12", "1", "2", "3"];
        const clockIdx = Math.floor(best.boundingBox.x * clockPositions.length);
        const clock = clockPositions[Math.min(clockIdx, clockPositions.length - 1)];
        
        // Height ratio for distance
        const dist = best.boundingBox.height > 0.7 ? "0.5" : best.boundingBox.height > 0.4 ? "1.5" : "5";
        const msg = `${best.name} at ${clock} o'clock, ${dist} meters.`;

        if (msg !== lastAnnouncement) {
          setLastAnnouncement(msg);
          speak(msg);
        }
      }
    } catch (error: any) {
      if (error?.message?.includes("429")) {
        setIsRateLimited(true);
        speak("System busy. Pausing for quota.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isAiActive, lastAnnouncement, speak, vibrateWarning, isRateLimited, sensitivity]);

  const toggleJourney = () => {
    playBlip();
    const nextState = !isJourneyMode;
    setIsJourneyMode(nextState);
    setIsAiActive(nextState);
    
    if (nextState) {
      requestWakeLock();
      speak("ELEOS Active. Safeguarding your journey.");
    } else {
      releaseWakeLock();
      speak("Journey ended.");
    }
  };

  return (
    <div className="relative flex flex-col h-svh w-full bg-background overflow-hidden">
      {/* 50% Top: Vision Area */}
      <div className="h-1/2 relative bg-black border-b-[12px] border-primary">
        <CameraView 
          onFrame={handleFrame} 
          isProcessing={isProcessing} 
          isAiEnabled={isAiActive} 
          isRateLimited={isRateLimited}
        />
        
        {isIntensiveWarning && (
          <div className="absolute inset-0 bg-destructive/90 flex items-center justify-center animate-pulse z-50">
            <div className="bg-background p-10 rounded-3xl border-[20px] border-destructive shadow-2xl">
              <AlertTriangle className="w-32 h-32 text-destructive" />
              <span className="text-8xl font-black text-destructive uppercase block mt-4">STOP</span>
            </div>
          </div>
        )}

        {lastAnnouncement && isAiActive && !isIntensiveWarning && (
          <div className="absolute bottom-6 left-0 w-full flex justify-center px-4 z-40">
            <div className="bg-primary text-black py-8 px-10 rounded-3xl border-[6px] border-white shadow-2xl flex items-center gap-4 max-w-lg">
              <Volume2 className="w-12 h-12 shrink-0" />
              <span className="text-4xl font-black uppercase leading-tight">{lastAnnouncement}</span>
            </div>
          </div>
        )}
      </div>

      {/* 50% Bottom: Interaction Zone */}
      <div className="h-1/2 flex flex-col p-6 gap-6 bg-background">
        <button
          onClick={toggleJourney}
          className={cn(
            "blind-first-button w-full border-[10px] text-6xl font-black uppercase flex-row gap-8 h-2/5",
            isJourneyMode ? "bg-destructive border-white text-white" : "bg-primary border-primary text-black"
          )}
          aria-label={isJourneyMode ? "Stop Journey" : "Start Journey"}
        >
          {isJourneyMode ? <PowerOff className="w-20 h-20" /> : <Navigation className="w-20 h-20" />}
          {isJourneyMode ? "STOP" : "START"}
        </button>

        <div className="grid grid-cols-2 gap-6 flex-grow">
          <button
            onClick={() => {
              playBlip();
              cycleLanguage();
            }}
            className="blind-first-button bg-background border-[10px] border-primary text-primary h-full"
            aria-label="Cycle Language"
          >
            <Languages className="w-20 h-20 mb-2" />
            <span className="text-2xl font-black uppercase">Lang</span>
            <span className="text-xl font-bold">{languageLabel}</span>
          </button>

          <PreferencesDialog 
            voiceGender={voiceGender} 
            setVoiceGender={setVoiceGender}
            vibrationAggression={vibrationAggression}
            setVibrationAggression={setVibrationAggression}
            sensitivity={sensitivity}
            setSensitivity={setSensitivity}
            onAnnounce={speak}
            playBlip={playBlip}
          />
        </div>

        <button
          onClick={() => {
            playBlip();
            speak("ELEOS Accessibility. Top half is camera preview. Bottom half controls. Main button starts journey. Bottom left changes language. Bottom right opens settings.");
          }}
          className="blind-first-button w-full bg-black border-white text-white h-[80px]"
        >
          <span className="text-2xl font-black uppercase tracking-widest underline decoration-[10px]">HELP INFO</span>
        </button>
      </div>

      <div className="sr-only" role="status" aria-live="assertive">
        {isRateLimited ? "Quota reached." : (isIntensiveWarning ? "STOP" : lastAnnouncement)}
      </div>
    </div>
  );
}
