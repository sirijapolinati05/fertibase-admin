from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional
import uuid
import json
import os
import aiofiles
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

def safe_parse_array(val):
    if not val: return "[]"
    if isinstance(val, list): return json.dumps(val)
    arr = [v.strip() for v in val.split("\n") if v.strip()]
    return json.dumps(arr)

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
            
        # Return the public URL path
        return f"/static/{file_name}"
    except Exception as e:
        print(f"File upload error: {e}")
        return None

@router.get("/")
def get_products(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    try:
        products = db.query(models.Product).offset(offset).limit(limit).all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
def get_product(id: str, db: Session = Depends(get_db)):
    try:
        product = db.query(models.Product).filter(models.Product.id == id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_product(
    name: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(""),
    description: str = Form(""),
    key_highlights: str = Form(""),
    crop_benefits: str = Form(""),
    product_advantages: str = Form(""),
    recommended_crops: str = Form(""),
    application_timing: str = Form(""),
    recommended_dosage: str = Form(""),
    application_details: str = Form(""),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        image_url = await save_upload_file(image) if image else None

        new_product = models.Product(
            name=name,
            category=category,
            sub_category=sub_category,
            description=description,
            key_highlights=safe_parse_array(key_highlights),
            crop_benefits=safe_parse_array(crop_benefits),
            product_advantages=safe_parse_array(product_advantages),
            recommended_crops=safe_parse_array(recommended_crops),
            application_timing=application_timing,
            recommended_dosage=recommended_dosage,
            application_details=application_details,
            image_url=image_url
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
async def update_product(
    id: str,
    name: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(""),
    description: str = Form(""),
    key_highlights: str = Form(""),
    crop_benefits: str = Form(""),
    product_advantages: str = Form(""),
    recommended_crops: str = Form(""),
    application_timing: str = Form(""),
    recommended_dosage: str = Form(""),
    application_details: str = Form(""),
    image_url: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        product = db.query(models.Product).filter(models.Product.id == id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if image and image.filename:
            new_image_url = await save_upload_file(image)
            if new_image_url:
                image_url = new_image_url

        product.name = name
        product.category = category
        product.sub_category = sub_category
        product.description = description
        product.key_highlights = safe_parse_array(key_highlights)
        product.crop_benefits = safe_parse_array(crop_benefits)
        product.product_advantages = safe_parse_array(product_advantages)
        product.recommended_crops = safe_parse_array(recommended_crops)
        product.application_timing = application_timing
        product.recommended_dosage = recommended_dosage
        product.application_details = application_details
        product.image_url = image_url

        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_product(id: str, db: Session = Depends(get_db)):
    try:
        product = db.query(models.Product).filter(models.Product.id == id).first()
        if product:
            db.delete(product)
            db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
