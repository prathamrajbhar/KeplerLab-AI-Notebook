# KeplerLab - AI-Powered Study Assistant

## Project Overview

KeplerLab is a comprehensive AI-powered study assistant application that transforms educational materials into various interactive formats including slides, podcasts, flashcards, quizzes, explainer videos, and provides RAG-based conversational learning. The platform enables students to upload documents and automatically generate multiple learning resources using advanced AI technologies.

## 🚀 Key Features & Detailed Implementation

### 📚 Content Generation
- **Smart Slides**: Auto-generate presentation slides from uploaded materials with AI-powered content structuring
  - Uses Google Gemini for slide content generation with specialized prompts
  - Implements structured JSON output with slide layouts and blocks
  - Supports multiple layout types: dense_text, text_with_image, full_table, numbered_block, academic_layout
  - Maintains strict content limits (80-120 words per paragraph block, 3-5 bullets per slide)
  - Exports to HTML format with programmatic rendering capabilities
  
- **Interactive Podcasts**: Convert text content to engaging audio podcasts with natural TTS
  - Generates academic-level dialogue between host and guest using Gemini LLM
  - Creates 15-25 dialogue exchanges for comprehensive coverage
  - Uses Coqui TTS (VCTK model) with multiple speaker voices
  - Host speaker: VCTK speaker #7, Guest speaker: VCTK speaker #4
  - Generates timing data for each dialogue segment
  - Outputs high-quality WAV audio files
  
- **Flashcards**: Create study flashcards with Q&A format for efficient memorization
  - AI-powered question generation from source material
  - Structured JSON output for programmatic display
  - Focus on key concepts and definitions extraction
  
- **Quizzes**: Generate interactive quizzes to test understanding
  - Multiple choice, true/false, and open-ended question formats
  - Automatic grading and feedback system
  - Difficulty level adaptation based on content complexity
  
- **Explainer Videos**: Create educational videos with slide animations and narration
  - Combines generated slides with TTS narration
  - Uses MoviePy for video composition
  - Playwright for slide screenshot capture
  - Synchronized audio-visual timeline generation

### 💬 AI Chat & RAG (Retrieval-Augmented Generation)
- **Intelligent Chat**: RAG-powered conversational learning with context from uploaded materials
  - ChromaDB vector database for semantic search
  - Sentence-transformers/all-MiniLM-L6-v2 for embeddings generation
  - User-isolated collections for data privacy
  - Context retrieval with k=5 similar chunks by default
  
- **Document Q&A**: Ask questions about specific documents and get accurate answers
  - Material-specific filtering in vector search
  - Contextual chat history maintenance
  - Source attribution for generated responses
  
- **Multi-material Context**: Chat across multiple documents within notebooks
  - Notebook-scoped vector search across all materials
  - Cross-document knowledge synthesis
  - Persistent conversation history per notebook

### 📁 Organization & Management
- **Notebooks**: Organize materials into logical study groups
  - UUID-based identification system
  - Hierarchical material organization
  - User ownership and access control
  
- **Material Upload**: Support for PDF, PPT, and text documents
  - PyPDF for PDF text extraction
  - Automatic text chunking (800 chars, 150 overlap) using LangChain RecursiveCharacterTextSplitter
  - Material status tracking: PENDING → PROCESSING → COMPLETED/FAILED
  - Chunk count tracking for processing metrics
  
- **Content History**: Track all generated content and chat conversations
  - PostgreSQL persistence for all generated content
  - Metadata tracking for content types and generation parameters
  - Chat history with timestamps and user attribution
  
- **User Authentication**: Secure JWT-based authentication system
  - Bcrypt password hashing with salt
  - JWT tokens with python-jose cryptography
  - Role-based access control (default: "user")
  - Account status management (active/inactive)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   AI Services   │
│                 │    │                 │    │                 │
│ • React 19      │◄──►│ • FastAPI       │◄──►│ • Google Gemini │
│ • Vite          │    │ • Python 3.11   │    │ • LangChain     │
│ • TailwindCSS   │    │ • Pydantic      │    │ • HuggingFace   │
│ • React Router  │    │ • SQLAlchemy    │    │ • Coqui TTS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Databases     │
                       │                 │
                       │ • PostgreSQL    │
                       │ • ChromaDB      │
                       │ • Redis Cache   │
                       └─────────────────┘
```

## 🛠️ Technology Stack & Detailed Models

### Frontend Stack
| Technology | Version | Purpose | Implementation Details |
|------------|---------|---------|----------------------|
| **React** | 19.2.0 | UI framework | Component-based architecture, functional components with hooks |
| **Vite** | 7.2.4 | Build tool and dev server | Hot module replacement, optimized bundling |
| **TailwindCSS** | 3.4.19 | Utility-first CSS framework | Custom component styling, responsive design |
| **React Router** | 7.11.0 | Client-side routing | SPA navigation, protected routes |
| **React Markdown** | 10.1.0 | Markdown rendering | Content display with remark-gfm support |
| **jsPDF** | 4.0.0 | PDF generation | Client-side PDF export functionality |

### Backend Stack  
| Technology | Version | Purpose | Configuration Details |
|------------|---------|---------|---------------------|
| **FastAPI** | 0.115.6 | Web framework | ASGI server, automatic API documentation, async/await support |
| **Python** | 3.11+ | Programming language | Type hints, async support, performance optimizations |
| **Pydantic** | 2.9.2 | Data validation | Schema validation, automatic serialization/deserialization |
| **SQLAlchemy** | 2.0.35 | ORM | Async support with asyncpg, relationship management |
| **Uvicorn** | 0.30.6 | ASGI server | Production-ready, with standard extras |
| **python-multipart** | 0.0.9 | File upload handling | Multipart form data processing |

### AI & ML Models Stack
| Technology | Version | Model Details | Use Case |
|------------|---------|---------------|----------|
| **Google Gemini** | via langchain-google-genai 1.0.10 | Gemini-Pro model, temperature=0.0 | Primary LLM for content generation (slides, podcasts, quizzes, chat) |
| **Sentence Transformers** | 3.1.1 | all-MiniLM-L6-v2 model | Text embeddings for semantic search (384 dimensions) |
| **Coqui TTS** | Latest | VCTK VITS model (en/vctk/vits) | Multi-speaker text-to-speech (Host: Speaker #7, Guest: Speaker #4) |
| **LangChain** | 0.2.16 | Framework | LLM orchestration, text splitting, prompt management |
| **HuggingFace Hub** | 0.24.6 | Model distribution | Automatic model downloading and caching |
| **PyTorch** | Latest (CUDA 12.1) | Deep learning framework | TTS model inference, GPU acceleration support |

### Alternative LLM Providers
| Provider | Configuration | Fallback Strategy |
|----------|---------------|------------------|
| **Primary**: Google Gemini | `LLM_PROVIDER=GOOGLE`, `GOOGLE_MODEL` env var | Main production LLM |
| **Secondary**: Ollama | `LLM_PROVIDER=OLLAMA`, `OLLAMA_MODEL` env var | Local deployment option |
| **Tertiary**: Custom OpenLM API | `LLM_PROVIDER=MYOPENLM` | External API fallback |

### Database Stack
| Technology | Purpose | Configuration | Performance Features |
|------------|---------|---------------|-------------------|
| **PostgreSQL** | Primary relational DB | asyncpg driver, connection pooling | Async queries, UUID primary keys, foreign key constraints |
| **ChromaDB** | Vector database | Persistent storage, sentence-transformers integration | User-isolated collections, semantic similarity search |
| **Redis** | Caching layer | Session storage, query caching | FastAPI-cache2 integration, performance optimization |

### Media Processing Stack
| Technology | Purpose | Implementation Details |
|------------|---------|---------------------|
| **MoviePy** | Video generation | Slide-to-video conversion, audio synchronization |
| **Playwright** | Web automation | Slide screenshot capture, headless browser operations |
| **PyPDF** | PDF processing | Text extraction, page-by-page processing |
| **python-pptx** | PowerPoint handling | Slide generation, content extraction |
| **Pillow** | Image processing | Image manipulation, format conversion |
| **PyMuPDF** | Advanced PDF operations | Alternative PDF processing, better text extraction |
| **pdf2image** | PDF to image conversion | Slide thumbnail generation |

### Text Processing & NLP
| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **tiktoken** | Token counting | GPT tokenizer for content limits |
| **LangChain Text Splitters** | Document chunking | RecursiveCharacterTextSplitter (chunk_size=800, overlap=150) |
| **NumPy** | Numerical operations | Array processing for audio/embeddings |

### Security & Authentication
| Technology | Purpose | Implementation |
|------------|---------|----------------|
| **python-jose** | JWT handling | Cryptographic JWT signing/verification |
| **passlib** | Password hashing | Bcrypt algorithm with salting |
| **bcrypt** | Hashing algorithm | Secure password storage |

## 📊 Database Schema & Data Architecture

### Relational Database (PostgreSQL) - Detailed Schema

#### Core Entities with Relationships
```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

-- Notebooks Table
CREATE TABLE notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);

-- Materials Table with Status Tracking
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_text TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- ENUM: pending, processing, completed, failed
    chunk_count VARCHAR(10) DEFAULT '0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_materials_user_id ON materials(user_id);
CREATE INDEX idx_materials_notebook_id ON materials(notebook_id);

-- Chat History Table
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_history_user_notebook ON chat_history(user_id, notebook_id);

-- Generated Content Table
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- slides, podcast, flashcard, quiz, explainer
    file_path TEXT,
    metadata JSONB, -- Stores generation parameters and additional info
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX idx_generated_content_type ON generated_content(content_type);
```

#### Data Relationships & Cascade Rules
- **User Deletion**: Cascades to all owned notebooks, materials, chat history, and generated content
- **Notebook Deletion**: Sets material.notebook_id to NULL, cascades chat history
- **Material Deletion**: Cascades to generated content derived from that material

### Vector Database (ChromaDB) - Detailed Architecture

#### Collection Structure
```python
# Collection Naming Convention
collection_name = f"user_{user_id}_chapters"  # User isolation

# Document Storage Structure
{
    "ids": ["chunk_uuid_1", "chunk_uuid_2", ...],
    "documents": ["chunk_text_1", "chunk_text_2", ...],
    "metadatas": [
        {
            "material_id": "material_uuid",
            "user_id": "user_uuid", 
            "filename": "document.pdf",
            "chunk_index": 0,
            "original_length": 1200,
            "created_at": "2026-01-27T..."
        }
    ],
    "embeddings": [[0.1, 0.2, ...], [0.3, 0.1, ...], ...]  # 384-dimensional vectors
}
```

#### Embedding Generation Pipeline
1. **Model**: sentence-transformers/all-MiniLM-L6-v2
   - Dimensions: 384
   - Context length: 512 tokens
   - Multilingual support: Limited
   - Performance: ~65.2 on STS benchmark

2. **Storage Location**: 
   - Path: `data/chroma/` 
   - Persistence: SQLite backend (`chroma.sqlite3`)
   - Model cache: `data/models/models--sentence-transformers--all-MiniLM-L6-v2/`

#### Search & Retrieval Configuration
```python
# Default search parameters
n_results = 5  # Top-k similar chunks
similarity_threshold = None  # Uses distance ranking
where_filter = {"material_id": "specific_material"}  # Optional filtering
```

## 🔄 End-to-End Workflow & Technical Implementation

### 1. User Onboarding & Authentication Flow
```mermaid
graph LR
    A[User Registration] --> B[Password Hashing bcrypt]
    B --> C[JWT Token Generation] 
    C --> D[Database User Record]
    D --> E[Auto-create User ChromaDB Collection]
    
    F[User Login] --> G[Password Verification]
    G --> H[JWT Token Issue]
    H --> I[Session Management]
```

**Technical Details**:
- Password hashing: bcrypt with automatic salt generation
- JWT signing: RS256 algorithm with python-jose
- Token expiration: Configurable via environment variables
- User collection: `user_{uuid}_chapters` created on first upload

### 2. Document Processing Pipeline (Detailed)
```mermaid
graph TD
    A[File Upload via /upload] --> B{File Type Detection}
    B -->|PDF| C[PyPDF Text Extraction]
    B -->|PPT| D[python-pptx Text Extraction]
    B -->|TXT| E[Direct Text Reading]
    
    C --> F[Text Preprocessing]
    D --> F
    E --> F
    
    F --> G[LangChain RecursiveCharacterTextSplitter]
    G --> H[Chunk Size: 800, Overlap: 150]
    H --> I[Generate UUID per Chunk]
    I --> J[sentence-transformers Embedding]
    J --> K[ChromaDB Storage with Metadata]
    K --> L[PostgreSQL Material Record Update]
    L --> M[Status: PENDING → COMPLETED]
```

**Implementation Details**:
```python
# Text Chunking Configuration
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,          # Max characters per chunk
    chunk_overlap=150,       # Overlap between chunks
    length_function=len,     # Character-based splitting
    separators=["\n\n", "\n", ". ", " ", ""]
)

# Embedding Model Configuration
model_name = "sentence-transformers/all-MiniLM-L6-v2"
dimensions = 384
max_sequence_length = 256
model_size = ~90MB
```

### 3. AI Content Generation Pipeline (Complete Implementation)

#### A. Slide Generation Flow
```mermaid
graph TD
    A[User Request: /slide] --> B[Material Text Retrieval]
    B --> C[Prompt Template Loading]
    C --> D[slide_generation_prompt.txt]
    D --> E[Google Gemini API Call]
    E --> F[JSON Response Parsing]
    F --> G[Slide Schema Validation]
    G --> H[PPT Generator Service]
    H --> I[HTML Slide Rendering]
    I --> J[File Storage: output/html/]
    J --> K[Database Content Record]
```

**Technical Implementation**:
```python
# Slide Generation Process
def generate_chapter_ppt(chapter_text: str) -> dict:
    llm = get_llm()  # Google Gemini with temperature=0.0
    prompt = get_slide_generation_prompt(chapter_text)
    response = llm.invoke(prompt)
    
    # JSON extraction and validation
    text = getattr(response, 'content', str(response)).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text)

# Slide Content Constraints
- Max slides per presentation: 20-25
- Paragraph blocks: 80-120 words
- Bullet points: 3-5 items, 15-25 words each
- Layout types: dense_text, text_with_image, full_table, numbered_block, academic_layout
```

#### B. Podcast Generation Flow
```mermaid
graph TD
    A[User Request: /podcast] --> B[Material Text Retrieval]
    B --> C[Content Truncation: 8000 chars]
    C --> D[podcast_prompt.txt Loading]
    D --> E[Google Gemini Dialogue Generation]
    E --> F[Host/Guest Script Parsing]
    F --> G[Coqui TTS Model Loading]
    G --> H[Multi-Speaker Audio Generation]
    H --> I[Audio Segment Timing Calculation]
    I --> J[WAV File Assembly]
    J --> K[File Storage: output/podcasts/]
    K --> L[Timing Metadata Storage]
```

**Technical Implementation**:
```python
# TTS Configuration
tts_model = "tts_models/en/vctk/vits"  # Multi-speaker English model
speaker_host = tts.speakers[7]         # Host voice (typically female)
speaker_guest = tts.speakers[4]        # Guest voice (typically male)
gpu_acceleration = torch.cuda.is_available()

# Audio Processing
sample_rate = 22050  # Standard for VCTK model
audio_format = "wav"
timing_precision = 0.01  # 10ms precision for dialogue timing

# Dialogue Structure
{
    "title": "Generated podcast title",
    "dialogue": [
        {"speaker": "host", "text": "Question or comment"},
        {"speaker": "guest", "text": "Expert response"},
        ...  # 15-25 exchanges for comprehensive coverage
    ]
}
```

### 4. RAG (Retrieval-Augmented Generation) Implementation

#### A. Query Processing Flow
```mermaid
graph TD
    A[User Chat Message] --> B[Query Embedding Generation]
    B --> C[ChromaDB Similarity Search]
    C --> D[Top-K Relevant Chunks k=5]
    D --> E[Context Assembly]
    E --> F[Chat History Retrieval]
    F --> G[Prompt Template Assembly]
    G --> H[chat_prompt.txt + Context + History]
    H --> I[Google Gemini LLM Call]
    I --> J[Response Generation]
    J --> K[Response Storage in chat_history]
    K --> L[Return to User]
```

**Technical Implementation**:
```python
# RAG Retrieval Configuration
def retrieve_chunks(query, k=5, material_id=None, user_id=None):
    collection = get_user_collection(user_id)  # User-isolated search
    
    where_filter = None
    if material_id:
        where_filter = {"material_id": material_id}  # Material-specific search
    
    results = collection.query(
        query_texts=[query], 
        n_results=k, 
        where=where_filter
    )
    return results.get('documents', [[]])[0]

# Context Assembly
context_limit = 4000  # Characters for context window
chat_history_limit = 10  # Recent conversations
response_max_tokens = 1000  # LLM response limit
```

#### B. Context Window Management
```python
# Prompt Structure for chat_prompt.txt
"""
CONTEXT: {{CONTEXT}}  # Retrieved relevant chunks
CHAT_HISTORY: {{CHAT_HISTORY}}  # Previous conversations
USER_MESSAGE: {{USER_MESSAGE}}  # Current question

# Total context budget management
context_budget = 8000  # Total characters
context_chunks = 4000  # For retrieved content
history_budget = 2000  # For conversation history
user_message_budget = 1000  # For current question
system_prompt_budget = 1000  # For instructions
"""
```

### 5. Interactive Learning & Content Consumption

#### A. Generated Content Access Flow
```mermaid
graph TD
    A[User Selects Content Type] --> B{Content Type Router}
    B -->|Slides| C[HTML Slide Viewer]
    B -->|Podcast| D[Audio Player with Transcript]
    B -->|Flashcards| E[Interactive Card Interface]
    B -->|Quiz| F[Question-Answer Interface]
    B -->|Explainer| G[Video Player with Controls]
    
    C --> H[Progress Tracking]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Learning Analytics Storage]
```

#### B. Content Delivery Optimization
```python
# File Serving Configuration
html_output_dir = "output/html"
podcast_output_dir = "output/podcasts"
slide_images_dir = "output/slide_images"
video_output_dir = "output/videos"

# Caching Strategy
- Static file serving via FastAPI
- Redis caching for frequently accessed content
- Browser caching headers for media files
- Lazy loading for large content files
```

## 📁 Project Structure & Detailed Implementation

```
KeplerLab/
├── backend/                              # FastAPI Backend Application
│   ├── app/
│   │   ├── main.py                      # FastAPI app initialization, middleware, router registration
│   │   │                                # Features: CORS, logging middleware, lifespan management
│   │   ├── db/                          # Database Connection Managers
│   │   │   ├── chroma.py               # ChromaDB client, user collection management
│   │   │   │                           # Features: Persistent client, user isolation, collection CRUD
│   │   │   └── postgres.py             # SQLAlchemy async engine, session management
│   │   │                               # Features: Connection pooling, async context managers
│   │   ├── models/                     # SQLAlchemy ORM Models & Pydantic Schemas
│   │   │   ├── user.py                 # User entity: UUID, email, hashed_password, relationships
│   │   │   ├── notebook.py             # Notebook entity: user_id FK, materials relationship
│   │   │   ├── material.py             # Material entity: status enum, chunk tracking
│   │   │   ├── chat_history.py         # Chat persistence: user/notebook scoped messages
│   │   │   ├── generated_content.py    # Content tracking: type, metadata JSONB column
│   │   │   └── schemas.py              # Pydantic schemas: Block, Slide, ChapterPPT models
│   │   ├── routes/                     # API Endpoint Implementations
│   │   │   ├── auth.py                 # JWT authentication: login, register, logout
│   │   │   │                           # Features: Password hashing, token generation
│   │   │   ├── notebook.py             # CRUD operations: create, read, update, delete notebooks
│   │   │   │                           # Features: User ownership validation, material listing
│   │   │   ├── upload.py               # File upload handling: PDF/PPT processing, chunking
│   │   │   │                           # Features: File validation, text extraction, embedding
│   │   │   ├── slide.py                # Slide generation: LLM integration, PPT creation
│   │   │   │                           # Features: HTML export, image capture, layout management
│   │   │   ├── podcast_router.py       # Podcast generation: script creation, TTS synthesis
│   │   │   │                           # Features: Multi-speaker audio, timing synchronization
│   │   │   ├── explainer.py            # Video generation: slide-to-video conversion
│   │   │   │                           # Features: MoviePy integration, narration sync
│   │   │   ├── flashcard.py            # Flashcard creation: Q&A extraction, JSON formatting
│   │   │   │                           # Features: Spaced repetition ready, difficulty tagging
│   │   │   ├── quiz.py                 # Quiz generation: multiple choice, true/false, grading
│   │   │   │                           # Features: Answer validation, feedback generation
│   │   │   └── chat.py                 # RAG chat: context retrieval, conversation management
│   │   │                               # Features: Chat history, source attribution
│   │   ├── services/                   # Business Logic & External Service Integration
│   │   │   ├── auth/                   # Authentication Services
│   │   │   │   └── [JWT management, password validation, user session handling]
│   │   │   ├── rag/                    # Retrieval-Augmented Generation
│   │   │   │   ├── retriever.py        # ChromaDB query logic, similarity search
│   │   │   │   └── [Context assembly, relevance scoring, filtering]
│   │   │   ├── slide_generation/       # Slide Creation Logic
│   │   │   │   ├── generator.py        # LLM prompt management, JSON parsing
│   │   │   │   ├── image_generator.py  # Image fetching, slide visualization
│   │   │   │   └── [Layout management, content formatting]
│   │   │   ├── podcast/                # Podcast Generation
│   │   │   │   ├── generator.py        # Script generation, dialogue structuring
│   │   │   │   └── [Content adaptation, educational optimization]
│   │   │   ├── explainer/              # Video Creation
│   │   │   │   ├── slide_renderer.py   # Playwright automation, screenshot capture
│   │   │   │   └── [Video composition, animation effects]
│   │   │   ├── flashcard/              # Flashcard Logic
│   │   │   │   └── [Q&A extraction, difficulty assessment, topic categorization]
│   │   │   ├── quiz/                   # Quiz Generation
│   │   │   │   └── [Question types, answer validation, performance analytics]
│   │   │   ├── text_to_speech/         # TTS Integration
│   │   │   │   ├── tts.py              # Coqui TTS wrapper, speaker management
│   │   │   │   └── [Voice selection, audio quality, timing calculation]
│   │   │   ├── text_processing/        # Document Processing
│   │   │   │   ├── extractor.py        # PDF text extraction (PyPDF)
│   │   │   │   ├── chunker.py          # Text splitting (LangChain)
│   │   │   │   └── [Content preprocessing, metadata extraction]
│   │   │   ├── llm_service/            # LLM Integration & Management
│   │   │   │   ├── llm.py              # Multi-provider LLM support (Gemini, Ollama, Custom)
│   │   │   │   └── [Provider switching, fallback handling, response parsing]
│   │   │   ├── ppt_generator/          # PowerPoint Generation
│   │   │   │   └── [Slide layout, content formatting, export handling]
│   │   │   ├── material_service.py     # Material CRUD operations, file management
│   │   │   ├── notebook_service.py     # Notebook business logic, organization
│   │   │   ├── notebook_name_generator.py # Auto-naming for notebooks
│   │   │   └── logger.py               # Structured logging configuration
│   │   └── prompts/                    # LLM Prompt Templates & Management
│   │       ├── __init__.py             # Prompt loading utilities, template substitution
│   │       ├── slide_generation_prompt.txt    # 343 lines: Academic slide generation rules
│   │       │                          # Features: JSON schema, layout constraints, content limits
│   │       ├── podcast_prompt.txt      # Educational dialogue generation template
│   │       │                          # Features: Host/guest roles, academic discourse
│   │       ├── explainer_prompt.txt    # Video narration script generation
│   │       ├── flashcard_prompt.txt    # Q&A extraction and formatting rules
│   │       ├── quiz_prompt.txt         # Question generation with multiple formats
│   │       └── chat_prompt.txt         # RAG-powered conversation template
│   ├── data/                           # Data Storage & Model Cache
│   │   ├── uploads/                    # User-uploaded files (organized by user UUID)
│   │   │   └── {user_uuid}/           # Isolated file storage per user
│   │   ├── chroma/                     # ChromaDB persistent storage
│   │   │   ├── chroma.sqlite3         # Vector database file
│   │   │   └── {user_collection_dirs}/ # User-specific vector collections
│   │   └── models/                     # Downloaded ML model cache
│   │       ├── models--sentence-transformers--all-MiniLM-L6-v2/  # Embedding model
│   │       └── tts/                   # Coqui TTS model files (VCTK, other voices)
│   ├── output/                         # Generated Content Storage
│   │   ├── html/                      # Generated slide presentations (HTML format)
│   │   ├── podcasts/                  # Generated audio files with metadata
│   │   │   └── {material_uuid}/       # Audio files + timing data per material
│   │   ├── slide_images/              # Screenshot captures for slide images
│   │   │   └── {generation_uuid}/     # Image sets per generation request
│   │   └── videos/                    # Generated explainer videos
│   ├── logs/                          # Application logging
│   │   └── [Structured logs: requests, errors, performance metrics]
│   ├── tests/                         # Test Suite
│   │   ├── gemini_test.py            # LLM integration testing
│   │   ├── test_audio.py             # TTS functionality testing
│   │   ├── test_ppt_generation.py    # Slide generation testing
│   │   └── output/                   # Test artifacts and results
│   ├── create_tables.py              # Database schema initialization
│   ├── reset_database.py             # Development database reset utility
│   ├── requirements.txt              # Python dependencies (51 packages)
│   ├── README.md                     # Backend documentation
│   └── sample_output.json            # Example API response formats
├── frontend/                          # React Frontend Application  
│   ├── src/
│   │   ├── App.jsx                   # Main application component, routing setup
│   │   │                             # Features: Authentication context, protected routes
│   │   ├── main.jsx                  # React 19 app initialization, StrictMode
│   │   ├── index.css                 # TailwindCSS configuration, custom styles
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── [Authentication components: Login, Register, ProtectedRoute]
│   │   │   ├── [Navigation: Navbar, Sidebar, Breadcrumbs]
│   │   │   ├── [Content display: SlideViewer, PodcastPlayer, ChatInterface]
│   │   │   ├── [Forms: UploadForm, NotebookForm, MaterialManager]
│   │   │   └── [UI elements: LoadingSpinner, ErrorBoundary, Modal]
│   │   ├── context/                  # React Context Providers
│   │   │   ├── [AuthContext: User state, token management]
│   │   │   ├── [NotebookContext: Current notebook, materials]
│   │   │   └── [ThemeContext: UI preferences, dark mode]
│   │   ├── hooks/                    # Custom React Hooks
│   │   │   ├── [useAuth: Authentication state management]
│   │   │   ├── [useApi: API call abstractions]
│   │   │   ├── [useLocalStorage: Persistent local state]
│   │   │   └── [useDebounce: Input optimization]
│   │   ├── api/                      # API Client Functions
│   │   │   ├── [auth.js: Login, register, logout API calls]
│   │   │   ├── [notebooks.js: Notebook CRUD operations]
│   │   │   ├── [materials.js: Upload, delete, list materials]
│   │   │   ├── [generation.js: Content generation API calls]
│   │   │   └── [chat.js: Chat and RAG functionality]
│   │   └── assets/                   # Static Assets
│   │       ├── [Icons, images, logos]
│   │       └── [Fonts, animations, graphics]
│   ├── public/                       # Public Static Files
│   │   ├── index.html               # HTML template, meta tags, favicon
│   │   └── [favicon.ico, robots.txt, manifest.json]
│   ├── package.json                 # Frontend dependencies, scripts
│   ├── vite.config.js              # Vite build configuration, dev server
│   ├── tailwind.config.js          # TailwindCSS customization, theme
│   ├── postcss.config.js           # PostCSS plugins configuration
│   ├── eslint.config.js            # ESLint rules, code quality
│   └── README.md                   # Frontend documentation
├── plan.md                          # Project planning and architecture document
├── schema.md                        # Database schema and design documentation  
└── project.md                       # This comprehensive technical guide
```

### Environment & Configuration Files Structure

```
KeplerLab/backend/
├── .env                             # Environment variables (not in repo)
│   ├── DATABASE_URL                 # PostgreSQL connection string
│   ├── REDIS_URL                    # Redis cache connection
│   ├── GOOGLE_API_KEY              # Google Gemini API key
│   ├── LLM_PROVIDER                # GOOGLE|OLLAMA|MYOPENLM
│   ├── GOOGLE_MODEL                # gemini-pro (default)
│   ├── OLLAMA_MODEL                # Local model name
│   ├── CHROMA_DIR                  # data/chroma
│   ├── UPLOAD_DIR                  # data/uploads  
│   ├── HTML_OUTPUT_DIR             # output/html
│   ├── PODCAST_OUTPUT_DIR          # output/podcasts
│   ├── SLIDE_IMAGES_DIR            # output/slide_images
│   └── VIDEO_OUTPUT_DIR            # output/videos
└── .env.example                    # Environment template (in repo)
```

## 🚦 Complete API Endpoints & Implementation Details

### Authentication Endpoints (`/auth`)
| Method | Endpoint | Purpose | Request Body | Response | Implementation |
|--------|----------|---------|--------------|----------|----------------|
| `POST` | `/auth/register` | User registration | `{email, username, password}` | `{access_token, user_info}` | bcrypt hashing, JWT generation, user creation |
| `POST` | `/auth/login` | User authentication | `{email, password}` | `{access_token, user_info}` | Password verification, token issuance |
| `POST` | `/auth/logout` | Session termination | Bearer token | `{message}` | Token invalidation, session cleanup |
| `GET` | `/auth/me` | Current user info | Bearer token | `{user_details}` | JWT validation, user data retrieval |

### Notebook Management (`/notebooks`)
| Method | Endpoint | Purpose | Parameters | Response | Database Operations |
|--------|----------|---------|------------|----------|-------------------|
| `GET` | `/notebooks` | List user notebooks | `user_id` (from token) | `[{id, name, description, created_at}]` | `SELECT * FROM notebooks WHERE user_id = ?` |
| `POST` | `/notebooks` | Create new notebook | `{name, description}` | `{notebook_object}` | `INSERT INTO notebooks VALUES (...)` |
| `GET` | `/notebooks/{id}` | Get notebook details | `notebook_id, user_id` | `{notebook, materials[]}` | JOIN notebooks, materials tables |
| `PUT` | `/notebooks/{id}` | Update notebook | `{name, description}` | `{updated_notebook}` | `UPDATE notebooks SET ... WHERE id = ?` |
| `DELETE` | `/notebooks/{id}` | Delete notebook | `notebook_id, user_id` | `{success: true}` | CASCADE delete materials, chat_history |

### Material Upload & Management (`/upload`, `/materials`)
| Method | Endpoint | Purpose | Request Format | Processing Pipeline | Storage Details |
|--------|----------|---------|----------------|-------------------|-----------------|
| `POST` | `/upload` | Upload document | `multipart/form-data` | File validation → Text extraction → Chunking → Embedding | Local storage + ChromaDB |
| `GET` | `/materials` | List materials | `notebook_id` (optional) | Material metadata retrieval | PostgreSQL query with filtering |
| `DELETE` | `/materials/{id}` | Delete material | `material_id, user_id` | File cleanup + DB cleanup + Vector cleanup | Multi-storage cleanup |

**Upload Processing Pipeline**:
```python
# File Upload Flow
1. File validation (size, type, security)
2. UUID generation for material
3. File storage: data/uploads/{user_id}/{material_uuid}/
4. Text extraction based on file type:
   - PDF: PyPDF → plain text
   - PPT: python-pptx → slide text
   - TXT: direct reading
5. Text chunking: LangChain splitter (800/150)
6. Embedding generation: sentence-transformers
7. ChromaDB storage: user-specific collection
8. PostgreSQL record: status tracking
9. Async status update: PENDING → COMPLETED
```

### Content Generation Endpoints

#### Slide Generation (`/slide`)
| Method | Endpoint | Parameters | LLM Processing | Output Format |
|--------|----------|------------|----------------|---------------|
| `POST` | `/slide` | `{material_id, topic}` | Gemini + slide_generation_prompt.txt | HTML slides + JSON metadata |

**Implementation Details**:
```python
# Slide Generation Process
Request: material_id OR custom topic
↓
Text Retrieval: PostgreSQL material.original_text
↓
Prompt Assembly: slide_generation_prompt.txt + content
↓
LLM Call: Google Gemini (temperature=0.0)
↓
Response Parsing: JSON extraction from LLM response
↓
Validation: Pydantic schema (Block, Slide, ChapterPPT)
↓
HTML Generation: Template-based slide rendering
↓
File Storage: output/html/{title}.html
↓
Database Record: generated_content table
```

#### Podcast Generation (`/podcast`)
| Method | Endpoint | Parameters | Audio Processing | Output Files |
|--------|----------|------------|------------------|--------------|
| `POST` | `/podcast` | `{material_id}` | Script generation → TTS → Audio assembly | WAV file + timing metadata |

**Implementation Details**:
```python
# Podcast Generation Pipeline
Material Text (max 8000 chars)
↓
Prompt: podcast_prompt.txt → Academic dialogue format
↓
LLM Response: {title, dialogue: [{speaker, text}]}
↓
TTS Processing:
  - Model: tts_models/en/vctk/vits
  - Host: Speaker #7, Guest: Speaker #4
  - GPU acceleration if available
↓
Audio Assembly:
  - Individual segment generation
  - Timing calculation (start_time, end_time)
  - WAV concatenation
↓
Output:
  - File: output/podcasts/{material_uuid}/podcast.wav
  - Metadata: timing_data.json
```

#### Quiz Generation (`/quiz`)
| Method | Endpoint | Question Types | Scoring System | Output Format |
|--------|----------|----------------|----------------|---------------|
| `POST` | `/quiz` | Multiple choice, True/False, Short answer | Auto-grading with explanations | Interactive JSON quiz |

#### Flashcard Generation (`/flashcard`)
| Method | Endpoint | Card Types | Difficulty Levels | Spaced Repetition |
|--------|----------|------------|------------------|------------------|
| `POST` | `/flashcard` | Q&A, Definition, Concept | Easy, Medium, Hard | Ready for SR algorithms |

#### Explainer Video (`/explainer`)
| Method | Endpoint | Video Components | Technical Stack | Resolution |
|--------|----------|------------------|-----------------|------------|
| `POST` | `/explainer` | Slides + Narration + Timing | MoviePy + Playwright | 1080p MP4 |

### RAG Chat Endpoints (`/chat`)
| Method | Endpoint | Context Sources | Response Generation | History Management |
|--------|----------|------------------|-------------------|------------------|
| `POST` | `/chat` | ChromaDB + Chat history + Current message | Gemini with context window | PostgreSQL chat_history |
| `GET` | `/chat/history` | Notebook-scoped conversation | Historical retrieval | Paginated responses |
| `DELETE` | `/chat/history` | Clear conversation | Soft/Hard delete options | Cleanup operations |

**Chat Implementation Pipeline**:
```python
# RAG Chat Flow
User Message Input
↓
Query Embedding: sentence-transformers/all-MiniLM-L6-v2
↓
Vector Search: ChromaDB similarity search (k=5)
↓
Context Assembly:
  - Retrieved chunks (max 4000 chars)
  - Chat history (last 10 exchanges)
  - Current message
↓
Prompt Construction: chat_prompt.txt template
↓
LLM Generation: Google Gemini with assembled context
↓
Response Storage: chat_history table
↓
Return: Response + source attribution
```

### System & Health Endpoints
| Method | Endpoint | Purpose | Monitoring | Response Format |
|--------|----------|---------|------------|-----------------|
| `GET` | `/health` | System status | Service availability | `{status, services}` |
| `GET` | `/metrics` | Performance data | Response times, throughput | Prometheus format |
| `GET` | `/docs` | API documentation | Interactive Swagger UI | HTML documentation |

## 🔧 Complete Setup & Installation Guide

### System Requirements
```bash
# Minimum Requirements
- Python 3.11+ (recommended: 3.11.7)
- Node.js 18+ (recommended: 18.19.0 LTS)
- PostgreSQL 14+ (recommended: 15.5)
- Redis 6+ (recommended: 7.2)
- Git 2.40+

# Optional (for better performance)
- NVIDIA GPU with CUDA 12.1+ (for TTS acceleration)
- 16GB+ RAM (for large document processing)
- SSD storage (for faster model loading)
```

### Environment Setup (Detailed)

#### 1. Backend Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd KeplerLab/backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Install playwright browsers (for slide capture)
playwright install chromium
```

#### 2. Database Setup (PostgreSQL)
```sql
-- Create database and user
CREATE DATABASE keplerlab;
CREATE USER keplerlab_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE keplerlab TO keplerlab_user;

-- Connect to keplerlab database
\c keplerlab;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### 3. Redis Setup
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Windows (via Chocolatey)
choco install redis-64

# macOS (via Homebrew)
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping
# Expected response: PONG
```

#### 4. Environment Variables Configuration
```bash
# Create .env file in backend directory
cp .env.example .env

# Edit .env with your configuration
DATABASE_URL=postgresql+asyncpg://keplerlab_user:your_secure_password@localhost/keplerlab
REDIS_URL=redis://localhost:6379/0

# AI Service Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here
LLM_PROVIDER=GOOGLE
GOOGLE_MODEL=gemini-pro

# Alternative LLM Providers (optional)
OLLAMA_MODEL=llama2:7b-chat
MYOPENLM_API_URL=https://your-custom-llm-api.com

# Directory Configuration
CHROMA_DIR=data/chroma
UPLOAD_DIR=data/uploads
HTML_OUTPUT_DIR=output/html
PODCAST_OUTPUT_DIR=output/podcasts
SLIDE_IMAGES_DIR=output/slide_images
VIDEO_OUTPUT_DIR=output/videos

# Security Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here_make_it_long_and_secure
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# TTS Configuration
TTS_HOME=data/models
SENTENCE_TRANSFORMERS_HOME=data/models

# Performance Configuration
MAX_UPLOAD_SIZE=50485760  # 50MB in bytes
CHUNK_SIZE=800
CHUNK_OVERLAP=150
VECTOR_SEARCH_K=5
CONTEXT_WINDOW_SIZE=4000
```

### Google Gemini API Setup
```bash
# 1. Go to Google AI Studio: https://makersuite.google.com/
# 2. Create a new project or select existing
# 3. Enable the Generative AI API
# 4. Create API credentials
# 5. Copy API key to .env file

# Test Gemini API
curl -H "Content-Type: application/json" \
     -H "x-goog-api-key: YOUR_API_KEY" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### Database Initialization
```bash
# Navigate to backend directory
cd backend

# Initialize database tables
python create_tables.py

# Verify tables are created
psql -h localhost -U keplerlab_user -d keplerlab -c "\dt"

# Expected tables:
# users, notebooks, materials, chat_history, generated_content
```

### Model Pre-download (Optional but Recommended)
```python
# Download embedding model
python -c "
from sentence_transformers import SentenceTransformer
import os
os.environ['SENTENCE_TRANSFORMERS_HOME'] = 'data/models'
model = SentenceTransformer('all-MiniLM-L6-v2')
print('Embedding model downloaded successfully')
"

# Download TTS model
python -c "
from TTS.api import TTS
import os
os.environ['TTS_HOME'] = 'data/models'
tts = TTS('tts_models/en/vctk/vits')
print('TTS model downloaded successfully')
"
```

### Backend Startup
```bash
# Development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production server (with multiple workers)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Verify backend is running
curl http://localhost:8000/docs
# Should return Swagger UI
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Setup (Alternative Installation)
```dockerfile
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keplerlab
      POSTGRES_USER: keplerlab_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql+asyncpg://keplerlab_user:secure_password@postgres/keplerlab
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./backend/data:/app/data
      - ./backend/output:/app/output

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Testing the Installation
```bash
# Test backend health
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}'

# Test file upload
curl -X POST http://localhost:8000/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test_document.pdf" \
     -F "notebook_id=YOUR_NOTEBOOK_UUID"

# Test content generation
curl -X POST http://localhost:8000/slide \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"material_id":"YOUR_MATERIAL_UUID"}'
```

### Performance Optimization Setup
```bash
# Enable PostgreSQL query optimization
echo "shared_preload_libraries = 'pg_stat_statements'" >> postgresql.conf
echo "pg_stat_statements.track = all" >> postgresql.conf

# Redis optimization
echo "maxmemory 1gb" >> redis.conf
echo "maxmemory-policy allkeys-lru" >> redis.conf

# Python optimization
export PYTHONOPTIMIZE=2
export PYTHONDONTWRITEBYTECODE=1
```

### Monitoring & Logging Setup
```bash
# Create log directory
mkdir -p backend/logs

# Configure log rotation
echo "backend/logs/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 644 root root
}" > /etc/logrotate.d/keplerlab
```

### Security Configuration
```bash
# Set proper file permissions
chmod 600 backend/.env
chmod 755 backend/data/uploads
chmod 755 backend/output

# Configure firewall (optional)
ufw allow 8000/tcp  # Backend
ufw allow 3000/tcp  # Frontend
ufw allow 5432/tcp  # PostgreSQL (if external access needed)
```

## 📱 User Experience Flow

1. **Registration/Login**: Secure authentication with JWT
2. **Notebook Creation**: Organize study materials
3. **Document Upload**: Support for PDF, PPT, TXT files
4. **Content Generation**: Choose from multiple AI-powered formats
5. **Interactive Learning**: Engage with generated content
6. **Progress Tracking**: Monitor learning through chat history

## 🎯 Detailed Feature Implementation & User Experience

### 1. Smart Slide Generation - Complete Technical Flow

#### A. Content Analysis & Structure Generation
```python
# slide_generation_prompt.txt (343 lines) - Key Specifications:
- OUTPUT: Valid JSON only, no markdown/explanations
- CONSTRAINTS: 2-3 blocks max per slide, standard PPT dimensions
- TEXT LIMITS: 
  - paragraph_block: 80-120 words (3-4 sentences)
  - bullet_block: 3-5 bullets, 15-25 words each
  - table_block: Max 5 rows × 4 columns
- LAYOUT_INTENT: dense_text, text_with_image, full_table, numbered_block, academic_layout
```

#### B. Generated Slide Schema (Pydantic)
```python
class Block(BaseModel):
    block_type: str  # paragraph, bullet, numbered, table, definition
    content: Optional[str] = None
    heading: Optional[str] = None
    bullets: Optional[List[str]] = None
    points: Optional[List[str]] = None
    headers: Optional[List[str]] = None
    rows: Optional[List[List[str]]] = None
    diagram_prompt: Optional[str] = None

class Slide(BaseModel):
    slide_id: int
    section_number: Optional[str] = None
    title: str
    layout_intent: str
    blocks: List[Block]

class ChapterPPT(BaseModel):
    chapter_title: str
    slides: List[Slide]
```

#### C. User Experience Flow
1. **Material Selection**: User selects uploaded document or enters custom topic
2. **Processing Indicator**: Real-time status showing "Analyzing content..."
3. **LLM Generation**: Gemini Pro processes with academic slide prompt (5-15 seconds)
4. **Slide Preview**: Interactive HTML preview with navigation
5. **Export Options**: Download HTML, generate images, create video

### 2. Interactive Podcast Generation - Academic Dialogue System

#### A. Script Generation Process
```python
# podcast_prompt.txt - Educational Objectives:
1. Complete knowledge transfer (NOT summaries)
2. Technical details with theoretical foundations
3. Real-world applications and academic context
4. 15-25 dialogue exchanges for comprehensive coverage
5. Progressive complexity: fundamentals → advanced concepts

# Dialogue Structure:
{
    "title": "Academic-level podcast title",
    "dialogue": [
        {"speaker": "host", "text": "Intellectually curious question"},
        {"speaker": "guest", "text": "Expert response (3-5 sentences)"}
    ]
}
```

#### B. Multi-Speaker TTS Implementation
```python
# Coqui TTS Configuration
Model: tts_models/en/vctk/vits
Host Voice: VCTK Speaker #7 (typically female, clear articulation)
Guest Voice: VCTK Speaker #4 (typically male, authoritative tone)
Sample Rate: 22050 Hz
Audio Format: WAV (uncompressed for quality)
GPU Acceleration: Automatic detection (torch.cuda.is_available())

# Timing Calculation
def generate_dialogue_audio(dialogue):
    for speaker_type, text in dialogue:
        audio_segment = tts.synthesis(text, speaker=speaker)
        duration = len(audio_segment) / sample_rate
        timing_data.append({
            "start_time": current_time,
            "end_time": current_time + duration,
            "speaker": speaker_type,
            "text": text
        })
        current_time += duration
```

#### C. User Experience Features
- **Real-time Generation Progress**: Shows script generation → audio synthesis phases
- **Interactive Transcript**: Click on any dialogue segment to jump to audio position
- **Speaker Identification**: Visual indicators for host vs guest segments
- **Download Options**: WAV audio file + SRT subtitles + timing JSON

### 3. RAG-Powered Chat - Conversational Learning System

#### A. Context Retrieval Pipeline
```python
# Vector Search Configuration
Embedding Model: sentence-transformers/all-MiniLM-L6-v2
Vector Dimensions: 384
Similarity Metric: Cosine similarity
Search Results: k=5 most relevant chunks
Context Window: 4000 characters maximum

# Search Process:
def retrieve_chunks(query, k=5, material_id=None, user_id=None):
    # 1. User query → embedding vector
    query_vector = embedding_model.encode(query)
    
    # 2. ChromaDB similarity search
    collection = get_user_collection(user_id)  # Isolated per user
    results = collection.query(
        query_texts=[query], 
        n_results=k,
        where={"material_id": material_id} if material_id else None
    )
    
    # 3. Return ranked relevant text chunks
    return results.get('documents', [[]])[0]
```

#### B. Conversation Context Management
```python
# chat_prompt.txt Template Structure:
"""
You are an AI tutor helping students learn from their uploaded materials.

CONTEXT: {{CONTEXT}}  # Retrieved relevant chunks (max 4000 chars)
CHAT_HISTORY: {{CHAT_HISTORY}}  # Last 10 conversations
USER_MESSAGE: {{USER_MESSAGE}}  # Current student question

Guidelines:
1. Answer based primarily on the provided context
2. Acknowledge when information is not in the materials
3. Encourage follow-up questions for deeper understanding
4. Provide page/section references when possible
5. Maintain conversational, educational tone
"""
```

#### C. Chat User Interface Features
- **Source Attribution**: Each response shows which document sections were used
- **Context Highlighting**: Relevant text chunks highlighted in chat
- **Material Switching**: Toggle between different uploaded documents
- **History Persistence**: Conversation history maintained per notebook
- **Export Functionality**: Save chat sessions as PDF/markdown

### 4. Flashcard System - Intelligent Q&A Extraction

#### A. Content Analysis for Card Generation
```python
# flashcard_prompt.txt Processing:
- Extract key concepts, definitions, and relationships
- Generate questions targeting different cognitive levels:
  - Recall: "What is...?"
  - Comprehension: "Explain the difference between...?"
  - Application: "How would you use...?"
  - Analysis: "Why does...?"
  
# Output Structure:
{
    "flashcards": [
        {
            "id": "uuid",
            "question": "Front of card",
            "answer": "Back of card",
            "difficulty": "easy|medium|hard",
            "topic": "extracted topic tag",
            "source_section": "document reference"
        }
    ]
}
```

#### B. Spaced Repetition Integration (Ready)
```python
# Card Metadata for SR Algorithms:
- created_at: Initial card generation timestamp
- last_reviewed: Most recent study session
- review_count: Number of times reviewed
- ease_factor: Performance-based difficulty adjustment
- interval: Next review interval (SR algorithm input)
- difficulty: AI-assessed complexity level
```

### 5. Quiz Generation - Multi-Format Assessment

#### A. Question Type Generation
```python
# quiz_prompt.txt Specifications:
Question Types:
1. Multiple Choice (4 options, 1 correct)
2. True/False with explanation
3. Short Answer (2-3 sentences expected)
4. Fill-in-the-blank (key terms)
5. Matching (concepts to definitions)

Difficulty Adaptation:
- Analyze source material complexity
- Generate 40% easy, 40% medium, 20% hard questions
- Include distractors based on common misconceptions
```

#### B. Auto-Grading System
```python
# Grading Implementation:
def grade_quiz_response(question, user_answer, correct_answer):
    if question_type == "multiple_choice":
        return user_answer == correct_answer
    elif question_type == "true_false":
        return user_answer.lower() == correct_answer.lower()
    elif question_type == "short_answer":
        # Semantic similarity scoring using sentence-transformers
        similarity = embedding_model.similarity(user_answer, correct_answer)
        return similarity > 0.7  # Threshold for acceptance
    
# Feedback Generation:
- Immediate results with explanations
- Performance analytics (by topic, difficulty)
- Recommendations for further study
```

### 6. Explainer Video Generation - Automated Educational Videos

#### A. Video Composition Pipeline
```python
# Technical Stack:
- Slide Capture: Playwright (Chromium automation)
- Video Assembly: MoviePy (Python video editing)
- Audio Sync: TTS timing data alignment
- Resolution: 1920x1080 (Full HD)
- Format: MP4 with H.264 encoding

# Generation Process:
1. Generate slides (HTML format)
2. Launch headless Chrome via Playwright
3. Navigate through each slide, capture screenshots
4. Generate narration audio for each slide
5. Calculate slide display timing based on audio length
6. Compose video: slide_images + audio_narration
7. Add transitions, animations (fade, slide)
8. Export final MP4 file
```

#### B. Narration Script Generation
```python
# explainer_prompt.txt Features:
- Convert slide JSON to natural speech
- Add transitions between concepts: "Now let's look at...", "Next, we'll explore..."
- Include emphasis markers for important points
- Generate clear, educational narration style
- Maintain 140-160 words per minute speaking pace
```

### 7. Material Upload & Processing - Multi-Format Document Handling

#### A. File Type Support & Processing
```python
# Supported Formats:
PDF Files:
- Engine: PyPDF (primary), PyMuPDF (fallback)
- Features: Page-by-page extraction, metadata preservation
- Limitations: Image text requires OCR (future enhancement)

PowerPoint Files (.pptx):
- Engine: python-pptx
- Features: Slide text, speaker notes, title extraction
- Processing: Concatenate slide content with structure preservation

Text Files (.txt, .md):
- Direct UTF-8 reading
- Markdown parsing support
- Minimal preprocessing required

# Processing Pipeline:
1. File validation (size, type, virus scan)
2. UUID generation for tracking
3. User-specific storage: data/uploads/{user_id}/{material_uuid}/
4. Text extraction based on file type
5. Content preprocessing (encoding, formatting)
6. Chunking with LangChain RecursiveCharacterTextSplitter
7. Embedding generation with sentence-transformers
8. ChromaDB storage in user-specific collection
9. PostgreSQL metadata record with processing status
```

#### B. Processing Status Tracking
```python
# Material Status Enum:
class MaterialStatus(enum.Enum):
    PENDING = "pending"      # Upload complete, processing not started
    PROCESSING = "processing" # Text extraction/chunking in progress
    COMPLETED = "completed"  # Ready for content generation
    FAILED = "failed"       # Processing error occurred

# Real-time Status Updates:
- WebSocket connections for live status updates
- Progress indicators during chunking/embedding
- Error handling with detailed failure reasons
- Retry mechanisms for transient failures
```

## 🔒 Security Implementation & Performance Optimizations

### Security Architecture (Comprehensive)

#### A. Authentication & Authorization
```python
# JWT Implementation Details:
Algorithm: HS256 (HMAC with SHA-256)
Token Structure:
{
    "sub": "user_uuid",           # Subject (user ID)
    "email": "user@example.com",  # User email
    "role": "user|admin",         # Role-based access
    "exp": timestamp,             # Expiration time
    "iat": timestamp,             # Issued at
    "jti": "token_uuid"          # JWT ID for blacklisting
}

# Password Security:
- Algorithm: bcrypt with automatic salt generation
- Cost Factor: 12 (configurable, recommended minimum)
- Password Requirements: 8+ chars, mixed case, numbers, symbols
- Account Lockout: 5 failed attempts, 15-minute lockout
```

#### B. Data Protection & Privacy
```python
# User Data Isolation:
- ChromaDB Collections: user_{uuid}_chapters (complete isolation)
- File Storage: data/uploads/{user_uuid}/ (directory-level separation)
- Database Queries: Always include user_id WHERE clause
- API Endpoints: JWT middleware validates user access to resources

# Data Encryption:
- Database: PostgreSQL with encryption at rest (TDE)
- File Storage: OS-level encryption for uploads directory
- Network: HTTPS enforcement, secure WebSocket (WSS)
- Environment Variables: Never committed, .env in .gitignore
```

#### C. Input Validation & Sanitization
```python
# Pydantic Schema Validation:
class MaterialUpload(BaseModel):
    filename: str = Field(max_length=255, pattern=r'^[^<>:"/\\|?*]+$')
    file_size: int = Field(le=50485760)  # Max 50MB
    file_type: str = Field(regex=r'^(pdf|txt|pptx)$')

# SQL Injection Prevention:
- SQLAlchemy ORM with parameterized queries
- No raw SQL execution with user input
- Input sanitization for all text fields

# XSS Prevention:
- React built-in XSS protection
- Content Security Policy (CSP) headers
- HTML sanitization for user-generated content
```

#### D. API Security
```python
# Rate Limiting (Implementation Ready):
from slowapi import Limiter, _rate_limit_exceeded_handler
limiter = Limiter(key_func=get_remote_address)

@app.post("/upload")
@limiter.limit("5/minute")  # 5 uploads per minute per IP
async def upload_file(...):
    ...

# CORS Configuration:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Performance Optimizations (Production-Ready)

#### A. Database Performance
```python
# PostgreSQL Optimizations:
- Connection Pooling: asyncpg with pool_size=20, max_overflow=0
- Indexing Strategy:
  - users.email (unique index for login queries)
  - materials.user_id (foreign key index)
  - chat_history(user_id, notebook_id) (composite index)
  - generated_content.content_type (query optimization)

# Query Optimization:
async def get_user_notebooks_with_materials(user_id: UUID):
    return await db.execute(
        select(Notebook)
        .options(selectinload(Notebook.materials))  # Eager loading
        .where(Notebook.user_id == user_id)
    )
```

#### B. ChromaDB Performance
```python
# Vector Database Optimizations:
- Collection Sharding: User-specific collections prevent cross-user queries
- Embedding Cache: In-memory caching of frequently accessed embeddings
- Batch Operations: Process multiple documents in single ChromaDB operation

# Search Optimization:
def optimized_similarity_search(query, user_id, k=5):
    collection = get_user_collection(user_id)
    
    # Use where filters to reduce search space
    where_filter = {"user_id": user_id}
    
    # Limit result set for better performance
    results = collection.query(
        query_texts=[query],
        n_results=min(k, 10),  # Cap at 10 for performance
        where=where_filter
    )
    return results
```

#### C. Caching Strategy
```python
# Redis Caching Implementation:
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

# Cache Configuration:
- LLM Responses: Cache generated content for 24 hours
- User Sessions: Store JWT blacklist, active sessions
- Embedding Cache: Cache document embeddings for quick retrieval
- Query Results: Cache expensive database queries

@cache(expire=3600)  # 1 hour cache
async def get_material_chunks(material_id: UUID):
    # Expensive ChromaDB query cached
    return await retrieve_chunks_from_db(material_id)
```

#### D. Async Processing & Background Tasks
```python
# Celery Background Tasks (Ready for Implementation):
from celery import Celery

celery_app = Celery("keplerlab")

@celery_app.task
def process_uploaded_document(material_id: str):
    # Text extraction, chunking, embedding generation
    # Run asynchronously to avoid blocking API requests
    ...

@celery_app.task  
def generate_podcast_audio(material_id: str):
    # TTS processing in background
    # Update status in database when complete
    ...

# FastAPI Background Tasks:
@router.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, ...):
    # Immediate response to user
    background_tasks.add_task(process_document_async, material_id)
    return {"message": "Upload successful", "status": "processing"}
```

#### E. Memory Management & Resource Optimization
```python
# Model Loading Optimization:
class ModelManager:
    _embedding_model = None
    _tts_model = None
    
    @classmethod
    def get_embedding_model(cls):
        if cls._embedding_model is None:
            cls._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._embedding_model
    
    @classmethod
    def get_tts_model(cls):
        if cls._tts_model is None:
            cls._tts_model = TTS("tts_models/en/vctk/vits", 
                               gpu=torch.cuda.is_available())
        return cls._tts_model

# Memory Cleanup:
import gc
import torch

def cleanup_gpu_memory():
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()
```

### Monitoring & Observability

#### A. Logging Architecture
```python
# Structured Logging Configuration:
import structlog

logger = structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

# Request Logging Middleware:
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    user_id = get_user_id_from_token(request)
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        "HTTP Request",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time,
        user_id=user_id,
        content_length=response.headers.get("content-length"),
    )
    
    return response
```

#### B. Health Monitoring
```python
# Health Check Endpoint:
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": await check_database_connection(),
            "redis": await check_redis_connection(),
            "chromadb": check_chromadb_connection(),
            "llm_service": await check_llm_availability(),
        },
        "version": "2.0.0",
        "uptime": get_uptime_seconds()
    }
    
    # Return 503 if any critical service is down
    if not all(health_status["services"].values()):
        raise HTTPException(status_code=503, detail="Service unhealthy")
    
    return health_status
```

#### C. Performance Metrics
```python
# Prometheus Metrics (Ready for Implementation):
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
REQUEST_COUNT = Counter("http_requests_total", "HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "HTTP latency")
ACTIVE_USERS = Gauge("active_users_total", "Number of active users")
CONTENT_GENERATION_TIME = Histogram("content_generation_duration_seconds", "Content generation time", ["content_type"])

# Metrics collection
@REQUEST_LATENCY.time()
async def timed_request_handler(request, call_next):
    response = await call_next(request)
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    return response
```

## 🚀 Future Enhancements & Roadmap

### Phase 1: Core Improvements (Q2 2026)
- [ ] **Advanced TTS Voices**: 
  - Integration of multiple TTS providers (Azure Cognitive Services, AWS Polly)
  - Custom voice training capabilities
  - Emotion-aware speech synthesis for more engaging podcasts
  
- [ ] **Enhanced RAG Pipeline**:
  - Multi-modal RAG with image understanding (GPT-4 Vision integration)
  - Hybrid search combining vector similarity with keyword matching
  - Dynamic context window adjustment based on query complexity
  
- [ ] **Real-time Collaboration**:
  - WebSocket-based collaborative notebook editing
  - Shared study sessions with synchronized content viewing
  - Real-time chat during podcast/video playback
  
- [ ] **Advanced Analytics Dashboard**:
  - Learning progress tracking with spaced repetition algorithms
  - Content engagement metrics (time spent, completion rates)
  - Personalized study recommendations based on performance

### Phase 2: Platform Expansion (Q3 2026)
- [ ] **Mobile Application (React Native)**:
  - Native iOS and Android apps
  - Offline content access with sync capabilities
  - Voice-to-text note taking during content consumption
  
- [ ] **Integration Ecosystem**:
  - Learning Management System (LMS) integration (Canvas, Blackboard, Moodle)
  - Google Classroom and Microsoft Teams integration
  - Zotero and Mendeley reference manager connections
  
- [ ] **Advanced Content Generation**:
  - Interactive simulations and virtual labs
  - 3D model generation for complex concepts
  - Mind map and concept diagram auto-generation
  
- [ ] **Multilingual Support**:
  - Support for 20+ languages with native TTS
  - Cross-language content translation and generation
  - Localized educational content adaptation

### Phase 3: AI & ML Enhancements (Q4 2026)
- [ ] **Adaptive Learning AI**:
  - Personalized content difficulty adjustment
  - Learning style detection and content adaptation
  - Predictive analytics for learning outcome optimization
  
- [ ] **Advanced Question Generation**:
  - Bloom's Taxonomy-aligned question generation
  - Adaptive questioning based on student performance
  - Socratic method dialogue implementation
  
- [ ] **Content Quality AI**:
  - Automatic fact-checking against reliable sources
  - Bias detection and mitigation in generated content
  - Accessibility compliance validation (WCAG 2.1)

### Phase 4: Enterprise & Educational Institution Features (Q1 2027)
- [ ] **Institution Dashboard**:
  - Teacher/professor management console
  - Class and student progress monitoring
  - Curriculum alignment and standards mapping
  
- [ ] **Advanced Security & Compliance**:
  - FERPA compliance for educational data
  - GDPR compliance for international users
  - Single Sign-On (SSO) integration (SAML, OAuth 2.0)
  
- [ ] **Content Marketplace**:
  - Peer-to-peer content sharing
  - Verified educational content from institutions
  - Monetization options for premium content creators

### Technical Infrastructure Roadmap

#### A. Scalability Improvements
```python
# Microservices Architecture (Phase 2)
Services:
- user-service: Authentication and user management
- content-service: Document processing and storage
- generation-service: AI-powered content creation
- chat-service: RAG and conversation management
- analytics-service: Learning analytics and recommendations

# Container Orchestration
- Kubernetes deployment with auto-scaling
- Redis Cluster for distributed caching
- PostgreSQL read replicas for query optimization
- CDN integration for media content delivery
```

#### B. AI Model Evolution
```python
# Model Upgrade Timeline:
Q2 2026: 
- Upgrade to Sentence Transformers v3 with improved embeddings
- Integration of Code Llama for programming content
- Custom fine-tuned models for educational content

Q3 2026:
- GPT-4 Turbo integration for advanced reasoning
- Multimodal models for image and video content analysis
- On-premise model deployment options for institutions

Q4 2026:
- Custom domain-specific model training
- Federated learning for privacy-preserving model improvement
- Edge computing deployment for latency reduction
```

#### C. Performance & Infrastructure
```python
# Performance Targets (2027):
Response Times:
- Content generation: <10 seconds (95th percentile)
- RAG chat responses: <2 seconds (99th percentile)
- File upload processing: <30 seconds for 50MB files
- Concurrent users: 10,000+ simultaneous users

Infrastructure:
- 99.9% uptime SLA
- Multi-region deployment (US, EU, Asia)
- Auto-scaling based on demand
- Disaster recovery with <1 hour RTO
```

### Research & Development Initiatives

#### A. Educational AI Research
- **Adaptive Tutoring Systems**: Personalized learning paths based on cognitive science
- **Knowledge Graph Construction**: Automatic creation of concept relationships
- **Learning Outcome Prediction**: ML models to predict student success
- **Cognitive Load Optimization**: Content presentation based on cognitive load theory

#### B. Open Source Contributions
- **Educational NLP Toolkit**: Open source library for educational content processing
- **Prompt Engineering Repository**: Community-contributed prompts for educational AI
- **Benchmark Datasets**: Educational content quality evaluation datasets
- **Research Publications**: Academic papers on AI in education

### Community & Ecosystem Development

#### A. Developer Ecosystem
```python
# Plugin Architecture (Phase 2):
class ContentGenerator(Plugin):
    def generate(self, material: Material, options: dict) -> GeneratedContent:
        """Custom content generation plugin interface"""
        pass

# Supported Plugin Types:
- Custom content generators (new formats like interactive simulations)
- External API integrations (academic databases, research tools)
- Custom TTS voices and personalities
- Learning analytics extensions
```

#### B. Educational Partnerships
- **University Collaborations**: Pilot programs with computer science departments
- **Research Institutions**: Partnerships for educational AI research
- **Open Educational Resources (OER)**: Integration with OER repositories
- **Accessibility Organizations**: Ensuring inclusive design principles

### Technology Evolution & Emerging Trends

#### A. Emerging AI Technologies
- **Large Language Model Evolution**: GPT-5, Claude 3, and next-gen models
- **Multimodal AI**: Vision-language models for document understanding
- **Retrieval-Augmented Generation 2.0**: Advanced RAG architectures
- **Neuromorphic Computing**: Energy-efficient AI processing

#### B. Educational Technology Trends
- **Virtual Reality Integration**: 3D immersive learning environments
- **Augmented Reality**: Overlay educational content in real-world contexts
- **Brain-Computer Interfaces**: Direct neural feedback for learning optimization
- **Quantum Computing**: Advanced optimization for personalized learning paths

---

**KeplerLab** - Transforming how students learn through cutting-edge AI-powered education technology, building the future of personalized and accessible education for all learners worldwide.