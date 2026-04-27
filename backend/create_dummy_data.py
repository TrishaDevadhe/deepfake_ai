import os
import numpy as np
from PIL import Image

def create_dummy_data():
    base_dir = "data"
    splits = ["train", "val"]
    classes = ["real", "fake"]
    
    for split in splits:
        for cls in classes:
            path = os.path.join(base_dir, split, cls)
            os.makedirs(path, exist_ok=True)
            
            # Create 2 dummy images per class
            for i in range(2):
                img_data = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                img = Image.fromarray(img_data)
                img.save(os.path.join(path, f"dummy_{i}.jpg"))
                
    print("Dummy dataset created.")

if __name__ == "__main__":
    create_dummy_data()
