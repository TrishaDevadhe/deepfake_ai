import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm
from config import Config

def get_data_loaders(train_dir, val_dir, batch_size):
    # Advanced Augmentations for Deepfake Detection
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.RandomGrayscale(p=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)

    return train_loader, val_loader

def train_model():
    print(f"Starting training on device: {Config.DEVICE}")
    
    # 1. Setup Data
    if not os.path.exists(Config.TRAIN_DATA_PATH) or not os.path.exists(Config.VAL_DATA_PATH):
        print(f"Error: Training or Validation data path not found.")
        print(f"Please ensure data exists at {Config.TRAIN_DATA_PATH} and {Config.VAL_DATA_PATH}")
        print("Example structure: data/train/real/, data/train/fake/")
        return

    train_loader, val_loader = get_data_loaders(
        Config.TRAIN_DATA_PATH, 
        Config.VAL_DATA_PATH, 
        Config.BATCH_SIZE
    )

    # 2. Setup Model
    # Using EfficientNet V2 S as the backbone
    model = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.DEFAULT)
    # Freeze earlier layers if needed, but for deepfakes, fine-tuning is usually better
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1) # Binary output
    model.to(Config.DEVICE)

    # 3. Optimizer and Loss
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=Config.LEARNING_RATE, weight_decay=Config.WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=Config.NUM_EPOCHS)
    scaler = torch.cuda.amp.GradScaler(enabled=Config.USE_MIXED_PRECISION)

    best_val_acc = 0.0
    save_path = os.path.join(os.path.dirname(__file__), "services", "xception_deepfake_detector.pth")

    # 4. Training Loop
    for epoch in range(Config.NUM_EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{Config.NUM_EPOCHS}")
        for inputs, labels in pbar:
            inputs, labels = inputs.to(Config.DEVICE), labels.to(Config.DEVICE).float().unsqueeze(1)
            
            optimizer.zero_grad()
            
            with torch.cuda.amp.autocast(enabled=Config.USE_MIXED_PRECISION):
                outputs = model(inputs)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
            running_loss += loss.item() * inputs.size(0)
            preds = (torch.sigmoid(outputs) > 0.5).float()
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
            pbar.set_postfix(loss=loss.item(), acc=correct/total)

        epoch_loss = running_loss / len(train_loader.dataset)
        epoch_acc = correct / total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(Config.DEVICE), labels.to(Config.DEVICE).float().unsqueeze(1)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * inputs.size(0)
                preds = (torch.sigmoid(outputs) > 0.5).float()
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)
        
        val_acc = val_correct / val_total
        print(f"Epoch {epoch+1} Summary: Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.4f} | Val Loss: {val_loss/val_total:.4f}, Val Acc: {val_acc:.4f}")
        
        scheduler.step()

        # Save Best Model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), save_path)
            print(f"New best model saved to {save_path}")

    print(f"Training Complete. Best Val Acc: {best_val_acc:.4f}")

if __name__ == "__main__":
    train_model()
