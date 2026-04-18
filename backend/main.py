import os
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, AnalysisResult
from services.blockchain import generate_video_hash, verify_and_store_hash
from services.ai_pipeline import analyze_video
import tempfile
from fastapi.concurrency import run_in_threadpool
app = FastAPI(title="DeepShield AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_video_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_bytes = await file.read()
    video_hash = generate_video_hash(file_bytes)
    
    # Optimization: Return cached result from blockchain/ledger if previously verified
    existing = db.query(AnalysisResult).filter(AnalysisResult.file_hash == video_hash).first()
    if existing:
        return {
            "status": "success",
            "message": "Verified via Blockchain Ledger Cache",
            "result": {
                "filename": existing.filename,
                "is_deepfake": existing.is_deepfake,
                "confidence_score": existing.confidence_score,
                "details": existing.details,
                "blockchain_verified": existing.blockchain_verified
            }
        }
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(file_bytes)
        temp_video_path = temp_video.name
        
    try:
        # Layer 1: AI Model verification
        ai_results = await run_in_threadpool(analyze_video, temp_video_path)
        
        # Layer 2: Blockchain / Ledger hash verification
        bc_status = await run_in_threadpool(verify_and_store_hash, video_hash)
        
        # Combine Layers into result
        result_record = AnalysisResult(
            filename=file.filename,
            file_hash=video_hash,
            is_deepfake=ai_results["is_deepfake"],
            confidence_score=ai_results["confidence_score"],
            details=ai_results["details"],
            blockchain_verified="Verified" if bc_status else "Failed"
        )
        db.add(result_record)
        db.commit()
        db.refresh(result_record)
        
        return {
            "status": "success",
            "message": "Analysis Complete",
            "result": {
                "filename": result_record.filename,
                "is_deepfake": result_record.is_deepfake,
                "confidence_score": result_record.confidence_score,
                "details": result_record.details,
                "blockchain_verified": result_record.blockchain_verified
            }
        }
    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    results = db.query(AnalysisResult).order_by(AnalysisResult.id.desc()).all()
    return {"history": results}

@app.delete("/api/history")
def clear_history(db: Session = Depends(get_db)):
    db.query(AnalysisResult).delete()
    db.commit()
    return {"status": "success", "message": "History cleared"}
