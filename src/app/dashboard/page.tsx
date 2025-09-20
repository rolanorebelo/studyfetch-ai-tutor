'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PDFUpload } from '@/components/pdf/PDFUpload';
import { 
  FileText, 
  MessageCircle, 
  LogOut, 
  Upload,
  TrendingUp,
  BookOpen,
  Sparkles,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';

interface Document {
  id: string;
  originalName: string;
  createdAt: string;
  chats: Array<{
    id: string;
    title: string;
    updatedAt: string;
  }>;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

 useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/auth/login');
    }
  };

  fetchUser();
  loadDocuments();
}, [router]);


  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/tutor/${chatId}`);
  };

  const totalChats = documents.reduce((acc, doc) => acc + doc.chats.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage your learning materials</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {user && (
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-3xl font-bold text-gray-900">{totalChats}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {documents.length > 0 ? Math.round((totalChats / documents.length) * 10) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Upload Section */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload New Document</h2>
                <p className="text-gray-600">Start learning with your PDF materials</p>
              </div>
              <PDFUpload />
              
              {/* Quick Tips */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3>
                </div>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Best with textbooks and research papers</li>
                  <li>• Supports multiple languages</li>
                  <li>• AI will create personalized study plans</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enhanced Documents Section with Scroll */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Learning Library</h2>
                    <p className="text-gray-600 mt-1">Access your documents and continue conversations</p>
                  </div>
                  {documents.length > 0 && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Last updated {new Date(Math.max(...documents.map(d => new Date(d.createdAt).getTime()))).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full animate-pulse mb-4">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading your library...</p>
                  <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-600 mb-6">Upload your first PDF to start your learning journey</p>
                  <div className="flex items-center justify-center space-x-2 text-blue-600 font-medium">
                    <Plus className="w-4 h-4" />
                    <span>Get started by uploading a document</span>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="p-8 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                              {doc.originalName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{doc.chats.length} chat{doc.chats.length !== 1 ? 's' : ''}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      {doc.chats.length > 0 && (
                        <div className="ml-16">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                            <span>Recent Conversations</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {doc.chats.length}
                            </span>
                          </h4>
                          <div className="grid gap-3">
                            {doc.chats.slice(0, 3).map((chat) => (
                              <button
                                key={chat.id}
                                onClick={() => handleChatClick(chat.id)}
                                className="flex items-center justify-between w-full p-4 text-left rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-200 group/chat"
                              >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-900 truncate block">
                                      {chat.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(chat.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover/chat:text-gray-600 transition-colors flex-shrink-0" />
                              </button>
                            ))}
                            {doc.chats.length > 3 && (
                              <div className="text-center pt-2">
                                <span className="text-sm text-gray-500">
                                  +{doc.chats.length - 3} more conversation{doc.chats.length - 3 !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}