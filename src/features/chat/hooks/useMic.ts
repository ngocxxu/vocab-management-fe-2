'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TRecognitionResult = {
  readonly transcript: string;
  readonly confidence: number;
};

type TRecognitionResultList = {
  readonly length: number;
  item(index: number): TRecognitionResult[] & { length: number };
  [index: number]: TRecognitionResult[] & { length: number };
};

type TRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: TRecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
};

type TSpeechRecognitionCtor = new () => TRecognition;

type TWindowWithSpeech = Window & typeof globalThis & {
  SpeechRecognition?: TSpeechRecognitionCtor;
  webkitSpeechRecognition?: TSpeechRecognitionCtor;
};

type TUseMicReturn = {
  isRecording: boolean;
  isSupported: boolean;
  toggle: () => void;
};

function getSpeechRecognition(): TSpeechRecognitionCtor | undefined {
  const w = window as TWindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function useMic(onTranscript: (text: string) => void): TUseMicReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<TRecognition | null>(null);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? '';
      if (text) onTranscript(text);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [onTranscript]);

  const toggle = useCallback(() => {
    if (isRecording) {
      stop();
    }
    else {
      start();
    }
  }, [isRecording, start, stop]);

  return { isRecording, isSupported, toggle };
}
