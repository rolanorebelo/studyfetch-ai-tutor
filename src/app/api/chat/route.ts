import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateTutorResponse } from '@/lib/ai';

// Type for messages going into the AI model
interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const user = await verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId, currentPage } = await req.json();

    // Verify chat ownership and include extracted text
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            extractedText: true,
          },
        },
      },
    });

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get last 20 messages for context
    const chatHistory = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    // Map Prisma messages into strictly typed AI messages
    const mappedHistory: AIMessage[] = chatHistory
      .map((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          return { role: msg.role, content: msg.content };
        }
        return null;
      })
      .filter(
        (m): m is AIMessage => m !== null
      );

    // Prepare PDF context
    const hasExtractedText =
      chat.document.extractedText &&
      chat.document.extractedText.length > 50;

    const pdfContext = hasExtractedText
      ? `Document: "${chat.document.originalName}"

Full Document Content:
${chat.document.extractedText}

Please provide specific, detailed answers based on the actual content of this document.`
      : `Document: "${chat.document.originalName}"
Note: This PDF document's text content could not be extracted, so I can only provide general guidance about the document type and structure.`;

    console.log(`📄 Document: ${chat.document.originalName}`);
    console.log(`📝 Has extracted text: ${hasExtractedText}`);
    console.log(`📊 Text length: ${chat.document.extractedText?.length || 0} characters`);
    console.log(`💬 User question: ${message}`);

    // Generate AI response
    const aiResponse = await generateTutorResponse(
      message,
      pdfContext,
      mappedHistory,
      currentPage
    );

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        userId: user.id,
        role: 'user',
        content: message,
      },
    });

    // Save AI response
    await prisma.message.create({
      data: {
        chatId,
        userId: user.id,
        role: 'assistant',
        content: aiResponse.response,
        pageNumber: aiResponse.action?.pageNumber,
        annotations: aiResponse.action ?? undefined,
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    console.log(`🤖 AI response generated: ${aiResponse.response.substring(0, 100)}...`);

    return NextResponse.json({
      response: aiResponse.response,
      action: aiResponse.action,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
