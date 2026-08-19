import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from datetime import datetime
from config import settings

def send_email(to_addresses, subject, html_content):
    if not to_addresses:
        return

    if not isinstance(to_addresses, list):
        to_addresses = [to_addresses]
    
    # Remove empty or invalid addresses
    to_addresses = [addr.strip() for addr in to_addresses if addr and isinstance(addr, str)]
    if not to_addresses:
        return
        
    email_user = settings.EMAIL_USER
    email_pass = settings.EMAIL_PASS
    
    if not email_user or not email_pass:
        print("❌ Error: EMAIL_USER or EMAIL_PASS not set in .env.")
        return

    print(f"🔄 Attempting to send email via Google SMTP: '{subject}' to {to_addresses}")

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Fertibase Admin <{email_user}>"
        msg['To'] = ", ".join(to_addresses)
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(msg)
            
        print(f"🚀 Successfully sent via Google SMTP!")
            
    except Exception as e:
        print(f"❌ Failed to send email via SMTP: {e}")


def get_date_str():
    return datetime.now().strftime("%B %d, %Y")

def format_time(t_str):
    try:
        dt = datetime.strptime(t_str, "%H:%M:%S")
    except:
        try:
            dt = datetime.strptime(t_str, "%H:%M")
        except:
            return t_str
    return dt.strftime("%I:%M %p")

def format_date(d_str):
    try:
        dt = datetime.strptime(d_str, "%Y-%m-%d")
        return dt.strftime("%A, %B %d, %Y")
    except:
        return d_str

# ─── Applications ─────────────────────────────────────────────────────────────

def send_application_status_update(applicant, job, new_status):
    status_configs = {
        'applied': {
            'message': 'We have successfully received your application. Our recruitment team is currently reviewing your profile.',
            'status_label': 'Applied'
        },
        'shortlisted': {
            'message': 'Great news! Your profile has been shortlisted for the next stage. We will reach out shortly to schedule your first round.',
            'status_label': 'Shortlisted'
        },
        'tr1': {
            'message': 'We are moving forward with your profile for the first Technical Round. Good luck!',
            'status_label': 'Technical Round 1'
        },
        'tr2': {
            'message': 'You have successfully cleared the previous round! We are scheduling your second Technical Round.',
            'status_label': 'Technical Round 2'
        },
        'final': {
            'message': 'Congratulations on reaching the final round of our selection process. We look forward to our conversation.',
            'status_label': 'Final Round Selection'
        },
        'rejected': {
            'message': 'Thank you for your interest in joining us. After careful consideration, we have decided to move forward with other candidates at this time.',
            'status_label': 'Not Selected'
        }
    }

    config = status_configs.get(new_status)
    if not config: return

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <p>Dear {applicant.get('full_name', '')},</p>
        <p>{config['message']}</p>
        <p><strong>Application Details:</strong><br>
        • Position: {job.get('title', '')}<br>
        • Current Status: {config['status_label']}</p>
        <p>Best regards,<br>
        Human Resources<br>
        Fertibase</p>
    </body>
    </html>
    """
    send_email(
        applicant.get('email'),
        f"Update on your Application | Fertibase",
        html
    )

def send_interview_scheduled_email(applicant, job, details):
    start_time_raw = details.get('start_time', '')
    try:
        dt = datetime.fromisoformat(start_time_raw.replace('Z', '+00:00'))
        date_str = dt.strftime("%A, %B %d, %Y")
        time_str = dt.strftime("%I:%M %p")
    except:
        date_str = start_time_raw
        time_str = ""

    notes_section = f"<p><strong>Notes from Recruiter:</strong><br>{details.get('notes')}</p>" if details.get('notes') else ""
    meeting_section = f"""
        <p><strong>Meeting Link:</strong><br>
        <a href="{details.get('meeting_link', '')}" style="display: inline-block; padding: 10px 20px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Join Google Meet</a></p>
    """ if details.get('meeting_link') else "<p>Our recruitment team will share the meeting link separately.</p>"

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <p>Dear {applicant.get('full_name', '')},</p>
        <p>We are pleased to inform you that we have scheduled an interview regarding your application for the {job.get('title', '')} position. Please find the session details below:</p>
        <p><strong>Interview Details:</strong><br>
        • Date: {date_str}<br>
        • Time: {time_str} ({details.get('timezone', '')})<br>
        • Duration: {details.get('duration', '')} Minutes</p>
        {meeting_section}
        {notes_section}
        <p>Please ensure you are in a quiet environment with a stable internet connection.</p>
        <p>Best regards,<br>
        Human Resources<br>
        Fertibase</p>
    </body>
    </html>
    """
    send_email(
        applicant.get('email'),
        f"Interview Scheduled: {job.get('title', '')} | Fertibase",
        html
    )

def send_hiring_email(applicant, job, offer_letter_url):
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="background-color: #2563EB; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Congratulations!</h1>
                <p style="color: #dbeafe; margin-top: 8px; font-size: 16px; font-weight: 500;">You've been selected for {job.get('title')}</p>
            </div>
            
            <div style="padding: 40px; background-color: #ffffff;">
                <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>{applicant.get('full_name')}</strong>,</p>
                
                <p style="margin-bottom: 20px;">We are thrilled to formally offer you the position of <strong>{job.get('title')}</strong> at <strong>Fertibase</strong>. Our team was deeply impressed by your skills and experience throughout the selection process.</p>
                
                <p style="margin-bottom: 30px;">We believe your expertise will be a significant asset to our mission, and we look forward to the innovative contributions you will bring to our organization.</p>
                
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #1e40af; font-weight: 600; text-transform: uppercase; tracking: 0.05em;">Your Offer Letter is Ready</p>
                    <a href="{offer_letter_url}" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">Download Offer Letter</a>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">Please review, sign, and return the document at your earliest convenience.</p>
                </div>
                
                <p style="margin-bottom: 24px;">If you have any questions regarding the terms of this offer, please feel free to reach out to our HR department directly.</p>
                
                <p style="margin: 0; color: #64748b; font-size: 14px;">Welcome to the family!</p>
                <p style="margin: 4px 0 0 0; font-weight: 700; color: #1e293b;">The Recruitment Team</p>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">Fertibase</p>
            </div>
            
            <div style="padding: 20px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">&copy; {datetime.now().year} Fertibase. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    send_email(
        applicant.get('email'),
        f"Job Offer: {job.get('title')} | Fertibase",
        html
    )

def send_otp_email(email: str, otp_code: str):
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
            <h2 style="color: #6B412E; text-align: center;">Verify Your Email</h2>
            <p>Hello,</p>
            <p>Thank you for initiating your application with Fertibase. Please use the following 6-digit code to verify your email address:</p>
            <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; background-color: #E8D5C9; color: #4A2E1F; border-radius: 8px; letter-spacing: 5px;">{otp_code}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #777; border-top: 1px solid #ddd; padding-top: 20px;">
                Best regards,<br>
                Fertibase Recruitment Team
            </p>
        </div>
    </body>
    </html>
    """
    send_email(email, "Your Verification Code | Fertibase", html)

