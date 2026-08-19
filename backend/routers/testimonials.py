from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
import uuid
import os
import aiofiles
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

async def save_upload_file(upload_file: UploadFile, folder: str = "uploads") -> str:
    try:
        if not upload_file.filename:
            return None
        file_ext = upload_file.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(folder, file_name)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
            
        return f"/static/{file_name}"
    except Exception as e:
        print(f"File upload error: {e}")
        return None

@router.get("/")
def get_testimonials(db: Session = Depends(get_db)):
    try:
        testimonials = db.query(models.Testimonial).order_by(models.Testimonial.created_at.desc()).all()
        return testimonials
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_testimonial(
    title: str = Form(...),
    name: str = Form(...),
    state: str = Form(...),
    description: str = Form(...),
    video_url: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        image_url = await save_upload_file(image) if image else None

        new_testimonial = models.Testimonial(
            title=title,
            name=name,
            state=state,
            description=description,
            video_url=video_url,
            image_url=image_url
        )

        db.add(new_testimonial)
        db.commit()
        db.refresh(new_testimonial)
        return new_testimonial
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
async def update_testimonial(
    id: str,
    title: str = Form(None),
    name: str = Form(None),
    state: str = Form(None),
    description: str = Form(None),
    video_url: str = Form(None),
    image_url: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == id).first()
        if not testimonial:
            raise HTTPException(status_code=404, detail="Testimonial not found")

        if image and image.filename:
            new_image_url = await save_upload_file(image)
            if new_image_url:
                image_url = new_image_url

        if title is not None: testimonial.title = title
        if name is not None: testimonial.name = name
        if state is not None: testimonial.state = state
        if description is not None: testimonial.description = description
        if video_url is not None: testimonial.video_url = video_url
        if image_url is not None: testimonial.image_url = image_url

        db.commit()
        db.refresh(testimonial)
        return testimonial
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_testimonial(id: str, db: Session = Depends(get_db)):
    try:
        testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == id).first()
        if testimonial:
            db.delete(testimonial)
            db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
