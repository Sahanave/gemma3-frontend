# Robot Frontend-Backend API Contract

## Overview
This document defines the API contract between the robot frontend and backend services for camera streaming, audio processing, and robot communication.

## Base Configuration
- **Base URL**: `http://localhost:8000` (configurable)
- **WebSocket URL**: `ws://localhost:8000/ws` (configurable)
- **Authentication**: Bearer token (optional)

## API Endpoints

### Camera Endpoints

#### Connect Camera
- **POST** `/api/camera/{camera_type}/connect`
- **Parameters**: `camera_type` (wrist | top)
- **Response**: `{ success: boolean, data: boolean }`

#### Disconnect Camera
- **POST** `/api/camera/{camera_type}/disconnect`
- **Parameters**: `camera_type` (wrist | top)
- **Response**: `{ success: boolean, data: boolean }`

#### Get Camera Status
- **GET** `/api/camera/{camera_type}/status`
- **Response**: 
\`\`\`json
{
  "success": true,
  "data": {
    "id": "wrist",
    "connected": true,
    "resolution": "1920x1080",
    "fps": 30,
    "lastFrame": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Get Camera Frame
- **GET** `/api/camera/{camera_type}/frame`
- **Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "cameraId": "wrist",
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "jpeg"
    }
  }
}
\`\`\`

### Audio Endpoints

#### Start Recording
- **POST** `/api/audio/record/start`
- **Response**: `{ success: boolean, data: boolean }`

#### Stop Recording
- **POST** `/api/audio/record/stop`
- **Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "audioData": "base64_encoded_audio_data",
    "format": "wav",
    "sampleRate": 44100,
    "channels": 1,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Play Audio
- **POST** `/api/audio/play/{audio_id}`
- **Response**: `{ success: boolean, data: boolean }`

#### Speech to Text
- **POST** `/api/audio/speech-to-text`
- **Body**:
\`\`\`json
{
  "audioData": "base64_encoded_audio",
  "format": "wav",
  "sampleRate": 44100,
  "channels": 1
}
\`\`\`
- **Response**: `{ success: boolean, data: "transcribed text" }`

#### Text to Speech
- **POST** `/api/audio/text-to-speech`
- **Body**: `{ "text": "Hello, how can I help you?" }`
- **Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "responseId": "audio_123",
    "audioData": "base64_encoded_audio",
    "transcript": "Hello, how can I help you?",
    "duration": 2.5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Chat Endpoints

#### Send Message
- **POST** `/api/chat/message`
- **Body**: `{ "text": "Hello robot" }`
- **Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "msg_123",
    "text": "Hello! How can I help you?",
    "timestamp": "2024-01-15T10:30:00Z",
    "type": "robot",
    "audioId": "audio_456"
  }
}
\`\`\`

#### Get Chat History
- **GET** `/api/chat/history?limit=50`
- **Response**: `{ success: boolean, data: ChatMessage[] }`

### Robot Status

#### Get Status
- **GET** `/api/robot/status`
- **Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "online": true,
    "cameras": [
      {
        "id": "wrist",
        "connected": true,
        "resolution": "1920x1080",
        "fps": 30
      },
      {
        "id": "top",
        "connected": false,
        "resolution": "1920x1080",
        "fps": 30
      }
    ],
    "audio": {
      "isPlaying": false,
      "isRecording": false,
      "volume": 75,
      "sampleRate": 44100
    },
    "lastHeartbeat": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## WebSocket Events

### Connection
- **URL**: `ws://localhost:8000/ws`
- **Authentication**: Send `{ type: "auth", token: "your_token" }` after connection

### Message Types

#### Camera Frame Stream
\`\`\`json
{
  "type": "camera_frame",
  "payload": {
    "cameraId": "wrist",
    "imageData": "base64_encoded_image",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Audio Data Stream
\`\`\`json
{
  "type": "audio_data",
  "payload": {
    "audioData": "base64_encoded_audio",
    "level": 75,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Status Updates
\`\`\`json
{
  "type": "status_update",
  "payload": {
    "component": "camera",
    "status": "connected",
    "details": { "cameraId": "wrist" }
  }
}
\`\`\`

#### Chat Messages
\`\`\`json
{
  "type": "chat_message",
  "payload": {
    "id": "msg_123",
    "text": "Hello!",
    "type": "robot",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## Error Handling

All API responses follow this format:
\`\`\`json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Implementation Notes

1. **Camera Streaming**: Use WebSocket for real-time camera frames
2. **Audio Processing**: Support both real-time streaming and batch processing
3. **Authentication**: Optional Bearer token authentication
4. **Rate Limiting**: Implement appropriate rate limits for API endpoints
5. **Error Recovery**: Frontend should handle connection drops gracefully
6. **Image Format**: JPEG for camera frames, base64 encoded
7. **Audio Format**: WAV/PCM for processing, MP3 for playback
