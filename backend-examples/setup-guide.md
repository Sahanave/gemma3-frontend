# Backend Setup Guide

## 1. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 2. Configure Frontend URL
Edit `config.py` or set environment variable:

\`\`\`python
# If frontend is on same machine
FRONTEND_URL = "http://localhost:3000"

# If frontend is on different machine (replace with actual IP)
FRONTEND_URL = "http://192.168.1.100:3000"

# If frontend is deployed (replace with actual URL)
FRONTEND_URL = "https://your-app.vercel.app"
\`\`\`

## 3. Run Backend
\`\`\`bash
python simple-backend.py
\`\`\`

Backend will be available at: `http://localhost:8000`

## 4. Test Backend
\`\`\`bash
python test-backend.py
\`\`\`

## 5. Configure Frontend
In your frontend, set the backend URL:

\`\`\`typescript
const api = new RobotApiService({ 
  baseUrl: "http://YOUR_LAPTOP_IP:8000"  // Replace with your laptop's IP
})
\`\`\`

## Network Setup

### Same Machine:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### Different Machines:
- Find your laptop's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Frontend connects to: `http://YOUR_LAPTOP_IP:8000`
- Make sure firewall allows port 8000

## Camera Setup
- Wrist camera: USB camera index 0
- Top camera: USB camera index 1
- Adjust camera indices in `config.py` if needed
\`\`\`
