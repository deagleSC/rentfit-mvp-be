# rentfit-mvp-be
RentFit.ai — Backend (Monolith)

Backend service for RentFit.ai, India’s rent management platform for tenants & property owners.
Built using Express + TypeScript + MongoDB (Mongoose) with Cloudinary for media storage, Gemini API for AI features, Redis + BullMQ for workers, and Swagger (swagger-autogen + swagger-ui-express) for API documentation.

Built using:
- **Express + TypeScript**
- **MongoDB (Mongoose)**
- **JWT authentication**
- **Cloudinary** for media uploads
- **Redis + BullMQ** for background jobs
- **Gemini API** for AI features
- **swagger-autogen + swagger-ui-express** for API docs

---

## Tech Stack

- Node.js + Express  
- TypeScript  
- MongoDB + Mongoose  
- JWT Authentication  
- Cloudinary (media storage)  
- Redis + BullMQ (jobs & scheduling)  
- Gemini API (LLM)  
- Swagger (auto-generated docs)

---

## Project Structure
```
rentfit-mvp-be/
├── src/
│   ├── config/          # Configuration files (database, redis, cloudinary, gemini)
│   ├── middleware/      # Express middleware (error handling, auth, etc.)
│   ├── routes/          # API route handlers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Express app entry point
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (create from .env.example)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for background jobs)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd rentfit-mvp-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/rentfit

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini API Configuration (optional)
GEMINI_API_KEY=your-gemini-api-key
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /api/*` - API routes (to be implemented)

## Development

The server uses:
- **TypeScript** for type safety
- **Express** as the web framework
- **Mongoose** for MongoDB ODM
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for HTTP request logging
- **Compression** for response compression
