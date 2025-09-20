'use client';

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

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageWidth: number;
  pageHeight: number;
  pageNumber: number;
}

export function AnnotationLayer({ 
  annotations, 
  pageWidth, 
  pageHeight, 
  pageNumber 
}: AnnotationLayerProps) {
  // Filter annotations for current page
  const currentPageAnnotations = annotations.filter(
    annotation => annotation.pageNumber === pageNumber
  );

  if (currentPageAnnotations.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{ 
        width: pageWidth, 
        height: pageHeight,
        background: 'transparent' 
      }}
    >
      {currentPageAnnotations.map((annotation) => {
        const { x, y, width, height } = annotation.coordinates;
        
        // Convert percentage coordinates to pixel coordinates
        const scaledX = (x / 100) * pageWidth;
        const scaledY = (y / 100) * pageHeight;
        const scaledWidth = (width / 100) * pageWidth;
        const scaledHeight = (height / 100) * pageHeight;

        console.log('🎯 Rendering annotation:', {
          type: annotation.type,
          pageNumber: annotation.pageNumber,
          scaledCoordinates: { scaledX, scaledY, scaledWidth, scaledHeight },
          pageSize: { pageWidth, pageHeight }
        });

        // Base styles for all annotations
        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          left: scaledX,
          top: scaledY,
          width: scaledWidth,
          height: scaledHeight,
          pointerEvents: 'none',
          zIndex: 10,
        };

        // Render different annotation types
        if (annotation.type === 'highlight') {
          return (
            <div
              key={annotation.id}
              style={{
                ...baseStyle,
                backgroundColor: annotation.color,
                opacity: 0.4,
                borderRadius: '2px',
              }}
              className="animate-pulse"
              title={annotation.text}
            />
          );
        }

        if (annotation.type === 'circle') {
          return (
            <div
              key={annotation.id}
              style={{
                ...baseStyle,
                border: `3px solid ${annotation.color}`,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                opacity: 0.8,
              }}
              className="animate-pulse"
              title={annotation.text}
            />
          );
        }

        if (annotation.type === 'underline') {
          return (
            <div
              key={annotation.id}
              style={{
                ...baseStyle,
                height: '3px',
                top: scaledY + scaledHeight - 3,
                backgroundColor: annotation.color,
                opacity: 0.8,
              }}
              className="animate-pulse"
              title={annotation.text}
            />
          );
        }

        return null;
      })}
    </div>
  );
}