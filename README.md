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

1. **Get a LiteLLM API Key**: Contact your SiriusXM administrator for access
2. **Enter API Key**: Paste your key in the configuration section
3. **Upload Audio**: Drag & drop files or use the upload buttons
4. **Choose Model**: Select the appropriate Whisper model for your use case
5. **Start Processing**: Click "Start Transcription" to begin

## Model Recommendations

- **60s or less**: Whisper-1 (Standard) - fastest processing
- **Poor audio quality**: Whisper Large v3 - best accuracy
- **Multiple languages**: Whisper Large v3 - best multilingual support
- **Enterprise/Azure users**: Azure Whisper - integrated billing

## Development

```bash
npm install
npm start
