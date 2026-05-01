"use client"; import { useEffect, useMemo, useState } from "react";

export default function Home() { const [page, setPage] = useState("home"); const [anim, setAnim] = useState(false);

const [examName, setExamName] = useState(""); const [subjectCount, setSubjectCount] = useState("");

const [students, setStudents] = useState([]);

const [name, setName] = useState(""); const [roll, setRoll] = useState(""); const [marks, setMarks] = useState([]);

const [viewStudent, setViewStudent] = useState(null); const [searchRoll, setSearchRoll] = useState("");

// Load useEffect(() => { try { const data = localStorage.getItem("students"); if (data) setStudents(JSON.parse(data)); } catch (e) {} }, []);

// Save useEffect(() => { localStorage.setItem("students", JSON.stringify(students)); }, [students]);

// UI ripple const ripple = (e) => { const btn = e.currentTarget; const circle = document.createElement("span"); const size = Math.max(btn.clientWidth, btn.clientHeight); const rect = btn.getBoundingClientRect();

circle.style.width = circle.style.height = size + "px";
circle.style.left = e.clientX - rect.left - size / 2 + "px";
circle.style.top = e.clientY - rect.top - size / 2 + "px";
circle.className = "ripple";

const old = btn.querySelector(".ripple");
if (old) old.remove();
btn.appendChild(circle);

};

// navigation const go = (p) => { setAnim(true); setTimeout(() => { setPage(p); setAnim(false); }, 200); };

// grading const gp = (m) => { if (m >= 80) return 5; if (m >= 70) return 4; if (m >= 60) return 3.5; if (m >= 50) return 3; if (m >= 40) return 2; if (m >= 33) return 1; return 0; };

const lg = (g) => { if (g === 5) return "A+"; if (g >= 4) return "A"; if (g >= 3.5) return "A-"; if (g >= 3) return "B"; if (g >= 2) return "C"; if (g >= 1) return "D"; return "F"; };

const start = () => { if (!examName || !subjectCount) return alert("Fill all fields"); setMarks(Array(Number(subjectCount)).fill("")); go("app"); };

const updateMark = (i, v) => { if (v === "") return; const num = Number(v); if (num < 0 || num > 100) return;

const copy = [...marks];
copy[i] = v;
setMarks(copy);

};

const addStudent = () => { const nums = marks.map(Number);

if (!name || !roll || nums.some((n) => isNaN(n))) return;

const total = nums.reduce((a, b) => a + b, 0);
const fail = nums.some((m) => m < 33);
const gpa = fail ? 0 : nums.reduce((a, b) => a + gp(b), 0) / nums.length;

const obj = {
  name,
  roll: String(roll),
  total,
  gpa: +gpa.toFixed(2),
  grade: lg(gpa),
  status: fail ? "FAIL" : "PASS",
};

const exists = students.find((s) => s.roll === obj.roll);

if (exists) {
  const ok = confirm("Student exists. Update marks?");
  if (!ok) return;

  setStudents(students.map((s) => (s.roll === obj.roll ? obj : s)));
} else {
  setStudents([...students, obj]);
}

setViewStudent(obj);
setName("");
setRoll("");
setMarks(Array(Number(subjectCount)).fill(""));

};

const search = () => { const s = students.find((x) => x.roll === String(searchRoll)); setViewStudent(s || null); };

// MERIT LOGIC (stable) const ranked = useMemo(() => { return [...students] .sort((a, b) => b.gpa - a.gpa || b.total - a.total || Number(a.roll) - Number(b.roll) ) .map((s, i) => ({ ...s, merit: i + 1 })); }, [students]);

const byRoll = useMemo(() => { return [...students].sort((a, b) => Number(a.roll) - Number(b.roll)); }, [students]);

const passCount = students.filter((s) => s.status === "PASS").length; const failCount = students.filter((s) => s.status === "FAIL").length;

const gradeCount = (g) => students.filter((s) => s.grade === g).length;

const printPDF = () => window.print();

return ( <div style={styles.bg}>

<style>{`
    .ripple{position:absolute;border-radius:50%;transform:scale(0);animation:ripple .6s linear;background:rgba(255,255,255,.4)}
    @keyframes ripple{to{transform:scale(4);opacity:0}}

    .fade{animation:fade .25s ease}
    @keyframes fade{from{opacity:.4;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

    input{width:100%;margin-top:8px;padding:10px;border-radius:12px;border:none;background:rgba(255,255,255,0.1);color:white;outline:none}
  `}</style>

  {/* NAV */}
  <div style={styles.nav}>
    {["🏠","⚙️","📘","📊","🏆"].map((ic,i)=>(
      <button key={i} type="button" style={styles.navBtn} onClick={(e)=>{ripple(e);go(["home","setup","app","summary","merit"][i]);}}>{ic}</button>
    ))}
  </div>

  <div className={anim ? "fade" : ""}>

    {/* HOME */}
    {page === "home" && (
      <div style={styles.center}>
        <h1 style={styles.title}>GPA GOD MODE 3.0</h1>
        <div style={styles.cardBtn} onClick={(e)=>{ripple(e);go("setup");}}>➕ Create Project</div>
        <div style={styles.cardBtn} onClick={(e)=>{ripple(e);go("app");}}>📂 Continue</div>
      </div>
    )}

    {/* SETUP */}
    {page === "setup" && (
      <div style={styles.card}>
        <h2>Setup</h2>
        <input placeholder="Exam Name" value={examName} onChange={(e)=>setExamName(e.target.value)} />
        <input placeholder="Subjects" value={subjectCount} onChange={(e)=>setSubjectCount(e.target.value)} />
        <button type="button" style={styles.primary} onClick={(e)=>{ripple(e);start();}}>Start</button>
      </div>
    )}

    {/* APP */}
    {page === "app" && (
      <div style={styles.card}>
        <h2>{examName}</h2>

        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Roll" value={roll} onChange={(e)=>setRoll(e.target.value)} />

        {marks.map((m,i)=>(
          <input key={i} type="number" value={m} placeholder={`Sub ${i+1}`} onChange={(e)=>updateMark(i,e.target.value)} />
        ))}

        <button type="button" style={styles.primary} onClick={(e)=>{ripple(e);addStudent();}}>Add Student</button>

        <input placeholder="Search Roll" value={searchRoll} onChange={(e)=>setSearchRoll(e.target.value)} />
        <button type="button" style={styles.secondary} onClick={(e)=>{ripple(e);search();}}>Search</button>

        {viewStudent && (
          <div style={styles.result}>
            <h3>{viewStudent.name}</h3>
            <p>Roll: {viewStudent.roll}</p>
            <p>Total: {viewStudent.total}</p>
            <p>GPA: {viewStudent.gpa}</p>
            <p>{viewStudent.grade} ({viewStudent.status})</p>
          </div>
        )}
      </div>
    )}

    {/* SUMMARY */}
    {page === "summary" && (
      <div style={styles.card}>
        <h2>Summary</h2>
        <p>PASS: {passCount} | FAIL: {failCount}</p>
        <p>A+: {gradeCount("A+")} | A: {gradeCount("A")} | A-: {gradeCount("A-")}</p>
      </div>
    )}

    {/* MERIT */}
    {page === "merit" && (
      <div style={styles.card}>
        <h2>Merit Table</h2>

        <button type="button" style={styles.primary} onClick={printPDF}>Export PDF</button>

        <div style={styles.tableHead}>
          <span>Name</span><span>Roll</span><span>Merit</span><span>Total</span><span>GPA</span><span>LG</span>
        </div>

        {byRoll.map((s) => {
          const m = ranked.find((r) => r.roll === s.roll)?.merit;
          return (
            <div key={s.roll} style={styles.tableRow}>
              <span>{s.name}</span>
              <span>{s.roll}</span>
              <span>{m}</span>
              <span>{s.total}</span>
              <span>{s.gpa}</span>
              <span>{s.grade}</span>
            </div>
          );
        })}

      </div>
    )}

  </div>
</div>

); }

const styles = { bg:{minHeight:"100vh",padding:20,background:"radial-gradient(circle at top,#0f172a,#020617)",color:"white"}, center:{textAlign:"center"}, title:{fontSize:36,fontWeight:"bold"},

card:{padding:20,borderRadius:24,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(20px)"}, cardBtn:{margin:"12px auto",padding:18,maxWidth:320,borderRadius:22,background:"rgba(255,255,255,0.1)",cursor:"pointer"},

primary:{marginTop:10,padding:12,borderRadius:14,border:"none",background:"linear-gradient(135deg,#6366f1,#3b82f6)",color:"white"}, secondary:{marginTop:10,padding:12,borderRadius:14,border:"1px solid #94a3b8",background:"transparent",color:"white"},

result:{marginTop:12,padding:14,borderRadius:14,background:"rgba(59,130,246,0.2)"},

nav:{position:"fixed",bottom:18,left:"50%",transform:"translateX(-50%)",display:"flex",gap:10}, navBtn:{padding:12,borderRadius:14,border:"none",background:"rgba(255,255,255,0.1)",color:"white",position:"relative",overflow:"hidden"},

tableHead:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginTop:10,fontWeight:"bold"}, tableRow:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginTop:6,padding:8,borderRadius:10,background:"rgba(255,255,255,0.08)"} };
