// WebSocket only. Long-polling keeps its session in one API pod's memory, so it breaks when the API runs on several pods.
export const SOCKET_TRANSPORTS: Array<'websocket'> = ['websocket'];

export enum SOCKET_EVENTS {
  AUDIO_EVALUATION_PROGRESS = 'audio-evaluation-progress',
  MULTIPLE_CHOICE_GENERATION_PROGRESS = 'multiple-choice-generation-progress',
  FILL_IN_BLANK_CHOICE_GENERATION_PROGRESS = 'fill-in-blank-choice-generation-progress',
  FILL_IN_BLANK_EVALUATION_PROGRESS = 'fill-in-blank-evaluation-progress',
  SUBJECT_GENERATE_RESULT = 'subject-generate-result',
  VOCAB_GENERATE_TEXT_TARGET_RESULT = 'vocab-generate-text-target-result',
}
