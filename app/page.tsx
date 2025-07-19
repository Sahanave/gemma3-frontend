"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Pause, Mic, MicOff } from "lucide-react"

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [camera1Connected, setCamera1Connected] = useState(false)
  const [camera2Connected, setCamera2Connected] = useState(false)

  // Simulate audio levels when playing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

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

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMic = () => {
    setIsMicActive(!isMicActive)
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white text-center py-4 text-xl font-bold tracking-wider">ROBOT MEETS GEMMA</div>

      {/* Main Split Screen */}
      <div className="flex-1 flex">
        {/* Left Side - Voice Visualization */}
        <div className="w-1/2 bg-gray-900 flex flex-col">
          <div className="h-full flex flex-col items-center justify-center relative">
            {/* Voice Visualization Circle */}
            <div className="relative w-64 h-64">
              <svg width="256" height="256" className="absolute inset-0">
                <AnimatePresence>
                  {dots.map((dot) => (
                    <motion.circle
                      key={dot.id}
                      cx={dot.x * 0.8}
                      cy={dot.y * 0.8}
                      r={isPlaying ? 1.5 * dot.scale : 1 * dot.scale}
                      fill="white"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isPlaying ? dot.opacity * (audioLevel / 100) : dot.opacity * 0.3,
                        scale: isPlaying ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: isPlaying ? 0.5 : 1,
                        repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
                        delay: dot.id * 0.01,
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Central pulse effect */}
                {isPlaying && (
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="16"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ r: 16, opacity: 0.8 }}
                    animate={{ r: 48, opacity: 0 }}
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
                animate={{ opacity: isPlaying ? [1, 0.5, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
              >
                {isPlaying ? "Playing response..." : "Ready to respond"}
              </motion.p>
              <p className="text-gray-400 text-sm mt-1">
                {isPlaying ? "Audio response playing" : "Click play to start"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={togglePlayback}
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                onClick={toggleMic}
                variant={isMicActive ? "destructive" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isMicActive ? "Mute" : "Unmute"}
              </Button>
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
