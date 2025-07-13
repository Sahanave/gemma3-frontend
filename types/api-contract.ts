// API Contract for Robot Frontend-Backend Communication

// Base API Configuration
export interface ApiConfig {
  baseUrl: string
  websocketUrl: string
  apiKey?: string
}

// Camera Types
export type CameraType = "wrist" | "top"

export interface CameraStatus {
  id: CameraType
  connected: boolean
  resolution: string
  fps: number
  lastFrame?: string // timestamp
}

export interface CameraFrame {
  cameraId: CameraType
  imageData: string // base64 encoded image
  timestamp: string
  metadata?: {
    width: number
    height: number
    format: string
  }
}

// Audio Types
export interface AudioStatus {
  isPlaying: boolean
  isRecording: boolean
  volume: number
  sampleRate: number
}

export interface AudioData {
  audioData: ArrayBuffer | string // raw audio data or base64
  format: "wav" | "mp3" | "pcm"
  sampleRate: number
  channels: number
  timestamp: string
}

export interface AudioResponse {
  responseId: string
  audioData: string // base64 encoded audio
  transcript?: string
  duration: number
  timestamp: string
}

// Chat/Communication Types
export interface ChatMessage {
  id: string
  text: string
  timestamp: string
  type: "user" | "robot" | "system"
  audioId?: string // reference to audio response
}

export interface RobotCommand {
  commandId: string
  type: "move" | "speak" | "camera_control" | "audio_control"
  parameters: Record<string, any>
  timestamp: string
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: "camera_frame" | "audio_data" | "status_update" | "chat_message" | "command_response"
  payload: any
  timestamp: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Robot Status
export interface RobotStatus {
  online: boolean
  cameras: CameraStatus[]
  audio: AudioStatus
  lastHeartbeat: string
}
