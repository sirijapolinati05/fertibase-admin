from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

class LatestUpdateCreate(BaseModel):
    title: str
    message: str
    action_text: Optional[str] = None
    action_link: Optional[str] = None
    is_active: Optional[bool] = True

class LatestUpdateUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    action_text: Optional[str] = None
    action_link: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/")
def get_latest_updates(db: Session = Depends(get_db)):
    try:
        updates = db.query(models.LatestUpdate).order_by(models.LatestUpdate.created_at.desc()).all()
        return updates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_latest_update(payload: LatestUpdateCreate, db: Session = Depends(get_db)):
    try:
        # Convert bool to string if needed, depending on how models.py mapped it.
        # models.LatestUpdate.is_active is mapped as Text right now!
        new_update = models.LatestUpdate(
            title=payload.title,
            message=payload.message,
            action_text=payload.action_text,
            action_link=payload.action_link,
            is_active=str(payload.is_active).lower() if payload.is_active is not None else "true"
        )
        db.add(new_update)
        db.commit()
        db.refresh(new_update)
        return new_update
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
def update_latest_update(id: str, payload: LatestUpdateUpdate, db: Session = Depends(get_db)):
    try:
        update_obj = db.query(models.LatestUpdate).filter(models.LatestUpdate.id == id).first()
        if not update_obj:
            raise HTTPException(status_code=404, detail="Update not found")

        if payload.title is not None: update_obj.title = payload.title
        if payload.message is not None: update_obj.message = payload.message
        if payload.action_text is not None: update_obj.action_text = payload.action_text
        if payload.action_link is not None: update_obj.action_link = payload.action_link
        if payload.is_active is not None: update_obj.is_active = str(payload.is_active).lower()

        db.commit()
        db.refresh(update_obj)
        return update_obj
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_latest_update(id: str, db: Session = Depends(get_db)):
    try:
        update_obj = db.query(models.LatestUpdate).filter(models.LatestUpdate.id == id).first()
        if update_obj:
            db.delete(update_obj)
            db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
