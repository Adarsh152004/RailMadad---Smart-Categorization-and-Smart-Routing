# 🚆 RailMadad

RailMadad is a premium, AI-powered railway grievance management system designed to streamline the reporting and resolution of passenger complaints.

## 🚀 Vision
To revolutionize the Indian Railways grievance redressal system by providing a high-performance, intelligent, and user-friendly platform that ensures every passenger concern is heard and routed to the correct department instantly.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.2 (Bleeding Edge)
- **Styling**: Tailwind CSS 4 + Framer Motion (Glassmorphic UI)
- **Icons**: Lucide React
- **Charts**: Recharts (for Analytics)
- **State/API**: Axios + React Toastify

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **AI Engine**: CLIP (Contrastive Language-Image Pre-training) via `sentence-transformers`
- **Database**: Supabase (PostgreSQL + Storage) + **Local JSON Failover**

## ✨ Key Features
- **🤖 AI-Driven Categorization**: Automatically routes grievances (text or image) to departments like EnHM, Electrical, Mechanical, Catering, or Security.
- **💎 Glassmorphic Design**: A premium, modern UI with smooth micro-animations.
- **💾 Local Failover Mode**: If your internet or DNS fails to reach Supabase, the system automatically saves complaints locally so no data is lost.
- **📊 Analytics Dashboard**: Comprehensive view for administrators to track complaint status.

## 🏁 Getting Started

### 1. Backend Setup
1. `cd backend`
2. Activate:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server:
   ```bash
   python -u main.py
   ```

### 2. Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run development server:
   ```bash
   npx next dev --webpack
   ```

---

## 🛠️ Troubleshooting & Fixes

### 🌐 "Submission Failed: getaddrinfo failed" (DNS Fix)
If you see this error, your system cannot resolve the Supabase domain. This is common with some ISP settings.
**Fix**: Change your system DNS to Google DNS:
1. Open **Settings** > **Network & Internet** > **Status**.
2. Click **Change adapter options**.
3. Right-click your connection > **Properties**.
4. Select **IPv4** > **Properties**.
5. Set **Preferred DNS server**: `8.8.8.8` and **Alternate**: `8.8.4.4`.

### 💾 Local Failover Mode
We have implemented a **Local Failover System**. If the connection to Supabase fails:
- Complaints are saved to `backend/complaints_local.json`.
- The dashboard will merge these local records with any successfully fetched cloud records.
- You will see a status **"Saved Locally (Sync Pending)"** on successful submission.

### 📦 "Module not found: framer-motion"
Ensure you are using `framer-motion@11`. Version 12 has known resolution issues with the current experimental Next.js setup.

