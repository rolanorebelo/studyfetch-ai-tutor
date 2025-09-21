'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Brain, MessageCircle, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and redirect to dashboard
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch {
  console.error('An error occurred');
}
    };
    checkAuth();
  }, [router]);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">StudyFetch AI Tutor</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Learn Smarter with AI
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your PDF documents and chat with an AI tutor that can highlight, 
            annotate, and explain content in real-time.
          </p>
          
          <div className="mt-8">
            <button
              onClick={handleRegister}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">PDF Integration</h3>
            <p className="mt-2 text-gray-600">
              Upload any PDF and get AI-powered annotations and highlights
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Voice Interaction</h3>
            <p className="mt-2 text-gray-600">
              Ask questions with voice input and hear responses read aloud
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Smart Learning</h3>
            <p className="mt-2 text-gray-600">
              AI understands context and provides personalized explanations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}