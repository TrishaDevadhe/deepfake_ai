import os
import torch

class Config:
    # --- Performance Tuning --- #
    # Process only every Nth frame to drastically speed up analysis.
    # Higher = faster but lower precision
    FRAME_SKIP_RATE = int(os.getenv("FRAME_SKIP_RATE", "5"))
    
    # Batch size for PyTorch inference. 
    # Adjust based on GPU VRAM availability.
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", "16"))
    
    # Model type: "efficientnet", "mobilenet", or "onnx"
    MODEL_TYPE = os.getenv("MODEL_TYPE", "efficientnet")
    
    # Hardware acceleration
    USE_GPU = torch.cuda.is_available()
    DEVICE = torch.device("cuda" if USE_GPU else "cpu")
    
    # Enable torch.cuda.amp.autocast for mixed precision inference if on CUDA
    USE_MIXED_PRECISION = USE_GPU and os.getenv("USE_MIXED_PRECISION", "true").lower() == "true"
    
    # Enable torch.compile for graph optimization (PyTorch 2+)
    USE_TORCH_COMPILE = USE_GPU and hasattr(torch, "compile") and os.getenv("USE_TORCH_COMPILE", "true").lower() == "true"
    
    # Toggle Decord processing. If decord fails to load or import, fallback will be PyAV
    USE_DECORD = os.getenv("USE_DECORD", "true").lower() == "true"

    # --- Training Configuration --- #
    LEARNING_RATE = float(os.getenv("LEARNING_RATE", "1e-4"))
    NUM_EPOCHS = int(os.getenv("NUM_EPOCHS", "10"))
    TRAIN_DATA_PATH = os.getenv("TRAIN_DATA_PATH", "data/train")
    VAL_DATA_PATH = os.getenv("VAL_DATA_PATH", "data/val")
    WEIGHT_DECAY = float(os.getenv("WEIGHT_DECAY", "1e-5"))
