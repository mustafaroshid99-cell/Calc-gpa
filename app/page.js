"use client";
import { useEffect, useState, useCallback, useRef } from "react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBUrRK1CxFLiA9MXo7TJH3bnS9d9pJN7R0",
  authDomain: "calc-gpa-3cc87.firebaseapp.com",
  projectId: "calc-gpa-3cc87",
  storageBucket: "calc-gpa-3cc87.firebasestorage.app",
  messagingSenderId: "311166071670",
  appId: "1:311166071670:web:1b3aa2aa1746d3b2548057",
  measurementId: "G-LMCWHSE517"
};

const ADMIN_EMAIL = "mustafaroshid99@gmail.com";

const getGP    = (m) => m >= 80 ? 5 : m >= 70 ? 4 : m >= 60 ? 3.5 : m >= 50 ? 3 : m >= 40 ? 2 : m >= 33 ? 1 : 0;
const getGrade = (g) => g === 5 ? "A+" : g >= 4 ? "A" : g >= 3.5 ? "A-" : g >= 3 ? "B" : g >= 2 ? "C" : g >= 1 ? "D" : "F";
const gradeColor = (g) =>
  g === "A+" ? "#0ea5e9" : g === "A" ? "#0284c7" : g === "A-" ? "#0369a1"
  : g === "B" ? "#6366f1" : g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

const getMeritRank = (students) =>
  [...students]
    .sort((a, b) => b.gpa - a.gpa || b.total - a.total)
    .reduce((acc, s, i) => { acc[s.roll] = i + 1; return acc; }, {});

// ─── CSS ─────────────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       ${dark ? "#0a0f1a" : "#f0f4f8"};
      --surface:  ${dark ? "#111827" : "#ffffff"};
      --surface2: ${dark ? "#1a2332" : "#f8fafc"};
      --surface3: ${dark ? "#1e2d42" : "#eef2f7"};
      --border:   ${dark ? "#263248" : "#dde3ec"};
      --text:     ${dark ? "#e8edf5" : "#0f1c2e"};
      --text2:    ${dark ? "#6b7fa0" : "#7a8ea8"};
      --text3:    ${dark ? "#4a5a78" : "#a0b0c4"};
      --sky:      #0ea5e9;
      --sky2:     #38bdf8;
      --sky3:     #0284c7;
      --indigo:   #6366f1;
      --green:    #10b981;
      --red:      #ef4444;
      --yellow:   #f59e0b;
      --glow:     ${dark ? "rgba(14,165,233,0.12)" : "rgba(14,165,233,0.08)"};
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'DM Sans', sans-serif; min-height: 100vh;
      transition: background 0.4s, color 0.4s;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    input[type="text"], input[type="number"], input[type="email"], input[type="password"], input:not([type]) {
      width: 100%; padding: 11px 14px; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface2);
      color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
      font-weight: 400; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    input:focus {
      border-color: var(--sky);
      background: var(--surface);
      box-shadow: 0 0 0 3px var(--glow);
    }
    input::placeholder { color: var(--text3); }
    button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--surface2); color: var(--text2);
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em;
      text-transform: uppercase; padding: 10px 14px; text-align: left;
      white-space: nowrap; border-bottom: 1.5px solid var(--border);
    }
    td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 13.5px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--sky) 4%, transparent); }
    @keyframes up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes splashIn { 0%{opacity:0;transform:scale(0.6);}60%{transform:scale(1.06);}100%{opacity:1;transform:scale(1);} }
    @keyframes splashOut { 0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.3);} }
    @keyframes toastPop { 0%{opacity:0;transform:translateX(-50%) translateY(-8px);}100%{opacity:1;transform:translateX(-50%) translateY(0);} }
    @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes badgePop { 0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);} }
    @keyframes shimmer { 0%{background-position:-200% 0;}100%{background-position:200% 0;} }
    @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  `;
  return <style>{css}</style>;
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, animate, glass }) => (
  <div style={{
    background: glass ? "color-mix(in srgb, var(--surface) 85%, transparent)" : "var(--surface)",
    border: "1.5px solid var(--border)",
    borderRadius: 16,
    padding: 20,
    animation: animate ? "up 0.28s ease" : "none",
    backdropFilter: glass ? "blur(12px)" : "none",
    ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{
    fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
    color: "var(--text2)", marginBottom: 7
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled, loading, size = "md" }) => {
  const sizes = {
    sm: { padding: "7px 14px", fontSize: 12, borderRadius: 9 },
    md: { padding: "11px 20px", fontSize: 14, borderRadius: 11 },
    lg: { padding: "14px 24px", fontSize: 15, borderRadius: 13 },
  };
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    border: "none", fontWeight: 600,
    transition: "all 0.17s", cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.55 : 1, letterSpacing: "0.01em",
    ...sizes[size],
  };
  const v = {
    primary: {
      background: "linear-gradient(135deg, var(--sky), var(--sky3))",
      color: "#fff",
      boxShadow: "0 3px 14px color-mix(in srgb,var(--sky) 30%,transparent)"
    },
    secondary: {
      background: "var(--surface2)", color: "var(--text)",
      border: "1.5px solid var(--border)"
    },
    danger: {
      background: "color-mix(in srgb,var(--red) 10%,transparent)", color: "var(--red)",
      border: "1.5px solid color-mix(in srgb,var(--red) 22%,transparent)"
    },
    ghost: {
      background: "transparent", color: "var(--text2)",
      border: "1.5px solid var(--border)"
    },
    sky: {
      background: "color-mix(in srgb,var(--sky) 12%,transparent)",
      color: "var(--sky)", border: "1.5px solid color-mix(in srgb,var(--sky) 25%,transparent)"
    },
  };
  return (
    <button style={{ ...base, ...v[variant], ...style }} onClick={onClick} disabled={disabled || loading}>
      {loading
        ? <span style={{ animation: "spin 0.7s linear infinite", display: "inline-block" }}>⟳</span>
        : children}
    </button>
  );
};

const Pill = ({ children, color }) => (
  <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 700,
    background: `color-mix(in srgb,${color} 13%,transparent)`, color,
  }}>{children}</span>
);

const Toast = ({ msg }) => (
  <div style={{
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "var(--surface)", border: "1.5px solid var(--border)",
    color: "var(--text)", padding: "9px 22px", borderRadius: 40, fontSize: 13.5,
    fontWeight: 500, zIndex: 9999, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
    animation: "toastPop 0.22s ease", whiteSpace: "nowrap",
  }}>{msg}</div>
);

// ── FIXED StatTile — View button always shown when onClick provided ──────────
const StatTile = ({ label, value, color, style = {}, onClick, actionLabel }) => (
  <div style={{
    background: "var(--surface2)", border: "1.5px solid var(--border)",
    borderRadius: 13, padding: "14px 16px", flex: 1, ...style
  }}>
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      color: "var(--text2)", marginBottom: 6
    }}>{label}</div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
      <div style={{
        fontSize: 26, fontWeight: 800, color: color || "var(--sky)",
        fontVariantNumeric: "tabular-nums", fontFamily: "'DM Mono', monospace",
        lineHeight: 1,
      }}>{value}</div>
      {onClick && (
        <button onClick={onClick} style={{
          padding: "5px 12px", borderRadius: 8,
          border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--sky)",
          fontSize: 11, fontWeight: 700,
          cursor: "pointer", transition: "all 0.15s",
          flexShrink: 0, whiteSpace: "nowrap",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "color-mix(in srgb,var(--sky) 10%,var(--surface))";
            e.currentTarget.style.borderColor = "var(--sky)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {actionLabel || "View →"}
        </button>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{
      width: 36, height: 36,
      border: "3px solid var(--border)", borderTop: "3px solid var(--sky)",
      borderRadius: "50%", animation: "spin 0.8s linear infinite"
    }} />
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ label, title, subtitle }) => (
  <div style={{ marginBottom: 22 }}>
    {label && (
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--sky)", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          display: "inline-block", width: 18, height: 2,
          background: "var(--sky)", borderRadius: 2
        }} />
        {label}
      </div>
    )}
    {title && <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, marginBottom: 3 }}>{title}</h2>}
    {subtitle && <p style={{ color: "var(--text2)", fontSize: 13 }}>{subtitle}</p>}
  </div>
);

// ─── Student List Modal ───────────────────────────────────────────────────────
const StudentListModal = ({ title, students, color, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 6000,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(6px)", padding: "20px 16px",
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: "var(--surface)", border: "1.5px solid var(--border)",
      borderRadius: 20, width: "100%", maxWidth: 420,
      maxHeight: "72vh", display: "flex", flexDirection: "column",
      animation: "up 0.25s ease",
      boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        padding: "18px 20px",
        borderBottom: "1.5px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color, marginBottom: 3
          }}>{title}</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "1.5px solid var(--border)",
          background: "var(--surface2)", color: "var(--text2)",
          fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {students.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text2)", padding: "30px 0", fontSize: 13 }}>
            No students in this category
          </div>
        ) : students.map((s, i) => (
          <div key={s.roll} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 11, marginBottom: 7,
            background: "var(--surface2)", border: "1.5px solid var(--border)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: `color-mix(in srgb,${color} 18%,transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
              <div style={{ color: "var(--text2)", fontSize: 11.5 }}>Roll: {s.roll}</div>
            </div>
            <Pill color={color}>{s.grade}</Pill>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Blocked Modal ────────────────────────────────────────────────────────────
const BlockedModal = ({ onSignOut }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 99999,
    background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(6px)",
  }}>
    <Card style={{ maxWidth: 360, textAlign: "center", animation: "splashIn 0.4s ease" }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🚫</div>
      <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Account Blocked</h2>
      <p style={{ color: "var(--text2)", fontSize: 13.5, marginBottom: 22 }}>
        Your account has been blocked by the administrator. Contact your administrator for help.
      </p>
      <Btn onClick={onSignOut} style={{ width: "100%" }}>Sign Out</Btn>
    </Card>
  </div>
);

// ─── Logo Splash ──────────────────────────────────────────────────────────────
const LogoSplash = ({ onDone }) => {
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1800);
    const t2 = setTimeout(() => onDone(), 2250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "linear-gradient(145deg,#050c18 0%,#0a1628 60%,#050c18 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: phase === "out" ? "splashOut 0.45s ease forwards" : "none",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 70%)",
        animation: "fadeIn 0.8s ease",
      }} />

      <div style={{
        position: "relative", width: 100, height: 100, marginBottom: 28,
        animation: "splashIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        <div style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          background: "conic-gradient(from 0deg,#0ea5e9,#38bdf8,#0284c7,#0ea5e9)",
          animation: "spin 4s linear infinite", opacity: 0.5, filter: "blur(6px)",
        }} />
        <div style={{
          position: "relative", width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(145deg,#0f1e34,#1a2d4a)",
          border: "1.5px solid rgba(56,189,248,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 36px rgba(14,165,233,0.25)",
        }}>
          <span style={{ fontSize: 44 }}>📚</span>
        </div>
      </div>

      <div style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 34, fontWeight: 800,
        background: "linear-gradient(135deg,#38bdf8,#7dd3fc,#0ea5e9)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        letterSpacing: "-0.03em", marginBottom: 8,
        animation: "splashIn 0.6s 0.15s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>EduGrade</div>

      <div style={{
        color: "#4a6585", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.18em", textTransform: "uppercase",
        animation: "splashIn 0.55s 0.28s ease both",
      }}>Academic Excellence</div>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ firebase, onAuth, showToast }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password && mode !== "reset") return showToast("⚠ Fill all fields");
    if (mode === "signup" && !name.trim()) return showToast("⚠ Enter your name");
    if (password.length < 6 && mode !== "reset") return showToast("⚠ Password min 6 chars");
    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await firebase.auth.signInWithEmailAndPassword(email, password);
        const snap = await firebase.db.collection("users").doc(cred.user.uid).get();
        if (snap.exists && snap.data().blocked) {
          await firebase.auth.signOut();
          showToast("🚫 Your account has been blocked");
          setLoading(false); return;
        }
        showToast("✓ Welcome back!");
      } else if (mode === "signup") {
        const cred = await firebase.auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name.trim() });
        await firebase.db.collection("users").doc(cred.user.uid).set({
          name: name.trim(), email, createdAt: new Date().toISOString(), blocked: false, uid: cred.user.uid,
        });
        await firebase.db.collection("adminNotifications").add({
          type: "newUser", name: name.trim(), email,
          uid: cred.user.uid, createdAt: new Date().toISOString(), read: false,
        });
        showToast("✓ Account created!");
      } else {
        await firebase.auth.sendPasswordResetEmail(email);
        showToast("✓ Reset email sent"); setMode("login");
      }
    } catch (e) { showToast("✗ " + (e.message?.replace("Firebase: ", "") || "Error")); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "up 0.35s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
            background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            boxShadow: "0 8px 28px rgba(14,165,233,0.28)",
          }}>📚</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>EduGrade</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>
            {mode === "login" ? "Sign in to continue" : mode === "signup" ? "Create your account" : "Reset password"}
          </p>
        </div>

        <Card style={{ padding: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div><Label>Full Name</Label>
                <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div><Label>Email</Label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            {mode !== "reset" && (
              <div><Label>Password</Label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            )}
            <Btn onClick={handleSubmit} loading={loading} style={{ width: "100%", marginTop: 4 }}>
              {mode === "login" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Email →"}
            </Btn>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button onClick={() => setMode("reset")} style={{
                  background: "none", border: "none", color: "var(--sky)",
                  fontSize: 12.5, cursor: "pointer", fontWeight: 500
                }}>Forgot password?</button>
                <div style={{ color: "var(--text2)", fontSize: 13 }}>
                  No account?{" "}
                  <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => setMode("signup")}>Sign up</span>
                </div>
              </>
            )}
            {mode !== "login" && (
              <div style={{ color: "var(--text2)", fontSize: 13 }}>
                <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => setMode("login")}>← Back to Sign In</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPanel = ({ firebase, showToast, onClose }) => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("notifs");
  const [loading, setLoading] = useState(true);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [viewingUser, setViewingUser] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersSnap = await firebase.db.collection("users").get();
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const notifsSnap = await firebase.db.collection("adminNotifications")
          .orderBy("createdAt", "desc").limit(50).get();
        setNotifications(notifsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { showToast("✗ " + e.message); }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleBlock = async (user) => {
    const newBlocked = !user.blocked;
    await firebase.db.collection("users").doc(user.id).update({ blocked: newBlocked });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, blocked: newBlocked } : u));
    showToast(newBlocked ? "🚫 User blocked" : "✓ User unblocked");
  };

  const markAllRead = async () => {
    const batch = firebase.db.batch();
    notifications.forEach(n => {
      if (!n.read) batch.update(firebase.db.collection("adminNotifications").doc(n.id), { read: true });
    });
    await batch.commit();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("✓ All marked as read");
  };

  const loadUserFullData = async (user) => {
    try {
      const snap = await firebase.db.collection("users").doc(user.id)
        .collection("projects").orderBy("createdAt", "asc").get();
      const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSelectedUserData({ user, projects });
      setSelectedProject(projects.length > 0 ? projects[0] : null);
      setViewingUser(true);
    } catch (e) { showToast("✗ " + e.message); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (viewingUser && selectedUserData) {
    const u = selectedUserData.user;
    const projects = selectedUserData.projects;
    const meritRanks = selectedProject ? getMeritRank(selectedProject.students) : {};
    const sortedStudents = selectedProject
      ? [...selectedProject.students].sort((a, b) =>
          String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true }))
      : [];

    const stats = (() => {
      if (!selectedProject?.students.length) return { pass: 0, fail: 0, rate: "0.0", avg: "0.00", total: 0 };
      const pass = selectedProject.students.filter(s => s.status === "PASS").length;
      const fail = selectedProject.students.length - pass;
      const avg = (selectedProject.students.reduce((a, s) => a + s.gpa, 0) / selectedProject.students.length).toFixed(2);
      return { pass, fail, rate: ((pass / selectedProject.students.length) * 100).toFixed(1), avg, total: selectedProject.students.length };
    })();

    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }} onClick={e => e.target === e.currentTarget && setViewingUser(false)}>
        <div style={{
          background: "var(--surface)", border: "1.5px solid var(--border)",
          borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560,
          maxHeight: "92vh", display: "flex", flexDirection: "column",
          animation: "up 0.3s ease", boxShadow: "0 -16px 60px rgba(0,0,0,0.3)",
        }}>
          <div style={{ padding: "18px 20px 0", borderBottom: "1.5px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 3 }}>
                  👤 Viewing As
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 19 }}>{u.name}</h2>
                <div style={{ color: "var(--text2)", fontSize: 12 }}>{u.email}</div>
              </div>
              <button onClick={() => setViewingUser(false)} style={{
                width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
                background: "var(--surface2)", color: "var(--text2)", fontSize: 17,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            {projects.length > 0 && (
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
                {projects.map(p => (
                  <button key={p.id} onClick={() => setSelectedProject(p)} style={{
                    padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)",
                    background: selectedProject?.id === p.id ? "linear-gradient(135deg,var(--sky),var(--sky3))" : "var(--surface2)",
                    color: selectedProject?.id === p.id ? "#fff" : "var(--text2)",
                    fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                  }}>{p.examName}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text2)", padding: "40px 0", fontSize: 13 }}>No projects yet</div>
            ) : !selectedProject ? null : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Students", value: selectedProject.students.length, color: "var(--sky)" },
                    { label: "Pass Rate", value: `${stats.rate}%`, color: "var(--green)" },
                    { label: "Avg GPA", value: stats.avg, color: "var(--indigo)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      background: "var(--surface2)", border: "1.5px solid var(--border)",
                      borderRadius: 11, padding: "11px 14px", flex: 1, textAlign: "center"
                    }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'DM Mono',monospace" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {sortedStudents.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text2)", padding: "30px 0", fontSize: 13 }}>No students</div>
                ) : (
                  <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                      <table>
                        <thead><tr>
                          <th style={{ paddingLeft: 14 }}>Name</th>
                          <th>Roll</th><th>Merit</th><th>GPA</th><th>Grade</th><th>Total</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                          {sortedStudents.map(s => {
                            const rank = meritRanks[s.roll];
                            const rankColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c2f" : null;
                            return (
                              <tr key={s.roll}>
                                <td style={{ fontWeight: 600, paddingLeft: 14 }}>{s.name}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)", fontSize: 12.5 }}>{s.roll}</td>
                                <td>
                                  {rankColor ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 800, background: rankColor, color: "#fff" }}>{rank}</span>
                                  ) : (
                                    <span style={{ color: "var(--text2)", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>#{rank}</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: gradeColor(s.grade), fontFamily: "'DM Mono',monospace" }}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>{s.total}</td>
                                <td><Pill color={s.status === "PASS" ? "var(--green)" : "var(--red)"}>{s.status}</Pill></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(6px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--surface)", border: "1.5px solid var(--border)",
        borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        animation: "up 0.3s ease", boxShadow: "0 -16px 60px rgba(0,0,0,0.28)",
      }}>
        <div style={{ padding: "20px 22px 0", borderBottom: "1.5px solid var(--border)", paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--yellow)", marginBottom: 4 }}>
                ⚡ Admin Control
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>Dashboard</h2>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
              background: "var(--surface2)", color: "var(--text2)", fontSize: 17,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: -1 }}>
            {[["notifs", `Notifications${unreadCount ? ` (${unreadCount})` : ""}`, unreadCount],
              ["users", `Users (${users.length})`, 0]].map(([id, label, badge]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "9px 16px", borderRadius: "10px 10px 0 0",
                border: "1.5px solid var(--border)",
                borderBottom: tab === id ? "1.5px solid var(--surface)" : "1.5px solid var(--border)",
                background: tab === id ? "var(--surface)" : "var(--surface2)",
                color: tab === id ? "var(--text)" : "var(--text2)",
                fontSize: 12.5, fontWeight: tab === id ? 700 : 500,
                position: "relative", marginBottom: tab === id ? -1 : 0,
              }}>
                {label}
                {badge > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    width: 17, height: 17, borderRadius: "50%",
                    background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "badgePop 0.3s ease",
                  }}>{badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {loading ? <Spinner /> : (
            <>
              {tab === "notifs" && (
                <>
                  {unreadCount > 0 && (
                    <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
                      <Btn variant="secondary" onClick={markAllRead} size="sm">✓ Mark all read</Btn>
                    </div>
                  )}
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text2)", padding: "40px 0", fontSize: 13 }}>
                      No notifications yet
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 14px", borderRadius: 11, marginBottom: 8,
                      background: n.read ? "var(--surface2)" : "color-mix(in srgb,var(--sky) 7%,var(--surface2))",
                      border: `1.5px solid ${n.read ? "var(--border)" : "color-mix(in srgb,var(--sky) 22%,var(--border))"}`,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg,var(--sky),var(--sky3))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: "#fff",
                      }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{n.name} joined</div>
                        <div style={{ color: "var(--text2)", fontSize: 12 }}>{n.email}</div>
                        <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sky)", flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </>
              )}
              {tab === "users" && users.map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 11, marginBottom: 8,
                  background: u.blocked ? "color-mix(in srgb,var(--red) 5%,var(--surface2))" : "var(--surface2)",
                  border: `1.5px solid ${u.blocked ? "color-mix(in srgb,var(--red) 20%,var(--border))" : "var(--border)"}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: u.blocked ? "color-mix(in srgb,var(--red) 18%,var(--surface))" : "linear-gradient(135deg,var(--sky),var(--sky3))",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>{u.blocked ? "🚫" : "👤"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {u.email === ADMIN_EMAIL && <Pill color="var(--yellow)">Admin</Pill>}
                      {u.blocked && <Pill color="var(--red)">Blocked</Pill>}
                    </div>
                    <div style={{ color: "var(--text2)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {u.email !== ADMIN_EMAIL && (
                      <Btn variant={u.blocked ? "secondary" : "danger"} onClick={() => toggleBlock(u)} size="sm" style={{ whiteSpace: "nowrap" }}>
                        {u.blocked ? "Unblock" : "Block"}
                      </Btn>
                    )}
                    <Btn variant="sky" onClick={() => loadUserFullData(u)} size="sm" style={{ whiteSpace: "nowrap" }}>
                      📊 View
                    </Btn>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dock ─────────────────────────────────────────────────────────────────────
const Dock = ({ page, go, isAdmin, onAdminOpen }) => {
  const tabs = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "setup", icon: "＋", label: "New" },
    { id: "app", icon: "✎", label: "Entry" },
    { id: "summary", icon: "◈", label: "Stats" },
    { id: "merit", icon: "☰", label: "Merit" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 3, padding: "6px 7px", borderRadius: 20,
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      boxShadow: "0 8px 36px rgba(0,0,0,0.22)", zIndex: 1000,
    }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "8px 13px", borderRadius: 14, border: "none", minWidth: 48,
            background: active ? "linear-gradient(135deg,var(--sky),var(--sky3))" : "transparent",
            color: active ? "#fff" : "var(--text2)",
            fontSize: 16, transition: "all 0.17s",
          }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em" }}>{t.label}</span>
          </button>
        );
      })}
      {isAdmin && (
        <button onClick={onAdminOpen} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "8px 13px", borderRadius: 14, border: "none", minWidth: 48,
          background: "color-mix(in srgb,var(--yellow) 14%,transparent)",
          color: "var(--yellow)", fontSize: 16, transition: "all 0.17s",
        }}>
          <span>⚡</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em" }}>Admin</span>
        </button>
      )}
    </nav>
  );
};

// ─── PDF: Marksheet — Clean White & Sky Blue ──────────────────────────────────
const downloadMarksheet = async (student, project, showToast) => {
  if (!student) return showToast("⚠ No student selected");
  showToast("⏳ Generating marksheet…");

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Color palette
  const SKY    = [14, 165, 233];   // sky-500
  const SKY_LT = [224, 242, 254];  // sky-100
  const SKY_MID= [186, 230, 253];  // sky-200
  const DARK   = [15, 28, 46];     // near-black
  const GREY   = [100, 116, 132];  // slate-500
  const LGREY  = [241, 245, 249];  // slate-100
  const WHITE  = [255, 255, 255];
  const GREEN  = [16, 185, 129];
  const RED    = [239, 68, 68];

  // ── Thin top accent bar ──────────────────────────────────────────────────
  doc.setFillColor(...SKY);
  doc.rect(0, 0, W, 4, "F");

  // ── Header section ───────────────────────────────────────────────────────
  // Logo circle
  doc.setFillColor(...SKY_LT);
  doc.circle(20, 20, 9, "F");
  doc.setFillColor(...SKY);
  doc.circle(20, 20, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("EG", 20, 21.5, { align: "center" });

  // App name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("EduGrade", 33, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("Student Marksheet", 33, 23);

  // Exam name tag (right side)
  doc.setFillColor(...SKY_LT);
  doc.roundedRect(W - 75, 8, 62, 14, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("EXAM", W - 69, 13);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  // Truncate exam name if too long
  const examLabel = project.examName.length > 22 ? project.examName.slice(0,22)+"…" : project.examName;
  doc.text(examLabel, W - 69, 19);

  // Divider line
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.line(15, 32, W - 15, 32);

  // ── Student Information section ──────────────────────────────────────────
  const infoY = 39;
  doc.setFillColor(...LGREY);
  doc.roundedRect(15, infoY, W - 30, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("STUDENT INFORMATION", 19, infoY + 5.5);

  const row1Y = infoY + 16;
  const row2Y = infoY + 24;
  const midX  = W / 2 + 5;

  // Labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Name", 19, row1Y - 0.5);
  doc.text("Roll No.", 19, row2Y - 0.5);
  doc.text("GPA", midX, row1Y - 0.5);
  doc.text("Grade", midX, row2Y - 0.5);

  // Values
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(student.name, 36, row1Y + 0.5);
  doc.text(String(student.roll), 36, row2Y + 0.5);
  doc.text(String(student.gpa), midX + 16, row1Y + 0.5);
  doc.text(student.grade, midX + 16, row2Y + 0.5);

  // Horizontal separators
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.3);
  doc.line(15, row2Y + 5, W - 15, row2Y + 5);

  // ── Subject Marks Table ──────────────────────────────────────────────────
  const subjectNames = project.subjectNames || Array.from({ length: project.subjectCount }, (_, i) => `Subject ${i + 1}`);
  const head = [["S.No.", "Subject", "Marks Obtained", "Out of"]];
  const body = (student.subjectMarks || []).map((mark, i) => [
    i + 1,
    subjectNames[i] || `Subject ${i + 1}`,
    mark || 0,
    "100"
  ]);

  doc.autoTable({
    head,
    body,
    startY: row2Y + 10,
    styles: { font: "helvetica", fontSize: 9, cellPadding: { top: 4.5, bottom: 4.5, left: 5, right: 5 } },
    headStyles: {
      fillColor: SKY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: SKY_LT },
    columnStyles: {
      0: { halign: "center", cellWidth: 14 },
      2: { halign: "center", cellWidth: 34 },
      3: { halign: "center", cellWidth: 22 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const mark = parseInt(data.cell.raw);
        if (mark >= 80) { data.cell.styles.textColor = GREEN; data.cell.styles.fontStyle = "bold"; }
        else if (mark < 33) { data.cell.styles.textColor = RED; data.cell.styles.fontStyle = "bold"; }
      }
    },
    margin: { left: 15, right: 15 },
  });

  // ── Result Summary section ───────────────────────────────────────────────
  const rsY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(...LGREY);
  doc.roundedRect(15, rsY, W - 30, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("RESULT SUMMARY", 19, rsY + 5.5);

  const meritRanks = getMeritRank(project.students);
  const myRank = meritRanks[student.roll] || "—";
  const pct = ((student.total / (project.subjectCount * 100)) * 100).toFixed(2);

  // 2-column grid
  const col1x = 19, col2x = W / 2 + 5;
  const rsRow = (lx, label, value, y, valColor) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(label, lx, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...(valColor || DARK));
    doc.text(String(value), lx, y + 6);
  };

  const r1 = rsY + 16, r2 = rsY + 30, r3 = rsY + 44;
  rsRow(col1x, "Total Marks", `${student.total} / ${project.subjectCount * 100}`, r1);
  rsRow(col2x, "Percentage", `${pct}%`, r1);
  rsRow(col1x, "GPA", student.gpa, r2);
  rsRow(col2x, "Grade", student.grade, r2);
  rsRow(col1x, "Merit Position", `#${myRank}`, r3);

  // Status pill
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Status", col2x, r3);
  const stColor = student.status === "PASS" ? GREEN : RED;
  doc.setFillColor(...stColor.map(c => Math.round(c * 0.15 + 235)));
  doc.roundedRect(col2x, r3 + 2, 22, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...stColor);
  doc.text(student.status, col2x + 11, r3 + 7, { align: "center" });

  // Bottom border above footer
  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.line(15, rsY + 54, W - 15, rsY + 54);

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFillColor(...SKY);
  doc.rect(0, H - 10, W, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("EduGrade — Auto-generated marksheet", 15, H - 4);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, W - 15, H - 4, { align: "right" });

  doc.save(`${student.name}_Marksheet_${project.examName.replace(/\s+/g, "_")}.pdf`);
  showToast("✓ Marksheet downloaded!");
};

// ─── PDF: Merit List — Clean White & Sky Blue ─────────────────────────────────
const downloadMeritListPDF = async (project, showToast) => {
  if (!project?.students.length) return showToast("⚠ No students to export");
  showToast("⏳ Generating Merit List PDF…");

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const SKY    = [14, 165, 233];
  const SKY_LT = [224, 242, 254];
  const SKY_MID= [186, 230, 253];
  const DARK   = [15, 28, 46];
  const GREY   = [100, 116, 132];
  const LGREY  = [241, 245, 249];
  const WHITE  = [255, 255, 255];
  const GREEN  = [16, 185, 129];
  const RED    = [239, 68, 68];

  // ── Top accent bar ───────────────────────────────────────────────────────
  doc.setFillColor(...SKY);
  doc.rect(0, 0, W, 4, "F");

  // ── Header ───────────────────────────────────────────────────────────────
  doc.setFillColor(...SKY_LT);
  doc.circle(20, 20, 9, "F");
  doc.setFillColor(...SKY);
  doc.circle(20, 20, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("EG", 20, 21.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("EduGrade", 33, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("Merit List", 33, 23);

  // Meta info (right)
  doc.setFillColor(...LGREY);
  doc.roundedRect(W - 85, 7, 72, 20, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("EXAM", W - 79, 13);
  doc.text("STUDENTS", W - 79, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const ex2 = project.examName.length > 20 ? project.examName.slice(0, 20) + "…" : project.examName;
  doc.text(ex2, W - 60, 13);
  doc.text(String(project.students.length), W - 60, 20);

  doc.setDrawColor(...SKY_MID);
  doc.setLineWidth(0.5);
  doc.line(15, 32, W - 15, 32);

  // ── Summary stats row ─────────────────────────────────────────────────────
  const passCount = project.students.filter(s => s.status === "PASS").length;
  const failCount = project.students.length - passCount;
  const avgGPA    = (project.students.reduce((a, s) => a + s.gpa, 0) / project.students.length).toFixed(2);
  const passRate  = ((passCount / project.students.length) * 100).toFixed(1);

  const tileW = (W - 30 - 12) / 4;
  [
    { label: "Total", value: project.students.length, color: SKY },
    { label: "Passed", value: passCount, color: GREEN },
    { label: "Failed", value: failCount, color: RED },
    { label: "Avg GPA", value: avgGPA, color: SKY },
  ].forEach(({ label, value, color }, i) => {
    const tx = 15 + i * (tileW + 4);
    doc.setFillColor(...SKY_LT);
    doc.roundedRect(tx, 37, tileW, 14, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(label.toUpperCase(), tx + tileW / 2, 42, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(String(value), tx + tileW / 2, 48.5, { align: "center" });
  });

  // ── Table ─────────────────────────────────────────────────────────────────
  const sortedByRoll = [...project.students].sort((a, b) =>
    String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true })
  );
  const meritRanks = getMeritRank(project.students);

  const head = [["Rank", "Name", "Roll No.", "Total", "GPA", "Grade", "Percent", "Status"]];
  const body = sortedByRoll.map(s => [
    `#${meritRanks[s.roll]}`,
    s.name,
    s.roll,
    s.total,
    s.gpa,
    s.grade,
    `${((s.total / (project.subjectCount * 100)) * 100).toFixed(1)}%`,
    s.status,
  ]);

  doc.autoTable({
    head, body,
    startY: 57,
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
    headStyles: { fillColor: SKY, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: SKY_LT },
    columnStyles: {
      0: { halign: "center", cellWidth: 13 },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "center", cellWidth: 15 },
      4: { halign: "center", cellWidth: 13 },
      5: { halign: "center", cellWidth: 15 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 0) {
          const raw = data.cell.raw;
          if (raw === "#1") { data.cell.styles.textColor = [180, 130, 0]; data.cell.styles.fontStyle = "bold"; }
          else if (raw === "#2") { data.cell.styles.textColor = [100, 116, 139]; data.cell.styles.fontStyle = "bold"; }
          else if (raw === "#3") { data.cell.styles.textColor = [160, 80, 30]; data.cell.styles.fontStyle = "bold"; }
        }
        if (data.column.index === 7) {
          data.cell.styles.textColor = data.cell.raw === "PASS" ? GREEN : RED;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 5) {
          const gradeColors = {
            "A+": SKY, "A": SKY, "A-": SKY, "B": [99, 102, 241],
            "C": [245, 158, 11], "D": [251, 146, 60], "F": RED,
          };
          data.cell.styles.textColor = gradeColors[data.cell.raw] || DARK;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 12, right: 12 },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...SKY);
    doc.rect(0, H - 10, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...WHITE);
    doc.text("EduGrade — Automatically generated merit list", 15, H - 4);
    doc.text(`Page ${i} of ${pageCount}`, W - 15, H - 4, { align: "right" });
  }

  doc.save(`${project.examName.replace(/\s+/g, "_")}_Merit_List.pdf`);
  showToast("✓ Merit List PDF downloaded!");
};

// ─── Firebase Loader ──────────────────────────────────────────────────────────
const useFirebase = () => {
  const [firebase, setFirebase] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const [fbError, setFbError] = useState(false);

  useEffect(() => {
    const load = async () => {
      const loadScript = (src) => new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      try {
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js");
        const app = window.firebase.initializeApp(FIREBASE_CONFIG);
        const auth = window.firebase.auth();
        const db = window.firebase.firestore();
        setFirebase({ app, auth, db });
        setFbReady(true);
      } catch (e) { console.error("Firebase load error:", e); setFbError(true); }
    };
    load();
  }, []);

  return { firebase, fbReady, fbError };
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { firebase, fbReady, fbError } = useFirebase();

  const [splash, setSplash] = useState(true);
  const [page, setPage] = useState("home");
  const [anim, setAnim] = useState(false);
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  const [examName, setExamName] = useState("");
  const [subjectCount, setSubjectCount] = useState("");
  const [subjectNames, setSubjectNames] = useState([]);
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [marks, setMarks] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);
  const [searchRoll, setSearchRoll] = useState("");
  const [saving, setSaving] = useState(false);
  const [studentModal, setStudentModal] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => {
    if (!firebase) return;
    const unsub = firebase.auth.onAuthStateChanged(async (u) => {
      setUser(u); setAuthReady(true);
      if (u) {
        const snap = await firebase.db.collection("users").doc(u.uid).get();
        if (snap.exists && snap.data().blocked) { setIsAccountBlocked(true); return; }
        try {
          const projSnap = await firebase.db.collection("users").doc(u.uid)
            .collection("projects").orderBy("createdAt", "asc").get();
          setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
      } else { setProjects([]); setActiveProjectIndex(null); }
    });
    return () => unsub();
  }, [firebase]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const d = localStorage.getItem("edu_dark");
    if (d !== null) setDark(JSON.parse(d));
  }, []);
  useEffect(() => { localStorage.setItem("edu_dark", JSON.stringify(dark)); }, [dark]);

  const go = useCallback((p) => {
    setAnim(true);
    setTimeout(() => { setPage(p); setAnim(false); }, 180);
  }, []);

  const activeProject = projects[activeProjectIndex] ?? null;

  const createProject = async () => {
    if (!examName.trim() || !subjectCount) return showToast("⚠ Fill all fields");
    const n = Number(subjectCount);
    if (n < 1 || n > 20) return showToast("⚠ Subjects: 1–20");
    setSaving(true);
    try {
      const names = showSubjectInput ? subjectNames.filter(s => s.trim()) : [];
      const np = {
        examName: examName.trim(), subjectCount: n, students: [],
        subjectNames: names.length > 0 ? names : undefined,
        createdAt: new Date().toISOString(),
      };
      const docRef = await firebase.db.collection("users").doc(user.uid).collection("projects").add(np);
      const newP = { ...np, id: docRef.id };
      const updated = [...projects, newP];
      setProjects(updated);
      setActiveProjectIndex(updated.length - 1);
      setMarks(Array(n).fill(""));
      setExamName(""); setSubjectCount(""); setSubjectNames([]); setShowSubjectInput(false);
      go("app"); showToast("✓ Project created");
    } catch (e) { showToast("✗ " + e.message); }
    setSaving(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project and all its data?")) return;
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).delete();
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProject?.id === id) setActiveProjectIndex(null);
      showToast("✓ Deleted");
    } catch (e) { showToast("✗ " + e.message); }
  };

  const addStudent = async () => {
    if (!activeProject) return;
    if (!name.trim() || !roll.trim()) return showToast("⚠ Name & Roll required");
    if (marks.some(m => m === "")) return showToast("⚠ Fill all subject marks");
    const nums = marks.map(Number);
    if (nums.some(isNaN)) return showToast("⚠ Invalid marks");
    const total = nums.reduce((a, b) => a + b, 0);
    const fail = nums.some(m => m < 33);
    const avgGP = fail ? 0 : nums.reduce((a, b) => a + getGP(b), 0) / nums.length;
    const obj = {
      name: name.trim(), roll: roll.trim(), total,
      gpa: Number(avgGP.toFixed(2)), grade: getGrade(avgGP),
      status: fail ? "FAIL" : "PASS", subjectMarks: [...nums],
    };
    setSaving(true);
    try {
      const pr = { ...activeProject, students: [...activeProject.students] };
      const idx = pr.students.findIndex(s => s.roll === obj.roll);
      if (idx !== -1) {
        if (!window.confirm("Student exists. Update?")) { setSaving(false); return; }
        pr.students[idx] = obj;
      } else { pr.students.push(obj); }
      await firebase.db.collection("users").doc(user.uid)
        .collection("projects").doc(pr.id).update({ students: pr.students });
      const updated = [...projects];
      updated[activeProjectIndex] = pr;
      setProjects(updated);
      setViewStudent(obj);
      setName(""); setRoll(""); setMarks(Array(activeProject.subjectCount).fill(""));
      showToast("✓ Saved");
    } catch (e) { showToast("✗ " + e.message); }
    setSaving(false);
  };

  const updateMark = (i, v) => {
    if (v === "") { const c = [...marks]; c[i] = ""; setMarks(c); return; }
    if (Number(v) > 100 || Number(v) < 0) return showToast("⚠ Marks: 0–100");
    const c = [...marks]; c[i] = v; setMarks(c);
  };

  const search = () => {
    const s = activeProject?.students.find(x => x.roll.toLowerCase() === searchRoll.trim().toLowerCase());
    if (!s) return showToast("✗ Not found");
    setViewStudent(s);
  };

  const signOut = async () => {
    await firebase.auth.signOut();
    setProjects([]); setActiveProjectIndex(null); setIsAccountBlocked(false);
    go("home"); showToast("✓ Signed out");
  };

  const meritRanks = activeProject ? getMeritRank(activeProject.students) : {};
  const sortedByRoll = activeProject
    ? [...activeProject.students].sort((a, b) =>
        String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true }))
    : [];
  const top3 = activeProject
    ? [...activeProject.students].sort((a, b) => b.gpa - a.gpa || b.total - a.total).slice(0, 3)
    : [];

  const summaryStats = () => {
    if (!activeProject?.students.length) return { pass: 0, fail: 0, rate: "0.0", avg: "0.00", total: 0 };
    const pass = activeProject.students.filter(s => s.status === "PASS").length;
    const fail = activeProject.students.length - pass;
    const avg = (activeProject.students.reduce((a, s) => a + s.gpa, 0) / activeProject.students.length).toFixed(2);
    return { pass, fail, rate: ((pass / activeProject.students.length) * 100).toFixed(1), avg, total: activeProject.students.length };
  };

  const medalColors = ["#f59e0b", "#94a3b8", "#cd7c2f"];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <Toast msg={toast} />}
      {splash && <LogoSplash onDone={() => setSplash(false)} />}
      {isAccountBlocked && <BlockedModal onSignOut={signOut} />}
      {showAdmin && firebase && <AdminPanel firebase={firebase} showToast={showToast} onClose={() => setShowAdmin(false)} />}
      {studentModal && (
        <StudentListModal
          title={studentModal.title}
          students={studentModal.students}
          color={studentModal.color}
          onClose={() => setStudentModal(null)}
        />
      )}

      <div style={{
        maxWidth: 520, margin: "0 auto",
        paddingTop: 16, paddingLeft: 14, paddingRight: 14, paddingBottom: 108,
        opacity: anim ? 0 : 1,
        transform: anim ? "translateY(10px)" : "translateY(0)",
        transition: "opacity 0.18s, transform 0.18s",
      }}>
        {(!fbReady || !authReady) && !splash && <Spinner />}

        {fbError && (
          <Card style={{ marginTop: 40, textAlign: "center" }}>
            <div style={{ fontSize: 34, marginBottom: 12 }}>❌</div>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Firebase failed to load</p>
            <p style={{ color: "var(--text2)", fontSize: 13 }}>Check your connection and Firebase config.</p>
          </Card>
        )}

        {fbReady && authReady && !user && !fbError && (
          <AuthPage firebase={firebase} onAuth={setUser} showToast={showToast} />
        )}

        {fbReady && authReady && user && !fbError && !isAccountBlocked && (
          <>
            {/* ── HOME ─────────────────────────────────────────────────── */}
            {page === "home" && (
              <div style={{ animation: "up 0.28s ease" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", paddingTop: 10, marginBottom: 28,
                }}>
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 8
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "var(--sky)", boxShadow: "0 0 8px var(--sky)",
                      }} />
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: "var(--sky)",
                      }}>Academic Excellence</span>
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 5 }}>EduGrade</h1>
                    <p style={{ color: "var(--text2)", fontSize: 13 }}>
                      Hi, {user.displayName || user.email?.split("@")[0]} 👋
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <button onClick={() => setDark(!dark)} style={{
                      width: 38, height: 38, borderRadius: "50%",
                      border: "1.5px solid var(--border)",
                      background: "var(--surface2)", color: "var(--text)",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>{dark ? "☀" : "☾"}</button>
                    <button onClick={signOut} style={{
                      padding: "5px 11px", borderRadius: 9,
                      border: "1.5px solid var(--border)",
                      background: "var(--surface2)", color: "var(--text2)",
                      fontSize: 11.5, fontWeight: 600,
                    }}>Sign Out</button>
                  </div>
                </div>

                {/* Quick stats strip */}
                {projects.length > 0 && (
                  <div style={{
                    display: "flex", gap: 8, marginBottom: 18,
                    padding: "12px 16px",
                    background: "var(--surface2)", border: "1.5px solid var(--border)",
                    borderRadius: 14,
                  }}>
                    {[
                      { label: "Projects", value: projects.length },
                      { label: "Students", value: projects.reduce((a, p) => a + p.students.length, 0) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--sky)", fontFamily: "'DM Mono',monospace" }}>{value}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => go("setup")} style={{
                  width: "100%", padding: "15px 22px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, var(--sky), var(--sky3))",
                  color: "#fff", fontSize: 14.5, fontWeight: 700, marginBottom: 16,
                  boxShadow: "0 5px 20px color-mix(in srgb,var(--sky) 30%,transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  letterSpacing: "0.01em",
                }}>
                  <span style={{ fontSize: 18 }}>+</span> Create New Project
                </button>

                {projects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text2)", fontSize: 13.5 }}>
                    <div style={{ fontSize: 40, marginBottom: 14 }}>📚</div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>No projects yet</div>
                    Create your first project above
                  </div>
                ) : projects.map((p, i) => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", marginBottom: 9,
                    background: "var(--surface)", border: "1.5px solid var(--border)",
                    borderRadius: 14,
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: "color-mix(in srgb,var(--sky) 12%,var(--surface2))",
                      border: "1.5px solid color-mix(in srgb,var(--sky) 20%,var(--border))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>📋</div>
                    <div onClick={() => { setActiveProjectIndex(i); setMarks(Array(p.subjectCount).fill("")); go("app"); }}
                      style={{ flex: 1, cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.examName}</div>
                      <div style={{ color: "var(--text2)", fontSize: 12.5 }}>
                        {p.students.length} student{p.students.length !== 1 ? "s" : ""} · {p.subjectCount} subject{p.subjectCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Btn variant="danger" onClick={() => deleteProject(p.id)} style={{ padding: "8px 12px" }}>🗑</Btn>
                  </div>
                ))}
              </div>
            )}

            {/* ── SETUP ────────────────────────────────────────────────── */}
            {page === "setup" && (
              <Card animate>
                <SectionHeader label="New Project" title="Configure Exam" subtitle="Set up your grading project" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <Label>Exam / Project Name</Label>
                    <input placeholder="e.g. Semester 1 Final" value={examName}
                      onChange={e => setExamName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Number of Subjects</Label>
                    <input type="number" placeholder="e.g. 6" value={subjectCount}
                      onChange={e => { setSubjectCount(e.target.value); const n = Number(e.target.value); setSubjectNames(Array(n).fill("")); }}
                      min={1} max={20} />
                  </div>
                  <div>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 9,
                      fontSize: 12, fontWeight: 600, color: "var(--text2)",
                      cursor: "pointer", marginBottom: 10, userSelect: "none",
                    }}>
                      <input type="checkbox" checked={showSubjectInput}
                        onChange={e => setShowSubjectInput(e.target.checked)}
                        style={{ width: "auto", cursor: "pointer", accentColor: "var(--sky)" }} />
                      Add Subject Names (Optional)
                    </label>
                    {showSubjectInput && subjectCount && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Array(Number(subjectCount)).fill(null).map((_, i) => (
                          <input key={i} type="text"
                            placeholder={`Subject ${i + 1}`}
                            value={subjectNames[i] || ""}
                            onChange={e => { const u = [...subjectNames]; u[i] = e.target.value; setSubjectNames(u); }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <Btn onClick={createProject} loading={saving} style={{ width: "100%", marginTop: 4 }}>
                    Create Project →
                  </Btn>
                </div>
              </Card>
            )}

            {/* ── ENTRY ────────────────────────────────────────────────── */}
            {page === "app" && (
              <div style={{ animation: "up 0.28s ease" }}>
                {!activeProject ? (
                  <Card>
                    <p style={{ color: "var(--text2)", textAlign: "center", fontSize: 13 }}>
                      No project selected.{" "}
                      <span style={{ color: "var(--sky)", cursor: "pointer", fontWeight: 700 }} onClick={() => go("home")}>
                        Go home →
                      </span>
                    </p>
                  </Card>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--sky)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          Active Project
                        </div>
                        <h2 style={{ fontWeight: 800, fontSize: 20 }}>{activeProject.examName}</h2>
                      </div>
                      <div style={{
                        background: "color-mix(in srgb,var(--sky) 10%,var(--surface2))",
                        border: "1.5px solid color-mix(in srgb,var(--sky) 22%,var(--border))",
                        borderRadius: 10, padding: "5px 13px", fontSize: 13,
                        color: "var(--sky)", fontWeight: 700, fontFamily: "'DM Mono',monospace",
                      }}>
                        {activeProject.students.length} students
                      </div>
                    </div>

                    <Card style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 13 }}>Add / Update Student</div>
                      <div style={{ display: "flex", gap: 9, marginBottom: 11 }}>
                        <input placeholder="Student Name" value={name} onChange={e => setName(e.target.value)} />
                        <input placeholder="Roll No." value={roll} onChange={e => setRoll(e.target.value)} style={{ maxWidth: 105 }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(84px,1fr))", gap: 7, marginBottom: 13 }}>
                        {marks.map((m, i) => {
                          const subName = activeProject.subjectNames?.[i];
                          return (
                            <input key={i} type="number" value={m}
                              placeholder={subName || `Sub ${i + 1}`}
                              onChange={e => updateMark(i, e.target.value)} min={0} max={100} />
                          );
                        })}
                      </div>
                      <Btn onClick={addStudent} loading={saving} style={{ width: "100%" }}>+ Add Student</Btn>
                    </Card>

                    <Card style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 11 }}>Search Student</div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <input placeholder="Enter Roll No." value={searchRoll}
                          onChange={e => setSearchRoll(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && search()} />
                        <Btn variant="secondary" onClick={search} style={{ whiteSpace: "nowrap" }}>Search</Btn>
                      </div>
                    </Card>

                    {viewStudent && (
                      <Card style={{
                        border: `1.5px solid color-mix(in srgb,${gradeColor(viewStudent.grade)} 30%,var(--border))`,
                        background: `color-mix(in srgb,${gradeColor(viewStudent.grade)} 4%,var(--surface))`,
                        animation: "up 0.25s ease",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{viewStudent.name}</div>
                            <div style={{ color: "var(--text2)", fontSize: 12.5, marginTop: 2 }}>Roll: {viewStudent.roll}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: gradeColor(viewStudent.grade), fontFamily: "'DM Mono',monospace" }}>
                              {viewStudent.grade}
                            </div>
                            <Pill color={viewStudent.status === "PASS" ? "var(--green)" : "var(--red)"}>
                              {viewStudent.status}
                            </Pill>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 9, marginBottom: 13 }}>
                          <StatTile label="GPA" value={viewStudent.gpa} color={gradeColor(viewStudent.grade)} />
                          <StatTile label="Total" value={viewStudent.total} />
                        </div>
                        <Btn onClick={() => downloadMarksheet(viewStudent, activeProject, showToast)} style={{ width: "100%" }}>
                          📋 Download Marksheet
                        </Btn>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── SUMMARY ──────────────────────────────────────────────── */}
            {page === "summary" && (
              <div style={{ animation: "up 0.28s ease" }}>
                <SectionHeader
                  label="Analytics"
                  title="Summary"
                  subtitle={activeProject ? activeProject.examName : "Select a project first"}
                />
                {!activeProject?.students.length ? (
                  <Card>
                    <p style={{ color: "var(--text2)", textAlign: "center", fontSize: 13 }}>No data yet.</p>
                  </Card>
                ) : (() => {
                  const s = summaryStats();
                  return (
                    <>
                      <div style={{ display: "flex", gap: 9, marginBottom: 9 }}>
                        <StatTile label="Total Students" value={s.total} />
                        <StatTile label="Pass Rate" value={`${s.rate}%`} color="var(--green)" />
                      </div>
                      <div style={{ display: "flex", gap: 9, marginBottom: 13 }}>
                        <StatTile
                          label="Passed" value={s.pass} color="var(--green)"
                          onClick={() => setStudentModal({
                            title: "Passed Students",
                            students: activeProject.students.filter(st => st.status === "PASS"),
                            color: "var(--green)",
                          })}
                          actionLabel="View →"
                        />
                        <StatTile
                          label="Failed" value={s.fail} color="var(--red)"
                          onClick={() => setStudentModal({
                            title: "Failed Students",
                            students: activeProject.students.filter(st => st.status === "FAIL"),
                            color: "var(--red)",
                          })}
                          actionLabel="View →"
                        />
                      </div>

                      <div style={{ marginBottom: 13 }}>
                        <StatTile label="Average GPA" value={s.avg} color="var(--sky)" style={{ display: "block" }} />
                      </div>

                      <Card>
                        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 16 }}>Grade Distribution</div>
                        {["A+", "A", "A-", "B", "C", "D", "F"].map(g => {
                          const gstuds = activeProject.students.filter(x => x.grade === g);
                          const count = gstuds.length;
                          const pct = ((count / activeProject.students.length) * 100).toFixed(0);
                          return (
                            <div key={g} style={{ marginBottom: 13 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 5 }}>
                                <span style={{ fontWeight: 700, color: gradeColor(g), minWidth: 24 }}>{g}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ color: "var(--text2)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                                    {count} ({pct}%)
                                  </span>
                                  {count > 0 && (
                                    <button onClick={() => setStudentModal({
                                      title: `Grade ${g} Students`,
                                      students: gstuds,
                                      color: gradeColor(g),
                                    })} style={{
                                      padding: "3px 10px", borderRadius: 7,
                                      border: `1.5px solid color-mix(in srgb,${gradeColor(g)} 28%,transparent)`,
                                      background: `color-mix(in srgb,${gradeColor(g)} 8%,transparent)`,
                                      color: gradeColor(g), fontSize: 10.5, fontWeight: 700, cursor: "pointer",
                                    }}>View</button>
                                  )}
                                </div>
                              </div>
                              <div style={{ height: 5, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                                <div style={{
                                  height: 5, borderRadius: 4, width: `${pct}%`,
                                  background: gradeColor(g), transition: "width 0.6s ease"
                                }} />
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

            {/* ── MERIT ────────────────────────────────────────────────── */}
            {page === "merit" && (
              <div style={{ animation: "up 0.28s ease" }}>
                <SectionHeader
                  label="Rankings"
                  title="Merit Table"
                  subtitle={`${activeProject?.examName || "—"} · by Roll No.`}
                />

                {!activeProject || !sortedByRoll.length ? (
                  <Card><p style={{ color: "var(--text2)", textAlign: "center", fontSize: 13 }}>No students to display.</p></Card>
                ) : (
                  <>
                    {top3.length > 0 && (
                      <div style={{ marginBottom: 18 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--text2)", marginBottom: 10
                        }}>🏆 Top Performers</div>
                        <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
                          {[1, 0, 2].map(idx => {
                            const s = top3[idx];
                            if (!s) return <div key={idx} style={{ flex: 1 }} />;
                            const mc = medalColors[idx];
                            const isFirst = idx === 0;
                            return (
                              <div key={s.roll} style={{
                                flex: 1,
                                background: `color-mix(in srgb,${mc} 9%,var(--surface))`,
                                border: `1.5px solid color-mix(in srgb,${mc} 30%,var(--border))`,
                                borderRadius: 14,
                                padding: isFirst ? "18px 10px" : "13px 10px",
                                textAlign: "center",
                                transform: isFirst ? "translateY(-5px)" : "none",
                              }}>
                                <div style={{ fontSize: isFirst ? 26 : 20, marginBottom: 5 }}>{medals[idx]}</div>
                                <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {s.name}
                                </div>
                                <div style={{ color: "var(--text2)", fontSize: 10.5, marginBottom: 6 }}>Roll: {s.roll}</div>
                                <div style={{
                                  display: "inline-block", padding: "2px 9px", borderRadius: 10,
                                  background: `color-mix(in srgb,${mc} 18%,transparent)`,
                                  color: mc, fontSize: 11.5, fontWeight: 800,
                                }}>GPA {s.gpa}</div>
                                <div style={{ marginTop: 5 }}>
                                  <Pill color={gradeColor(s.grade)}>{s.grade}</Pill>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Card style={{ overflowX: "auto", padding: 0, marginBottom: 14 }}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{ paddingLeft: 16 }}>#</th>
                            <th>Name</th>
                            <th>Roll</th>
                            <th>Merit</th>
                            <th>GPA</th>
                            <th>Grade</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedByRoll.map((s, i) => {
                            const rank = meritRanks[s.roll];
                            const rankColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c2f" : null;
                            return (
                              <tr key={s.roll}>
                                <td style={{ paddingLeft: 16, color: "var(--text2)", fontSize: 12.5, fontFamily: "'DM Mono',monospace" }}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{s.name}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)", fontSize: 12.5 }}>{s.roll}</td>
                                <td>
                                  {rankColor ? (
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                                      width: 26, height: 26, borderRadius: "50%", fontSize: 11, fontWeight: 800,
                                      background: rankColor, color: "#fff",
                                    }}>{rank}</span>
                                  ) : (
                                    <span style={{ color: "var(--text2)", fontSize: 12.5, fontFamily: "'DM Mono',monospace" }}>#{rank}</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: gradeColor(s.grade), fontFamily: "'DM Mono',monospace" }}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>{s.total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>

                    <Btn onClick={() => downloadMeritListPDF(activeProject, showToast)}
                      style={{ width: "100%", padding: "13px" }} size="lg">
                      ⬇ Download Merit List PDF
                    </Btn>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {fbReady && authReady && user && !fbError && !isAccountBlocked && (
        <Dock page={page} go={go} isAdmin={isAdmin} onAdminOpen={() => setShowAdmin(true)} />
      )}
    </>
  );
  }
