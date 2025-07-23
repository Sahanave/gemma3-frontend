"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Bot } from "lucide-react"
import { RobotApiService } from "@/services/api-service"
import type { ChatMessage } from "@/types/api-contract"

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [camera1Connected, setCamera1Connected] = useState(false)
  const [camera2Connected, setCamera2Connected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apiService = new RobotApiService()

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate audio levels when playing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying || isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isRecording])

  // Generate dots for the voice visualization
  const generateDots = () => {
    const dots = []
    const radius = 120
    const centerX = 150
    const centerY = 150

    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * Math.PI * 2
      const distance = radius * Math.sqrt(Math.random())
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      dots.push({
        id: i,
        x,
        y,
        opacity: Math.random() * 0.8 + 0.2,
        scale: Math.random() * 0.5 + 0.5,
      })
    }
    return dots
  }

  const [dots] = useState(generateDots())

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processVoiceRecording(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsMicActive(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsMicActive(false)
    }
  }

  // Process voice recording
  const processVoiceRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      // Call high-level processing API
      const response = await apiService.processHighLevel(base64Audio, "wav")

      if (response.success) {
        // Add robot response to chat
        const robotMessage: ChatMessage = {
          id: Date.now().toString(),
          text: response.text,
          sender: "robot",
          timestamp: response.timestamp,
          hasAudio: response.hasAudio,
        }
        setMessages((prev) => [...prev, robotMessage])

        // Auto-play audio if available
        if (response.hasAudio && response.audioData) {
          playAudio(response.audioData)
        }
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          text: `Error: ${response.error || "Failed to process voice"}`,
          sender: "robot",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error processing voice:", error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Error: Failed to process voice recording",
        sender: "robot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // Play audio
  const playAudio = (audioData: string) => {
    const audio = new Audio(audioData)
    setIsPlaying(true)
    audio.play()
    audio.onended = () => setIsPlaying(false)
  }

  const toggleMic = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white text-center py-4 text-xl font-bold tracking-wider">ROBOT MEETS GEMMA</div>

      {/* Main Split Screen */}
      <div className="flex-1 flex">
        {/* Left Side - Voice Visualization and Chat */}
        <div className="w-1/2 bg-gray-900 flex flex-col">
          {/* Voice Visualization - Top Half */}
          <div className="h-1/2 flex flex-col items-center justify-center relative">
            {/* Voice Visualization Circle */}
            <div className="relative w-48 h-48">
              <svg width="192" height="192" className="absolute inset-0">
                <AnimatePresence>
                  {dots.map((dot) => (
                    <motion.circle
                      key={dot.id}
                      cx={dot.x * 0.6}
                      cy={dot.y * 0.6}
                      r={isPlaying || isRecording ? 1.5 * dot.scale : 1 * dot.scale}
                      fill="white"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isPlaying || isRecording ? dot.opacity * (audioLevel / 100) : dot.opacity * 0.3,
                        scale: isPlaying || isRecording ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: isPlaying || isRecording ? 0.5 : 1,
                        repeat: isPlaying || isRecording ? Number.POSITIVE_INFINITY : 0,
                        delay: dot.id * 0.01,
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Central pulse effect */}
                {(isPlaying || isRecording) && (
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="12"
                    fill="none"
                    stroke={isRecording ? "red" : "white"}
                    strokeWidth="2"
                    initial={{ r: 12, opacity: 0.8 }}
                    animate={{ r: 36, opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />
                )}
              </svg>
            </div>

            {/* Status Text */}
            <div className="text-center mt-4">
              <motion.p
                className="text-white text-lg font-medium"
                animate={{ opacity: isPlaying || isRecording ? [1, 0.5, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isPlaying || isRecording ? Number.POSITIVE_INFINITY : 0 }}
              >
                {isRecording
                  ? "Recording..."
                  : isProcessing
                    ? "Processing..."
                    : isPlaying
                      ? "Playing response..."
                      : "Ready to respond"}
              </motion.p>
              <p className="text-gray-400 text-sm mt-1">
                {isRecording
                  ? "Speak now, click to stop"
                  : isProcessing
                    ? "Processing your voice..."
                    : "Click mic to talk to robot"}
              </p>
            </div>

            {/* Voice Controls */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={toggleMic}
                variant={isRecording ? "destructive" : isMicActive ? "secondary" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                disabled={isProcessing}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? "Stop Recording" : "Talk to Robot"}
              </Button>
            </div>
          </div>

          {/* Robot Chat - Bottom Half */}
          <div className="h-1/2 flex flex-col bg-gray-800 border-t border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                Robot Responses
              </h3>
            </div>

            {/* Messages - Only Robot Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isProcessing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg rounded-tl-none max-w-xs">
                    <p className="text-sm">Hello! I'm ready to help. Click the microphone to start talking to me.</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  {/* Robot Avatar */}
                  <motion.div
                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                    animate={message.hasAudio && isPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: message.hasAudio && isPlaying ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>

                  {/* Message Bubble */}
                  <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg rounded-tl-none max-w-xs">
                    <p className="text-sm">{message.text}</p>
                    {message.hasAudio && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-300">
                        <motion.div
                          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
                        >
                          🔊
                        </motion.div>
                        <span>{isPlaying ? "Playing..." : "Audio response"}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-start gap-3">
                  <motion.div
                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="flex gap-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </motion.div>
                      <span className="text-sm text-gray-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Right Side - Camera Control */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden">
          {/* Background placeholder */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage: "url('/placeholder.svg?height=600&width=800&text=Robot+Workspace')",
            }}
          />

          {/* Overlay Content - Robot Camera Controls */}
          <div className="relative z-10 bg-black/80 backdrop-blur-sm rounded-lg p-6 m-6 shadow-2xl w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Robot Workspace - Camera Control</h3>

            {/* Camera Connection Buttons */}
            <div className="flex gap-4 mb-6 justify-center">
              <Button
                onClick={() => setCamera1Connected(!camera1Connected)}
                variant={camera1Connected ? "default" : "outline"}
                size="lg"
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${camera1Connected ? "bg-green-500" : "bg-red-500"}`} />
                Wrist Camera {camera1Connected ? "Connected" : "Disconnected"}
              </Button>

              <Button
                onClick={() => setCamera2Connected(!camera2Connected)}
                variant={camera2Connected ? "default" : "outline"}
                size="lg"
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${camera2Connected ? "bg-green-500" : "bg-red-500"}`} />
                Top Camera {camera2Connected ? "Connected" : "Disconnected"}
              </Button>
            </div>

            {/* Camera Feeds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Camera 1 Feed */}
              <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
                <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${camera1Connected ? "bg-green-500" : "bg-gray-500"}`} />
                  Wrist Camera
                </h4>
                <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                  {camera1Connected ? (
                    <div
                      className="w-full h-full bg-cover bg-center rounded"
                      style={{
                        backgroundImage: "url('/placeholder.svg?height=200&width=300&text=Wrist+Camera')",
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Camera Disconnected</span>
                  )}
                </div>
              </div>

              {/* Camera 2 Feed */}
              <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
                <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${camera2Connected ? "bg-green-500" : "bg-gray-500"}`} />
                  Top Camera
                </h4>
                <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                  {camera2Connected ? (
                    <div
                      className="w-full h-full bg-cover bg-center rounded"
                      style={{
                        backgroundImage: "url('/placeholder.svg?height=200&width=300&text=Top+Camera')",
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Camera Disconnected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
