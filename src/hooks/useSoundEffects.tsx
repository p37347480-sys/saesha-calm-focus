import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useAppStore } from '@/store/useAppStore';

type SoundType = 'correct' | 'incorrect' | 'click' | 'whoosh' | 'celebration' | 'hint' | 'tick' | 'unlock';

export function useSoundEffects() {
  const { settings } = useAppStore();
  const soundsRef = useRef<Record<SoundType, Howl | null>>({
    correct: null,
    incorrect: null,
    click: null,
    whoosh: null,
    celebration: null,
    hint: null,
    tick: null,
    unlock: null,
  });

  useEffect(() => {
    // Generate sounds using Web Audio API (frequency-based)
    const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine', fadeType: 'gentle' | 'sharp' = 'gentle') => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      return new Howl({
        src: [createToneDataUrl(audioContext, frequency, duration, type, fadeType)],
        volume: settings.soundEnabled ? 0.3 : 0,
      });
    };

    // Correct answer - pleasant ascending chord
    soundsRef.current.correct = createTone(523.25, 0.2); // C5
    
    // Incorrect - gentle descending tone
    soundsRef.current.incorrect = createTone(220, 0.25);
    
    // Click - short tick
    soundsRef.current.click = createTone(880, 0.05, 'square', 'sharp');
    
    // Whoosh - sweep
    soundsRef.current.whoosh = createTone(300, 0.15);
    
    // Celebration - triumphant chord
    soundsRef.current.celebration = createTone(659.25, 0.4); // E5
    
    // Hint - soft notification
    soundsRef.current.hint = createTone(440, 0.15, 'triangle');

    // Tick - clock sound
    soundsRef.current.tick = createTone(800, 0.03, 'square', 'sharp');

    // Unlock - success chime
    soundsRef.current.unlock = createTone(784, 0.25, 'sine');

    return () => {
      Object.values(soundsRef.current).forEach(sound => sound?.unload());
    };
  }, [settings.soundEnabled]);

  const createToneDataUrl = (
    context: AudioContext, 
    frequency: number, 
    duration: number,
    type: OscillatorType,
    fadeType: 'gentle' | 'sharp' = 'gentle'
  ): string => {
    const sampleRate = context.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = context.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const fadeOut = fadeType === 'sharp' 
        ? (1 - (i / numSamples))
        : (1 - (i / numSamples) * 0.5); // Gentle fade
      
      if (type === 'sine') {
        data[i] = Math.sin(2 * Math.PI * frequency * t) * fadeOut;
      } else if (type === 'square') {
        data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * fadeOut;
      } else if (type === 'triangle') {
        data[i] = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t)) * fadeOut;
      }
    }

    // Convert to WAV format
    const wavData = encodeWAV(buffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const encodeWAV = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const data = buffer.getChannelData(0);
    const dataLength = data.length * bytesPerSample;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const play = (sound: SoundType) => {
    if (!settings.soundEnabled) return;
    
    const howl = soundsRef.current[sound];
    if (howl) {
      howl.play();
    }

    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      if (sound === 'correct' || sound === 'celebration') {
        navigator.vibrate(50);
      } else if (sound === 'incorrect') {
        navigator.vibrate([30, 50, 30]);
      } else if (sound === 'click' || sound === 'tick') {
        navigator.vibrate(10);
      }
    }
  };

  return { play };
}
