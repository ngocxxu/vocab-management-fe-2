'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowRight, Microphone2, StopCircle } from '@solar-icons/react/ssr';
import { useChat } from '@/providers/ChatProvider';
import { cn } from '@/libs/utils';
import { useMic } from '../hooks/useMic';

const MAX_CHARS = 300;
const COUNTER_THRESHOLD = 250;

export function ChatInput() {
  const { sendMessage, cancelGeneration, state } = useChat();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - value.length;
  const showCounter = value.length >= COUNTER_THRESHOLD;

  const handleTranscript = useCallback((text: string) => {
    setValue(prev => {
      const joined = prev ? `${prev} ${text}` : text;
      return joined.slice(0, MAX_CHARS);
    });
    textareaRef.current?.focus();
  }, []);

  const { isRecording, isSupported, toggle: toggleMic } = useMic(handleTranscript);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || state.isQueued) {
      return;
    }
    sendMessage(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, MAX_CHARS);
    setValue(next);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="border-t border-border px-3 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-input bg-background px-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={state.isQueued}
          placeholder="Type your message…"
          rows={1}
          maxLength={MAX_CHARS}
          className={cn(
            'flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'max-h-28 overflow-y-auto outline-none mb-1.5',
            state.isQueued && 'opacity-50',
          )}
        />
        <div className="flex shrink-0 items-end gap-1.5 py-2">
          {showCounter && (
            <span className={cn(
              'mb-1 text-xs',
              remaining <= 10 ? 'text-destructive' : 'text-muted-foreground',
            )}
            >
              {remaining}
            </span>
          )}
          {isSupported && !state.isQueued && (
            <div className="relative">
              {isRecording && (
                <span className="absolute inset-0 animate-ping rounded-xl bg-destructive/30" />
              )}
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                aria-pressed={isRecording}
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isRecording
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                <Microphone2 size={17} weight={isRecording ? 'BoldDuotone' : 'Linear'} />
              </button>
            </div>
          )}
          {state.isQueued
            ? (
                <button
                  type="button"
                  onClick={cancelGeneration}
                  aria-label="Cancel generation"
                  className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StopCircle size={18} weight="BoldDuotone" />
                </button>
              )
            : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!value.trim()}
                  aria-label="Send message"
                  className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowRight size={18} weight="Bold" />
                </button>
              )}
        </div>
      </div>
    </div>
  );
}
