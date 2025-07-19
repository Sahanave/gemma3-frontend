// Simple API Service for 3 endpoints

import type {
  ApiConfig,
  SendTaskRequest,
  SendTaskResponse,
  CameraWristResponse,
  CameraTopResponse,
} from "../types/api-contract"

export class RobotApiService {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  // 1. Send Task (Voice Recording)
  async sendTask(voiceData: string, format: "wav" | "mp3" | "webm" = "wav"): Promise<SendTaskResponse> {
    const requestData: SendTaskRequest = {
      voiceData,
      format,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/api/send-task`, {
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
      const response = await fetch(`${this.config.baseUrl}/api/camera/wrist`, {
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
      const response = await fetch(`${this.config.baseUrl}/api/camera/top`, {
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
}
