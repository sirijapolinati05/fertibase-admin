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
def get_resources(db: Session = Depends(get_db)):
    try:
        resources = db.query(models.Resource).order_by(models.Resource.created_at.desc()).all()
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_resource(
    category: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    detailed_description: str = Form(""),
    material_type: str = Form(...),
    is_active: str = Form("true"),
    image: Optional[UploadFile] = File(None),
    video_url: str = Form(None),
    file: Optional[UploadFile] = File(None),
    image_telugu: Optional[UploadFile] = File(None),
    image_marathi: Optional[UploadFile] = File(None),
    image_kannada: Optional[UploadFile] = File(None),
    image_gujarati: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        image_url = await save_upload_file(image) if image else None
        file_url = await save_upload_file(file) if file else None
        
        img_te = await save_upload_file(image_telugu) if image_telugu else None
        img_mr = await save_upload_file(image_marathi) if image_marathi else None
        img_kn = await save_upload_file(image_kannada) if image_kannada else None
        img_gu = await save_upload_file(image_gujarati) if image_gujarati else None

        new_resource = models.Resource(
            category=category,
            title=title,
            description=description,
            detailed_description=detailed_description,
            material_type=material_type,
            image_url=image_url,
            video_url=video_url,
            file_url=file_url,
            is_active=is_active,
            image_url_telugu=img_te,
            image_url_marathi=img_mr,
            image_url_kannada=img_kn,
            image_url_gujarati=img_gu
        )

        db.add(new_resource)
        db.commit()
        db.refresh(new_resource)
        return new_resource
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
async def update_resource(
    id: str,
    category: str = Form(None),
    title: str = Form(None),
    description: str = Form(None),
    detailed_description: str = Form(None),
    material_type: str = Form(None),
    is_active: str = Form(None),
    image: Optional[UploadFile] = File(None),
    video_url: str = Form(None),
    file: Optional[UploadFile] = File(None),
    image_telugu: Optional[UploadFile] = File(None),
    image_marathi: Optional[UploadFile] = File(None),
    image_kannada: Optional[UploadFile] = File(None),
    image_gujarati: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        resource = db.query(models.Resource).filter(models.Resource.id == id).first()
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        if image:
            resource.image_url = await save_upload_file(image)
        if file:
            resource.file_url = await save_upload_file(file)
        if image_telugu:
            resource.image_url_telugu = await save_upload_file(image_telugu)
        if image_marathi:
            resource.image_url_marathi = await save_upload_file(image_marathi)
        if image_kannada:
            resource.image_url_kannada = await save_upload_file(image_kannada)
        if image_gujarati:
            resource.image_url_gujarati = await save_upload_file(image_gujarati)

        if category is not None: resource.category = category
        if title is not None: resource.title = title
        if description is not None: resource.description = description
        if detailed_description is not None: resource.detailed_description = detailed_description
        if material_type is not None: resource.material_type = material_type
        if video_url is not None: resource.video_url = video_url
        if is_active is not None: resource.is_active = is_active

        db.commit()
        db.refresh(resource)
        return resource
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_resource(id: str, db: Session = Depends(get_db)):
    try:
        resource = db.query(models.Resource).filter(models.Resource.id == id).first()
        if resource:
            db.delete(resource)
            db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
