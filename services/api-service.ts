// Updated API Service with High Level Processing

import { API_CONFIG } from "@/lib/config"
import type {
  SendTaskRequest,
  SendTaskResponse,
  CameraWristResponse,
  CameraTopResponse,
  HighLevelRequest,
  HighLevelResponse,
} from "../types/api-contract"

export class RobotApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
  }

  // 1. Send Task (Voice Recording)
  async sendTask(voiceData: string, format: "wav" | "mp3" | "webm" = "wav"): Promise<SendTaskResponse> {
    const requestData: SendTaskRequest = {
      voiceData,
      format,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.sendTask}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        taskId: "",
        error: `Failed to send task: ${error}`,
      }
    }
  }

  // 2. Get Camera Wrist
  async getCameraWrist(): Promise<CameraWristResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.cameraWrist}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: `Failed to get wrist camera: ${error}`,
      }
    }
  }

  // 3. Get Camera Top
  async getCameraTop(): Promise<CameraTopResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.cameraTop}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: `Failed to get top camera: ${error}`,
      }
    }
  }

  // 4. High Level Processing (NEW)
  async processHighLevel(voiceData: string, format: "wav" | "mp3" | "webm" = "wav"): Promise<HighLevelResponse> {
    const requestData: HighLevelRequest = {
      voiceData,
      format,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.highLevel}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        text: "",
        hasAudio: false,
        timestamp: new Date().toISOString(),
        error: `Failed to process high level: ${error}`,
      }
    }
  }
}
