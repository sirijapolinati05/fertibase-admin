from fastapi import APIRouter, HTTPException, BackgroundTasks, File, UploadFile, Depends, Form
from pydantic import BaseModel
from typing import Optional
import uuid
import re
import os
import aiofiles
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from database import get_db, SessionLocal
import models

from services.email_service import send_application_status_update, send_interview_scheduled_email, send_hiring_email
from services.ai_service import process_application_ai

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

class InterviewSchedule(BaseModel):
    start_time: str
    duration: int
    timezone: str
    meeting_link: str
    notes: Optional[str] = None

@router.post("/apply")
async def apply_job(
    job_id: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    cover_note: str = Form(""),
    highest_degree: str = Form(None),
    professional_domain: str = Form(None),
    key_skills: str = Form(None),
    course: str = Form(None),
    domain: str = Form(None),
    skills: str = Form(None),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        print(f"DEBUG APPLICATION: job_id={job_id}, full_name={full_name}, email={email}, phone={phone}, highest_degree={highest_degree}, professional_domain={professional_domain}, key_skills={key_skills}, course={course}, domain={domain}, skills={skills}")
        
        file_ext = resume.filename.split('.')[-1]
        file_name = f"resume_{uuid.uuid4()}.{file_ext}"
        os.makedirs("uploads/resumes", exist_ok=True)
        file_path = os.path.join("uploads", "resumes", file_name)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await resume.read()
            await out_file.write(content)
            
        resume_url = f"/static/resumes/{file_name}"
        
        # Map frontend aliases if they used them instead
        final_degree = highest_degree or course
        final_domain = professional_domain or domain
        final_skills = key_skills or skills

        # The fertibase frontend concatenates all fields into cover_note!
        # We must parse it out if they weren't explicitly passed.
        if cover_note:
            for line in cover_note.split('\n'):
                line = line.strip()
                if line.startswith('Highest Course / Degree: ') and not final_degree:
                    final_degree = line.replace('Highest Course / Degree: ', '').strip()
                elif line.startswith('Professional Domain: ') and not final_domain:
                    final_domain = line.replace('Professional Domain: ', '').strip()
                elif line.startswith('Key Skills: ') and not final_skills:
                    final_skills = line.replace('Key Skills: ', '').strip()

        application = models.JobApplication(
            job_id=job_id,
            full_name=full_name,
            email=email,
            phone=phone,
            cover_note=cover_note,
            highest_degree=final_degree,
            professional_domain=final_domain,
            key_skills=final_skills,
            resume_url=resume_url
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        return {"success": True, "message": "Application submitted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_applications(
    status: Optional[str] = None,
    job_id: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    try:
        offset = (page - 1) * limit
        query = db.query(models.JobApplication)
        
        if status and status.lower() != 'all':
            query = query.filter(models.JobApplication.applicant_stage == status)
        if job_id:
            query = query.filter(models.JobApplication.job_id == job_id)
            
        total = query.count()
        applications = query.order_by(models.JobApplication.created_at.desc()).offset(offset).limit(limit).all()

        return {
            "success": True,
            "data": applications,
            "total": total,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{app_id}")
def get_application(app_id: str, db: Session = Depends(get_db)):
    try:
        application = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"success": True, "data": application}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{app_id}")
def update_application_status(
    app_id: str, 
    update: StatusUpdate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    valid_statuses = ['applied', 'shortlisted', 'tr1', 'tr2', 'final', 'rejected', 'hired']
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid values: {', '.join(valid_statuses)}")

    try:
        application = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get Job Title
        job = db.query(models.Job).filter(models.Job.id == application.job_id).first()
        job_title = job.title if job else 'Position'

        application.applicant_stage = update.status
        db.commit()
        db.refresh(application)

        applicant_email_data = {
            "full_name": application.full_name,
            "email": application.email
        }
        job_email_data = {"title": job_title}
        
        background_tasks.add_task(send_application_status_update, applicant_email_data, job_email_data, update.status)

        return {"success": True, "message": f"Status updated to {update.status}", "data": application}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{app_id}/schedule")
def schedule_interview(
    app_id: str,
    schedule: InterviewSchedule,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        application = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        job = db.query(models.Job).filter(models.Job.id == application.job_id).first()
        job_title = job.title if job else 'Position'
        
        interview_info = {
            "start_time": schedule.start_time,
            "duration": schedule.duration,
            "timezone": schedule.timezone,
            "meeting_link": schedule.meeting_link,
            "notes": schedule.notes,
            "scheduled_at": datetime.now(timezone.utc).isoformat()
        }
        
        # NOTE: This requires 'interview_details' JSON column on JobApplication model/DB
        if hasattr(application, 'interview_details'):
            import json
            application.interview_details = json.dumps(interview_info)
            db.commit()
            db.refresh(application)

        applicant_email_data = {
            "full_name": application.full_name,
            "email": application.email
        }
        job_email_data = {"title": job_title}
        
        background_tasks.add_task(send_interview_scheduled_email, applicant_email_data, job_email_data, interview_info)

        return {"success": True, "message": "Interview scheduled successfully", "data": application}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{app_id}/analyze")
def trigger_ai_analysis(
    app_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        application = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        resume_url = application.resume_url
        job_id = application.job_id
        
        if not resume_url:
            raise HTTPException(status_code=400, detail="No resume found for this application")
        
        # We don't pass supabase anymore, we'll fix ai_service to use SQLAlchemy
        background_tasks.add_task(process_application_ai, app_id, resume_url, job_id)
        
        return {"success": True, "message": "AI Analysis started in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{app_id}/hire")
async def hire_candidate(
    app_id: str,
    background_tasks: BackgroundTasks,
    offer_letter: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        application = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        job = db.query(models.Job).filter(models.Job.id == application.job_id).first()
        job_title = job.title if job else 'Position'
        
        file_ext = offer_letter.filename.split('.')[-1]
        file_name = f"offer_{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join("uploads", file_name)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await offer_letter.read()
            await out_file.write(content)
            
        offer_letter_url = f"/static/{file_name}"

        application.applicant_stage = "hired"
        if hasattr(application, 'offer_letter_url'):
            application.offer_letter_url = offer_letter_url
            
        db.commit()
        db.refresh(application)

        applicant_email_data = {
            "full_name": application.full_name,
            "email": application.email
        }
        job_email_data = {"title": job_title}
        
        background_tasks.add_task(send_hiring_email, applicant_email_data, job_email_data, offer_letter_url)

        return {
            "success": True, 
            "message": "Candidate hired and offer letter sent successfully", 
            "data": application
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
