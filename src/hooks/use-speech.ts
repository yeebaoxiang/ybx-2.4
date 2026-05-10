
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type LanguageCode = "en-US" | "ms-MY" | "zh-CN";

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  "en-US": "English",
  "ms-MY": "Bahasa Melayu",
  "zh-CN": "Mandarin",
};

export function useSpeech() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en-US");
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  const [vibrationAggression, setVibrationAggression] = useState(5); // 1-10
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBlip = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio blip failed", e);
    }
  }, []);

  const speak = useCallback((text: string, lang?: LanguageCode) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || currentLanguage;
    
    // Smart Voice Selection
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => {
      const isCorrectLang = v.lang.startsWith(utterance.lang.split('-')[0]);
      const genderMatch = voiceGender === "female" 
        ? /female|woman|samantha|victoria|google/i.test(v.name)
        : /male|man|alex|daniel|google/i.test(v.name);
      return isCorrectLang && genderMatch;
    });

    if (targetVoice) {
      utterance.voice = targetVoice;
    } else {
      // Fallback Pitch logic
      utterance.pitch = voiceGender === "male" ? 0.8 : 1.3;
    }
    
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [currentLanguage, voiceGender]);

  const cycleLanguage = useCallback(() => {
    const langs: LanguageCode[] = ["en-US", "ms-MY", "zh-CN"];
    const nextIdx = (langs.indexOf(currentLanguage) + 1) % langs.length;
    const nextLang = langs[nextIdx];
    
    playBlip();
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    setCurrentLanguage(nextLang);
    speak(`${LANGUAGE_LABELS[nextLang]} selected.`, nextLang);
  }, [currentLanguage, speak, playBlip]);

  const vibrateWarning = useCallback((intensityScale: number = 1) => {
    if (!("vibrate" in navigator)) return;
    // Map aggression 1-10 to vibration pattern
    const duration = (vibrationAggression * 40) * intensityScale;
    const pause = 50;
    const pattern = [duration, pause, duration];
    navigator.vibrate(pattern);
  }, [vibrationAggression]);

  return {
    currentLanguage,
    languageLabel: LANGUAGE_LABELS[currentLanguage],
    voiceGender,
    setVoiceGender,
    vibrationAggression,
    setVibrationAggression,
    speak,
    cycleLanguage,
    vibrateWarning,
    playBlip,
  };
}
