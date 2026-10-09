# 🚀 SkillBridge AI

> An intelligent, full-stack career readiness & skill acceleration platform built for students and early-career developers.

SkillBridge AI assesses self-reported skills, detects career gaps for specific tech roles, generates tailored step-by-step learning roadmaps, suggests practical portfolio projects, and validates project completions through verifiable GitHub proof of work.

---

## ✨ Features

- **🎯 Skill Assessment & Scoring**: Self-rate technical skills tailored to desired roles (e.g., Cybersecurity Analyst, Full Stack Developer, Data Scientist).
- **📊 Real-time Skill Gap Analysis**: Visual breakdown of strong skills, areas to improve, and missing critical prerequisites.
- **🗺️ Interactive Learning Roadmap**: Generated phase-by-phase learning modules with status tracking, estimated hours, and dynamic progress bar.
- **💼 Recommended Projects with Proof of Work**: Practical, hands-on portfolio projects with difficulty badges, tech stacks, implementation guides, and verifiable GitHub submission proof.
- **📚 Curated Resource Library**: Searchable and filterable tutorials, courses, and documentation links.
- **🏆 Goals, Streak, & Notifications**: Set weekly study targets, track activity, and receive achievement alerts.
- **🎨 Modern Dark Aesthetic**: Built with deep slate/indigo gradients, glassmorphism cards, and responsive layouts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Hot Toast
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Atlas cluster or local MongoDB instance)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update MONGODB_URI and JWT_SECRET in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
Backend API runs on `http://localhost:5000`.

---

## 📄 License
MIT
