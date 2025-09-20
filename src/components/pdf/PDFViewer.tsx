'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnnotationLayer } from './AnnotationLayer';

// Dynamically import react-pdf with no SSR
const Document = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const Page = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), {
  ssr: false
});

// Configure PDF.js worker only on client side
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  });
}

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  annotations: Annotation[];
  onLoadSuccess: (pdf: any) => void;
}

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

export function PDFViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange, 
  annotations,
  onLoadSuccess 
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [pageHeight, setPageHeight] = useState<number>(0); // Add pageHeight state
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updatePageWidth = () => {
      if (containerRef.current) {
        setPageWidth(Math.min(containerRef.current.clientWidth - 40, 800));
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  const handleLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    onLoadSuccess(pdf);
  };

  const handleLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setError('Failed to load PDF. Please try again.');
    setIsLoading(false);
  };

  const handlePageRenderSuccess = (page: any) => {
    // Calculate page height dynamically based on the viewport
    const viewport = page.getViewport({ scale: 1 });
    setPageHeight((viewport.height / viewport.width) * pageWidth);
  };

  const currentPageAnnotations = annotations.filter(
    annotation => annotation.pageNumber === currentPage
  );

  // Don't render PDF on server side
  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="text-sm text-gray-600">Loading PDF viewer...</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 h-96 w-full max-w-2xl rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : `Page ${currentPage} of ${numPages}`}
          </span>
          <button
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto flex justify-center p-4"
      >
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setIsLoading(true);
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Document
              file={fileUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              className="shadow-lg"
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <Page 
                pageNumber={currentPage} 
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={handlePageRenderSuccess} // Add this callback
                loading={
                  <div className="animate-pulse bg-gray-200 h-96 rounded"></div>
                }
              />
            </Document>
            
            {/* Custom Annotation Layer */}
            <AnnotationLayer
              annotations={annotations}
              pageWidth={pageWidth}
              pageHeight={pageHeight} // Use the calculated pageHeight
              pageNumber={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}