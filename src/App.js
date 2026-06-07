import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;


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

export default function App() {
  const [jd, setJd] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState("why");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

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

      const prompt = `You are HireFlow AI, an expert recruiter. Analyze these resumes against the job description.

JOB DESCRIPTION:
${jd}

RESUMES:
${resumeTexts.join("\n\n")}

Return ONLY a JSON object (no markdown, no backticks) with this structure:
{
  "summary": { "total": number, "strongFit": number, "avgScore": number },
  "candidates": [
    {
      "name": "candidate name or filename",
      "score": number 0-100,
      "rank": number,
      "headline": "their current role",
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
Sort by score descending. Be specific. Score rigorously.`;

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
      const raw = data.choices[0].message.content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setResults(parsed);
      setSelected(0);
      setTab("why");
    } catch (e) {
      setError("Analysis failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const c = results?.candidates?.[selected];

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", maxWidth: 900, margin: "0 auto", padding: "24px 16px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ width: 40, height: 40, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>HireFlow <span style={{ color: "#059669" }}>AI</span></div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Intelligent recruitment assistant · Microsoft Build AI Hackathon</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 8 }}>📋 Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            style={{ width: "100%", minHeight: 160, resize: "vertical", fontFamily: "inherit", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 8 }}>👥 Candidate Resumes (PDF)</div>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[["📊", results.summary.total, "Resumes Analyzed"], ["⭐", results.summary.strongFit, "Strong Fits (70+)"], ["📈", results.summary.avgScore, "Average Score"]].map(([icon, val, label]) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{icon} {val}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>🏆 Candidate Rankings</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
            {results.candidates.map((cd, i) => (
              <div key={i} onClick={() => { setSelected(i); setTab("why"); }}
                style={{ background: "#fff", border: `${selected === i ? "2px solid #059669" : "1px solid #e2e8f0"}`, borderRadius: 10, padding: 14, cursor: "pointer" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${cd.rank}`}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{cd.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cd.headline}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, display: "flex", justifyContent: "space-between" }}><span>Match</span><span>{cd.score}%</span></div>
                <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${cd.score}%`, background: cd.score >= 70 ? "#059669" : cd.score >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {c && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Rank #{c.rank} of {results.candidates.length}</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#059669" }}>{c.score}<span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 400 }}>/100</span></div>
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