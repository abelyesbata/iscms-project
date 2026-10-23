# Integrated School Community Management System (ISCMS)

A comprehensive web-based school management system for **Wachemo Community Excellency School**, Ethiopia.

## 📋 Overview

ISCMS is a full-stack web application that digitizes school management operations including student enrollment, attendance tracking, grade management, fee collection, and parent-teacher communication.

### Built by
- Asser Sedet (WCU1501722)
- Adinew Tesfaye (WCU1502030)
- Abel Yesfa (WCU1500594)
- Kibru Tesfaye (WCU1501035)

**Advisor:** Mrs. Biruk
**Institution:** Wachemo University, Department of Computer Science
**Year:** 2026

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Frontend** | React + Vite |
| **Styling** | Tailwind CSS |
| **Auth** | JWT + bcrypt |
| **API Testing** | curl / Postman |

## 👥 User Roles

1. **Admin** — Full system control
2. **Teacher** — Attendance, grades, resources, announcements
3. **Student** — View grades, attendance, download resources
4. **Parent** — View child's data, make payments
5. **Registrar** — Student approvals, academic rules, reports

## 🎯 Key Features

### Academic
- ✅ Student enrollment & approval
- ✅ Daily attendance tracking
- ✅ Grade management (assessments, terms)
- ✅ Learning resource sharing (PDFs, videos, links)
- ✅ Class management with teacher assignment

### Finance
- ✅ Fee payment deadlines
- ✅ **Ethiopian penalty rules** (100/300/500 Birr for 1/2/3 days late)
- ✅ Auto-block after 4 days
- ✅ Payment history & receipts

### Communication
- ✅ School-wide announcements
- ✅ Priority levels (normal/high/urgent)
- ✅ Real-time notifications

### Analytics
- ✅ Attendance reports
- ✅ Grade performance
- ✅ Finance summary
- ✅ Teacher performance

## 🛠️ Installation

### Backend Setup

```bash
cd backend
npm install
npm run dev
### Frontend Setup
cd web
npm install
npm run dev