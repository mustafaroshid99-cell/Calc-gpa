"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [page, setPage] = useState("home");

  const [examName, setExamName] = useState("");
  const [subjectCount, setSubjectCount] = useState("");

  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [marks, setMarks] = useState([]);

  const [viewStudent, setViewStudent] = useState(null);
  const [searchRoll, setSearchRoll] = useState("");

  const go = (p) => setPage(p);

  // INIT SUBJECTS
  const start = () => {
    if (!examName || !subjectCount) return;
    setMarks(Array(Number(subjectCount)).fill(""));
    setPage("app");
  };

  // GPA SYSTEM
  const gp = (m) => {
    if (m >= 80) return 5;
    if (m >= 70) return 4;
    if (m >= 60) return 3.5;
    if (m >= 50) return 3;
    if (m >= 40) return 2;
    if (m >= 33) return 1;
    return 0;
  };

  const lg = (g) => {
    if (g === 5) return "A+";
    if (g >= 4) return "A";
    if (g >= 3.5) return "A-";
    if (g >= 3) return "B";
    if (g >= 2) return "C";
    if (g >= 1) return "D";
    return "F";
  };

  // ADD STUDENT
  const addStudent = () => {
    if (!name || !roll) return;

    if (students.some((s) => s.roll === roll)) {
      alert("Student already exists");
      return;
    }

    let total = 0;
    let fail = false;

    const gpas = marks.map((m) => {
      const v = Number(m);
      if (v < 33) fail = true;
      total += v;
      return gp(v);
    });

    const gpa = fail ? 0 : gpas.reduce((a, b) => a + b, 0) / gpas.length;

    const student = {
      name,
      roll,
      marks,
      total,
      gpa: Number(gpa.toFixed(2)),
      grade: lg(gpa),
      status: fail ? "FAIL" : "PASS",
    };

    setStudents([...students, student]);

    setName("");
    setRoll("");
    setMarks(Array(Number(subjectCount)).fill(""));
  };

  // SEARCH
  const search = () => {
    setViewStudent(students.find((s) => s.roll === searchRoll) || null);
  };

  // MERIT SYSTEM (SAFE + STABLE)
  const ranked = [...students]
    .sort((a, b) => b.gpa - a.gpa || b.total - a.total || a.roll - b.roll)
    .map((s, i) => ({ ...s, merit: i + 1 }));

  // SUMMARY
  const pass = students.filter((s) => s.status === "PASS").length;
  const fail = students.length - pass;

  // PDF EXPORT (simple safe version)
  const exportPDF = () => {
    const text = ranked
      .map(
        (s) =>
          `${s.name} | Roll ${s.roll} | Merit ${s.merit} | GPA ${s.gpa} | ${s.grade}`
      )
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merit-list.txt";
    a.click();
  };

  const styles = {
    bg: {
      minHeight: "100vh",
      padding: 20,
      background: "linear-gradient(135deg,#0f172a,#020617)",
      color: "white",
      fontFamily: "Arial",
    },
    card: {
      background: "rgba(255,255,255,0.08)",
      padding: 15,
      borderRadius: 18,
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      marginBottom: 15,
      transition: "0.3s",
    },
    btn: {
      padding: 10,
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(90deg,#6366f1,#22c55e)",
      color: "white",
      cursor: "pointer",
      marginTop: 8,
    },
    input: {
      width: "100%",
      padding: 10,
      marginTop: 8,
      borderRadius: 10,
      border: "none",
      background: "rgba(255,255,255,0.1)",
      color: "white",
      outline: "none",
    },
    nav: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: 20,
      fontSize: 18,
    },
  };

  return (
    <div style={styles.bg}>
      {/* NAV */}
      <div style={styles.nav}>
        <button onClick={() => go("home")}>🏠</button>
        <button onClick={() => go("setup")}>⚙️</button>
        <button onClick={() => go("app")}>📘</button>
        <button onClick={() => go("summary")}>📊</button>
        <button onClick={() => go("merit")}>🏆</button>
      </div>

      {/* HOME */}
      {page === "home" && (
        <div style={styles.card}>
          <h1>GPA GOD MODE 3.2</h1>
          <button style={styles.btn} onClick={() => go("setup")}>
            Create Project
          </button>
        </div>
      )}

      {/* SETUP */}
      {page === "setup" && (
        <div style={styles.card}>
          <h3>Setup</h3>
          <input
            style={styles.input}
            placeholder="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Subjects"
            value={subjectCount}
            onChange={(e) => setSubjectCount(e.target.value)}
          />
          <button style={styles.btn} onClick={start}>
            Start
          </button>
        </div>
      )}

      {/* APP */}
      {page === "app" && (
        <div style={styles.card}>
          <h3>{examName}</h3>

          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Roll"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
          />

          {marks.map((m, i) => (
            <input
              key={i}
              style={styles.input}
              type="number"
              placeholder={`Subject ${i + 1}`}
              value={m}
              onChange={(e) => {
                const c = [...marks];
                c[i] = e.target.value;
                setMarks(c);
              }}
            />
          ))}

          <button style={styles.btn} onClick={addStudent}>
            Add Student
          </button>

          <input
            style={styles.input}
            placeholder="Search Roll"
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
          />
          <button style={styles.btn} onClick={search}>
            Search
          </button>

          {viewStudent && (
            <div style={styles.card}>
              <h3>{viewStudent.name}</h3>
              <p>Roll: {viewStudent.roll}</p>
              <p>Total: {viewStudent.total}</p>
              <p>GPA: {viewStudent.gpa}</p>
              <p>{viewStudent.grade} - {viewStudent.status}</p>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY */}
      {page === "summary" && (
        <div style={styles.card}>
          <h3>Summary</h3>
          <p>Total: {students.length}</p>
          <p>Pass: {pass}</p>
          <p>Fail: {fail}</p>
        </div>
      )}

      {/* MERIT */}
      {page === "merit" && (
        <div style={styles.card}>
          <h3>Merit List</h3>

          <button style={styles.btn} onClick={exportPDF}>
            Export Merit File
          </button>

          {ranked.map((s) => (
            <div key={s.roll}>
              {s.name} (Roll {s.roll}) → #{s.merit} | GPA {s.gpa} | {s.grade}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
