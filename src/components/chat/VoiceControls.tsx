'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Pause } from 'lucide-react';

interface VoiceControlsProps {
  onTranscript: (data: { interim: string; final: string }) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  textToRead?: string;
}

// ---- Custom Web Speech API type declarations ----
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

// ✅ Instead of circular type alias, just declare interface globally
declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognitionInstance;
    };
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function VoiceControls({
  onTranscript,
  isListening,
  onListeningChange,
  textToRead,
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthSupported, setSpeechSynthSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isListeningRef = useRef(false);
  const finalBuffer = useRef<string>('');
  const restartTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const RecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setIsSupported(!!RecognitionCtor);
    setSpeechSynthSupported('speechSynthesis' in window);

    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalBuffer.current += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (isListeningRef.current) {
        onTranscript({
          interim,
          final: finalBuffer.current.trim(),
        });
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.warn('⚠️ recognition error:', event.error);
      if (['not-allowed', 'audio-capture'].includes(event.error)) {
        onListeningChange(false);
      }
    };

    recognition.onend = () => {
      console.log('🛑 recognition ended');
      if (isListeningRef.current) {
        if (restartTimer.current) clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(() => {
          try {
            recognition.start();
            console.log('🔄 restarted recognition');
          } catch (err) {
            console.error('restart error:', err);
            onListeningChange(false);
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      if (restartTimer.current) clearTimeout(restartTimer.current);
      if (currentUtteranceRef.current) window.speechSynthesis.cancel();
    };
  }, [onTranscript, onListeningChange]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        finalBuffer.current = '';
        recognitionRef.current.start();
        onListeningChange(true);
        console.log('🎙️ started listening');
      } catch (err) {
        console.error('start error:', err);
        onListeningChange(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      if (restartTimer.current) clearTimeout(restartTimer.current);
      recognitionRef.current.stop();
      onListeningChange(false);
      console.log('🛑 stopped listening');
    }
  };

  // === SPEAKER ===
  const speakText = (text: string) => {
    if (!speechSynthSupported) return;
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Neural')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  };

  const toggleSpeaking = () => {
    if (isSpeaking) stopSpeaking();
    else if (textToRead) speakText(textToRead);
  };

  if (!isSupported && !speechSynthSupported) return null;

  return (
    <div className="flex space-x-1">
      {isSupported && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-lg ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border'
          }`}
          disabled={isSpeaking}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}

      {speechSynthSupported && (
        <button
          type="button"
          onClick={toggleSpeaking}
          className={`p-2 rounded-lg ${
            isSpeaking
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border'
          }`}
          disabled={isListening || !textToRead}
          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
        >
          {isSpeaking ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
