import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

// Schema for PDF actions
const PDFActionSchema = z.object({
  action: z.enum(['highlight', 'circle', 'underline', 'navigate']),
  pageNumber: z.number().optional(),
  coordinates: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(), // Make coordinates optional
  text: z.string().optional(),
});

export async function generateTutorResponse(
  message: string,
  documentContent?: string,
  chatHistory?: { role: 'user' | 'assistant'; content: string }[],
  currentPage?: number
) {
  try {
    // Generate the main response
    const response = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `
        You are an AI tutor helping students understand their PDF documents. 
        Be helpful, clear, and educational.

        Document context: ${documentContent || 'No document content available'}
        
        Previous conversation: ${chatHistory ? JSON.stringify(chatHistory.slice(-5)) : 'No previous messages'}
        
        Current page: ${currentPage || 1}
        
        Student question: ${message}
        
        Please provide a helpful response that references specific page numbers when relevant.
      `,
      maxTokens: 500,
    });

    // Generate PDF actions if needed
    const actionPrompt = `
Based on the user's request and document content, determine if you should take a PDF action.

IMPORTANT: For coordinates, use realistic percentages:
- x: 0-100 (left to right position)
- y: 0-100 (top to bottom position)
- width: 10-80 (reasonable width)
- height: 5-15 (reasonable height for text)

For highlights: Use coordinates that would cover text areas.
For circles: Use coordinates that would encompass important numbers/sections.
For underlines: Use thin height (2-5) positioned under text.

Current page: ${currentPage || 1}

Examples:
- Heading highlight: x:10, y:15, width:70, height:8
- Number circle: x:25, y:40, width:15, height:10
- Text underline: x:20, y:50, width:60, height:3

If the user asks to highlight, circle, or underline content, provide specific coordinates based on typical document layouts.

Student question: ${message}
AI response: ${response.text}

Actions available:
- highlight: highlight text on a page
- circle: circle an area on a page
- underline: underline text on a page
- navigate: go to a specific page

If no visual annotation is needed, use navigate action to relevant page.
`;

   const actionResponse = await generateObject({
  model: openai('gpt-4o-mini'),
  schema: PDFActionSchema,
  prompt: actionPrompt,
});

// Ensure `coordinates` are valid for actions that require them
if (['highlight', 'circle', 'underline'].includes(actionResponse.object.action)) {
  const { coordinates } = actionResponse.object;
  if (!coordinates || !coordinates.x || !coordinates.y || !coordinates.width || !coordinates.height) {
    throw new Error('Invalid coordinates generated for annotation action.');
  }
}

    return {
      response: response.text,
      action: actionResponse.object,
    };
  } catch (error) {
    console.error('AI generation error:', error);

    // Fallback response without structured output
    try {
      const fallbackResponse = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt: `
          You are an AI tutor. Please respond helpfully to this question: ${message}
          
          Keep your response concise and educational.
        `,
        maxTokens: 300,
      });

      return {
        response: fallbackResponse.text,
        action: null,
      };
    } catch (fallbackError) {
      console.error('Fallback AI generation error:', fallbackError);
      throw new Error('Failed to generate tutor response');
    }
  }
}

// Alternative function using regular text generation for actions
export async function generateTutorResponseAlternative(
  message: string,
  documentContent?: string,
  chatHistory?: { role: 'user' | 'assistant'; content: string }[]
) {
  try {
    const response = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `
        You are an AI tutor helping students understand their PDF documents.
        
        Document context: ${documentContent || 'No document content available'}
        Previous conversation: ${chatHistory ? JSON.stringify(chatHistory.slice(-5)) : 'No previous messages'}
        Student question: ${message}
        
        Please provide a helpful response. If you want to highlight, circle, or navigate to specific content,
        end your response with one of these action formats:
        
        [ACTION:HIGHLIGHT:page=1:x=10:y=20:width=60:height=8:text="specific text"]
        [ACTION:CIRCLE:page=1:x=25:y=40:width=15:height=10]
        [ACTION:NAVIGATE:page=3]
        
        IMPORTANT: Use percentage coordinates (0-100) for better accuracy.
        Only include an action if it would genuinely help the student understand the content better.
      `,
      maxTokens: 500,
    });

    // Parse action from response
    let action = null;
    let cleanResponse = response.text;
    
    const actionMatch = response.text.match(/\[ACTION:([^\]]+)\]/);
    if (actionMatch) {
      const actionString = actionMatch[1];
      const parts = actionString.split(':');
      
      if (parts[0] === 'NAVIGATE') {
        action = {
          action: 'navigate',
          pageNumber: parseInt(parts[1].split('=')[1]),
        };
      } else if (parts[0] === 'HIGHLIGHT') {
        action = {
          action: 'highlight',
          pageNumber: parseInt(parts[1].split('=')[1]),
          coordinates: {
            x: parseInt(parts[2].split('=')[1]),
            y: parseInt(parts[3].split('=')[1]),
            width: parseInt(parts[4].split('=')[1]),
            height: parseInt(parts[5].split('=')[1]),
          },
          text: parts[6]?.split('=')[1]?.replace(/"/g, ''),
        };
      } else if (parts[0] === 'CIRCLE') {
        action = {
          action: 'circle',
          pageNumber: parseInt(parts[1].split('=')[1]),
          coordinates: {
            x: parseInt(parts[2].split('=')[1]),
            y: parseInt(parts[3].split('=')[1]),
            width: parseInt(parts[4].split('=')[1]),
            height: parseInt(parts[5].split('=')[1]),
          },
        };
      }
      
      // Remove action from response
      cleanResponse = response.text.replace(/\[ACTION:[^\]]+\]/, '').trim();
    }

    return {
      response: cleanResponse,
      action,
    };

  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate tutor response');
  }
}