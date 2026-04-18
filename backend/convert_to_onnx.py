import torch
import torchvision.models as models
import torch.nn as nn
import os
import argparse

def convert(model_type="efficientnet_v2_s"):
    """
    Converts a PyTorch trained `.pth` model into an `.onnx` model 
    for ONNXRuntime acceleration.
    """
    print(f"[Conversion] Setting up base architecture: {model_type}")
    
    # Needs to match the model architecture you're currently using
    # Currently default in deepshield_ai is efficientnet_v2_s
    model = models.efficientnet_v2_s(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pth_path = os.path.join(base_dir, "services", "xception_deepfake_detector.pth")
    onnx_path = os.path.join(base_dir, "services", "xception_deepfake_detector.onnx")
    
    if os.path.exists(pth_path):
        model.load_state_dict(torch.load(pth_path, map_location="cpu"))
        print(f"[Conversion] Loaded weights from {pth_path}")
    else:
        print(f"[Conversion] WARNING: No pretrained weights found at {pth_path}.")
        print("[Conversion] Converting untrained architecture to ONNX as a placeholder.")
        
    model.eval()
    
    # Create Dummy Input matching target resolution (224x224)
    batch_size = 1
    dummy_input = torch.randn(batch_size, 3, 224, 224, requires_grad=True)
    
    print(f"[Conversion] Exporting model to ONNX...")
    try:
        torch.onnx.export(
            model,                     # model being run
            dummy_input,               # model input (or a tuple for multiple inputs)
            onnx_path,                 # where to save the model
            export_params=True,        # store the trained parameter weights inside the model file
            opset_version=12,          # the ONNX version to export the model to
            do_constant_folding=True,  # whether to execute constant folding for optimization
            input_names=['input'],     # the model's input names
            output_names=['output'],   # the model's output names
            dynamic_axes={
                'input': {0: 'batch_size'},    # variable length axes
                'output': {0: 'batch_size'}
            }
        )
        print(f"[Conversion] SUCCESS! Saved ONNX model to:\n  -> {onnx_path}")
        print("[Conversion] To use it, update config.py setting MODEL_TYPE='onnx'.")
    except Exception as e:
        print(f"[Conversion] ERROR exporting model: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert model to ONNX")
    args = parser.parse_args()
    
    convert()
