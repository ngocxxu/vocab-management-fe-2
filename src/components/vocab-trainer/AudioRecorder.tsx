'use client';

import {
  Microphone,
  Pause,
  Play,
  Stop,
  TrashBin2,
} from '@solar-icons/react/ssr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type AudioRecorderProps = {
  onRecordingComplete: (audioBlob: Blob) => void;
  onReset: () => void;
};

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onReset }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      durationIntervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  }, [onRecordingComplete]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - duration * 1000;

      durationIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
    }
  }, [duration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying]);

  const handleReset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setRecordedBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    onReset();
  }, [audioUrl, onReset]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6">
        <div className="space-y-6">
          {!recordedBlob
            ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mb-4 text-4xl font-bold text-foreground">
                      {formatTime(duration)}
                    </div>
                    {!isRecording && (
                      <p className="text-sm text-muted-foreground">
                        Click the button below to start recording
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    {!isRecording
                      ? (
                          <Button
                            onClick={startRecording}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Microphone size={20} weight="BoldDuotone" className="mr-2" />
                            Start Recording
                          </Button>
                        )
                      : (
                          <>
                            {isPaused
                              ? (
                                  <Button
                                    onClick={resumeRecording}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                  >
                                    <Play size={20} weight="BoldDuotone" className="mr-2" />
                                    Resume
                                  </Button>
                                )
                              : (
                                  <Button
                                    variant="outline"
                                    onClick={pauseRecording}
                                    className="border-border bg-secondary text-foreground hover:bg-secondary/80"
                                  >
                                    <Pause size={20} weight="BoldDuotone" className="mr-2" />
                                    Pause
                                  </Button>
                                )}
                            <Button
                              variant="destructive"
                              onClick={stopRecording}
                            >
                              <Stop size={20} weight="BoldDuotone" className="mr-2" />
                              Stop
                            </Button>
                          </>
                        )}
                  </div>
                </div>
              )
            : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="mb-2 text-lg font-semibold text-foreground">
                      Recording Complete
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration:
                      {' '}
                      {formatTime(duration)}
                    </p>
                  </div>

                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    aria-label="Recorded audio playback"
                  />

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={handlePlay}
                      variant="outline"
                      className="border-border bg-secondary text-foreground hover:bg-secondary/80"
                    >
                      {isPlaying
                        ? (
                            <>
                              <Pause size={20} weight="BoldDuotone" className="mr-2" />
                              Pause
                            </>
                          )
                        : (
                            <>
                              <Play size={20} weight="BoldDuotone" className="mr-2" />
                              Play
                            </>
                          )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-border bg-secondary text-foreground hover:bg-secondary/80"
                    >
                      <TrashBin2 size={20} weight="BoldDuotone" className="mr-2" />
                      Record Again
                    </Button>
                  </div>
                </div>
              )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
