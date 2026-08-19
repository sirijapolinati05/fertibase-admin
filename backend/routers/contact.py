from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

class ContactMessageCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    message: str

@router.post("/")
def create_contact_message(message: ContactMessageCreate, db: Session = Depends(get_db)):
    try:
        new_msg = models.ContactMessage(
            name=message.full_name,
            email=message.email,
            subject=message.phone, # reusing subject as phone
            message=message.message
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
        return {"success": True, "message": "Message saved successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
