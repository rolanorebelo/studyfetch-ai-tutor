'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { VoiceControls } from './VoiceControls';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pageNumber?: number;
  annotations?: any[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId: string;
  onPDFAction: (action: any) => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({ 
  chatId, 
  onPDFAction, 
  messages, 
  onSendMessage, 
  isLoading 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [interim, setInterim] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || typeof input !== 'string' || !input.trim()) return;
    
    onSendMessage(input);
    setInput('');
    setInterim('');
  };

  // ✅ Accept interim + final and show directly in input
  const handleVoiceInput = ({ interim, final }: { interim: string; final: string }) => {
    if (interim) {
      setInterim(interim);
    }
    if (final) {
      setInput(final.trim());  // overwrite instead of append
      setInterim('');
    }
    inputRef.current?.focus();
  };

  // Last AI message for text-to-speech
  const lastAIMessage = messages
    .filter(msg => msg.role === 'assistant')
    .pop();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">AI Tutor</h2>
        <p className="text-sm text-gray-600">Ask me anything about your document</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation about your PDF document!</p>
            <p className="text-sm mt-2">Try asking: "What is this document about?" or "Explain the main concepts"</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onPageClick={onPDFAction}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2 items-center">
          {/* Simple input, shows interim or final */}
          <input
            ref={inputRef}
            type="text"
            value={interim || input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            disabled={isLoading}
          />

          <VoiceControls
            onTranscript={handleVoiceInput}
            isListening={isListening}
            onListeningChange={setIsListening}
            textToRead={lastAIMessage?.content}
          />
          
          <button
            type="submit"
            disabled={!input || typeof input !== 'string' || !input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-400">
            Debug: Speech synthesis supported: {'speechSynthesis' in window ? 'Yes' : 'No'}, 
            Last AI message: {lastAIMessage ? 'Available' : 'None'}
          </div>
        )}
      </form>
    </div>
  );
}
