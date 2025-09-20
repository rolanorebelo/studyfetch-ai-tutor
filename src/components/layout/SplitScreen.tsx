'use client';

import { useState } from 'react';

interface SplitScreenProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitScreen({ leftPanel, rightPanel }: SplitScreenProps) {
  const [leftWidth, setLeftWidth] = useState(50);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseMove = (e: MouseEvent) => {
      const containerWidth = window.innerWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      setLeftWidth(Math.min(Math.max(newLeftWidth, 30), 70));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - PDF Viewer */}
      <div 
        className="bg-white border-r"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel - Chat */}
      <div 
        className="bg-white"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}