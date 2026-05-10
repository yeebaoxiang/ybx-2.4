"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Languages, Volume2, ShieldCheck, Zap, PowerOff, Navigation, AlertTriangle } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { CameraView } from "@/components/camera-view";
import { detectAndAnnounceObjects } from "@/ai/flows/object-detection-announcement";
import { cn } from "@/lib/utils";

export function EchoVisionUI() {
  const { currentLanguage, languageLabel, speak, cycleLanguage, vibrateWarning } = useSpeech();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [isJourneyMode, setIsJourneyMode] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>("");
  const [isIntensiveWarning, setIsIntensiveWarning] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Auto-reset rate limit after 60 seconds
  useEffect(() => {
    if (isRateLimited) {
      const timer = setTimeout(() => setIsRateLimited(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [isRateLimited]);

  /**
   * Linear horizontal mapping to clock face (7 to 5 o'clock covers the front 180 deg)
   * 0.0 -> 7 o'clock (Left)
   * 0.5 -> 12 o'clock (Center)
   * 1.0 -> 5 o'clock (Right)
   */
  const getClockTime = (x: number) => {
    if (x < 0.1) return "7 o'clock";
    if (x < 0.2) return "8 o'clock";
    if (x < 0.3) return "9 o'clock";
    if (x < 0.4) return "10 o'clock";
    if (x < 0.45) return "11 o'clock";
    if (x >= 0.45 && x <= 0.55) return "12 o'clock";
    if (x < 0.6) return "1 o'clock";
    if (x < 0.7) return "2 o'clock";
    if (x < 0.8) return "3 o'clock";
    if (x < 0.9) return "4 o'clock";
    return "5 o'clock";
  };

  const estimateDistance = (height: number) => {
    // Distance estimation based on object height ratio relative to frame
    if (height > 0.8) return 0.5;
    if (height > 0.5) return 1.0;
    if (height > 0.3) return 2.0;
    if (height > 0.15) return 5.0;
    return 10.0;
  };

  const handleFrame = useCallback(async (dataUri: string) => {
    if (isProcessing || !isAiActive || isRateLimited) return;
    setIsProcessing(true);
    
    try {
      const result = await detectAndAnnounceObjects({ imageDataUri: dataUri });
      
      if (result.detectedObjects && result.detectedObjects.length > 0) {
        // Find obstacles in the critical center path (11:30 to 12:30 o'clock)
        const obstacles = result.detectedObjects.filter(obj => 
          (obj.name.toLowerCase().includes("wall") || 
           obj.name.toLowerCase().includes("obstacle") || 
           obj.name.toLowerCase().includes("person") ||
           obj.name.toLowerCase().includes("chair"))
        );

        const centralObstacle = obstacles.find(obj => obj.boundingBox.x > 0.4 && obj.boundingBox.x < 0.6);
        
        if (centralObstacle) {
          const dist = estimateDistance(centralObstacle.boundingBox.height);
          if (dist <= 1.0) {
            setIsIntensiveWarning(true);
            vibrateWarning(1.0);
            speak("STOP. Obstacle directly ahead.");
            setIsProcessing(false);
            return;
          }
        }
        
        setIsIntensiveWarning(false);

        // General Announcement Logic
        const best = result.detectedObjects[0];
        const clock = getClockTime(best.boundingBox.x);
        const dist = estimateDistance(best.boundingBox.height);
        
        let announcement = `${best.name} at ${clock}, ${dist} meters.`;
        
        // Priority for Exits
        const exit = result.detectedObjects.find(obj => 
          obj.name.toLowerCase().includes("door") || 
          obj.name.toLowerCase().includes("exit")
        );
        
        if (exit) {
          const exitClock = getClockTime(exit.boundingBox.x);
          announcement = `Exit available at ${exitClock}.`;
        }

        if (announcement !== lastAnnouncement) {
          setLastAnnouncement(announcement);
          speak(announcement);
        }
      }
    } catch (error: any) {
      console.error("ELEOS AI processing error:", error);
      if (error?.message?.includes("429")) {
        setIsRateLimited(true);
        speak("System limit reached. Pausing for one minute.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isAiActive, lastAnnouncement, speak, vibrateWarning, isRateLimited]);

  const toggleJourney = () => {
    const nextState = !isJourneyMode;
    setIsJourneyMode(nextState);
    setIsAiActive(nextState);
    const msg = nextState 
      ? "ELEOS is active – Safeguarding your journey." 
      : "Journey ended.";
    speak(msg);
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Viewfinder area */}
      <div className="flex-grow relative h-[45vh]">
        <CameraView 
          onFrame={handleFrame} 
          isProcessing={isProcessing} 
          isAiEnabled={isAiActive} 
          isRateLimited={isRateLimited}
        />
        
        {/* Intensive Warning Overlay */}
        {isIntensiveWarning && (
          <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center animate-pulse border-[16px] border-destructive z-50">
            <div className="bg-background p-10 rounded-xl flex flex-col items-center gap-4">
              <AlertTriangle className="w-32 h-32 text-destructive" />
              <span className="text-6xl font-black text-destructive uppercase">STOP</span>
            </div>
          </div>
        )}

        {isJourneyMode && (
          <div className="absolute top-4 left-0 w-full flex justify-center px-4 pointer-events-none z-40">
            <div className="bg-primary text-black py-2 px-6 rounded-full flex items-center gap-2 shadow-2xl border-4 border-black">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-sm font-black tracking-widest uppercase">ELEOS ACTIVE</span>
            </div>
          </div>
        )}

        {/* Floating Feedback Label */}
        {lastAnnouncement && isAiActive && !isIntensiveWarning && !isRateLimited && (
          <div className="absolute bottom-6 left-0 w-full flex justify-center px-6 z-40">
            <div className="bg-primary text-black py-6 px-10 rounded-xl shadow-[0_0_50px_rgba(253,224,71,0.5)] border-4 border-white flex items-center gap-4 max-w-lg">
              <Volume2 className="w-10 h-10" />
              <span className="text-2xl font-black uppercase leading-tight">{lastAnnouncement}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="h-[55vh] bg-background border-t-[12px] border-primary p-6 flex flex-col gap-6">
        <button
          onClick={toggleJourney}
          className={cn(
            "blind-first-button w-full border-8 text-4xl font-black uppercase flex-row gap-6 h-32",
            isJourneyMode 
              ? "bg-destructive border-white text-white" 
              : "bg-primary border-primary text-black"
          )}
          aria-label={isJourneyMode ? "End Journey" : "Start Journey"}
        >
          {isJourneyMode ? <PowerOff className="w-14 h-14" /> : <Navigation className="w-14 h-14" />}
          {isJourneyMode ? "STOP" : "START"}
        </button>

        <div className="grid grid-cols-2 gap-6 flex-grow">
          <button
            onClick={cycleLanguage}
            className="blind-first-button bg-background border-primary text-primary"
            aria-label={`Current Language: ${languageLabel}`}
          >
            <Languages className="w-16 h-16 mb-2" />
            <span className="text-2xl font-black uppercase tracking-tighter">Lang</span>
            <span className="text-lg font-bold">{languageLabel}</span>
          </button>

          <button
            onClick={() => {
              const newState = !isAiActive;
              setIsAiActive(newState);
              speak(newState ? "AI Active" : "AI Paused");
            }}
            className={cn(
              "blind-first-button",
              isAiActive ? "bg-primary border-white text-black" : "bg-muted border-muted text-muted-foreground"
            )}
            aria-label={isAiActive ? "Pause AI Scan" : "Resume AI Scan"}
          >
            <Zap className={cn("w-16 h-16 mb-2", !isAiActive && "opacity-20")} />
            <span className="text-2xl font-black uppercase tracking-tighter">{isAiActive ? "LIVE" : "IDLE"}</span>
          </button>
        </div>

        <button
          onClick={() => speak("ELEOS helps you navigate. We announce objects by clock position and distance. If you hear STOP or feel pulses, stop immediately.")}
          className="blind-first-button w-full bg-black border-white text-white h-20"
          aria-label="Help and Info"
        >
          <span className="text-xl font-black uppercase tracking-widest underline decoration-8">HELP</span>
        </button>
      </div>

      <div className="sr-only" role="status" aria-live="assertive">
        {isRateLimited ? "Quota reached." : (isIntensiveWarning ? "STOP" : lastAnnouncement)}
      </div>
    </div>
  );
}
