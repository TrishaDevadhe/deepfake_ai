import cv2
import numpy as np

# Create a sample test video for DeepShield AI
width = 640
height = 480
fps = 24
seconds = 2

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('sample_test_video.mp4', fourcc, fps, (width, height))

for _ in range(fps * seconds):
    # Simulated noise frame
    frame = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    # Add fake face placeholder text
    cv2.putText(frame, 'TEST SUBJECT VIDEO', (150, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    out.write(frame)

out.release()
print("Sample test video generated: sample_test_video.mp4")
