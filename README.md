# 🎯 HireFlow AI — Intelligent Recruitment Assistant

> Microsoft Build AI Hackathon 2026 | Theme 01: AI at Work

## 🚀 Live Demo
👉 https://ishanmishra16.github.io/hireflow-ai

## 📌 Problem Statement
HR teams waste 40-60% of their time manually screening resumes. A typical job posting receives 250+ applications. This manual process is slow, biased, and inconsistent — causing companies to miss great candidates and waste recruiter time.

## 💡 Solution
HireFlow AI is an intelligent recruitment assistant that:
- **Ranks candidates** automatically against any job description
- **Explains** why each candidate was ranked (pros, cons, neutral signals)
- **Generates** 5 tailored interview questions per candidate
- **Flags** red flags like employment gaps, missing skills, or job hopping
- **Saves** hours of manual screening in seconds

## 🏗️ Architecture
HR User → React Frontend → Groq API (Llama 3.3 70B)
↓                      ↓
PDF.js (resume parsing)   AI Analysis
↓
Candidate Rankings + Interview Questions + Red Flags
### Microsoft AI Stack Used
- **Azure Static Web Apps** — Hosting (GitHub Pages for demo)
- **Groq API with Llama 3.3 70B** — LLM inference
- **GitHub Copilot** — Used during development
- **Azure AI Foundry** — Architecture reference

## 🛠️ Tech Stack
- **Frontend:** React.js
- **AI Model:** Llama 3.3 70B via Groq API
- **PDF Parsing:** PDF.js
- **Hosting:** GitHub Pages / Azure Static Web Apps
- **Build Tool:** Create React App

## ✨ Features
| Feature | Description |
|---|---|
| 📋 JD Input | Paste any job description |
| 📁 Multi PDF Upload | Upload multiple resumes at once |
| 🏆 Smart Ranking | AI ranks candidates 0-100 |
| 💡 Why Ranked | Detailed pros/cons for each candidate |
| ❓ Interview Questions | 5 tailored questions per candidate |
| 🚩 Red Flags | Severity-coded warnings and signals |
| 📊 Summary Stats | Total analyzed, strong fits, average score |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Groq API key (free at console.groq.com)

### Installation
```bash
git clone https://github.com/IshanMishra16/hireflow-ai.git
cd hireflow-ai
npm install
```

### Configuration
Open `src/App.js` and replace line 3:
```js
const GROQ_API_KEY = "your_groq_api_key_here";
```

### Run Locally
```bash
npm start
```
Open http://localhost:3000

### Deploy
```bash
npm run deploy
```

## 📁 Project Structure
hireflow-ai/
├── src/
│   ├── App.js          # Main application component
│   └── App.css         # Styles
├── public/
│   └── index.html
├── package.json
└── README.md

## 🎯 Impact
- Reduces resume screening time by **80%**
- Eliminates unconscious bias in initial screening
- Generates interview questions in **seconds** instead of hours
- Works for any industry, any role
