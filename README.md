# DeepShield AI 🛡️ - Next-Gen Deepfake Detection System

DeepShield AI is a full-stack, dual-layer deepfake detection system. It employs an innovative approach by combining **Physiological AI Signal Analysis** with **Blockchain-based Hash Verification** to determine the authenticity of a video, providing explainable AI insights to the user.

## System Architecture 🏗️

### Layer 1: Physiological AI Signal Analysis
- **Eye Blink Detection**: Extracts facial landmarks via MediaPipe. Low-quality deepfakes often lack natural blink patterns.
- **Lip-Sync Mismatch Detection**: Analyzes audio via Librosa and compares phonemes to lip movement anomalies.
- **Temporal Sequence Analysis**: Simulates a CNN+LSTM flow to detect temporal/spatial inconsistencies.

### Layer 2: Blockchain Verification 🔗
- Uploaded videos are fully hashed (SHA-256).
- Hashes are mock-published and verified against an Ethereum Testnet layer to ensure immutable tamper-proof guarantees over the raw file bits.

---

## 🚀 How to Run Locally

### 1. Setup Backend (FastAPI)
The backend requires Python 3.8+.

```bash
cd deepshield_ai/backend

# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate   # (Windows)

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn main:app --reload --port 8000
```
*Note: Make sure your system has the required C++ runtimes for Mediapipe and OpenCV.*

### 2. Setup Frontend (React + Vite + Tailwind)
The frontend requires Node.js to be installed.

```bash
cd deepshield_ai/frontend

# Install dependencies

npm install
# Start the development server
npm run dev
```

### 3. Generate a Sample Test Video
A Python script has been provided to generate a test video if you don't have one handy.

```bash
cd deepshield_ai
python create_test_video.py
```
This will output `sample_test_video.mp4` which you can upload via the Dashboard.

---

## Explanation / Explainable AI Metrics
When you upload a video, the dashboard will showcase:
- **REAL / DEEPFAKE badge**: Based on a dynamically weighted ensemble architecture.
- **Micro-Metrics**:
  - Blink Anomaly Score
  - Lip-Sync Mismatch (%)
  - Temporal Inconsistency (%)
- **Blockchain Verification Status**: Confirms whether the SHA-256 block matches prior analysis.
