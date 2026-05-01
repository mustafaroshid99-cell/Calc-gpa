"use client";

import { useEffect, useState, useCallback } from "react";

// ─── GPA helpers ────────────────────────────────────────────────────────────
const getGP  = (m) => m >= 80 ? 5 : m >= 70 ? 4 : m >= 60 ? 3.5 : m >= 50 ? 3 : m >= 40 ? 2 : m >= 33 ? 1 : 0;
const getGrade = (g) => g === 5 ? "A+" : g >= 4 ? "A" : g >= 3.5 ? "A-" : g >= 3 ? "B" : g >= 2 ? "C" : g >= 1 ? "D" : "F";
const gradeColor = (g) => g === "A+" ? "#10b981" : g === "A" ? "#34d399" : g === "A-" ? "#6ee7b7"
  : g === "B" ? "#60a5fa" : g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

// ─── Styles ──────────────────────────────────────────────────────────────────
const getStyles = (dark) => ({
  // Tokens
  "--bg":       dark ? "#070d1a"     : "#f0f4ff",
  "--surface":  dark ? "#0e1729"     : "#ffffff",
  "--surface2": dark ? "#131f35"     : "#f8faff",
  "--border":   dark ? "#1e2d47"     : "#dde5f5",
  "--text":     dark ? "#e2eaf8"     : "#111827",
  "--text2":    dark ? "#8296b5"     : "#5a6a8a",
  "--accent":   dark ? "#4f78ff"     : "#3b5bff",
  "--accent2":  dark ? "#9b5cff"     : "#7c3aed",
  "--green":    dark ? "#10b981"     : "#059669",
  "--red":      dark ? "#ef4444"     : "#dc2626",
  "--yellow":   dark ? "#f59e0b"     : "#d97706",
});

// ─── Inject global CSS ───────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const t = getStyles(dark);
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      ${Object.entries(t).map(([k,v]) => `${k}: ${v};`).join("\n      ")}
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      transition: background 0.4s, color 0.4s;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    input, select {
      width: 100%;
      padding: 11px 14px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }
    input::placeholder { color: var(--text2); }

    button { cursor: pointer; font-family: 'DM Sans', sans-serif; }

    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--surface2);
      color: var(--text2);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }
    td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--surface2); }

    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes toastIn {
      from { transform: translateX(-50%) translateY(-12px); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

    @media print {
      .no-print { display: none !important; }
      body { background: white; color: black; }
    }
  `;
  return <style>{css}</style>;
};

// ─── Pill Button ─────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", style = {}, disabled }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "11px 20px", borderRadius: 12, border: "none",
    fontSize: 14, fontWeight: 600, transition: "all 0.18s", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, ...style,
  };
  const variants = {
    primary: { background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff",
      boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 30%, transparent)" },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1.5px solid var(--border)" },
    danger:  { background: "color-mix(in srgb, var(--red) 12%, transparent)", color: "var(--red)", border: "1.5px solid color-mix(in srgb, var(--red) 25%, transparent)" },
    ghost:   { background: "transparent", color: "var(--text2)", border: "none" },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, animate = false }) => (
  <div style={{
    background: "var(--surface)", border: "1.5px solid var(--border)",
    borderRadius: 20, padding: 24, animation: animate ? "slideUp 0.3s ease" : "none", ...style
  }}>
    {children}
  </div>
);

// ─── Stat tile ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, color }) => (
  <div style={{ background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "16px 20px", flex: 1 }}>
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne, sans-serif", color: color || "var(--accent)" }}>{value}</div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg }) => (
  <div style={{
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "var(--surface)", border: "1.5px solid var(--border)",
    color: "var(--text)", padding: "10px 20px", borderRadius: 40,
    fontSize: 14, fontWeight: 500, zIndex: 9999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)", animation: "toastIn 0.22s ease",
    whiteSpace: "nowrap",
  }}>{msg}</div>
);

// ─── Bottom Dock ──────────────────────────────────────────────────────────────
const Dock = ({ page, go, dark }) => {
  const tabs = [
    { id: "home",    icon: "⌂",  label: "Home"    },
    { id: "setup",   icon: "✦",  label: "New"     },
    { id: "app",     icon: "✎",  label: "Entry"   },
    { id: "summary", icon: "◈",  label: "Stats"   },
    { id: "merit",   icon: "⬡",  label: "Merit"   },
  ];
  return (
    <div className="no-print" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 4, padding: "8px 10px", borderRadius: 24,
      background: dark ? "rgba(14,23,41,0.85)" : "rgba(255,255,255,0.9)",
      border: "1.5px solid var(--border)", backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 1000,
    }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "8px 14px", borderRadius: 16, border: "none",
            background: active ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "transparent",
            color: active ? "#fff" : "var(--text2)",
            fontSize: 18, transition: "all 0.18s", minWidth: 52,
          }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [page, setPage]   = useState("home");
  const [anim, setAnim]   = useState(false);
  const [dark, setDark]   = useState(true);
  const [projects, setProjects] = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  const [examName, setExamName]       = useState("");
  const [subjectCount, setSubjectCount] = useState("");
  const [name, setName]   = useState("");
  const [roll, setRoll]   = useState("");
  const [marks, setMarks] = useState([]);

  const [viewStudent, setViewStudent] = useState(null);
  const [searchRoll, setSearchRoll]   = useState("");
  const [toast, setToast] = useState("");

  // Load from localStorage
  useEffect(() => {
    const p = localStorage.getItem("gpa_projects");
    if (p) setProjects(JSON.parse(p));
    const d = localStorage.getItem("gpa_dark");
    if (d !== null) setDark(JSON.parse(d));
  }, []);

  useEffect(() => { localStorage.setItem("gpa_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("gpa_dark", JSON.stringify(dark)); }, [dark]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const go = useCallback((p) => {
    setAnim(true);
    setTimeout(() => { setPage(p); setAnim(false); }, 200);
  }, []);

  const activeProject = projects[activeProjectIndex] ?? null;

  const createProject = () => {
    if (!examName.trim() || !subjectCount) return showToast("⚠ Fill all fields");
    const n = Number(subjectCount);
    if (n < 1 || n > 20) return showToast("⚠ Subjects: 1–20");
    const np = { id: Date.now(), examName: examName.trim(), subjectCount: n, students: [] };
    const updated = [...projects, np];
    setProjects(updated);
    setActiveProjectIndex(updated.length - 1);
    setMarks(Array(n).fill(""));
    setExamName(""); setSubjectCount("");
    go("app");
    showToast("✓ Project created");
  };

  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects(projects.filter(p => p.id !== id));
    showToast("🗑 Deleted");
  };

  const updateMark = (i, v) => {
    if (v === "") { const c = [...marks]; c[i] = ""; setMarks(c); return; }
    if (Number(v) > 100 || Number(v) < 0) return showToast("⚠ Marks: 0–100");
    const c = [...marks]; c[i] = v; setMarks(c);
  };

  const addStudent = () => {
    if (!activeProject) return;
    if (!name.trim() || !roll.trim()) return showToast("⚠ Name & Roll required");
    const nums = marks.map(Number);
    if (marks.some(m => m === "") || nums.some(isNaN)) return showToast("⚠ Fill all marks");
    const total = nums.reduce((a, b) => a + b, 0);
    const fail  = nums.some(m => m < 33);
    const avgGP = fail ? 0 : nums.reduce((a, b) => a + getGP(b), 0) / nums.length;
    const obj = { name: name.trim(), roll: roll.trim(), total,
      gpa: Number(avgGP.toFixed(2)), grade: getGrade(avgGP), status: fail ? "FAIL" : "PASS",
      subjectMarks: [...nums],
    };
    const updated = [...projects];
    const pr = { ...updated[activeProjectIndex], students: [...updated[activeProjectIndex].students] };
    const idx = pr.students.findIndex(s => s.roll === obj.roll);
    if (idx !== -1) {
      if (!window.confirm("Student exists. Update?")) return;
      pr.students[idx] = obj;
    } else {
      pr.students.push(obj);
    }
    updated[activeProjectIndex] = pr;
    setProjects(updated);
    setViewStudent(obj);
    setName(""); setRoll(""); setMarks(Array(activeProject.subjectCount).fill(""));
    showToast("✓ Saved");
  };

  const search = () => {
    const s = activeProject?.students.find(x => x.roll.toLowerCase() === searchRoll.trim().toLowerCase());
    if (!s) return showToast("✗ Not found");
    setViewStudent(s);
  };

  const merit = activeProject
    ? [...activeProject.students]
        .sort((a, b) => b.gpa - a.gpa || b.total - a.total || String(a.roll).localeCompare(String(b.roll)))
        .map((s, i) => ({ ...s, rank: i + 1 }))
    : [];

  const summaryStats = () => {
    if (!activeProject || !activeProject.students.length) return { pass: 0, fail: 0, rate: "0.00", avg: "0.00", total: 0 };
    const pass = activeProject.students.filter(s => s.status === "PASS").length;
    const fail = activeProject.students.length - pass;
    const avgGPA = (activeProject.students.reduce((a, s) => a + s.gpa, 0) / activeProject.students.length).toFixed(2);
    return { pass, fail, rate: ((pass / activeProject.students.length) * 100).toFixed(1), avg: avgGPA, total: activeProject.students.length };
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle dark={dark} />

      {toast && <Toast msg={toast} />}

      {/* Theme toggle */}
      <button className="no-print" onClick={() => setDark(!dark)} style={{
        position: "fixed", top: 20, right: 20, zIndex: 1000,
        width: 44, height: 44, borderRadius: "50%", border: "1.5px solid var(--border)",
        background: "var(--surface)", color: "var(--text)", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "all 0.2s",
      }}>
        {dark ? "☀" : "☾"}
      </button>

      {/* Main content */}
      <div style={{
        maxWidth: 520, margin: "0 auto", padding: "24px 16px 120px",
        opacity: anim ? 0 : 1, transform: anim ? "translateY(10px)" : "translateY(0)",
        transition: "opacity 0.2s, transform 0.2s",
      }}>

        {/* ── HOME ── */}
        {page === "home" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
                Academic Tool
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                GPA Manager
              </h1>
              <p style={{ color: "var(--text2)", fontSize: 15 }}>Track grades, calculate GPA, rank students</p>
            </div>

            {/* New project CTA */}
            <button onClick={() => go("setup")} style={{
              width: "100%", padding: "18px 24px", borderRadius: 18, border: "none",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 20,
              boxShadow: "0 8px 28px color-mix(in srgb, var(--accent) 35%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "Syne, sans-serif", transition: "transform 0.15s, box-shadow 0.15s",
            }}>
              <span style={{ fontSize: 20 }}>+</span> Create New Project
            </button>

            {/* Project list */}
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text2)", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                No projects yet. Create one above!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {projects.map((p, i) => (
                  <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}>
                    <div onClick={() => { setActiveProjectIndex(i); go("app"); }} style={{ flex: 1, cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "Syne, sans-serif", marginBottom: 4 }}>{p.examName}</div>
                      <div style={{ color: "var(--text2)", fontSize: 13 }}>
                        {p.students.length} student{p.students.length !== 1 ? "s" : ""} · {p.subjectCount} subject{p.subjectCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Btn variant="danger" onClick={() => deleteProject(p.id)} style={{ padding: "8px 12px", fontSize: 16 }}>🗑</Btn>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETUP ── */}
        {page === "setup" && (
          <Card animate>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>New Project</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Set up your exam and subjects</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                  Exam / Project Name
                </label>
                <input placeholder="e.g. Semester 1 Final" value={examName} onChange={e => setExamName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && document.getElementById("sub-input")?.focus()} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                  Number of Subjects
                </label>
                <input id="sub-input" type="number" placeholder="e.g. 6" value={subjectCount}
                  onChange={e => setSubjectCount(e.target.value)} min={1} max={20}
                  onKeyDown={e => e.key === "Enter" && createProject()} />
              </div>
              <Btn onClick={createProject} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
                Create Project →
              </Btn>
            </div>
          </Card>
        )}

        {/* ── APP (Entry) ── */}
        {page === "app" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            {!activeProject ? (
              <Card>
                <p style={{ color: "var(--text2)", textAlign: "center" }}>
                  No project selected. <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go("home")}>Go back home →</span>
                </p>
              </Card>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Active Project</div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800 }}>{activeProject.examName}</h2>
                  </div>
                  <div style={{ background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", fontSize: 13, color: "var(--text2)" }}>
                    {activeProject.students.length} students
                  </div>
                </div>

                <Card style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, fontFamily: "Syne, sans-serif" }}>Add / Update Student</div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <input placeholder="Student Name" value={name} onChange={e => setName(e.target.value)} />
                    <input placeholder="Roll No." value={roll} onChange={e => setRoll(e.target.value)} style={{ maxWidth: 120 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginBottom: 14 }}>
                    {marks.map((m, i) => (
                      <input key={i} type="number" value={m} placeholder={`Sub ${i + 1}`}
                        onChange={e => updateMark(i, e.target.value)} min={0} max={100} />
                    ))}
                  </div>
                  <Btn onClick={addStudent} style={{ width: "100%", justifyContent: "center" }}>
                    + Add Student
                  </Btn>
                </Card>

                {/* Search */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, fontFamily: "Syne, sans-serif" }}>Search Student</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input placeholder="Enter Roll No." value={searchRoll} onChange={e => setSearchRoll(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && search()} />
                    <Btn variant="secondary" onClick={search} style={{ whiteSpace: "nowrap" }}>Search</Btn>
                  </div>
                </Card>

                {/* Result card */}
                {viewStudent && (
                  <Card style={{ border: `1.5px solid color-mix(in srgb, ${gradeColor(viewStudent.grade)} 40%, transparent)`,
                    background: `color-mix(in srgb, ${gradeColor(viewStudent.grade)} 5%, var(--surface))` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800 }}>{viewStudent.name}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13 }}>Roll: {viewStudent.roll}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Syne, sans-serif", color: gradeColor(viewStudent.grade) }}>
                          {viewStudent.grade}
                        </div>
                        <div style={{ fontSize: 12, color: viewStudent.status === "PASS" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                          {viewStudent.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Stat label="GPA" value={viewStudent.gpa} color={gradeColor(viewStudent.grade)} />
                      <Stat label="Total Marks" value={viewStudent.total} />
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SUMMARY ── */}
        {page === "summary" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Summary</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>
              {activeProject ? activeProject.examName : "Select a project"}
            </p>
            {!activeProject || !activeProject.students.length ? (
              <Card><p style={{ color: "var(--text2)", textAlign: "center" }}>No data yet. Add students first.</p></Card>
            ) : (() => {
              const s = summaryStats();
              return (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <Stat label="Total" value={s.total} />
                    <Stat label="Pass Rate" value={`${s.rate}%`} color="var(--green)" />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <Stat label="Passed" value={s.pass} color="var(--green)" />
                    <Stat label="Failed" value={s.fail} color="var(--red)" />
                  </div>
                  <Stat label="Average GPA" value={s.avg} style={{ display: "flex", flexDirection: "column" }} />

                  {/* Grade distribution */}
                  <Card style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, fontFamily: "Syne, sans-serif" }}>Grade Distribution</div>
                    {["A+","A","A-","B","C","D","F"].map(g => {
                      const count = activeProject.students.filter(s => s.grade === g).length;
                      const pct = ((count / activeProject.students.length) * 100).toFixed(0);
                      return (
                        <div key={g} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: gradeColor(g) }}>{g}</span>
                            <span style={{ color: "var(--text2)" }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 4, background: "var(--border)" }}>
                            <div style={{ height: 6, borderRadius: 4, width: `${pct}%`, background: gradeColor(g), transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </>
              );
            })()}
          </div>
        )}

        {/* ── MERIT ── */}
        {page === "merit" && (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800 }}>Merit List</div>
                <p style={{ color: "var(--text2)", fontSize: 14 }}>{activeProject?.examName || "—"}</p>
              </div>
              <Btn variant="secondary" onClick={() => window.print()} style={{ gap: 6 }}>
                🖨 Print
              </Btn>
            </div>

            {!activeProject || merit.length === 0 ? (
              <Card><p style={{ color: "var(--text2)", textAlign: "center" }}>No students to display.</p></Card>
            ) : (
              <Card style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Roll</th>
                      <th>GPA</th>
                      <th>Grade</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merit.map(s => (
                      <tr key={s.roll}>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 26, height: 26, borderRadius: "50%", fontSize: 12, fontWeight: 700,
                            background: s.rank <= 3 ? ["#f59e0b","#94a3b8","#cd7c2f"][s.rank-1] : "var(--surface2)",
                            color: s.rank <= 3 ? "#fff" : "var(--text2)",
                          }}>
                            {s.rank}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: "var(--text2)" }}>{s.roll}</td>
                        <td style={{ fontWeight: 700, color: gradeColor(s.grade) }}>{s.gpa}</td>
                        <td>
                          <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: `color-mix(in srgb, ${gradeColor(s.grade)} 15%, transparent)`,
                            color: gradeColor(s.grade),
                          }}>{s.grade}</span>
                        </td>
                        <td>{s.total}</td>
                        <td>
                          <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: s.status === "PASS" ? "color-mix(in srgb, var(--green) 12%, transparent)" : "color-mix(in srgb, var(--red) 12%, transparent)",
                            color: s.status === "PASS" ? "var(--green)" : "var(--red)",
                          }}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dock page={page} go={go} dark={dark} />
    </>
  );
}
