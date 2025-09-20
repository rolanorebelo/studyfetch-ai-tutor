'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SplitScreen } from '@/components/layout/SplitScreen';
import { ArrowLeft } from 'lucide-react';

// Define proper TypeScript interfaces
interface Document {
  id: string;
  filename: string;
  originalName: string;
  uploadPath: string;
  fileSize: number;
  mimeType: string;
}

interface Chat {
  id: string;
  title: string;
  userId: string;
  documentId: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  pageNumber?: number;
  annotations?: any;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'circle' | 'underline';
  pageNumber: number;
  coordinates: any;
  text?: string;
  color: string;
}

interface TutorPageProps {
  params: Promise<{ id: string }>;
}

export default function TutorPage({ params }: TutorPageProps) {
  const [chatId, setChatId] = useState<string>('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Resolve params and set chatId
    const resolveParams = async () => {
      const resolvedParams = await params;
      setChatId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  const loadChatData = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load chat');
      }
      
      const data = await response.json();
      setChat(data.chat);
      setDocument(data.document);
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      router.push('/dashboard');
    }
  };

  const handleSendMessage = async (message: string) => {
  setIsLoading(true);

  try {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        chatId: chatId,
        documentId: document?.id,
        currentPage, // Include the current page in the request
      }),
    });

    if (!response.ok) throw new Error('Failed to send message');

    const data = await response.json();

    // Add AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.response,
      role: 'assistant' as const,
      timestamp: new Date(),
      pageNumber: data.action?.pageNumber,
      annotations: data.action,
    };

    setMessages(prev => [...prev, aiMessage]);

    // Handle PDF actions
    if (data.action) {
      console.log("Data == ", data);
  if (data.action.action === 'navigate' && data.action.pageNumber) {
    // Handle navigation
    handlePDFAction(data.action);
  } else if (data.action.coordinates) {
    // Handle annotations (highlight, circle, underline)
    handlePDFAction(data.action);
  }
}
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setIsLoading(false);
  }
};

 const handlePDFAction = (action: any) => {
  if (action.action === 'navigate' && action.pageNumber) {
    setCurrentPage(action.pageNumber);
  }

  if (action.coordinates) {
    const { x, y, width, height } = action.coordinates;

    // Log the coordinates
    console.log('📍 Annotation Coordinates:', {
      x,
      y,
      width,
      height,
      pageNumber: action.pageNumber || currentPage,
      type: action.action,
    });

    // Validate coordinates
    if (x === undefined || y === undefined || width === undefined || height === undefined) {
      console.error('Invalid coordinates for annotation:', action.coordinates);
      return;
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: action.action as 'highlight' | 'circle' | 'underline',
      pageNumber: action.pageNumber || currentPage,
      coordinates: action.coordinates,
      text: action.text,
      color: action.action === 'highlight' ? '#fef08a' : 
             action.action === 'circle' ? '#ef4444' : '#3b82f6',
    };

    setAnnotations(prev => [...prev, newAnnotation]);

    // Remove annotation after 10 seconds
    setTimeout(() => {
      setAnnotations(prev => prev.filter(ann => ann.id !== newAnnotation.id));
    }, 10000);
  }
};

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center space-x-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            {document.originalName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <SplitScreen
          leftPanel={
            <PDFViewer
              fileUrl={document.uploadPath}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              annotations={annotations}
              onLoadSuccess={() => {}}
            />
          }
          rightPanel={
            <ChatInterface
              chatId={chatId}
              onPDFAction={handlePDFAction}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          }
        />
      </div>
    </div>
  );
}