"use client";

import { useEffect, useState } from "react";

export default function Home() { const [page, setPage] = useState("home"); const [anim, setAnim] = useState(false); const [dark, setDark] = useState(true);

const [examName, setExamName] = useState(""); const [subjectCount, setSubjectCount] = useState(""); const [students, setStudents] = useState([]);

const [name, setName] = useState(""); const [roll, setRoll] = useState(""); const [marks, setMarks] = useState([]); const [viewStudent, setViewStudent] = useState(null); const [searchRoll, setSearchRoll] = useState("");

const [toast, setToast] = useState("");

useEffect(() => { const s = localStorage.getItem("students"); if (s) setStudents(JSON.parse(s)); }, []);

useEffect(() => { localStorage.setItem("students", JSON.stringify(students)); }, [students]);

const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

const go = (p) => { setAnim(true); setTimeout(() => { setPage(p); setAnim(false); }, 220); };

const gp = (m) => (m >= 80 ? 5 : m >= 70 ? 4 : m >= 60 ? 3.5 : m >= 50 ? 3 : m >= 40 ? 2 : m >= 33 ? 1 : 0); const grade = (g) => (g === 5 ? "A+" : g >= 4 ? "A" : g >= 3.5 ? "A-" : g >= 3 ? "B" : g >= 2 ? "C" : g >= 1 ? "D" : "F");

const start = () => { if (!examName || !subjectCount) return showToast("Fill setup"); setMarks(Array(Number(subjectCount)).fill("")); go("app"); };

const updateMark = (i, v) => { if (v === "") return; if (Number(v) > 100 || Number(v) < 0) return showToast("Marks must be 0-100"); const c = [...marks]; c[i] = v; setMarks(c); };

const addStudent = () => { if (!name || !roll) return showToast("Name & Roll required");

const nums = marks.map(Number);
if (nums.some((m) => isNaN(m))) return showToast("Fill all marks");

const total = nums.reduce((a, b) => a + b, 0);
const fail = nums.some((m) => m < 33);
const gpa = fail ? 0 : nums.reduce((a, b) => a + gp(b), 0) / nums.length;

const obj = {
  name,
  roll,
  total,
  gpa: Number(gpa.toFixed(2)),
  grade: grade(gpa),
  status: fail ? "FAIL" : "PASS",
};

const idx = students.findIndex((s) => s.roll === roll);

if (idx !== -1) {
  if (!confirm("Student exists. Update marks?")) return;
  const copy = [...students];
  copy[idx] = obj;
  setStudents(copy);
  showToast("Updated student");
} else {
  setStudents([...students, obj]);
  showToast("Student added");
}

setViewStudent(obj);
setName(""); setRoll("");
setMarks(Array(Number(subjectCount)).fill(""));

};

const search = () => { const s = students.find((x) => x.roll === searchRoll); if (!s) showToast("Not found"); setViewStudent(s || null); };

const merit = [...students] .sort((a, b) => b.gpa - a.gpa || b.total - a.total || a.roll - b.roll) .map((s, i) => ({ ...s, rank: i + 1 }));

const summary = () => { const pass = students.filter((s) => s.status === "PASS").length; const fail = students.length - pass; const rate = ((pass / students.length) * 100 || 0).toFixed(2); return { pass, fail, rate }; };

const printMerit = () => { window.print(); };

return ( <div style={dark ? styles.bgDark : styles.bgLight}>

{toast && <div style={styles.toast}>{toast}</div>}

  <button onClick={() => setDark(!dark)} style={styles.themeBtn}>{dark ? "🌙" : "☀️"}</button>

  <div style={styles.dock}>
    {["home","setup","app","summary","merit"].map((p,i)=> (
      <button key={i} onClick={()=>go(p)} style={styles.dockBtn}>{["🏠","⚙️","📘","📊","🏆"][i]}</button>
    ))}
  </div>

  <div style={{
    transform: anim ? "scale(0.97) translateY(15px)" : "scale(1)",
    opacity: anim ? 0 : 1,
    transition: "0.3s ease"
  }}>

    {page === "home" && (
      <div style={styles.center}>
        <h1 style={styles.title}>GPA Manager</h1>
        <div style={styles.bigCard} onClick={()=>go("setup")}>➕ Create Project</div>
        <div style={styles.bigCard} onClick={()=>go("app")}>📂 Previous Project</div>
      </div>
    )}

    {page === "setup" && (
      <div style={styles.card}>
        <h2>Setup</h2>
        <input placeholder="Exam Name" value={examName} onChange={(e)=>setExamName(e.target.value)} />
        <input placeholder="Subjects" value={subjectCount} onChange={(e)=>setSubjectCount(e.target.value)} />
        <button style={styles.primary} onClick={start}>Start</button>
      </div>
    )}

    {page === "app" && (
      <div style={styles.card}>
        <h2>{examName}</h2>

        <input placeholder="Student Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Roll" value={roll} onChange={(e)=>setRoll(e.target.value)} />

        {marks.map((m,i)=>(
          <input key={i} type="number" value={m} placeholder={`Sub ${i+1}`} onChange={(e)=>updateMark(i,e.target.value)} />
        ))}

        <button style={styles.primary} onClick={addStudent}>➕ Add Student</button>

        <input placeholder="Search roll" value={searchRoll} onChange={(e)=>setSearchRoll(e.target.value)} />
        <button style={styles.secondary} onClick={search}>Search</button>

        {viewStudent && (
          <div style={{...styles.result, borderLeft:viewStudent.status==="PASS"?"4px solid #22c55e":"4px solid #ef4444"}}>
            <h3>{viewStudent.name}</h3>
            <p>Roll {viewStudent.roll}</p>
            <p>Total {viewStudent.total}</p>
            <p>GPA {viewStudent.gpa}</p>
            <p>{viewStudent.grade} | {viewStudent.status}</p>
          </div>
        )}
      </div>
    )}

    {page === "summary" && (
      <div style={styles.card}>
        <h2>Summary</h2>
        <p>Pass: {summary().pass}</p>
        <p>Fail: {summary().fail}</p>
        <p>Rate: {summary().rate}%</p>
      </div>
    )}

    {page === "merit" && (
      <div style={styles.card}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <h2>Merit List</h2>
          <button style={styles.primary} onClick={printMerit}>Export PDF</button>
        </div>
        {merit.map((s)=> (
          <div key={s.roll} style={styles.row}>#{s.rank} {s.name} ({s.roll})</div>
        ))}
      </div>
    )}

  </div>
</div>

); }

const styles = { bgDark:{minHeight:"100vh",padding:20,background:"radial-gradient(circle at top,#020617,#0f172a)",color:"#e2e8f0"}, bgLight:{minHeight:"100vh",padding:20,background:"#eef2ff",color:"#0f172a"},

title:{fontSize:36,fontWeight:"bold",marginBottom:20}, center:{textAlign:"center"},

bigCard:{margin:"12px auto",padding:18,maxWidth:300,borderRadius:24,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(25px)",cursor:"pointer",transition:"0.25s"},

card:{padding:20,borderRadius:24,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(25px)"},

primary:{marginTop:10,padding:12,borderRadius:14,border:"none",background:"linear-gradient(135deg,#6366f1,#22c55e)",color:"white"},

secondary:{marginTop:10,padding:12,borderRadius:14,border:"1px solid #94a3b8",background:"transparent"},

result:{marginTop:12,padding:14,borderRadius:16,background:"rgba(59,130,246,0.15)"},

dock:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:10,padding:10,borderRadius:20,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(20px)"},

dockBtn:{padding:10,borderRadius:12,border:"none",background:"rgba(255,255,255,0.1)"},

row:{marginTop:8,padding:10,borderRadius:12,background:"rgba(255,255,255,0.08)"},

themeBtn:{position:"fixed",top:20,right:20,padding:10,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.2)"},

toast:{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",padding:"10px 16px",borderRadius:12,background:"black",color:"white",opacity:0.9} };
