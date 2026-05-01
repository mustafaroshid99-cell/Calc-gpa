"use client";

import { useEffect, useState } from "react";

export default function Home() { const [page, setPage] = useState("home"); const [anim, setAnim] = useState(false); const [dark, setDark] = useState(true);

const [projects, setProjects] = useState([]); const [activeProjectIndex, setActiveProjectIndex] = useState(null);

const [examName, setExamName] = useState(""); const [subjectCount, setSubjectCount] = useState("");

const [name, setName] = useState(""); const [roll, setRoll] = useState(""); const [marks, setMarks] = useState([]);

const [viewStudent, setViewStudent] = useState(null); const [searchRoll, setSearchRoll] = useState("");

const [toast, setToast] = useState("");

useEffect(() => { const p = localStorage.getItem("projects"); if (p) setProjects(JSON.parse(p)); }, []);

useEffect(() => { localStorage.setItem("projects", JSON.stringify(projects)); }, [projects]);

const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

const go = (p) => { setAnim(true); setTimeout(() => { setPage(p); setAnim(false); }, 180); };

const gp = (m) => (m >= 80 ? 5 : m >= 70 ? 4 : m >= 60 ? 3.5 : m >= 50 ? 3 : m >= 40 ? 2 : m >= 33 ? 1 : 0); const grade = (g) => (g === 5 ? "A+" : g >= 4 ? "A" : g >= 3.5 ? "A-" : g >= 3 ? "B" : g >= 2 ? "C" : g >= 1 ? "D" : "F");

const createProject = () => { if (!examName || !subjectCount) return showToast("Fill all fields");

const newProject = {
  id: Date.now(),
  examName,
  subjectCount: Number(subjectCount),
  students: []
};

setProjects([...projects, newProject]);
setActiveProjectIndex(projects.length);

setMarks(Array(Number(subjectCount)).fill(""));
go("app");
showToast("Project created");

};

const deleteProject = (id) => { setProjects(projects.filter(p => p.id !== id)); showToast("Project deleted"); go("home"); };

const activeProject = projects[activeProjectIndex];

const updateMark = (i, v) => { if (v === "") return; if (Number(v) > 100 || Number(v) < 0) return showToast("0-100 only"); const c = [...marks]; c[i] = v; setMarks(c); };

const addStudent = () => { if (!activeProject) return; if (!name || !roll) return showToast("Fill name & roll");

const nums = marks.map(Number);
if (nums.some(isNaN)) return showToast("Fill marks");

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

const updated = [...projects];
const p = updated[activeProjectIndex];

const idx = p.students.findIndex(s => s.roll === roll);

if (idx !== -1) {
  if (!confirm("Student exists. Update?") ) return;
  p.students[idx] = obj;
} else {
  p.students.push(obj);
}

setProjects(updated);
setViewStudent(obj);

setName(""); setRoll("");
setMarks(Array(activeProject.subjectCount).fill(""));

showToast("Saved");

};

const search = () => { const s = activeProject?.students.find(x => x.roll === searchRoll); if (!s) showToast("Not found"); setViewStudent(s || null); };

const merit = activeProject ? [...activeProject.students] .sort((a,b)=> b.gpa - a.gpa || b.total - a.total || a.roll - b.roll) .map((s,i)=> ({...s, rank:i+1})) : [];

const summary = () => { if (!activeProject) return {pass:0,fail:0,rate:0}; const pass = activeProject.students.filter(s=>s.status==="PASS").length; const fail = activeProject.students.length - pass; const rate = ((pass / activeProject.students.length) * 100 || 0).toFixed(2); return {pass,fail,rate}; };

const downloadPDF = () => window.print();

return ( <div className={dark ? "dark" : "light"} style={styles.body}>

<style jsx global>{`
    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; top: 0; left: 0; width: 100%; }
    }
  `}</style>

  {toast && <div style={styles.toast}>{toast}</div>}

  <button style={styles.themeBtn} onClick={()=>setDark(!dark)}>{dark ? "🌙" : "☀️"}</button>

  <div style={styles.dock}>
    {["home","setup","app","summary","merit"].map((p,i)=> (
      <button key={i} onClick={()=>go(p)} style={styles.dockBtn}>{["🏠","⚙️","📘","📊","🏆"][i]}</button>
    ))}
  </div>

  <div style={{transform: anim?"scale(0.97)":"scale(1)",opacity:anim?0:1,transition:"0.25s"}}>

    {page === "home" && (
      <div style={styles.center}>
        <h1 style={styles.title}>GPA Manager</h1>

        <div style={styles.bigCard} onClick={()=>go("setup")}>➕ New Project</div>

        {projects.map((p,i)=> (
          <div key={p.id} style={styles.projectCard}>
            <div onClick={()=>{setActiveProjectIndex(i); go("app");}}>
              📘 {p.examName} ({p.students.length})
            </div>
            <button style={styles.deleteBtn} onClick={()=>deleteProject(p.id)}>🗑</button>
          </div>
        ))}
      </div>
    )}

    {page === "setup" && (
      <div style={styles.card}>
        <h2>Create Project</h2>
        <input placeholder="Exam Name" value={examName} onChange={(e)=>setExamName(e.target.value)} />
        <input placeholder="Subjects" value={subjectCount} onChange={(e)=>setSubjectCount(e.target.value)} />
        <button style={styles.primary} onClick={createProject}>Create</button>
      </div>
    )}

    {page === "app" && activeProject && (
      <div style={styles.card}>
        <h2>{activeProject.examName}</h2>

        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Roll" value={roll} onChange={(e)=>setRoll(e.target.value)} />

        {marks.map((m,i)=>(
          <input key={i} type="number" value={m} placeholder={`Sub ${i+1}`} onChange={(e)=>updateMark(i,e.target.value)} />
        ))}

        <button style={styles.primary} onClick={addStudent}>➕ Add Student</button>

        <input placeholder="Search Roll" value={searchRoll} onChange={(e)=>setSearchRoll(e.target.value)} />
        <button style={styles.secondary} onClick={search}>Search</button>

        {viewStudent && (
          <div style={styles.result}>
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

    {page === "merit" && activeProject && (
      <div className="print-area" style={styles.card}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <h2>Merit Table</h2>
          <button style={styles.primary} onClick={downloadPDF}>Download PDF</button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Roll</th>
              <th>GPA</th>
              <th>Grade</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {merit.map(s=> (
              <tr key={s.roll}>
                <td>{s.rank}</td>
                <td>{s.name}</td>
                <td>{s.roll}</td>
                <td>{s.gpa}</td>
                <td>{s.grade}</td>
                <td>{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

  </div>
</div>

); }

const styles = { body:{minHeight:"100vh",padding:20,fontFamily:"sans-serif"},

center:{textAlign:"center"}, title:{fontSize:40,fontWeight:"bold"},

bigCard:{margin:"10px auto",padding:18,maxWidth:320,borderRadius:18,background:"rgba(255,255,255,0.08)",cursor:"pointer"},

projectCard:{display:"flex",justifyContent:"space-between",padding:12,marginTop:10,borderRadius:12,background:"rgba(255,255,255,0.08)"},

deleteBtn:{border:"none",background:"transparent",color:"red"},

card:{padding:20,borderRadius:18,background:"rgba(255,255,255,0.08)"},

primary:{marginTop:10,padding:12,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366f1,#22c55e)",color:"white"},

secondary:{marginTop:10,padding:12,borderRadius:12,border:"1px solid gray",background:"transparent"},

result:{marginTop:12,padding:14,borderRadius:12,background:"rgba(59,130,246,0.15)"},

dock:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:10,padding:10,borderRadius:20,background:"rgba(0,0,0,0.3)"},

dockBtn:{padding:10,borderRadius:12,border:"none"},

toast:{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"black",color:"white",padding:"8px 14px",borderRadius:10},

themeBtn:{position:"fixed",top:20,right:20,padding:10,borderRadius:"50%",border:"none"},

table:{width:"100%",marginTop:20,borderCollapse:"collapse"} };
