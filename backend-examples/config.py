# Configuration file for backend

# Frontend Configuration
FRONTEND_URL = "http://localhost:3000"  # Default Next.js dev server
# FRONTEND_URL = "http://192.168.1.100:3000"  # If frontend is on different machine
# FRONTEND_URL = "https://your-deployed-frontend.vercel.app"  # Production

# Backend Configuration  
BACKEND_HOST = "0.0.0.0"  # Listen on all interfaces
BACKEND_PORT = 8000

# Camera Configuration
WRIST_CAMERA_INDEX = 0  # USB camera index for wrist camera
TOP_CAMERA_INDEX = 1    # USB camera index for top camera

# Audio Configuration
AUDIO_SAVE_PATH = "./received_audio/"  # Where to save received audio files
SUPPORTED_AUDIO_FORMATS = ["wav", "mp3", "webm"]

# Robot Configuration (add your robot-specific settings)
ROBOT_IP = "192.168.1.50"  # Your robot's IP address
ROBOT_PORT = 5000          # Your robot's control port
