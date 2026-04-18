import os
import uuid
import torch
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from PIL import Image
import io
from dotenv import load_dotenv
import requests
import smtplib
from email.message import EmailMessage

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: Supabase credentials not found in environment.")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Department Mapping based on user request
DEPARTMENTS = [
    {"name": "EnHM", "trigger": "Dirty coach, Toilets, Trash, Garbage, Waste, Smell, Cleaning required, Water on floor, Filthy washroom"},
    {"name": "Electrical", "trigger": "Fan not working, Light, AC cooling, Charging Socket, Switch, Electrical issue, Fuse, Heat in coach"},
    {"name": "Mechanical", "trigger": "Broken seats, Windows, Berths, Door, Middle berth, Upper berth, Lever, Rattle noise, Loose handle"},
    {"name": "Catering", "trigger": "Food quality, Pantry, Hygiene, Stale meal, Overcharging, Water bottle, Meal service, Bad taste, Rodent in pantry"},
    {"name": "Security", "trigger": "Theft, Harassment, RPF help, Unauthorized person, Fighting, Safety, Luggage stolen, Suspicious activity, Nuisance"},
    {"name": "Non-Rail Issue", "trigger": "Random image, nature, pet, landscape, person face, unrelated, meme, street, building, car, office, desk, computer, beach, mountain, sky, sunset"}
]

# Command Contact Matrix
DEPARTMENT_CONTACTS = {
    "Electrical": {"officer": "Vinit", "email": "vinit.praja689@gmail.com", "phone": "+911234567890", "color": "#2563eb"},
    "Catering": {"officer": "Hrishee", "email": "2303qkypkphrishee@viva-technology.org", "phone": "+911234567890", "color": "#ec4899"},
    "EnHM": {"officer": "Krishna", "email": "krishnaprajapati092006@gmail.com", "phone": "+917977236641", "color": "#f59e0b"},
    "Mechanical": {"officer": "Sarthak", "email": "capczvdwb12sarthak@viva-technology.org", "phone": "+911234567890", "color": "#6366f1"},
    "Security": {"officer": "Security Cell", "email": "krishnap8122@gmail.com", "phone": "+911234567890", "color": "#ef4444"},
    "Admin": {"officer": "Admin Central", "email": "krishnap8122@gmail.com", "phone": "+911234567890"}
}

# AI Resource Cache
model = None
dept_embeddings = None
dept_labels = [d["name"] for d in DEPARTMENTS]
dept_triggers = [d["trigger"] for d in DEPARTMENTS]

def get_ai_resources():
    global model, dept_embeddings
    if model is None:
        print("\n[AI INITIALIZATION] First-time model load triggered...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = SentenceTransformer('clip-ViT-B-32', device=device)
        print("[AI INITIALIZATION] Indexing Department Triggers...")
        dept_embeddings = model.encode(dept_triggers, convert_to_tensor=True)
        print("[AI INITIALIZATION] AI engine is ready.\n")
    return model, dept_embeddings

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "ai_ready": model is not None,
        "supabase_connected": supabase is not None
    }

import json
from datetime import datetime

LOCAL_COMPLAINTS_FILE = "complaints_local.json"

def save_local_complaint(data: dict):
    # Add timestamp for local records
    data["created_at"] = datetime.utcnow().isoformat()
    temp_file = LOCAL_COMPLAINTS_FILE + ".tmp"
    try:
        complaints = []
        if os.path.exists(LOCAL_COMPLAINTS_FILE):
            try:
                with open(LOCAL_COMPLAINTS_FILE, "r") as f:
                    complaints = json.load(f)
            except Exception:
                # If current file is corrupted, backup and start fresh
                print("[CRITICAL] Local complaints file corrupted. Starting fresh.")
                os.rename(LOCAL_COMPLAINTS_FILE, f"{LOCAL_COMPLAINTS_FILE}.bak")
        
        complaints.insert(0, data)
        # Atomic write pattern: Write to temp, then rename
        with open(temp_file, "w") as f:
            json.dump(complaints, f, indent=2)
        os.replace(temp_file, LOCAL_COMPLAINTS_FILE)
        print(f"[FAILOVER] Complaint {data['id']} persisted locally.")
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        print(f"[CRITICAL] Local Persistence Failure: {e}")

def get_local_complaints():
    if os.path.exists(LOCAL_COMPLAINTS_FILE):
        try:
            with open(LOCAL_COMPLAINTS_FILE, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def send_email_notification(subject: str, body: str, html_body: str = None, recipient_email: str = None):
    """
    Sends an email notification with automatic SMTP server detection and HTML support.
    """
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    admin_email = os.getenv("NOTIFY_EMAIL", "krishnap8122@gmail.com")
    
    # Send to both department head and admin
    target_recipients = [admin_email]
    if recipient_email and recipient_email != admin_email:
        target_recipients.append(recipient_email)

    if not email_user or not email_pass:
        print("[AI-ROUTER] Email credentials missing. Skipping notification.")
        return False

    smtp_server = "smtp.gmail.com"
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = email_user
    msg['To'] = ", ".join(target_recipients)
    msg.set_content(body)
    
    if html_body:
        msg.add_alternative(html_body, subtype='html')

    for port in [465, 587]:
        try:
            print(f"[MAIL] Attempting Port {port} via {smtp_server} to {msg['To']}...")
            if port == 465:
                with smtplib.SMTP_SSL(smtp_server, 465) as smtp:
                    smtp.login(email_user, email_pass)
                    smtp.send_message(msg)
            else:
                with smtplib.SMTP(smtp_server, 587, timeout=10) as smtp:
                    smtp.starttls()
                    smtp.login(email_user, email_pass)
                    smtp.send_message(msg)
            print(f"[AI-ROUTER] Notification sent successfully via Port {port}")
            return True
        except Exception as e:
            print(f"[MAIL] Port {port} Failed: {e}")

    return False

def send_whatsapp_notification(phone_number: str, message: str):
    """Simulated WhatsApp notification."""
    print(f"[WHATSAPP SIM] To {phone_number}: {message}")
    return True

@app.post("/submit-complaint")
async def submit_complaint(
    pnr: str = Form(""),
    train_number: str = Form(""),
    coach_number: str = Form(""),
    description: str = Form(""),
    phone_number: str = Form(""),
    image: UploadFile = File(None)
):
    print(f"--- Received complaint: PNR={pnr}, Train={train_number}")
    if not description and not image:
        raise HTTPException(status_code=400, detail="Either description or image is required.")

    # 1. AI Categorization (Lazy Load)
    try:
        current_model, current_embeddings = get_ai_resources()
    except Exception as e:
        print(f"[CRITICAL] AI Model Load Failed: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Engine Unavailable. Please try again in 60 seconds.")

    image_emb = None
    text_emb = None

    if image:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        image_emb = current_model.encode(img, convert_to_tensor=True)
    
    if description:
        text_emb = current_model.encode(description, convert_to_tensor=True)

    if image_emb is not None and text_emb is not None:
        final_emb = (image_emb + text_emb) / 2
    elif image_emb is not None:
        final_emb = image_emb
    else:
        final_emb = text_emb

    cos_scores = torch.nn.functional.cosine_similarity(final_emb.unsqueeze(0), current_embeddings)
    best_idx = torch.argmax(cos_scores).item()
    predicted_dept = dept_labels[best_idx]
    confidence = cos_scores[best_idx].item()
    print(f"[AI-ENGINE] Categorized as: {predicted_dept} (Confidence: {confidence:.2f})")

    if predicted_dept == "Non-Rail Issue" or confidence < 0.15:
        reason = "Non-Rail Category" if predicted_dept == "Non-Rail Issue" else f"Low Confidence ({confidence:.2f})"
        print(f"[AI-REJECTION] Grievance REJECTED. Reason: {reason}")
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Relevance Error",
                "message": "This content does not appear to be a railway grievance.",
                "reason": reason
            }
        )

    # 2. Persistence with Failover
    image_url = ""
    complaint_id = str(uuid.uuid4())
    data = {
        "id": complaint_id,
        "category": predicted_dept,
        "description": description,
        "pnr": pnr,
        "train_number": train_number,
        "coach_number": coach_number,
        "phone_number": phone_number,
        "image_url": image_url,
        "status": "Pending"
    }

    supabase_success = False
    if supabase:
        try:
            # Attempt Image Upload
            if image:
                image.file.seek(0)
                file_ext = image.filename.split(".")[-1]
                file_name = f"{uuid.uuid4()}.{file_ext}"
                supabase.storage.from_("evidence").upload(file_name, contents)
                data["image_url"] = supabase.storage.from_("evidence").get_public_url(file_name)

            # Attempt DB Save
            dept_res = supabase.table("departments").select("id").eq("name", predicted_dept).execute()
            data["department_id"] = dept_res.data[0]['id'] if dept_res.data else None
            
            supabase.table("complaints").insert(data).execute()
            print(f"[SUCCESS] Complaint {complaint_id} saved to Supabase.")
            supabase_success = True
        except Exception as e:
            print(f"[WARNING] Supabase Save Failed: {e}. Falling back to local storage.")

    if not supabase_success:
        save_local_complaint(data)

    # 3. Direct Notifications
    if phone_number:
        contact = DEPARTMENT_CONTACTS.get(predicted_dept, DEPARTMENT_CONTACTS["Security"])
        officer_name = contact["officer"]
        dept_email = contact["email"]
        dept_phone = contact["phone"]
        dept_color = contact["color"]
        short_id = complaint_id[:8].upper()

        print(f"[ROUTING-DEBUG] Dept: {predicted_dept} | Officer: {officer_name} | Phone: {dept_phone}")

        # 3a. Premium HTML Admin/Dept Email
        email_subject = f"🚨 [RAIL-ALERT] {predicted_dept} Cell Priority - Incident #RA-{short_id}"
        
        email_body_plain = f"URGENT: New {predicted_dept} grievance reported. ID: #RA-{short_id}. Action is required within 4 hours."
        
        html_body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 40px 20px;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, {dept_color} 0%, #1e293b 100%); color: white; padding: 40px; text-align: left;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; opacity: 0.8;">OFFICIAL GRIEVANCE ALERT</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; line-height: 1.2;">{predicted_dept} Priority Anomaly Detected</h1>
                    <div style="margin-top: 20px; display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 99px; border: 1px solid rgba(255,255,255,0.2);">
                        ID: #RA-{short_id}
                    </div>
                </div>
                
                <div style="padding: 40px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px; border-bottom: 1px solid #e2e8f0; padding-bottom: 25px;">
                        <div style="width: 100%;">
                            <h3 style="color: #64748b; font-size: 14px; text-transform: uppercase; margin: 0 0 10px;">Primary Responder</h3>
                            <p style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0;">Officer {officer_name}</p>
                        </div>
                    </div>

                    <div style="display: grid; gap: 20px; margin-bottom: 35px;">
                        <div style="background: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0;">
                            <h4 style="margin: 0 0 15px; font-size: 13px; color: #94a3b8; text-transform: uppercase;">Grievance Intelligence Summary</h4>
                            <table style="width: 100%; font-size: 16px; color: #1e293b;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b;">Train Number</td>
                                    <td style="padding: 6px 0; font-weight: 700; text-align: right;">{train_number}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b;">Coach Displacement</td>
                                    <td style="padding: 6px 0; font-weight: 700; text-align: right;">{coach_number}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b;">PNR Reference</td>
                                    <td style="padding: 6px 0; font-weight: 700; text-align: right;">{pnr or 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b;">AI Confidence</td>
                                    <td style="padding: 6px 0; font-weight: 700; text-align: right; color: {dept_color};">{int(confidence*100)}% Match</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div style="margin-bottom: 40px;">
                        <h4 style="margin: 0 0 10px; font-size: 13px; color: #94a3b8; text-transform: uppercase;">Citizen Description</h4>
                        <p style="font-size: 18px; color: #1e293b; line-height: 1.6; background-color: #fff9f0; padding: 20px; border-radius: 12px; border: 1px dashed #f59e0b; margin: 0;">
                            "{description or 'Passenger provided visual evidence without text description.'}"
                        </p>
                    </div>

                    
                </div>
                
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                        This is an automated intelligence dispatch from <strong>RailMadad Pro</strong>.<br/>
                        Resolution SLA: <strong>&lt; 4 Hours</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        send_email_notification(
            subject=email_subject, 
            body=email_body_plain, 
            html_body=html_body, 
            recipient_email=dept_email
        )

        # 3b. Structured Officer WhatsApp Alert
        officer_msg = (
            f"🚉 *RAILMADAD OFFICIAL ALERT* 🚨\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🔹 *ID:* #RA-{short_id}\n"
            f"🔹 *DEPT:* *{predicted_dept.upper()}*\n"
            f"🔹 *OFFICER:* Officer {officer_name}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📍 *LOCALIZATION:*\n"
            f"• Train: {train_number}\n"
            f"• Coach: {coach_number}\n"
            f"• PNR: {pnr or 'N/A'}\n\n"
            f"💡 *AI SUMMARY:*\n"
            f"\"{description[:160] + '...' if len(description) > 160 else description}\"\n\n"
            f"🚀 *ACTION REQUIRED:* Login to Command Center to resolve.\n"
            f"🔗 http://localhost:3000"
        )
        send_whatsapp_notification(dept_phone, officer_msg)

        # 3c. Formatted Passenger Acknowledgment
        passenger_msg = (
            f"🚉 *RAILMADAD ASSIST* ✅\n\n"
            f"Namaste, your grievance (#RA-{short_id}) has been professionally routed to the *Officer in Charge ({officer_name})* of the {predicted_dept} Technical Cell.\n\n"
            f"🕒 *Target Resolution:* Within 4 Hours\n"
            f"📱 *Tracking Status:* Live at Command Portal\n\n"
            f"We are committed to making your journey comfortable."
        )
        send_whatsapp_notification(phone_number, passenger_msg)

        print(f"[AUTO-NOTIFY] Premium alerts routed to {officer_name} and Admin.")

    return {
        "complaint_id": complaint_id,
        "category": predicted_dept,
        "confidence": round(float(confidence), 2),
        "status": ("Synchronized" if supabase_success else "Saved Locally (Sync Pending)"),
        "image_url": data["image_url"]
    }

@app.get("/complaints")
async def get_complaints():
    all_complaints = get_local_complaints()
    
    if supabase:
        try:
            res = supabase.table("complaints").select("*, departments(*)").order("created_at", desc=True).execute()
            # Merge (Local records first for immediate feedback)
            return all_complaints + res.data
        except Exception as e:
            print(f"[WARNING] Supabase Fetch Failed: {e}. Returning local records only.")
            try:
                res = supabase.table("complaints").select("*").order("created_at", desc=True).execute()
                return all_complaints + res.data
            except:
                pass
    
    return all_complaints

@app.get("/")
def read_root():
    return {"message": "RailAssist Pro API is running."}

@app.patch("/complaints/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str):
    print(f"--- Resolving complaint: {complaint_id}")
    
    # 1. Update Supabase
    success = False
    if supabase:
        try:
            supabase.table("complaints").update({"status": "Resolved"}).eq("id", complaint_id).execute()
            print(f"[SUCCESS] Complaint {complaint_id} marked as Resolved in Supabase.")
            success = True
        except Exception as e:
            print(f"[WARNING] Supabase Update Failed: {e}")

    # 2. Update Local File (for consistency)
    try:
        if os.path.exists(LOCAL_COMPLAINTS_FILE):
            with open(LOCAL_COMPLAINTS_FILE, "r") as f:
                complaints = json.load(f)
            
            for c in complaints:
                if c["id"] == complaint_id:
                    c["status"] = "Resolved"
                    break
            
            with open(LOCAL_COMPLAINTS_FILE, "w") as f:
                json.dump(complaints, f, indent=2)
            print(f"[SUCCESS] Complaint {complaint_id} marked as Resolved locally.")
            if not success: success = True # Treat local success as sufficient for UI
    except Exception as e:
        print(f"[ERROR] Local Update Failed: {e}")

    if not success:
        raise HTTPException(status_code=500, detail="Failed to update complaint status.")
    
    return {"message": "Complaint resolved successfully", "id": complaint_id}

if __name__ == "__main__":
    import uvicorn
    # Final check before startup
    print("\n" + "="*50)
    print("🚀 RAILASSIST PRO BACKEND STARTUP")
    print("="*50)
    print(f"📡 API Version: 1.2.0 (Resolved Route Active)")
    print(f"📧 SMTP Service: {'Configured' if os.getenv('EMAIL_USER') else 'MISSING'}")
    print(f"🗄️  Supabase: {'Connected' if supabase else 'OFFLINE'}")
    print("="*50 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
