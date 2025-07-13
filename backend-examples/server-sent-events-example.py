from flask import Flask, Response
from flask_cors import CORS
import json
import queue
import time
import base64

app = Flask(__name__)
CORS(app)

# Event queue for storing messages
event_queue = queue.Queue()

@app.route('/api/events')
def event_stream():
    """Server-Sent Events endpoint - server pushes to frontend"""
    def generate():
        while True:
            try:
                # Wait for new event
                event_data = event_queue.get(timeout=30)  # 30 second timeout
                yield f"data: {json.dumps(event_data)}\n\n"
            except queue.Empty:
                # Send heartbeat to keep connection alive
                yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
    
    return Response(generate(), mimetype="text/plain")

def send_response_to_frontend(text, audio_bytes=None):
    """Call this function when you have a response ready"""
    event_data = {
        'type': 'robot_response',
        'text': text,
        'timestamp': time.time(),
        'hasAudio': False,
        'audioData': None
    }
    
    if audio_bytes is not None:
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        event_data['hasAudio'] = True
        event_data['audioData'] = f"data:audio/wav;base64,{audio_base64}"
    
    event_queue.put(event_data)
    print(f"Pushed event: {text} (Audio: {'Yes' if audio_bytes else 'No'})")

# Test endpoints
@app.route('/test/push')
def test_push():
    send_response_to_frontend("This was pushed from server!")
    return "Message pushed!"

if __name__ == '__main__':
    app.run(port=8000, debug=True)
