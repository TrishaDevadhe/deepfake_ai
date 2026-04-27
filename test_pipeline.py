import sys
import os

# Add backend and backend/services to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
sys.path.append(os.path.join(os.getcwd(), "backend", "services"))

from ai_pipeline import analyze_video

def test_pipeline():
    video_path = "sample_test_video.mp4"
    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found.")
        return

    print(f"Analyzing {video_path}...")
    result = analyze_video(video_path)
    print("Analysis Result:")
    print(result)

if __name__ == "__main__":
    test_pipeline()
