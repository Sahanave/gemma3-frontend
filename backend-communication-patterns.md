# Backend Communication Patterns Explained

## 1. HTTP Polling (GET -> Response)
**Pattern**: Frontend repeatedly asks "Do you have anything for me?"

### Frontend Code:
\`\`\`javascript
// Frontend keeps asking every 500ms
setInterval(async () => {
    const response = await fetch('http://localhost:8000/api/check')  // GET request
    const data = await response.json()
    
    if (data.hasMessage) {
        displayMessage(data.message)
    }
}, 500)
\`\`\`

### Backend Code:
\`\`\`python
@app.route('/api/check')  # GET endpoint
def check_messages():
    if message_queue.empty():
        return {"hasMessage": false}
    else:
        message = message_queue.get()
        return {"hasMessage": true, "message": message}
\`\`\`

**Characteristics:**
- ❌ **Not real-time** (500ms delay)
- ❌ **Wasteful** (constant requests even when nothing happens)
- ✅ **Simple to debug**
- ✅ **Works through firewalls**

---

## 2. WebSocket (Bidirectional Real-time)
**Pattern**: Persistent connection, both sides can send anytime

### Frontend Code:
\`\`\`javascript
// One connection, real-time messages
const websocket = new WebSocket('ws://localhost:8001')

websocket.onmessage = function(event) {
    const data = JSON.parse(event.data)
    displayMessage(data.message)  // Instant delivery!
}

// Frontend can also send
websocket.send(JSON.stringify({type: 'user_message', text: 'Hello'}))
\`\`\`

### Backend Code:
\`\`\`python
import websockets

async def handle_client(websocket, path):
    # Send message instantly when ready
    await websocket.send(json.dumps({
        'type': 'robot_response',
        'message': 'Hello from robot!'
    }))
    
    # Also receive from frontend
    async for message in websocket:
        data = json.loads(message)
        print(f"Received: {data}")

# Start WebSocket server
start_server = websockets.serve(handle_client, "localhost", 8001)
\`\`\`

**Characteristics:**
- ✅ **Real-time** (instant delivery)
- ✅ **Efficient** (no wasted requests)
- ✅ **Bidirectional** (both sides can initiate)
- ❌ **More complex to debug**

---

## 3. Server-Sent Events (Push Only)
**Pattern**: Server pushes to frontend, but frontend can't send back through same connection

### Frontend Code:
\`\`\`javascript
// Listen for server pushes
const eventSource = new EventSource('http://localhost:8000/api/events')

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data)
    displayMessage(data.message)  // Server pushed this!
}

// To send to server, use separate HTTP request
fetch('http://localhost:8000/api/send', {
    method: 'POST',
    body: JSON.stringify({message: 'Hello'})
})
\`\`\`

### Backend Code:
\`\`\`python
@app.route('/api/events')
def event_stream():
    def generate():
        while True:
            # Push message when ready
            yield f"data: {json.dumps({'message': 'Hello from server!'})}\n\n"
            time.sleep(1)
    
    return Response(generate(), mimetype="text/plain")

@app.route('/api/send', methods=['POST'])  # Separate endpoint for receiving
def receive_message():
    message = request.json['message']
    # Process message
    return {"status": "received"}
\`\`\`

**Characteristics:**
- ✅ **Real-time push** (server to frontend)
- ✅ **Simpler than WebSocket**
- ❌ **One-way only** (server -> frontend)
- ❌ **Need separate endpoint for frontend -> server**

---

## Summary Table

| Pattern | Real-time | Bidirectional | Complexity | Best For |
|---------|-----------|---------------|------------|----------|
| **HTTP Polling** | ❌ | ❌ | Low | Simple apps, debugging |
| **WebSocket** | ✅ | ✅ | High | Real-time chat, gaming |
| **Server-Sent Events** | ✅ (push only) | ❌ | Medium | Live updates, notifications |

---

## For Your Robot App

### Current Need: Backend -> Frontend (Audio/Messages)
**Recommendation**: **Server-Sent Events** or **WebSocket**

### If You Also Need: Frontend -> Backend (Voice commands)
**Recommendation**: **WebSocket** (bidirectional)

### For Debugging/Testing:
**Recommendation**: **HTTP Polling** (easiest to test with curl)

---

## The Confusion in My Examples

You're right to be confused! In my "WebSocket" example, I was actually showing:
- WebSocket for real-time delivery
- But the pattern was still "backend pushes when ready"

True WebSocket design would be:
\`\`\`python
# Real WebSocket - bidirectional
async def handle_client(websocket, path):
    async for message in websocket:
        # Receive from frontend
        user_data = json.loads(message)
        
        # Process and respond immediately
        response = process_message(user_data['text'])
        
        # Send back instantly
        await websocket.send(json.dumps({
            'type': 'response',
            'text': response
        }))
\`\`\`

## Which Should You Use?

For your robot app, I'd recommend:
1. **Start with HTTP Polling** (easy to debug)
2. **Upgrade to Server-Sent Events** (real-time push)
3. **Use WebSocket** if you need voice commands from frontend

The "push when ready" pattern works with all three!
\`\`\`

```python file="backend-examples/http-polling-example.py"
from flask import Flask, jsonify
from flask_cors import CORS
import queue
import threading
import time
import base64

app = Flask(__name__)
CORS(app)

# Message queue for storing responses
response_queue = queue.Queue()

@app.route('/api/responses/check')
def check_responses():
    """Frontend polls this endpoint every 500ms"""
    if not response_queue.empty():
        response_data = response_queue.get()
        return jsonify(response_data)
    
    return jsonify({'hasResponse': False})

def send_response_to_frontend(text, audio_bytes=None):
    """Call this function when you have a response ready"""
    response_data = {
        'hasResponse': True,
        'text': text,
        'timestamp': time.time(),
        'hasAudio': False,
        'audioData': None
    }
    
    if audio_bytes is not None:
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        response_data['hasAudio'] = True
        response_data['audioData'] = f"data:audio/wav;base64,{audio_base64}"
    
    response_queue.put(response_data)
    print(f"Queued response: {text} (Audio: {'Yes' if audio_bytes else 'No'})")

# Test endpoints
@app.route('/test/text')
def test_text():
    send_response_to_frontend("This is a text-only message")
    return "Text message sent!"

@app.route('/test/audio')
def test_audio():
    # Simulate audio bytes (in real app, this would be your TTS output)
    fake_audio = b"fake audio data for testing"
    send_response_to_frontend("This message has audio", fake_audio)
    return "Audio message sent!"

if __name__ == '__main__':
    app.run(port=8000, debug=True)
