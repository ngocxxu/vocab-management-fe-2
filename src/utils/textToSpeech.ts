export const selectVoiceByCode = (voices: any, code?: string): SpeechSynthesisVoice | undefined => {
  if (!voices || !Array.isArray(voices) || voices.length === 0) {
    return undefined;
  }

  const input = (code || 'en').toLowerCase();
  const availableVoices = voices as SpeechSynthesisVoice[];

  const voice = availableVoices.find(v => v.lang?.toLowerCase() === input)
    || availableVoices.find(v => v.lang?.toLowerCase()?.startsWith(input.split('-')[0] || 'en'));

  return voice || availableVoices[0];
};
