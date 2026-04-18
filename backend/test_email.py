import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

def send_dummy_email():
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    notify_email = os.getenv("NOTIFY_EMAIL", "krishnap8122@gmail.com")

    print(f"DEBUG: Attempting to send from {email_user} to {notify_email}")
    print(f"DEBUG: Using password length: {len(email_pass) if email_pass else 0}")

    if not email_user or not email_pass:
        print("[ERROR] Credentials missing in .env")
        return

    try:
        msg = EmailMessage()
        msg.set_content("This is a dummy test email from RailAssist Pro system verification.")
        msg['Subject'] = "RailAssist Pro - SMTP Test"
        msg['From'] = email_user
        msg['To'] = notify_email

        # Try Port 465 (SSL)
        try:
            print("DEBUG: Trying SMTP_SSL on port 465...")
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                
                smtp.login(email_user, email_pass)
                smtp.send_message(msg)
            print("[SUCCESS] Email sent via port 465 (SSL)")
            return
        except Exception as e:
            print(f"DEBUG: Port 465 failed: {e}")

        # Try Port 587 (TLS)
        print("DEBUG: Trying SMTP on port 587 (TLS)...")
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(email_user, email_pass)
            smtp.send_message(msg)
        print("[SUCCESS] Email sent via port 587 (TLS)")

    except Exception as e:
        print(f"[FATAL] Email test failed: {e}")

if __name__ == "__main__":
    send_dummy_email()
