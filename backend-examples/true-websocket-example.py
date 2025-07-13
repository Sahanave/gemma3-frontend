import asyncio
import websockets
import json
import base64

connected_clients = set()

async def handle_client(websocket, path):
    """True bidirectional WebSocket"""
    connected_clients.add(websocket)
    print("Client connected")
    
    try:
        async for message in websocket:
            # Receive message from frontend
            data = json.loads(message)
            print(f"Received from frontend: {data}")
            
            if data['type'] == 'user_message':
                # Process the message and respond immediately
                response_text = f"I received: {data['text']}"
                
                # Send response back to this client
                await websocket.send(json.dumps({
                    'type': 'robot_response',
                    'text': response_text,
                    'hasAudio': False,
                    'audioData': None
                }))
                
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    finally:
        connected_clients.remove(websocket)

async def send_response_to_frontend(text, audio_bytes=None):
    """Call this function to broadcast to all connected clients"""
    if not connected_clients:
        print("No clients connected")
        return
    
    message_data = {
        'type': 'robot_response',
        'text': text,
        'hasAudio': False,
        'audioData': None
    }
    
    if audio_bytes is not None:
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        message_data['hasAudio'] = True
        message_data['audioData'] = f"data:audio/wav;base64,{audio_base64}"
    
    # Send to all connected clients
    disconnected = []
    for websocket in connected_clients:
        try:
            await websocket.send(json.dumps(message_data))
        except websockets.exceptions.ConnectionClosed:
            disconnected.append(websocket)
    
    # Clean up disconnected clients
    for websocket in disconnected:
        connected_clients.remove(websocket)
    
    print(f"Sent to {len(connected_clients)} clients: {text}")

# Example usage in your code
async def simulate_robot_responses():
    """Simulate robot sending responses"""
    await asyncio.sleep(2)
    await send_response_to_frontend("Robot initialized")
    
    await asyncio.sleep(3)
    await send_response_to_frontend("Camera connected")
    
    await asyncio.sleep(5)
    fake_audio = b"fake audio data"
    await send_response_to_frontend("Hello! How can I help?", fake_audio)

if __name__ == '__main__':
    # Start WebSocket server
    start_server = websockets.serve(handle_client, "localhost", 8001)
    
    # Start simulation
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().create_task(simulate_robot_responses())
    
    print("WebSocket server running on ws://localhost:8001")
    asyncio.get_event_loop().run_forever()
