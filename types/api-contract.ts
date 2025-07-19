// Simple API Contract for Robot Frontend-Backend Communication

// Base API Configuration
export interface ApiConfig {
  baseUrl: string
}

// 1. Send Task (Voice Recording)
export interface SendTaskRequest {
  voiceData: string // base64 encoded audio
  format: "wav" | "mp3" | "webm"
  timestamp: string
}

export interface SendTaskResponse {
  success: boolean
  taskId: string
  message?: string
  error?: string
}

// 2. Get Camera Wrist
export interface CameraWristResponse {
  success: boolean
  imageData?: string // base64 encoded image: "data:image/jpeg;base64,..."
  timestamp?: string
  error?: string
}

// 3. Get Camera Top
export interface CameraTopResponse {
  success: boolean
  imageData?: string // base64 encoded image: "data:image/jpeg;base64,..."
  timestamp?: string
  error?: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}
