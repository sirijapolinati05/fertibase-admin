from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
import models
import json

router = APIRouter()

def safe_json_dump(val):
    if isinstance(val, (list, dict)):
        return json.dumps(val)
    return val

@router.get("/")
def get_jobs(db: Session = Depends(get_db)):
    try:
        jobs = db.query(models.Job).order_by(models.Job.created_at.desc()).all()
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
def get_job(id: str, db: Session = Depends(get_db)):
    try:
        job = db.query(models.Job).filter(models.Job.id == id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_job(payload: dict, db: Session = Depends(get_db)):
    try:
        # Convert lists to json strings
        for key in ["responsibilities", "requirements", "skills", "tools", "nice_to_have"]:
            if key in payload:
                payload[key] = safe_json_dump(payload[key])
                
        new_job = models.Job(**payload)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}")
def update_job(id: str, payload: dict, db: Session = Depends(get_db)):
    try:
        job = db.query(models.Job).filter(models.Job.id == id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        for key, value in payload.items():
            if key in ["responsibilities", "requirements", "skills", "tools", "nice_to_have"]:
                value = safe_json_dump(value)
            setattr(job, key, value)

        db.commit()
        db.refresh(job)
        return job
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}")
def delete_job(id: str, db: Session = Depends(get_db)):
    try:
        job = db.query(models.Job).filter(models.Job.id == id).first()
        if job:
            db.delete(job)
            db.commit()
        return {"message": "Job deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
