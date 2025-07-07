# Studio Resonate Audio Transcription Tool

A professional web-based audio transcription application built for Studio Resonate, using advanced AI models through SiriusXM's internal LiteLLM proxy.

🌐 **Live App:** [https://wh1sk0.github.io/audio-transcription-app](https://wh1sk0.github.io/audio-transcription-app)

## ✨ Features

- **Multiple AI Models**: Choose from Whisper-1, GPT-4o Transcribe, and GPT-4o Mini Transcribe
- **Multiple Audio Formats**: Support for MP3, WAV, MP4, M4A, FLAC, OGG, WebM, AAC
- **Drag & Drop Interface**: Easy file uploads with visual feedback
- **Batch Processing**: Upload and process multiple files or entire folders simultaneously
- **Real-time Progress**: Live processing status with progress bars for each file
- **Export Options**: Copy to clipboard or download transcriptions as .txt files
- **Pre-configured**: Ready to use - no API key setup required for team members
- **Studio Resonate Branding**: Professional internal tool design

## 🚀 Getting Started

### For Studio Resonate Team Members

1. **Visit the app**: [https://wh1sk0.github.io/audio-transcription-app](https://wh1sk0.github.io/audio-transcription-app)
2. **Choose a model**: Select the appropriate transcription model for your audio
3. **Upload files**: Drag & drop your audio files or use the upload buttons
4. **Start transcription**: Click "Start Transcription" and wait for results
5. **Export results**: Copy text or download as .txt files

### Model Recommendations

- **60s or less, clear audio**: GPT-4o Mini Transcribe - fastest processing
- **General use**: Whisper-1 - reliable standard option  
- **Poor quality/noisy audio**: GPT-4o Transcribe - highest accuracy
- **Multiple speakers/languages**: GPT-4o Transcribe - best for complex audio

## 🛠️ Technical Details

### Architecture
- **Frontend**: React 18 with Tailwind CSS
- **Deployment**: GitHub Pages
- **API**: SiriusXM LiteLLM proxy for AI model access
- **Authentication**: Pre-configured X-API-Key for team use

### Available Models
- `whisper-1` - OpenAI's standard Whisper model
- `gpt-4o-transcribe` - Advanced GPT-4o for highest accuracy
- `gpt-4o-mini-transcribe` - Fast and efficient processing

### Supported Audio Formats
`.mp3`, `.wav`, `.mp4`, `.m4a`, `.flac`, `.ogg`, `.webm`, `.aac`

## 🔧 Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Local Development
```bash
# Clone the repository
git clone https://github.com/wh1sk0/audio-transcription-app.git
cd audio-transcription-app

# Install dependencies
npm install

# Start development server
npm start
```

### Deployment
```bash
# Build and deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
src/
├── App.js          # Main React component
├── index.js        # React entry point
public/
├── index.html      # HTML template
package.json        # Dependencies and scripts
```

## 🔒 Security & API Keys

- **Team Use**: API key is pre-configured for all Studio Resonate team members
- **Heavy Users**: Can replace the pre-configured key with their own in Advanced Configuration
- **Internal Network**: Uses SiriusXM's internal LiteLLM proxy for secure access

## 🤝 Contributing

This tool is maintained for Studio Resonate internal use. For feature requests or issues:

1. Contact the development team
2. Submit issues through internal channels
3. Suggest improvements for team workflow optimization

## 📊 Usage Analytics

- **Deployments**: Automated via GitHub Pages
- **Monitoring**: Track usage through SiriusXM's internal analytics
- **Updates**: Deployed automatically on code changes

## 🆘 Support

For technical support:
- **Internal IT**: Contact SiriusXM IT for API access issues
- **App Issues**: Reach out to the development team
- **Model Problems**: Check Advanced Configuration → Check Available Models

## 📝 License

Internal tool for Studio Resonate / SiriusXM use only.

---

**Built with ❤️ for Studio Resonate team productivity**
