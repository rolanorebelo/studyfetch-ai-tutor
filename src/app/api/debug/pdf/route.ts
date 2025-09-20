import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const user = await verifyToken(token || '');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest document for this user
    const document = await prisma.document.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        fileSize: true,
        extractedText: true,
        createdAt: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'No documents found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.originalName,
        fileSize: document.fileSize,
        uploadedAt: document.createdAt,
        hasExtractedText: !!document.extractedText,
        textLength: document.extractedText?.length || 0,
        textPreview: document.extractedText?.substring(0, 500) || 'No text available',
        isSmartContext: document.extractedText?.includes('This is a PDF document named') || false
      }
    });

  } catch (error) {
    console.error('Debug PDF error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}