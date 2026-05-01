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

  const styles = {
    bg: { minHeight: "100vh", padding: 20, color: "white" },
  };

  return (
    <div style={styles.bg}>
      <h1>FIXED STRUCTURE</h1>
      <button onClick={() => go("home")}>Home</button>
    </div>
  );
}
