from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import time
import json

app = Flask(__name__)
CORS(app)  # Allow frontend to connect from different port

# Configuration - Frontend URL (configurable)
FRONTEND_URL = "http://localhost:3000"  # Your frontend URL
BACKEND_PORT = 8000

# 1. Send Task Endpoint - Receives voice recording
@app.route('/api/send-task', methods=['POST'])
def send_task():
    try:
        data = request.get_json()
        
        # Extract voice data
        voice_data = data.get('voiceData')  # base64 encoded audio
        format_type = data.get('format', 'wav')
        timestamp = data.get('timestamp')
        
        print(f"Received voice task at {timestamp}")
        print(f"Audio format: {format_type}")
        print(f"Audio data length: {len(voice_data) if voice_data else 0} characters")
        
        # TODO: Process the voice data here
        # - Decode base64 to audio bytes
        # - Save to file or process with speech recognition
        # - Send commands to robot
        
        # Example: Save audio to file
        if voice_data:
            audio_bytes = base64.b64decode(voice_data.split(',')[1] if ',' in voice_data else voice_data)
            with open(f"received_audio_{int(time.time())}.{format_type}", "wb") as f:
                f.write(audio_bytes)
            print("Audio saved to file")
        
        return jsonify({
            "success": True,
            "taskId": f"task_{int(time.time())}",
            "message": "Voice task received and processing started"
        })
        
    except Exception as e:
        print(f"Error in send_task: {e}")
        return jsonify({
            "success": False,
            "taskId": "",
            "error": str(e)
        }), 500

# 2. Get Camera Wrist Endpoint
@app.route('/api/camera/wrist', methods=['GET'])
def get_camera_wrist():
    try:
        # TODO: Replace with your actual wrist camera code
        # Example using OpenCV (camera index 0)
        cap = cv2.VideoCapture(0)  # Change index for your wrist camera
        
        if not cap.isOpened():
            return jsonify({
                "success": False,
                "error": "Wrist camera not available"
            })
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return jsonify({
                "success": False,
                "error": "Failed to capture wrist camera frame"
            })
        
        # Encode frame to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "success": True,
            "imageData": f"data:image/jpeg;base64,{image_base64}",
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in get_camera_wrist: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

# 3. Get Camera Top Endpoint  
@app.route('/api/camera/top', methods=['GET'])
def get_camera_top():
    try:
        # TODO: Replace with your actual top camera code
        # Example using OpenCV (camera index 1)
        cap = cv2.VideoCapture(1)  # Change index for your top camera
        
        if not cap.isOpened():
            return jsonify({
                "success": False,
                "error": "Top camera not available"
            })
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return jsonify({
                "success": False,
                "error": "Failed to capture top camera frame"
            })
        
        # Encode frame to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "success": True,
            "imageData": f"data:image/jpeg;base64,{image_base64}",
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in get_camera_top: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "frontend_url": FRONTEND_URL
    })

if __name__ == '__main__':
    print(f"Starting backend server on port {BACKEND_PORT}")
    print(f"Frontend expected at: {FRONTEND_URL}")
    print(f"Backend will be available at: http://localhost:{BACKEND_PORT}")
    
    app.run(
        host='0.0.0.0',  # Allow connections from other machines
        port=BACKEND_PORT,
        debug=True
    )
