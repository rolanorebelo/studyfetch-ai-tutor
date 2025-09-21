# StudyFetch AI Tutor

An intelligent PDF document analysis platform that provides AI-powered tutoring with voice interaction, real-time annotations, and personalized learning experiences.

🚀 **Live Demo**: [https://studyfetch-ai-tutor-cyan.vercel.app/](https://studyfetch-ai-tutor-cyan.vercel.app/)

## Features

### 🤖 AI-Powered Learning
- Interactive chat with AI tutor about your PDF documents
- Context-aware responses based on document content
- Smart text extraction and analysis from uploaded PDFs
- Personalized explanations and study guidance

### 🎙️ Voice Integration
- **Speech-to-Text**: Voice input for hands-free questioning
- **Text-to-Speech**: AI responses read aloud with natural voices
- Smart listening with pause detection and continuous input
- Enhanced accessibility for all learning styles

### 📄 PDF Analysis
- Advanced PDF text extraction using pdf-parse
- Real-time annotations (highlight, circle, underline)
- Page navigation with AI-guided jumps to relevant sections
- Visual feedback and temporary annotation display

### 💬 Enhanced Chat Experience
- Formatted message display with numbered sections and bullet points
- Chat history persistence across sessions
- Loading states and typing indicators
- Responsive design for all screen sizes

### 🔐 User Management
- Secure authentication with JWT tokens
- User registration and login with password strength validation
- Personal document libraries and chat history
- Session management and automatic redirects

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom components
- **Lucide React** - Modern icon library
- **React PDF** - PDF viewing and rendering

### Backend
- **Next.js API Routes** - Server-side functionality
- **Prisma** - Database ORM with PostgreSQL
- **bcryptjs** - Password hashing
- **JWT** - Session management
- **pdf-parse** - PDF text extraction

### AI Integration
- **Vercel AI SDK** - AI model integration
- **OpenAI GPT-4o-mini** - Language model for tutoring responses
- **Structured output generation** - PDF annotation coordinates

### Browser APIs
- **Web Speech API** - Speech recognition and synthesis
- **File API** - PDF upload handling
- **Canvas API** - PDF rendering support

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studyfetch-ai-tutor.git
cd studyfetch-ai-tutor
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/studyfetch"
DIRECT_URL="postgresql://username:password@localhost:5432/studyfetch"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"

# AI Integration
OPENAI_API_KEY="your-openai-api-key"
```

4. **Database setup**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Live Application

**Production URL**: [https://studyfetch-ai-tutor-cyan.vercel.app/](https://studyfetch-ai-tutor-cyan.vercel.app/)

The application is deployed on Vercel with full functionality including:
- User authentication and registration
- PDF upload and processing
- AI-powered document analysis
- Voice recognition and text-to-speech
- Real-time chat interface
- PDF annotations and navigation

## Quick Start

Visit the live application at: **[https://studyfetch-ai-tutor-cyan.vercel.app/](https://studyfetch-ai-tutor-cyan.vercel.app/)**

1. **Sign up** for a free account
2. **Upload a PDF** document (max 10MB)
3. **Start chatting** with the AI tutor about your document
4. **Use voice features** for hands-free interaction

## Getting Started
1. **Register an account** or sign in if you already have one
2. **Upload a PDF document** from your dashboard
3. **Start chatting** with the AI tutor about your document
4. **Use voice commands** by clicking the microphone button
5. **Listen to responses** using the speaker button

### Voice Features
- **Voice Input**: Click the microphone and speak your questions naturally
- **Text-to-Speech**: Click the speaker icon on any AI response to hear it read aloud
- **Continuous Listening**: The system intelligently handles pauses in speech
- **Multiple Languages**: Supports various English accents and dialects

### PDF Interactions
- **Smart Annotations**: AI can highlight, circle, or underline relevant content
- **Page Navigation**: Ask to go to specific sections and the AI will navigate there
- **Context Awareness**: AI understands your document's content and structure
- **Visual Feedback**: Annotations appear temporarily to guide your attention

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── tutor/             # PDF tutoring interface
├── components/            # React components
│   ├── chat/              # Chat interface components
│   ├── pdf/               # PDF viewer components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── ai.ts              # AI integration logic
│   ├── auth.ts            # Authentication utilities
│   └── db.ts              # Database connection
└── prisma/                # Database schema and migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List user documents
- `POST /api/pdf/upload` - Upload PDF document

### Chat
- `GET /api/chat/[id]` - Get chat history
- `POST /api/chat` - Send message and get AI response

## Configuration

### PDF Processing
The system uses pdf-parse for text extraction with fallback context generation for documents that can't be processed. You can customize extraction behavior in `src/app/api/pdf/upload/route.ts`.

### AI Responses
AI behavior is configured in `src/lib/ai.ts`. You can adjust:
- Response length and style
- Annotation coordinate generation
- Context awareness parameters
- Fallback response handling

### Voice Settings
Voice recognition and synthesis settings can be modified in `src/components/chat/VoiceControls.tsx`:
- Language and accent preferences
- Speech rate and pitch
- Recognition sensitivity
- Restart timing for continuous listening

## Deployment

The application is deployed on Vercel at: [https://studyfetch-ai-tutor-cyan.vercel.app/](https://studyfetch-ai-tutor-cyan.vercel.app/)

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/studyfetch-ai-tutor)

### Environment Variables for Production
Ensure these environment variables are set in your deployment platform:

```env
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-database-direct-url"
NEXTAUTH_SECRET="your-production-secret"
OPENAI_API_KEY="your-openai-api-key"
```

### Database Migration for Production
```bash
npx prisma migrate deploy
```

### File Storage
PDF files are stored in the `public/uploads` directory. For production, consider using cloud storage like AWS S3 or Vercel Blob Storage for better performance and scalability.

## Troubleshooting

### Common Issues

**PDF Upload Fails**
- Check file size (max 10MB)
- Ensure PDF is not password protected
- Verify upload directory permissions

**Voice Features Not Working**
- Use HTTPS (required for speech APIs)
- Check browser compatibility (Chrome recommended)
- Verify microphone permissions

**AI Responses Are Generic**
- Check OpenAI API key configuration
- Verify PDF text extraction is working
- Review API rate limits

**Styling Issues**
- Clear browser cache
- Check Tailwind CSS compilation
- Verify global CSS imports

### Browser Compatibility
- **Recommended**: Chrome 80+, Edge 80+
- **Speech Recognition**: Chrome/Edge only
- **PDF Viewing**: Modern browsers with Canvas support
- **Mobile**: iOS Safari 14+, Android Chrome 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**StudyFetch AI Tutor** - Transform your learning experience with AI-powered document analysis and voice interaction.
