
"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Volume2, Zap, ShieldCheck, User } from "lucide-react";

interface PreferencesDialogProps {
  voiceGender: "male" | "female";
  setVoiceGender: (v: "male" | "female") => void;
  vibrationAggression: number;
  setVibrationAggression: (v: number) => void;
  sensitivity: number;
  setSensitivity: (v: number) => void;
  onAnnounce: (msg: string) => void;
  playBlip: () => void;
}

export function PreferencesDialog({
  voiceGender,
  setVoiceGender,
  vibrationAggression,
  setVibrationAggression,
  sensitivity,
  setSensitivity,
  onAnnounce,
  playBlip,
}: PreferencesDialogProps) {
  
  const handleSensitivityChange = (val: number[]) => {
    const s = val[0];
    setSensitivity(s);
    let msg = "";
    if (s === 1) msg = "Priority Level 1: Life-threatening alerts only.";
    else if (s === 3) msg = "Priority Level 3: Standard navigation selected.";
    else if (s === 5) msg = "Priority Level 5: Hyper-aware mode active.";
    onAnnounce(msg);
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        playBlip();
        onAnnounce("Preferences opened");
      }
    }}>
      <DialogTrigger asChild>
        <button className="blind-first-button bg-black border-white text-white w-full h-full min-h-[120px]">
          <Settings className="w-14 h-14 mb-2" />
          <span className="text-2xl font-black uppercase">Settings</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black border-[12px] border-primary text-primary max-w-md h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-center">ELEOS Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-10 py-6">
          <div className="space-y-6">
            <Label className="text-2xl font-black uppercase flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              Priority: Level {sensitivity}
            </Label>
            <Slider 
              value={[sensitivity]} 
              onValueChange={handleSensitivityChange} 
              max={5} min={1} step={2}
              className="py-8"
            />
          </div>

          <div className="space-y-6">
            <Label className="text-2xl font-black uppercase flex items-center gap-3">
              <Zap className="w-8 h-8" />
              Haptics: Level {vibrationAggression}
            </Label>
            <Slider 
              value={[vibrationAggression]} 
              onValueChange={(v) => {
                setVibrationAggression(v[0]);
                playBlip();
              }} 
              max={10} min={1} step={1}
              className="py-8"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-2xl font-black uppercase flex items-center gap-3">
              <User className="w-8 h-8" />
              Voice Selection
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={voiceGender === "female" ? "default" : "outline"}
                className="h-24 text-2xl font-black border-8"
                onClick={() => {
                  setVoiceGender("female");
                  onAnnounce("Female voice selected");
                }}
              >
                Female
              </Button>
              <Button 
                variant={voiceGender === "male" ? "default" : "outline"}
                className="h-24 text-2xl font-black border-8"
                onClick={() => {
                  setVoiceGender("male");
                  onAnnounce("Male voice selected");
                }}
              >
                Male
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
