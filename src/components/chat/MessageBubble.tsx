'use client';

import { MessageCircle, User, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pageNumber?: number;
  annotations?: any[];
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onPageClick?: (action: any) => void;
}

export function MessageBubble({ message, onPageClick }: MessageBubbleProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-Speech Functions
  const speakMessage = () => {
    if (!('speechSynthesis' in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean up the text (remove markdown and formatting)
    const cleanText = message.content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      .replace(/`([^`]+)`/g, '$1') // Remove code backticks
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Neural') || voice.name.includes('Enhanced') || voice.name.includes('Premium'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
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

  // Format assistant messages with proper structure
  const formatAssistantContent = (text: string) => {
    // Split by numbered points (1., 2., etc.)
    const numberedSections = text.split(/(\d+\.\s*\*\*[^*]+\*\*:)/);
    
    if (numberedSections.length > 1) {
      return (
        <div className="space-y-4">
          {numberedSections.map((section, index) => {
            if (section.match(/^\d+\.\s*\*\*[^*]+\*\*:$/)) {
              // This is a numbered header
              const cleanHeader = section.replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').replace(/:$/, '');
              const number = section.match(/^(\d+)\./)?.[1];
              return (
                <div key={index} className="flex items-start space-x-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex-shrink-0 mt-0.5">
                    {number}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-lg">{cleanHeader}</h3>
                </div>
              );
            } else if (section.trim() && !section.match(/^\d+\.\s*\*\*[^*]+\*\*:$/)) {
              // This is content after a header
              return (
                <div key={index} className="ml-8 space-y-2">
                  {section.split('\n').map((line, lineIndex) => {
                    if (line.trim()) {
                      // Handle sub-bullets with **text**:
                      if (line.includes('**') && line.includes(':')) {
                        const parts = line.split(/(\*\*[^*]+\*\*:)/);
                        return (
                          <div key={lineIndex} className="space-y-1">
                            {parts.map((part, partIndex) => {
                              if (part.match(/\*\*[^*]+\*\*:/)) {
                                const cleanPart = part.replace(/\*\*/g, '').replace(/:$/, '');
                                return (
                                  <div key={partIndex} className="flex items-start space-x-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="font-medium text-gray-800">{cleanPart}</span>
                                  </div>
                                );
                              } else if (part.trim()) {
                                return (
                                  <div key={partIndex} className="ml-4 text-gray-700 leading-relaxed">
                                    {part.trim()}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <p key={lineIndex} className="text-gray-700 leading-relaxed">
                            {line.trim()}
                          </p>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // Fallback: simple paragraph formatting
    return (
      <div className="space-y-3">
        {text.split('\n').map((paragraph, index) => {
          if (paragraph.trim()) {
            // Check if it's a bullet point
            if (paragraph.includes('**') && paragraph.includes(':')) {
              const cleanText = paragraph.replace(/\*\*/g, '');
              const [label, ...rest] = cleanText.split(':');
              return (
                <div key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <div>
                    <span className="font-medium text-gray-800">{label}:</span>
                    <span className="text-gray-700 ml-1">{rest.join(':')}</span>
                  </div>
                </div>
              );
            }
            return (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph.trim()}
              </p>
            );
          }
          return null;
        })}
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
                <span className="font-medium text-gray-900 text-sm">AI Tutor</span>
                <span className="text-xs text-gray-500">
                  {message.timestamp instanceof Date 
                    ? message.timestamp.toLocaleTimeString()
                    : new Date(message.timestamp).toLocaleTimeString()
                  }
                </span>
              </div>
              
              {/* Speech Controls */}
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
                onClick={() => onPageClick?.({ action: 'navigate', pageNumber: message.pageNumber })}
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