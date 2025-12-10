# Degree Plan Assistant Documentation 

# Degree Plan Assistant Agent

## Overview
The **Degree Plan Assistant Agent** is an AI-powered academic planning tool designed to help AUI students build accurate degree plans, select courses, and validate prerequisites. It automates communication with peer mentors and FYE instructors, ensuring that plans meet catalog requirements before submission.

---

##  Purpose
AUI students often face difficulties navigating complex degree catalogs, tracking prerequisites, and receiving timely approval from advisors. This system simplifies academic planning through intelligent validation and streamlined approval workflows.

---

##  Users
- **Students:** Generate and validate their degree plans.
- **Peer Mentors:** Review plans and provide guidance.
- **FYE Instructors:** Grade pre-validated submissions for reflection and analysis.
- **Admins:** Manage catalogs, users, and workflows.

---

## 🧩 Core Features
- **AI Validation:** Uses university catalog and transcripts to check course eligibility.
- **Automated Workflows:** Integrates with n8n to notify mentors and instructors.
- **Interactive Planner:** Built with Next.js for real-time course selection.
- **Catalog Integration:** Automatically updates course and prerequisite data.
- **Role-Based Access:** Managed via NextAuth for secure user roles.

---

## Architecture
- **Frontend:** Next.js (TypeScript + Tailwind)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Automation:** n8n workflows
- **AI Layer:** LangChain + OpenAI API
- **Deployment:** Vercel (frontend), Render/AWS (backend), MongoDB Atlas

---

##Folder Structure
degree-plan-assistant/
│
├── frontend/ → Next.js app (UI + API)
├── backend/ → Express API + AI logic
├── n8n/ → Automation workflows
├── scripts/ → Data loaders (catalog, seeding)
└── docs/ → Documentation and progress reports

## 📚 Documentation Index

### Core Documentation
- **[README.md](./README.md)** - Project overview and architecture
- **[ROLES-ANALYSIS.md](./ROLES-ANALYSIS.md)** - User roles implementation and finalization guide
- **[ADMIN-ANALYTICS-DASHBOARD.md](./ADMIN-ANALYTICS-DASHBOARD.md)** - Admin analytics dashboard documentation

### Backend Documentation
- **[backend progress/AUTH-SUMMARY.md](./backend%20progress/AUTH-SUMMARY.md)** - Complete authentication system
- **[backend progress/authentication-progress.md](./backend%20progress/authentication-progress.md)** - Signup flow details
- **[backend progress/login-progress.md](./backend%20progress/login-progress.md)** - Login flow details

### Frontend Documentation
- **[UI&Frontend/SETUP-GUIDE.md](./UI&Frontend/SETUP-GUIDE.md)** - Frontend setup and configuration
- **[UI&Frontend/UI-progress.md](./UI&Frontend/UI-progress.md)** - UI/UX design progress
- **[UI&Frontend/home-experience.md](./UI&Frontend/home-experience.md)** - Authenticated home experience
- **[frontend progress/README.md](./frontend%20progress/README.md)** - Frontend implementation status

### Setup & Testing
- **[setup/README.md](./setup/README.md)** - Dependencies and environment setup
- **[test-and-bugs/README.md](./test-and-bugs/README.md)** - Known issues and testing notes