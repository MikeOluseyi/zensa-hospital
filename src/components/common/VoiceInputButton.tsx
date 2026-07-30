"use client";

import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechtoText";

export default function VoiceInputButton({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const { listening, start, stop } = useSpeechToText((text) => onTranscript(text));

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      title={listening ? "Stop dictation" : "Start dictation"}
      className={`p-1.5 rounded-lg transition-colors ${
        listening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {listening ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  );
}