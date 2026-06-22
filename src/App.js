import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;

// ✅ SET YOUR USERNAME AND PASSWORD HERE
const VALID_USERNAME = "hireflow";
const VALID_PASSWORD = "microsoft2026";

async function pdfToText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(" ") + "\n";
  }
  return fullText;
}

function downloadExcel(candidates, rankView) {
  const top10 = [...candidates]
    .sort((a, b) => rankView === "experience" ? a.experienceRank - b.experienceRank : a.rank - b.rank)
    .slice(0, 10);

  const rows = top10.map((c, i) => ({
    "Rank": i + 1,
    "Name": c.name || "",
    "Phone": c.phone || "Not found",
    "Email": c.email || "Not found",
    "LinkedIn": c.linkedin || "Not found",
    "Years of Experience": c.yearsOfExperience || "",
    "Current Role": c.headline || "",
    "Estimated Salary": c.estimatedSalary || "Not estimated",
    "Salary Basis": c.salaryBasis || "",
    "Match Score": rankView === "experience" ? c.experienceScore : c.overallScore,
    "Overall Score": c.overallScore,
    "Experience Score": c.experienceScore,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 6 }, { wch: 25 }, { wch: 18 }, { wch: 30 },
    { wch: 35 }, { wch: 10 }, { wch: 30 }, { wch: 18 },
    { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 16 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Top 10 Candidates");
  XLSX.writeFile(wb, `HireFlow_Top10_${rankView === "experience" ? "ByExperience" : "ByOverallFit"}.xlsx`);
}

async function downloadResumes(candidates, files, rankView) {
  const top10Names = [...candidates]
    .sort((a, b) => rankView === "experience" ? a.experienceRank - b.experienceRank : a.rank - b.rank)
    .slice(0, 10)
    .map(c => c.name?.toLowerCase());

  const matchedFiles = files.filter(f =>
    top10Names.some(name => f.name.toLowerCase().includes(name?.split(" ")[0] || ""))
  );

  if (matchedFiles.length === 0) {
    alert("Could not match resume files. Please download manually.");
    return;
  }

  for (const file of matchedFiles) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    await new Promise(r => setTimeout(r, 300));
  }
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 16px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "#059669", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🎯</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>HireFlow <span style={{ color: "#34d399" }}>AI</span></div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Intelligent recruitment assistant</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Microsoft Build AI Hackathon 2026</div>
        </div>

        {/* Login Card */}
        <div style={{ background: "#1e293b", borderRadius: 16, padding: 32, border: "1px solid #334155" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Sign in to access HireFlow AI</div>

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter username"
              style={{ width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter password"
                style={{ width: "100%", padding: "10px 40px 10px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <span onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, color: "#64748b" }}>
                {showPass ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
              ❌ {error}
            </div>
          )}

          {/* Login Button */}
          <button onClick={handleLogin}
            style={{ width: "100%", padding: 12, background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Sign In →
          </button>

          {/* Hint */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#475569" }}>
            🔒 Authorized personnel only
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#334155" }}>
          © 2026 HireFlow AI · Microsoft Build AI Hackathon
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [jd, setJd] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("why");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [rankView, setRankView] = useState("experience");

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.name.endsWith(".pdf"));
    setFiles(prev => [...prev, ...pdfs.filter(f => !prev.find(p => p.name === f.name))]);
  };

  const analyze = async () => {
    if (!jd.trim()) { setError("Please paste a job description!"); return; }
    if (files.length === 0) { setError("Please upload at least one resume!"); return; }
    setError(""); setLoading(true); setResults(null);
    try {
      const resumeTexts = await Promise.all(files.map(async f => {
        const text = await pdfToText(f);
        return `--- RESUME: ${f.name} ---\n${text}`;
      }));

      const prompt = `You are HireFlow AI, an expert recruiter and compensation specialist. Analyze these resumes against the job description.

JOB DESCRIPTION:
${jd}

RESUMES:
${resumeTexts.join("\n\n")}

Return ONLY a valid JSON object (no markdown, no backticks, no extra text) with this exact structure:
{
  "summary": { 
    "total": number, 
    "strongFit": number, 
    "avgScore": number,
    "requiredExperience": "e.g. 4-6 years or Not specified"
  },
  "candidates": [
    {
      "name": "full name from resume",
      "email": "email from resume or null",
      "phone": "phone number from resume or null",
      "linkedin": "linkedin URL from resume or null",
      "overallScore": number 0-100,
      "experienceScore": number 0-100,
      "skillsScore": number 0-100,
      "yearsOfExperience": number,
      "rank": number,
      "experienceRank": number,
      "headline": "their current role and company",
      "estimatedSalary": "salary range e.g. ₹18-24 LPA",
      "salaryBasis": "one line explaining estimate e.g. Based on 5 yrs exp as Senior Engineer at product company in Bangalore with React+Node skills per 2024 India market rates",
      "whyRanked": [
        { "type": "pro", "text": "strength" },
        { "type": "con", "text": "weakness" }
      ],
      "interviewQuestions": ["q1", "q2", "q3", "q4", "q5"],
      "redFlags": [
        { "severity": "warn or danger or ok", "text": "observation" }
      ]
    }
  ]
}

IMPORTANT:
- Extract real email, phone, LinkedIn from each resume
- estimatedSalary: estimate current salary based on role, experience, skills, company, location. Use India LPA format.
- salaryBasis: explain reasoning in one line
- experienceRank: rank by years of experience matching JD
- rank: rank by overall skills and fit
- Return top 10 max, sort by overallScore descending`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4000,
          temperature: 0.3
        })
      });
      const data = await res.json();
      if (!data.choices || !data.choices[0]) throw new Error("API error: " + JSON.stringify(data));
      const raw = data.choices[0].message.content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setResults(parsed);
      setSelected(0);
      setTab("why");
      setRankView("experience");
    } catch (e) {
      setError("Analysis failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedCandidates = () => {
    if (!results) return [];
    const list = [...results.candidates].slice(0, 10);
    if (rankView === "experience") return list.sort((a, b) => a.experienceRank - b.experienceRank);
    return list.sort((a, b) => a.rank - b.rank);
  };

  const c = results?.candidates?.[selected];

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", maxWidth: 960, margin: "0 auto", padding: "24px 16px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>HireFlow <span style={{ color: "#059669" }}>AI</span></div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Intelligent recruitment assistant · Microsoft Build AI Hackathon</div>
          </div>
        </div>
        <button onClick={() => setLoggedIn(false)}
          style={{ padding: "6px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          🚪 Sign Out
        </button>
      </div>

      {/* Input */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 8 }}>📋 Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            style={{ width: "100%", minHeight: 160, resize: "vertical", fontFamily: "inherit", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 8 }}>👥 Candidate Resumes (PDF)</div>
          <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("fi").click()}
            style={{ border: `2px dashed ${drag ? "#059669" : "#cbd5e1"}`, borderRadius: 8, padding: 24, textAlign: "center", cursor: "pointer", background: drag ? "#f0fdf4" : "#f8fafc", marginBottom: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 13, color: "#64748b" }}><strong style={{ color: "#059669" }}>Click or drag</strong> PDF resumes here</div>
          </div>
          <input id="fi" type="file" multiple accept=".pdf" style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {files.map((f, i) => (
              <span key={i} style={{ background: "#f0fdf4", color: "#065f46", borderRadius: 20, padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                📄 {f.name.replace(".pdf", "")}
                <span onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.6 }}>✕</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button onClick={analyze} disabled={loading}
        style={{ width: "100%", padding: 14, background: loading ? "#94a3b8" : "#0f172a", color: "#a7f3d0", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {loading ? "⏳ Analyzing candidates..." : "✨ Analyze Candidates"}
      </button>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#991b1b", fontSize: 13, marginTop: 12 }}>{error}</div>}

      {results && (
        <div style={{ marginTop: 24 }}>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              ["📊", results.summary.total, "Resumes Analyzed"],
              ["⭐", results.summary.strongFit, "Strong Fits (70+)"],
              ["📈", results.summary.avgScore, "Average Score"],
              ["🕐", results.summary.requiredExperience, "Required Exp"]
            ].map(([icon, val, label]) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{icon} {val}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Rank Toggle + Download */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>🏆 Top 10 Candidates</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
                <button onClick={() => setRankView("experience")}
                  style={{ padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: rankView === "experience" ? "#0f172a" : "transparent", color: rankView === "experience" ? "#a7f3d0" : "#64748b" }}>
                  🕐 By Experience
                </button>
                <button onClick={() => setRankView("overall")}
                  style={{ padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: rankView === "overall" ? "#0f172a" : "transparent", color: rankView === "overall" ? "#a7f3d0" : "#64748b" }}>
                  ⭐ By Overall Fit
                </button>
              </div>
              <button onClick={() => downloadExcel(results.candidates, rankView)}
                style={{ padding: "6px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                📥 Download Excel
              </button>
              <button onClick={() => downloadResumes(results.candidates, files, rankView)}
                style={{ padding: "6px 14px", background: "#0f172a", color: "#a7f3d0", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                📄 Download Resumes
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{ background: rankView === "experience" ? "#eff6ff" : "#f0fdf4", border: `1px solid ${rankView === "experience" ? "#bfdbfe" : "#bbf7d0"}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: rankView === "experience" ? "#1e40af" : "#065f46", marginBottom: 12 }}>
            {rankView === "experience"
              ? `🕐 Ranked by years of experience matching the JD requirement (${results.summary.requiredExperience})`
              : "⭐ Ranked by overall skills, achievements, and job fit — experience years not weighted"}
          </div>

          {/* Candidate Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 10, marginBottom: 16 }}>
            {getSortedCandidates().map((cd, i) => {
              const score = rankView === "experience" ? cd.experienceScore : cd.overallScore;
              const originalIdx = results.candidates.indexOf(cd);
              return (
                <div key={i} onClick={() => { setSelected(originalIdx); setTab("why"); }}
                  style={{ background: "#fff", border: `${selected === originalIdx ? "2px solid #059669" : "1px solid #e2e8f0"}`, borderRadius: 10, padding: 14, cursor: "pointer" }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{cd.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cd.headline}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>⏱ {cd.yearsOfExperience} yrs exp</div>
                  {cd.estimatedSalary && <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 4 }}>💰 {cd.estimatedSalary}</div>}
                  {cd.email && <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>✉ {cd.email}</div>}
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                    <span>{rankView === "experience" ? "Exp Match" : "Overall"}</span><span>{score}%</span>
                  </div>
                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${score}%`, background: score >= 70 ? "#059669" : score >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {c && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{c.headline} · {c.yearsOfExperience} yrs exp</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                    {c.email && <span style={{ fontSize: 12, color: "#059669" }}>✉ {c.email}</span>}
                    {c.phone && <span style={{ fontSize: 12, color: "#059669" }}>📞 {c.phone}</span>}
                    {c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0284c7" }}>🔗 LinkedIn</a>}
                  </div>
                  {c.estimatedSalary && (
                    <div style={{ marginTop: 8, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>💰 Estimated Salary: {c.estimatedSalary}</span>
                      {c.salaryBasis && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.salaryBasis}</div>}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#059669" }}>{c.overallScore}<span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>/100</span></div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Overall · Exp: {c.experienceScore}/100</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["⭐ Overall Fit", c.overallScore], ["🕐 Experience", c.experienceScore], ["🛠 Skills", c.skillsScore]].map(([label, score]) => (
                  <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
                    <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${score}%`, background: score >= 70 ? "#059669" : score >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginTop: 4 }}>{score}%</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                {[["why", "💡 Why Ranked"], ["questions", "❓ Interview Qs"], ["flags", "🚩 Red Flags"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 600 : 400, color: tab === id ? "#059669" : "#64748b", borderBottom: tab === id ? "2px solid #059669" : "2px solid transparent" }}>
                    {label}
                  </button>
                ))}
              </div>

              {tab === "why" && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {c.whyRanked.map((r, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc", fontSize: 13, color: "#334155" }}>
                      <span>{r.type === "pro" ? "✅" : r.type === "con" ? "❌" : "⚠️"}</span>{r.text}
                    </li>
                  ))}
                </ul>
              )}
              {tab === "questions" && (
                <ol style={{ padding: "0 0 0 20px", margin: 0 }}>
                  {c.interviewQuestions.map((q, i) => (
                    <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc", fontSize: 13, color: "#334155" }}>{q}</li>
                  ))}
                </ol>
              )}
              {tab === "flags" && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {c.redFlags.map((f, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8, marginBottom: 6, fontSize: 13, background: f.severity === "danger" ? "#fef2f2" : f.severity === "ok" ? "#f0fdf4" : "#fffbeb", color: f.severity === "danger" ? "#991b1b" : f.severity === "ok" ? "#065f46" : "#92400e" }}>
                      <span>{f.severity === "danger" ? "🔴" : f.severity === "ok" ? "🟢" : "🟡"}</span>{f.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}