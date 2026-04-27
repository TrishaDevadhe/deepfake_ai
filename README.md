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
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Training the Model for Better Output

To improve detection accuracy, you can train the model on your own dataset.

### 1. Prepare Your Dataset
Extract faces from your "real" and "fake" videos to create an image-based dataset.
```bash
cd backend
python prepare_dataset.py --video path/to/real_video.mp4 --output data/train/real --skip 10
python prepare_dataset.py --video path/to/fake_video.mp4 --output data/train/fake --skip 10
```
Repeat for validation data into `data/val/real` and `data/val/fake`.

### 2. Run Training
Adjust hyperparameters in `backend/config.py` if needed, then run:
```bash
cd backend
python train.py
```
The best model will be saved to `backend/services/xception_deepfake_detector.pth` and automatically used by the AI pipeline.

---

## Explanation / Explainable AI Metrics
When you upload a video, the dashboard will showcase:
- **REAL / DEEPFAKE badge**: Based on a dynamically weighted ensemble architecture.
- **Micro-Metrics**:
  - Blink Anomaly Score
  - Lip-Sync Mismatch (%)
  - Temporal Inconsistency (%)
- **Blockchain Verification Status**: Confirms whether the SHA-256 block matches prior analysis.
