import os
from config import settings
import httpx
import json
from pypdf import PdfReader
from docx import Document
from io import BytesIO
from openai import OpenAI
from typing import Dict, Any, Optional

# Global client variable
_client = None

def get_openai_client():
    """Lazy initialization of the OpenAI client."""
    global _client
    if _client is None:
        if not settings.OPENAI_API_KEY:
            raise Exception("OPENAI_API_KEY not found in environment variables")
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

async def extract_text_from_url(url: str) -> str:
    """Downloads a file from a URL and extracts its text."""
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.get(url)
            if response.status_code != 200:
                return f"Failed to download file from {url}"
            
            content = response.content
            # Simple way to check extension or content type
            if 'pdf' in url.lower() or response.headers.get('content-type') == 'application/pdf':
                pdf = PdfReader(BytesIO(content))
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
                return text
            elif 'docx' in url.lower():
                doc = Document(BytesIO(content))
                return "\n".join([para.text for para in doc.paragraphs])
            else:
                return content.decode('utf-8', errors='ignore')
        except Exception as e:
            return f"Extraction error: {str(e)}"

async def analyze_resume(resume_text: str, jd_text: str, job_skills: str) -> Dict[str, Any]:
    """Uses OpenAI to score a resume against a JD."""
    if not resume_text or len(resume_text.strip()) < 50:
        return {
            "score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "summary": "Resume text is too short or could not be extracted properly."
        }

    prompt = f"""
    You are an expert recruitment AI for Fertibase. Your task is to analyze a candidate's resume against a Job Description (JD).
    IMPORTANT: Do not mention any names in your summary. Always refer to the candidate as 'The candidate'.
    
    ### JOB DESCRIPTION:
    {jd_text}
    
    ### REQUIRED SKILLS:
    {job_skills}
    
    ### CANDIDATE RESUME:
    {resume_text}
    
    ---
    ### INSTRUCTIONS:
    1. Provide a match score from 0 to 100 based on how well the candidate fits the role. Be objective and strict.
    2. Identify "Matching Skills" found in the resume that align with the JD.
    3. Identify "Missing Skills" that the JD requires but are missing or weak in the resume.
    4. Provide a brief "Summary" (max 2-3 sentences) of why the candidate is a good or poor fit.
    
    Return the result ONLY as a valid JSON object with the following structure:
    {{
        "score": number,
        "matching_skills": ["skill1", "skill2"],
        "missing_skills": ["skill1", "skill2"],
        "summary": "string"
    }}
    """

    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Using 4o-mini for speed and cost efficiency
            messages=[
                {"role": "system", "content": "You are a professional recruitment assistant that outputs structured JSON analysis."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {
            "score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "summary": f"Error during analysis: {str(e)}"
        }

async def process_application_ai(app_id: str, resume_url: str, job_id: str, supabase_client):
    """Full background process: Fetch JD -> Extract Text -> Analyze -> Update DB."""
    try:
        print(f"--- Starting AI Analysis for App: {app_id} ---")
        # 1. Fetch Job Description
        job_response = supabase_client.table("jobs").select("*").eq("id", job_id).execute()
        if not job_response.data:
            print(f"Error: No job found with ID {job_id}")
            return
        
        job = job_response.data[0]
        jd_text = job.get("desc", "")
        job_skills = ", ".join(job.get("skills", []))

        if not jd_text:
            print(f"Warning: Job {job_id} has no description. AI cannot compare.")
            return

        # 2. Extract Resume Text
        print(f"Extracting text from: {resume_url}")
        resume_text = await extract_text_from_url(resume_url)

        # 3. Analyze with AI
        print("Calling OpenAI...")
        analysis = await analyze_resume(resume_text, jd_text, job_skills)
        print(f"Analysis complete. Score: {analysis.get('score')}")

        # 4. Update Application in DB
        print(f"Updating application {app_id} in database...")
        update_response = supabase_client.table("job_applications").update({
            "ai_score": analysis.get("score", 0),
            "ai_analysis": analysis
        }).eq("id", app_id).execute()
        
        if update_response.data:
            print(f"Successfully updated App {app_id} with score {analysis.get('score')}")
        else:
            print(f"Failed to update database for App {app_id}. Did you run the SQL migration?")

    except Exception as e:
        print(f"Error in process_application_ai: {str(e)}")
