'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Microphone2, StopCircle } from '@solar-icons/react/ssr';
import { useChat } from '@/providers/ChatProvider';
import { cn } from '@/libs/utils';
import { useMic } from '../hooks/useMic';

const MAX_CHARS = 300;
const COUNTER_THRESHOLD = 250;
const DRAFT_KEY = 'chat-draft';

export function ChatInput() {
  const { sendMessage, cancelGeneration, state, onInputFocus, onInputBlur } = useChat();
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return localStorage.getItem(DRAFT_KEY) ?? '';
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - value.length;
  const showCounter = value.length >= COUNTER_THRESHOLD;

  const handleTranscript = useCallback((text: string) => {
    setValue((prev) => {
      const joined = prev ? `${prev} ${text}` : text;
      return joined.slice(0, MAX_CHARS);
    });
    textareaRef.current?.focus();
  }, []);

  const { isRecording, isSupported, toggle: toggleMic } = useMic(handleTranscript);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || state.isQueued) {
      return;
    }
    sendMessage(trimmed);
    setValue('');
    localStorage.removeItem(DRAFT_KEY);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCancel = () => {
    cancelGeneration();
    textareaRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, MAX_CHARS);
    setValue(next);
    localStorage.setItem(DRAFT_KEY, next);
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
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          readOnly={state.isQueued}
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
                  onClick={handleCancel}
                  aria-label="Cancel generation"
                  className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
                  className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40"
                >
                  <ArrowRight size={18} weight="Bold" />
                </button>
              )}
        </div>
      </div>
    </div>
  );
}
