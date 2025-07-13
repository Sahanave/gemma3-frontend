// API Service Implementation

import type {
  ApiConfig,
  CameraType,
  CameraFrame,
  AudioData,
  AudioResponse,
  ChatMessage,
  RobotStatus,
  ApiResponse,
  CameraStatus,
} from "../types/api-contract"

export class RobotApiService {
  private config: ApiConfig
  private websocket: WebSocket | null = null

  constructor(config: ApiConfig) {
    this.config = config
  }

  // Camera API Endpoints
  async connectCamera(cameraType: CameraType): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.config.baseUrl}/api/camera/${cameraType}/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async disconnectCamera(cameraType: CameraType): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.config.baseUrl}/api/camera/${cameraType}/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async getCameraStatus(cameraType: CameraType): Promise<ApiResponse<CameraStatus>> {
    const response = await fetch(`${this.config.baseUrl}/api/camera/${cameraType}/status`, {
      headers: {
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async getCameraFrame(cameraType: CameraType): Promise<ApiResponse<CameraFrame>> {
    const response = await fetch(`${this.config.baseUrl}/api/camera/${cameraType}/frame`, {
      headers: {
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  // Audio API Endpoints
  async startAudioRecording(): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.config.baseUrl}/api/audio/record/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async stopAudioRecording(): Promise<ApiResponse<AudioData>> {
    const response = await fetch(`${this.config.baseUrl}/api/audio/record/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async playAudio(audioId: string): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.config.baseUrl}/api/audio/play/${audioId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  async processAudioToText(audioData: AudioData): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.config.baseUrl}/api/audio/speech-to-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(audioData),
    })
    return response.json()
  }

  async processTextToAudio(text: string): Promise<ApiResponse<AudioResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/audio/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({ text }),
    })
    return response.json()
  }

  // Chat API Endpoints
  async sendChatMessage(message: string): Promise<ApiResponse<ChatMessage>> {
    const response = await fetch(`${this.config.baseUrl}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({ text: message }),
    })
    return response.json()
  }

  async getChatHistory(limit = 50): Promise<ApiResponse<ChatMessage[]>> {
    const response = await fetch(`${this.config.baseUrl}/api/chat/history?limit=${limit}`, {
      headers: {
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  // Robot Status
  async getRobotStatus(): Promise<ApiResponse<RobotStatus>> {
    const response = await fetch(`${this.config.baseUrl}/api/robot/status`, {
      headers: {
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    })
    return response.json()
  }

  // WebSocket Connection
  connectWebSocket(onMessage: (message: any) => void, onError?: (error: Event) => void): void {
    this.websocket = new WebSocket(this.config.websocketUrl)

    this.websocket.onopen = () => {
      console.log("WebSocket connected")
      // Send authentication if needed
      if (this.config.apiKey) {
        this.websocket?.send(
          JSON.stringify({
            type: "auth",
            token: this.config.apiKey,
          }),
        )
      }
    }

    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    this.websocket.onerror = (error) => {
      console.error("WebSocket error:", error)
      onError?.(error)
    }

    this.websocket.onclose = () => {
      console.log("WebSocket disconnected")
      // Implement reconnection logic if needed
    }
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }

  sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message))
    }
  }
}
