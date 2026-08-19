from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random

from database import get_db
import models
from services.email_service import send_otp_email

router = APIRouter()

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str

class LoginRequest(BaseModel):
    emp_id: str
    password: str

class ChangePasswordRequest(BaseModel):
    emp_id: str
    current_password: str
    new_password: str


@router.post("/send-otp")
def send_otp(request: SendOtpRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        # Generate a 6 digit code
        otp_code = str(random.randint(100000, 999999))
        
        # Expire in 10 minutes
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        # Create record
        verification = models.EmailVerification(
            email=request.email,
            otp_code=otp_code,
            expires_at=expires_at,
            used=False
        )
        db.add(verification)
        db.commit()
        
        # Send email in background
        background_tasks.add_task(send_otp_email, request.email, otp_code)
        
        return {"success": True, "message": "Verification code sent successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-otp")
def verify_otp(request: VerifyOtpRequest, db: Session = Depends(get_db)):
    try:
        # Find the latest unused OTP for this email
        verification = db.query(models.EmailVerification).filter(
            models.EmailVerification.email == request.email,
            models.EmailVerification.used == False
        ).order_by(models.EmailVerification.created_at.desc()).first()
        
        if not verification:
            raise HTTPException(status_code=400, detail="No verification requested for this email.")
            
        if verification.otp_code != request.otp_code:
            raise HTTPException(status_code=400, detail="Invalid verification code.")
            
        if verification.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Verification code has expired.")
            
        # Mark as used
        verification.used = True
        db.commit()
        
        return {"success": True, "message": "Email verified successfully."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.AdminUser).filter(
            models.AdminUser.emp_id == request.emp_id,
            models.AdminUser.password == request.password
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        return {
            "success": True,
            "user": {
                "empId": user.emp_id,
                "name": user.name,
                "role": user.role,
                "image": user.image_url
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.AdminUser).filter(
            models.AdminUser.emp_id == request.emp_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.password != request.current_password:
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        user.password = request.new_password
        db.commit()

        return {"success": True, "message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

