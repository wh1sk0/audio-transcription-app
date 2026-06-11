# Audio Transcription App

A web-based audio transcription application using OpenAI's Whisper API through SiriusXM's LiteLLM proxy.

## Features

- **Multiple Audio Formats**: Support for MP3, WAV, MP4, M4A, FLAC, OGG, WebM, AAC
- **Drag & Drop Interface**: Easy file uploads with visual feedback
- **Batch Processing**: Upload and process multiple files or entire folders
- **Multiple Whisper Models**: Choose from different models based on your needs
- **Export Options**: Copy to clipboard or download as .txt files
- **Real-time Progress**: Live processing status for each file

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   - Set `REACT_APP_LITELLM_API_KEY` to your LiteLLM API key.
   - Optionally set `REACT_APP_LITELLM_BASE_URL` if you use a non-default endpoint.
3. **Run the app**:
   ```bash
   npm start
   ```
4. **Upload Audio**: Drag & drop files or use the upload buttons
5. **Choose Model**: Select the appropriate Whisper model for your use case
6. **Start Processing**: Click "Start Transcription" to begin

## Model Recommendations

- **60s or less**: Whisper-1 (Standard) - fastest processing
- **Poor audio quality**: Whisper Large v3 - best accuracy
- **Multiple languages**: Whisper Large v3 - best multilingual support
- **Enterprise/Azure users**: Azure Whisper - integrated billing

## Development

```bash
npm install
npm start
```

## Deploy For Colleagues

Important: this is a client-side React app. Any `REACT_APP_*` value is embedded in browser JavaScript and is not secret.

### Option A: GitHub Pages (uses existing deploy script)

1. Create a GitHub repo and push this project.
2. Do not set `REACT_APP_LITELLM_API_KEY` in hosted environment unless you are okay with key exposure.
3. Run:
   ```bash
   npm run deploy
   ```
4. In GitHub repo settings, enable Pages from the `gh-pages` branch if needed.
5. Share your Pages URL with colleagues.

### Option B: Netlify/Vercel (recommended for easier updates)

1. Push this repo to GitHub.
2. Import the repo into Netlify or Vercel.
3. Build command: `npm run build`
4. Publish directory: `build`
5. Leave `REACT_APP_LITELLM_API_KEY` unset so each colleague enters their own key in the UI.

## Better Security Model (recommended later)

Move transcription calls to a backend API so the LiteLLM key never reaches the browser.
