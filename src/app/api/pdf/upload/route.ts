// src/app/api/pdf/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const user = await verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    console.log("🚀 === PDF UPLOAD DEBUG START ===");
    console.log(`📄 File: ${file.name}`);
    console.log(`📏 Size: ${file.size} bytes`);

    // ✅ Upload to Vercel Blob instead of writing to /public/uploads
    const filename = `${Date.now()}-${file.name}`;
    const { url } = await put(`pdf-uploads/${filename}`, file, {
      access: "public", // or "private" if you want to restrict
    });

    console.log(`✅ Uploaded to Blob Storage: ${url}`);

    // Extract text using pdf-parse
    let extractedText = "";
    let textExtractionSuccess = false;
    let extractionMethod = "none";

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer, { max: 20 });

      let fullText = pdfData.text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .replace(/[^\x20-\x7E\n\r\t]/g, "")
        .trim();

      if (fullText.length > 50000) {
        fullText =
          fullText.substring(0, 50000) +
          "\n\n[Document truncated for performance...]";
      }

      if (fullText.length > 50) {
        extractedText = fullText;
        textExtractionSuccess = true;
        extractionMethod = "pdf-parse";
      }
    } catch (err) {
      console.error("❌ Text extraction failed:", err);
      extractedText = generateAdvancedContext(file.name, file.size);
      extractionMethod = "advanced-context";
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        filename,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadPath: url, // ✅ Store Blob URL instead of local path
        extractedText,
        userId: user.id,
      },
    });

    const chat = await prisma.chat.create({
      data: {
        title: `Chat about ${file.name}`,
        userId: user.id,
        documentId: document.id,
      },
    });

    return NextResponse.json({
      document: {
        id: document.id,
        originalName: document.originalName,
        uploadPath: document.uploadPath,
        hasExtractedText: textExtractionSuccess,
        textLength: extractedText.length,
        extractionMethod,
      },
      chat,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ === UPLOAD ERROR ===", errorMessage);
    console.error("❌ Full error object:", error);
    return NextResponse.json(
      { error: "Upload failed", details: errorMessage },
      { status: 500 }
    );
  }
}

function generateAdvancedContext(filename: string, fileSize: number): string {
  return `This is a PDF document titled "${filename}" (${Math.round(
    fileSize / 1024
  )}KB). I can help analyze structure, summarize, and extract insights.`;
}
