'use client';

import { MessageCircle, User, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef } from 'react';

// Define a proper type for annotations
interface Annotation {
  id: string;
  type: 'highlight' | 'circle' | 'underline';
  pageNumber: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
  color: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pageNumber?: number;
  annotations?: Annotation[]; // ✅ no more any[]
  timestamp: Date | string;   // accept Date or serialized Date
}

interface MessageBubbleProps {
  message: Message;
  onPageClick?: (action: { action: string; pageNumber?: number }) => void;
}

export function MessageBubble({ message, onPageClick }: MessageBubbleProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // === Text-to-Speech ===
  const speakMessage = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = message.content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Neural') ||
            v.name.includes('Enhanced') ||
            v.name.includes('Premium'))
      ) || voices.find((v) => v.lang.startsWith('en')) || null;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  };

  // === Formatting assistant output ===
  const formatAssistantContent = (text: string) => {
    const numberedSections = text.split(/(\d+\.\s*\*\*[^*]+\*\*:)/);

    if (numberedSections.length > 1) {
      return (
        <div className="space-y-4">
          {numberedSections.map((section, index) => {
            if (/^\d+\.\s*\*\*[^*]+\*\*:$/.test(section)) {
              const cleanHeader = section
                .replace(/\*\*/g, '')
                .replace(/^\d+\.\s*/, '')
                .replace(/:$/, '');
              const number = section.match(/^(\d+)\./)?.[1];
              return (
                <div key={index} className="flex items-start space-x-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex-shrink-0 mt-0.5">
                    {number}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {cleanHeader}
                  </h3>
                </div>
              );
            } else if (section.trim()) {
              return (
                <div key={index} className="ml-8 space-y-2">
                  {section.split('\n').map((line, lineIndex) =>
                    line.trim() ? (
                      <p
                        key={lineIndex}
                        className="text-gray-700 leading-relaxed"
                      >
                        {line.trim()}
                      </p>
                    ) : null
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // fallback
    return (
      <div className="space-y-3">
        {text.split('\n').map(
          (paragraph, index) =>
            paragraph.trim() && (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph.trim()}
              </p>
            )
        )}
      </div>
    );
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <User className="w-4 h-4 mt-1 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 text-sm">
                  AI Tutor
                </span>
                <span className="text-xs text-gray-500">
                  {message.timestamp instanceof Date
                    ? message.timestamp.toLocaleTimeString()
                    : new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {'speechSynthesis' in window && (
                <button
                  onClick={isSpeaking ? stopSpeaking : speakMessage}
                  className={`p-1 rounded transition-colors ${
                    isSpeaking
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {formatAssistantContent(message.content)}

            {message.pageNumber && (
              <button
                onClick={() =>
                  onPageClick?.({
                    action: 'navigate',
                    pageNumber: message.pageNumber,
                  })
                }
                className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Go to page {message.pageNumber}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
