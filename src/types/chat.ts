export type AnnotationType = 'highlight' | 'circle' | 'underline';

export interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  coordinates: { x: number; y: number; width: number; height: number };
  text?: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string | Date;   // flexible for JSON or Date
  pageNumber?: number;
  annotations?: Annotation[]; // array
}
