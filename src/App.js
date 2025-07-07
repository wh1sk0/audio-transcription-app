import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileAudio, Copy, Download, X, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const AudioTranscriptionApp = () => {
  const [files, setFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState('whisper-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [apiKey, setApiKey] = useState('sk-ZJbdOf6R6nckBQ588n09qw'); // Pre-filled for team use
  const [showApiKey, setShowApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [checkingModels, setCheckingModels] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://litellm.plat-eng.prod.cloud.siriusxm.com');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const models = {
    'whisper-1': { 
      name: 'Whisper-1', 
      description: 'OpenAI\'s standard Whisper model - reliable for most audio', 
      provider: 'OpenAI',
      speed: 'Fast',
      accuracy: 'High'
    },
    'gpt-4o-transcribe': { 
      name: 'GPT-4o Transcribe', 
      description: 'Advanced GPT-4o for transcription - highest accuracy for complex audio', 
      provider: 'OpenAI',
      speed: 'Medium',
      accuracy: 'Highest'
    },
    'gpt-4o-mini-transcribe': { 
      name: 'GPT-4o Mini Transcribe', 
      description: 'Fast and efficient - great for clear audio and quick processing', 
      provider: 'OpenAI',
      speed: 'Fastest',
      accuracy: 'High'
    }
  };

  const acceptedFormats = ['.mp3', '.wav', '.mp4', '.m4a', '.flac', '.ogg', '.webm', '.aac'];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const audioFiles = droppedFiles.filter(file => 
      acceptedFormats.some(format => file.name.toLowerCase().endsWith(format))
    );
    
    if (audioFiles.length > 0) {
      addFiles(audioFiles);
    }
  }, []);

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      transcription: null,
      error: null
    }));
    setFiles(prev => [...prev, ...filesWithId]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const audioFiles = selectedFiles.filter(file => 
      acceptedFormats.some(format => file.name.toLowerCase().endsWith(format))
    );
    addFiles(audioFiles);
    e.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setResults(prev => prev.filter(result => result.id !== id));
  };

  // Check what models are available
  const checkAvailableModels = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your API key first.');
      return;
    }
    
    setCheckingModels(true);
    try {
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      
      const data = await response.json();
      const transcriptionModels = data.data?.filter(model => 
        model.id.toLowerCase().includes('whisper') ||
        model.id.toLowerCase().includes('transcribe')
      ) || [];
      
      setAvailableModels(transcriptionModels);
      
      if (transcriptionModels.length > 0 && !transcriptionModels.find(m => m.id === selectedModel)) {
        setSelectedModel(transcriptionModels[0].id);
      }
      
    } catch (error) {
      alert(`Error checking models: ${error.message}`);
      console.error('Model check error:', error);
    }
    setCheckingModels(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // LiteLLM/OpenAI Whisper API transcription
  const transcribeAudio = async (fileData) => {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('model', selectedModel);
    formData.append('response_format', 'text');

    const response = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const result = await response.text();
    
    // Handle both JSON and plain text responses
    try {
      const jsonResult = JSON.parse(result);
      return jsonResult.text || result;
    } catch {
      return result.trim();
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    if (!apiKey.trim()) {
      alert('Please enter your API key first.');
      return;
    }
    
    setIsProcessing(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileData of pendingFiles) {
      try {
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'processing', progress: 10 }
            : f
        ));

        // Perform transcription
        const transcription = await transcribeAudio(fileData);
        
        // Update with results
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'completed', progress: 100, transcription }
            : f
        ));

        setResults(prev => [...prev, {
          id: fileData.id,
          fileName: fileData.file.name,
          transcription,
          timestamp: new Date().toLocaleString()
        }]);

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: error.message }
            : f
        ));
      }
    }
    
    setIsProcessing(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadTranscription = (fileName, transcription) => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_transcription.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllTranscriptions = () => {
    const allTranscriptions = results.map(result => 
      `=== ${result.fileName} ===\n${result.transcription}\n\n`
    ).join('');
    
    const blob = new Blob([allTranscriptions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_transcriptions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Audio Transcription</h1>
          <p className="text-gray-600">Convert your audio files to text using AI-powered transcription</p>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">SiriusXM LiteLLM API Configuration</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                LiteLLM API Key (Pre-configured for team)
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API key pre-configured"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                API key is pre-configured for team use. Heavy users can replace with their own key if needed.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-2 rounded-lg text-sm ${
              apiKey.trim() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {apiKey.trim() ? '✓ API Key Set' : '⚠ API Key Required'}
            </div>
            
            <button
              onClick={checkAvailableModels}
              disabled={!apiKey.trim() || checkingModels}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {checkingModels ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Available Models'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              <span>Endpoint: SiriusXM LiteLLM</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Connected to:</strong> {baseUrl}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Using SiriusXM's internal LiteLLM proxy for optimized AI model access with cost management and fallbacks.
            </p>
          </div>
          
          {availableModels.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2">
                <strong>✓ Available Transcription Models Found:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {availableModels.map(model => (
                  <span key={model.id} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {model.id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Choose Transcription Model</h2>
          
          {availableModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModels.map((model) => (
                <div 
                  key={model.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel === model.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={selectedModel === model.id}
                      onChange={() => setSelectedModel(model.id)}
                      className="mr-2"
                    />
                    <h3 className="font-medium">{model.id}</h3>
                    <span className="ml-auto text-xs px-2 py-1 bg-gray-100 rounded-full">Available</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {model.id.includes('transcribe') ? 'AI transcription model' : 
                     model.id.includes('whisper') ? 'OpenAI Whisper transcription model' : 
                     'Transcription model'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(models).map(([key, model]) => (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedModel(key)}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={selectedModel === key}
                      onChange={() => setSelectedModel(key)}
                      className="mr-2"
                    />
                    <h3 className="font-medium">{model.name}</h3>
                    <span className="ml-auto text-xs px-2 py-1 bg-gray-100 rounded-full">{model.provider}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Speed: {model.speed}</span>
                    <span>Accuracy: {model.accuracy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>📋 Model Recommendations:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• <strong>60s or less, clear audio:</strong> GPT-4o Mini Transcribe - fastest processing</li>
              <li>• <strong>General use:</strong> Whisper-1 - reliable standard option</li>
              <li>• <strong>Poor quality/noisy audio:</strong> GPT-4o Transcribe - highest accuracy</li>
              <li>• <strong>Multiple speakers/languages:</strong> GPT-4o Transcribe - best for complex audio</li>
            </ul>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Audio Files</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your audio files here, or click to select
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select Files
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Folder
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: {acceptedFormats.join(', ')}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory=""
            onChange={handleFolderSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Files to Process ({files.length})</h2>
              <button
                onClick={processFiles}
                disabled={isProcessing || files.every(f => f.status === 'completed') || !apiKey.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Transcription'
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              {files.map((fileData) => (
                <div key={fileData.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileAudio className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileData.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(fileData.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {fileData.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileData.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{fileData.progress}%</span>
                      </div>
                    )}
                    
                    {fileData.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    
                    {fileData.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-red-600 max-w-xs truncate" title={fileData.error}>
                          {fileData.error}
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transcription Results</h2>
              <button
                onClick={downloadAllTranscriptions}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </button>
            </div>
            
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{result.fileName}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(result.transcription)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button
                        onClick={() => downloadTranscription(result.fileName, result.transcription)}
                        className="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{result.transcription}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Transcribed: {result.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTranscriptionApp;