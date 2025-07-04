# AI API App

## Overview
AI API App is a robust, production-ready Node.js/Express backend that powers advanced AI-driven features for chatbots, PDF document interaction, text-to-speech, speech-to-text, image recognition, and more. Built with scalability, security, and extensibility in mind, it leverages MongoDB for data storage and integrates with OpenAI APIs for state-of-the-art AI capabilities.

---

## Features
- **User Authentication & Authorization** (JWT-based, role support)
- **Admin Management** (secure bot management)
- **AI Chatbots** (text & image bots, multi-turn conversations)
- **Text-to-Speech & Speech-to-Text** (OpenAI-powered)
- **Image Recognition** (AI-based image analysis)
- **PDF Chat** (upload, embed, and chat with single/multiple PDFs)
- **File Embeddings** (vector storage for semantic search)
- **RESTful API** (modular, versionable endpoints)
- **Production-Ready Security** (input validation, token checks, error handling)
- **Extensible Architecture** (easy to add new AI features)

---

## Architecture
```mermaid
graph TD
  A[Client Apps / Frontend] -->|REST API| B(API Server)
  B --> C[Controllers]
  C --> D[Services / Utils]
  D --> E[OpenAI API]
  D --> F[MongoDB]
  B --> G[Authentication & Middleware]
  B --> H[File Storage (public/)]
```

---

## Project Structure
```
AI_Server/
  config/           # Database connection
  controllers/      # API logic for AI, chat, PDF, auth, admin
  middlewares/      # Auth, admin, and request validation
  models/           # Mongoose schemas for all entities
  public/           # Uploaded files (images, PDFs, audio, etc.)
  routes/           # Express route definitions
  utils/            # Helpers, uploaders, validations
  index.js          # Main server entry point
  package.json      # Project metadata and dependencies
```

---

## Getting Started
### Prerequisites
- Node.js >= 16.x
- MongoDB (local or Atlas)
- OpenAI API Key

### Installation
```bash
# Clone the repository
$ git clone <your-repo-url>
$ cd AI_Server

# Install dependencies
$ npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=8000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_jwt_secret
BASE_URL=http://localhost:8000/
OPENAI_API_KEY=your_openai_api_key
```

### Running the Server
```bash
# Start in development mode
$ npm start
```

---

## Deployment
- **Production**: Use a process manager (e.g., PM2), reverse proxy (e.g., Nginx), and secure environment variables.
- **Static Files**: Ensure the `public/` directory is writable and served securely.
- **Environment**: Set `NODE_ENV=production` and use strong secrets.
- **Scaling**: Deploy behind a load balancer for horizontal scaling.

---

## Security Best Practices
- All endpoints require JWT authentication (except login/register).
- Admin routes require `is_admin` flag in JWT.
- Input validation via `express-validator`.
- Passwords are hashed with bcrypt.
- Sensitive keys/secrets are never hardcoded.
- File uploads are validated and stored in segregated folders.
- Error messages are sanitized for production.

---

## API Usage
### Authentication
- `POST /api/register` — Register (multipart/form-data, image required)
- `POST /api/login` — Login (returns JWT access/refresh tokens)
- `GET /api/profile` — Get user profile (JWT required)

### Admin (JWT + is_admin required)
- `POST /api/admin/add-chat-bot` — Add chatbot (image upload)
- `GET /api/admin/chat-bots` — List chatbots
- `PUT /api/admin/update-chat-bot` — Update chatbot
- `DELETE /api/admin/delete-chat-bot` — Delete chatbot

### Chat & AI
- `POST /api/send-message` — Send message to chatbot
- `GET /api/get-messages` — Get chat messages
- `POST /api/image-generate` — Generate image from text
- `GET /api/get-images` — List generated images
- `DELETE /api/image` — Delete image
- `GET /api/download-image` — Download image

### Text-to-Speech & Speech-to-Text
- `POST /api/text-to-speech` — Convert text to speech
- `GET /api/text-to-speech` — List TTS conversions
- `GET /api/tts-download` — Download TTS audio
- `DELETE /api/text-to-speech` — Delete TTS audio
- `POST /api/speech-to-text` — Convert speech to text
- `GET /api/speech-to-text` — List STT conversions
- `DELETE /api/speech-to-text` — Delete STT conversion

### Image Recognition
- `POST /api/image-recognition` — Upload image for recognition
- `GET /api/image-recognition` — List recognition results
- `DELETE /api/image-recognition` — Delete result

### PDF Chat
- `POST /api/pdf` — Upload single PDF
- `GET /api/pdf` — List PDFs
- `POST /api/chat-with-pdf` — Chat with a PDF
- `GET /api/single-pdf-chats` — Get PDF chats
- `POST /api/pdfs` — Upload multiple PDFs
- `POST /api/chat-with-multiple-pdf` — Chat with multiple PDFs
- `GET /api/pdfs` — List all PDFs
- `PUT /api/update-chunk` — Update PDF chunk
- `DELETE /api/delete-pdf-data` — Delete PDF data
- `GET /api/pdf-conversations` — List PDF conversations
- `GET /api/pdf-conversation-messages` — Get PDF conversation messages

---

## Data Models (Mongoose)
- **User**: name, email, password (hashed), image, is_admin
- **ChatBot**: name, message, prompt_message, image, status, type
- **Chat**: user_id, conversation_id, chat_bot_id, user_message, ai_message, type
- **Conversation**: user_id, chat_bot_id, last_message
- **TextToSpeech**: user_id, text, file_path
- **SpeechToText**: user_id, text, file_path
- **TextToImage**: user_id, chat_bot_id, text, size, file_path
- **ImageRecognition**: user_id, image, ai_message
- **PDF Models**: SinglePdf, PdfFile, PdfChat, PdfConversation, FileEmbedding

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License
This project is licensed under the ISC License.

---

## Contact & Support
For issues, open a GitHub issue or contact the maintainer.

---
*This documentation is auto-generated from the codebase. Please review and update for your production deployment needs.* 