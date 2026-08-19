from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, BigInteger
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    name = Column(Text)
    category = Column(Text)
    sub_category = Column(Text)
    description = Column(Text)
    key_highlights = Column(Text)
    crop_benefits = Column(Text)
    product_advantages = Column(Text)
    recommended_crops = Column(Text)
    application_timing = Column(Text)
    recommended_dosage = Column(Text)
    application_details = Column(Text)
    image_url = Column(Text)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    title = Column(Text)
    category = Column(Text)
    type = Column(Text)
    mode = Column(Text)
    location = Column(Text)
    experience = Column(Text)
    description = Column(Text)
    responsibilities = Column(Text)
    requirements = Column(Text)
    skills = Column(Text)
    tools = Column(Text)
    short_preview = Column(Text)
    application_note = Column(Text)
    nice_to_have = Column(Text)
    days_left = Column(Text)
    salary_range = Column(Text)
    positions = Column(Text)
    role = Column(Text)
    key_skills = Column(Text)
    salary = Column(Text)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    title = Column(Text)
    name = Column(Text)
    state = Column(Text)
    description = Column(Text)
    video_url = Column(Text)
    image_url = Column(Text)
    image_src = Column(Text)
    area = Column(Text)

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(Text)
    email = Column(Text)
    phone = Column(Text)
    expected_salary = Column(Text)
    cover_note = Column(Text)
    resume_url = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    job_id = Column(Text) # we mapped this as text in SQL script
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    status_updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    current_company = Column(Text)
    experience_years = Column(Text)
    linkedin_url = Column(Text)
    highest_degree = Column(Text)
    professional_domain = Column(Text)
    languages_known = Column(Text)
    candidate_location = Column(Text)
    key_skills = Column(Text)
    referred_by = Column(Text)
    cover_letter = Column(Text)
    applicant_stage = Column(Text, default="applied")
    admin_note = Column(Text)

class LatestUpdate(Base):
    __tablename__ = "latest_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text)
    message = Column(Text)
    action_text = Column(Text)
    action_link = Column(Text)
    is_active = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(Text)
    title = Column(Text)
    description = Column(Text)
    detailed_description = Column(Text)
    material_type = Column(Text)
    image_url = Column(Text)
    video_url = Column(Text)
    file_url = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True))
    is_active = Column(Text)
    image_url_telugu = Column(Text)
    image_url_marathi = Column(Text)
    image_url_kannada = Column(Text)
    image_url_gujarati = Column(Text)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text)
    email = Column(Text)
    subject = Column(Text)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text)
    otp_code = Column(Text)
    expires_at = Column(DateTime(timezone=True))
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    emp_id = Column(Text, unique=True, index=True) # username
    password = Column(Text)
    name = Column(Text)
    role = Column(Text, default="admin")
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

