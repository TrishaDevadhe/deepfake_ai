import cv2
import os
import argparse
from tqdm import tqdm
import numpy as np

# Try to import mediapipe but don't fail if it's missing
try:
    import mediapipe as mp
except ImportError:
    mp = None

class RobustFaceDetector:
    def __init__(self):
        self.mp_face = None
        self.cv2_face = None
        if mp and hasattr(mp, 'solutions') and hasattr(mp.solutions, 'face_detection'):
            try:
                self.mp_face = mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)
            except Exception:
                pass
        
        if self.mp_face is None:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.cv2_face = cv2.CascadeClassifier(cascade_path)

    def detect(self, frame_rgb):
        if self.mp_face:
            results = self.mp_face.process(frame_rgb)
            if hasattr(results, 'detections') and results.detections:
                detection = results.detections[0]
                bboxC = detection.location_data.relative_bounding_box
                ih, iw, _ = frame_rgb.shape
                x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                return x, y, w, h
        elif self.cv2_face:
            gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
            faces = self.cv2_face.detectMultiScale(gray, 1.1, 4)
            if len(faces) > 0:
                return faces[0]
        return None

def extract_faces(video_path, output_dir, skip_frames=5):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    detector = RobustFaceDetector()
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    extracted_count = 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    with tqdm(total=total_frames, desc=f"Processing {os.path.basename(video_path)}") as pbar:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % skip_frames == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                detection = detector.detect(frame_rgb)

                if detection:
                    x, y, w, h = detection
                    ih, iw, _ = frame.shape
                    
                    # Add margin
                    margin = 0.2
                    x = max(0, int(x - margin * w))
                    y = max(0, int(y - margin * h))
                    w = min(iw - x, int(w * (1 + 2 * margin)))
                    h = min(ih - y, int(h * (1 + 2 * margin)))

                    face = frame[y:y+h, x:x+w]
                    if face.size > 0:
                        face_filename = f"{os.path.basename(video_path)}_{frame_count}.jpg"
                        cv2.imwrite(os.path.join(output_dir, face_filename), face)
                        extracted_count += 1

            frame_count += 1
            pbar.update(1)

    cap.release()
    print(f"Extracted {extracted_count} faces to {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract faces from a video for training.")
    parser.add_argument("--video", type=str, required=True, help="Path to the video file.")
    parser.add_argument("--output", type=str, required=True, help="Output directory for extracted faces.")
    parser.add_argument("--skip", type=int, default=10, help="Number of frames to skip.")
    
    args = parser.parse_args()
    extract_faces(args.video, args.output, args.skip)
