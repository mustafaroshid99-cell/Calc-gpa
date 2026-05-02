"use client";
import { useEffect, useState, useCallback, useRef } from "react";

// ─── Firebase config ──────────────────────────────────────────────────────────
// NOTE: Replace with your own Firebase project config from console.firebase.google.com
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

// ─── GPA helpers ──────────────────────────────────────────────────────────────
const getGP    = (m) => m >= 80 ? 5 : m >= 70 ? 4 : m >= 60 ? 3.5 : m >= 50 ? 3 : m >= 40 ? 2 : m >= 33 ? 1 : 0;
const getGrade = (g) => g === 5 ? "A+" : g >= 4 ? "A" : g >= 3.5 ? "A-" : g >= 3 ? "B" : g >= 2 ? "C" : g >= 1 ? "D" : "F";
const gradeColor = (g) =>
  g === "A+" ? "#22c55e" : g === "A" ? "#34d399" : g === "A-" ? "#6ee7b7"
  : g === "B" ? "#60a5fa" : g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

const getMeritRank = (students) =>
  [...students]
    .sort((a, b) => b.gpa - a.gpa || b.total - a.total)
    .reduce((acc, s, i) => { acc[s.roll] = i + 1; return acc; }, {});

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       ${dark ? "#06090f" : "#f0f4ff"};
      --surface:  ${dark ? "#0d1117" : "#ffffff"};
      --surface2: ${dark ? "#161b27" : "#eef2ff"};
      --border:   ${dark ? "#1f2937" : "#dde3f5"};
      --text:     ${dark ? "#e6edf3" : "#0d1117"};
      --text2:    ${dark ? "#7d8ea8" : "#5a6a8a"};
      --accent:   ${dark ? "#3b82f6" : "#2563eb"};
      --accent2:  ${dark ? "#8b5cf6" : "#7c3aed"};
      --green:    ${dark ? "#22c55e" : "#16a34a"};
      --red:      ${dark ? "#ef4444" : "#dc2626"};
      --yellow:   ${dark ? "#f59e0b" : "#d97706"};
      --gold:     #f59e0b;
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Outfit', sans-serif; min-height: 100vh;
      transition: background 0.35s, color 0.35s;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    input[type="text"], input[type="number"], input[type="email"], input[type="password"], input:not([type]) {
      width: 100%; padding: 12px 14px; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface2);
      color: var(--text); font-family: 'Outfit', sans-serif; font-size: 14px;
      font-weight: 400; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    }
    input::placeholder { color: var(--text2); }
    button { cursor: pointer; font-family: 'Outfit', sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--surface2); color: var(--text2);
      font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; padding: 10px 14px; text-align: left;
    }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child  { border-radius: 0 8px 8px 0; }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--accent) 4%, transparent); }
    @keyframes up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes splashIn { 0%{opacity:0;transform:scale(0.6) rotate(-8deg);}60%{transform:scale(1.08) rotate(2deg);}100%{opacity:1;transform:scale(1) rotate(0deg);} }
    @keyframes splashOut { 0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.4);} }
    @keyframes toastPop { 0%{opacity:0;transform:translateX(-50%) scale(0.88);}100%{opacity:1;transform:translateX(-50%) scale(1);} }
    @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.5;} }
    @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes badgePop { 0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);} }
  `;
  return <style>{css}</style>;
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, animate }) => (
  <div style={{
    background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:18,
    padding:22, animation:animate?"up 0.28s ease":"none", ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",
    color:"var(--text2)",marginBottom:7}}>{children}</div>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled, loading }) => {
  const base = {
    display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    padding:"12px 20px",borderRadius:12,border:"none",fontSize:14,fontWeight:600,
    transition:"all 0.17s",cursor:disabled||loading?"not-allowed":"pointer",
    opacity:disabled||loading?0.6:1,letterSpacing:"0.01em",
  };
  const v = {
    primary:{ background:"linear-gradient(135deg,var(--accent),var(--accent2))",color:"#fff",
      boxShadow:"0 4px 18px color-mix(in srgb,var(--accent) 28%,transparent)" },
    secondary:{ background:"var(--surface2)",color:"var(--text)",border:"1.5px solid var(--border)" },
    danger:{ background:"color-mix(in srgb,var(--red) 10%,transparent)",color:"var(--red)",
      border:"1.5px solid color-mix(in srgb,var(--red) 22%,transparent)" },
    ghost:{ background:"transparent",color:"var(--text2)",border:"1.5px solid var(--border)" },
  };
  return (
    <button style={{...base,...v[variant],...style}} onClick={onClick} disabled={disabled||loading}>
      {loading ? <span style={{animation:"spin 0.7s linear infinite",display:"inline-block"}}>⟳</span> : children}
    </button>
  );
};

const Pill = ({ children, color }) => (
  <span style={{
    display:"inline-block",padding:"2px 11px",borderRadius:20,fontSize:12,fontWeight:700,
    background:`color-mix(in srgb,${color} 14%,transparent)`,color,
  }}>{children}</span>
);

const Toast = ({ msg }) => (
  <div style={{
    position:"fixed",top:22,left:"50%",transform:"translateX(-50%)",
    background:"var(--surface)",border:"1.5px solid var(--border)",
    color:"var(--text)",padding:"10px 22px",borderRadius:40,fontSize:14,
    fontWeight:500,zIndex:9999,boxShadow:"0 8px 30px rgba(0,0,0,0.22)",
    animation:"toastPop 0.2s ease",whiteSpace:"nowrap",
  }}>{msg}</div>
);

const StatTile = ({ label, value, color, style={} }) => (
  <div style={{background:"var(--surface2)",border:"1.5px solid var(--border)",
    borderRadius:14,padding:"14px 18px",flex:1,...style}}>
    <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",
      color:"var(--text2)",marginBottom:5}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color:color||"var(--accent)",fontVariantNumeric:"tabular-nums"}}>
      {value}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}>
    <div style={{width:40,height:40,border:"3px solid var(--border)",
      borderTop:"3px solid var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
  </div>
);

// ─── Logo Splash ──────────────────────────────────────────────────────────────
const LogoSplash = ({ onDone }) => {
  const [phase, setPhase] = useState("in"); // in | hold | out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1800);
    const t2 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:99999,
      background:"linear-gradient(135deg,#06090f 0%,#0d1117 50%,#06090f 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      animation: phase==="out" ? "splashOut 0.5s ease forwards" : "none",
    }}>
      {/* Glow ring */}
      <div style={{
        position:"relative",width:140,height:140,marginBottom:28,
        animation:"splashIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        <div style={{
          position:"absolute",inset:-12,borderRadius:"50%",
          background:"conic-gradient(from 0deg,#3b82f6,#8b5cf6,#3b82f6)",
          animation:"spin 3s linear infinite",opacity:0.6,
          filter:"blur(8px)",
        }}/>
        <div style={{
          position:"relative",width:140,height:140,borderRadius:"50%",
          background:"linear-gradient(135deg,#0d1117,#161b27)",
          border:"2px solid #1f2937",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 40px rgba(59,130,246,0.3)",
        }}>
          <span style={{fontSize:60}}>🎓</span>
        </div>
      </div>

      <div style={{
        fontFamily:"'Outfit',sans-serif",fontSize:36,fontWeight:900,
        background:"linear-gradient(135deg,#60a5fa,#a78bfa)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        letterSpacing:"-0.02em",marginBottom:8,
        animation:"splashIn 0.7s 0.15s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>GPA Manager</div>

      <div style={{
        color:"#7d8ea8",fontSize:13,fontWeight:500,letterSpacing:"0.12em",
        textTransform:"uppercase",
        animation:"splashIn 0.6s 0.3s ease both",
      }}>Grade · Calculate · Rank</div>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ firebase, onAuth, showToast }) => {
  const [mode, setMode]       = useState("login"); // login | signup | reset
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return showToast("⚠ Fill all fields");
    if (mode === "signup" && !name.trim()) return showToast("⚠ Enter your name");
    if (password.length < 6 && mode !== "reset") return showToast("⚠ Password min 6 chars");
    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await firebase.auth.signInWithEmailAndPassword(email, password);
        // Check blocked
        const snap = await firebase.db.collection("users").doc(cred.user.uid).get();
        if (snap.exists && snap.data().blocked) {
          await firebase.auth.signOut();
          showToast("🚫 Your account has been blocked");
          setLoading(false);
          return;
        }
        showToast("✓ Welcome back!");
      } else if (mode === "signup") {
        const cred = await firebase.auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name.trim() });
        await firebase.db.collection("users").doc(cred.user.uid).set({
          name: name.trim(), email, createdAt: new Date().toISOString(),
          blocked: false, uid: cred.user.uid,
        });
        // Notify admin
        await firebase.db.collection("adminNotifications").add({
          type: "newUser", name: name.trim(), email,
          uid: cred.user.uid, createdAt: new Date().toISOString(), read: false,
        });
        showToast("✓ Account created!");
      } else {
        await firebase.auth.sendPasswordResetEmail(email);
        showToast("✓ Reset email sent — check inbox");
        setMode("login");
      }
    } catch (e) {
      showToast("✗ " + (e.message?.replace("Firebase: ","") || "Error"));
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:"20px 16px",
    }}>
      <div style={{width:"100%",maxWidth:420,animation:"up 0.35s ease"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{
            width:70,height:70,borderRadius:"50%",margin:"0 auto 16px",
            background:"linear-gradient(135deg,#1e3a8a,#4c1d95)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,
            boxShadow:"0 8px 30px rgba(59,130,246,0.25)",
          }}>🎓</div>
          <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>GPA Manager</h1>
          <p style={{color:"var(--text2)",fontSize:14}}>
            {mode==="login"?"Sign in to your account":mode==="signup"?"Create a new account":"Reset your password"}
          </p>
        </div>

        <Card style={{padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode === "signup" && (
              <div>
                <Label>Full Name</Label>
                <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
            </div>
            {mode !== "reset" && (
              <div>
                <Label>Password</Label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e=>setPass(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
              </div>
            )}
            <Btn onClick={handleSubmit} loading={loading} style={{width:"100%",marginTop:4}}>
              {mode==="login"?"Sign In →":mode==="signup"?"Create Account →":"Send Reset Email →"}
            </Btn>
          </div>

          <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
            {mode === "login" && (
              <>
                <button onClick={()=>setMode("reset")} style={{
                  background:"none",border:"none",color:"var(--accent)",fontSize:13,
                  cursor:"pointer",fontWeight:500
                }}>Forgot password?</button>
                <div style={{color:"var(--text2)",fontSize:13}}>
                  No account?{" "}
                  <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}}
                    onClick={()=>setMode("signup")}>Sign up</span>
                </div>
              </>
            )}
            {mode !== "login" && (
              <div style={{color:"var(--text2)",fontSize:13}}>
                <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}}
                  onClick={()=>setMode("login")}>← Back to Sign In</span>
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
  const [users, setUsers]                 = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab]                     = useState("notifs");
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersSnap = await firebase.db.collection("users").get();
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const notifsSnap = await firebase.db.collection("adminNotifications")
          .orderBy("createdAt","desc").limit(50).get();
        setNotifications(notifsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { showToast("✗ " + e.message); }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleBlock = async (user) => {
    const newBlocked = !user.blocked;
    await firebase.db.collection("users").doc(user.id).update({ blocked: newBlocked });
    setUsers(prev => prev.map(u => u.id===user.id ? {...u,blocked:newBlocked} : u));
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:5000,background:"rgba(0,0,0,0.7)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)",
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:"var(--surface)",border:"1.5px solid var(--border)",
        borderRadius:"22px 22px 0 0",width:"100%",maxWidth:600,
        maxHeight:"85vh",display:"flex",flexDirection:"column",
        animation:"up 0.3s ease",
      }}>
        {/* Header */}
        <div style={{padding:"20px 22px 0",borderBottom:"1.5px solid var(--border)",paddingBottom:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                color:"var(--accent)",marginBottom:4}}>⚡ Admin Control</div>
              <h2 style={{fontWeight:800,fontSize:20}}>Dashboard</h2>
            </div>
            <button onClick={onClose} style={{
              width:36,height:36,borderRadius:"50%",border:"1.5px solid var(--border)",
              background:"var(--surface2)",color:"var(--text2)",fontSize:18,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>×</button>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:-1}}>
            {[["notifs",`Notifications${unreadCount?` (${unreadCount})`:""}`,unreadCount],
              ["users",`Users (${users.length})`,0]].map(([id,label,badge])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"9px 16px",borderRadius:"10px 10px 0 0",border:"1.5px solid var(--border)",
                borderBottom:tab===id?"1.5px solid var(--surface)":"1.5px solid var(--border)",
                background:tab===id?"var(--surface)":"var(--surface2)",
                color:tab===id?"var(--text)":"var(--text2)",
                fontSize:13,fontWeight:tab===id?700:500,position:"relative",
                marginBottom:tab===id?-1:0,
              }}>
                {label}
                {badge>0&&<span style={{
                  position:"absolute",top:-6,right:-6,
                  width:18,height:18,borderRadius:"50%",
                  background:"var(--red)",color:"#fff",fontSize:10,fontWeight:800,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  animation:"badgePop 0.3s ease",
                }}>{badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {loading ? <Spinner /> : (
            <>
              {tab === "notifs" && (
                <>
                  {unreadCount > 0 && (
                    <div style={{marginBottom:14,display:"flex",justifyContent:"flex-end"}}>
                      <Btn variant="secondary" onClick={markAllRead} style={{padding:"7px 14px",fontSize:12}}>
                        ✓ Mark all read
                      </Btn>
                    </div>
                  )}
                  {notifications.length === 0 ? (
                    <div style={{textAlign:"center",color:"var(--text2)",padding:"40px 0",fontSize:14}}>
                      No notifications yet
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{
                      display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                      borderRadius:12,marginBottom:8,
                      background:n.read?"var(--surface2)":"color-mix(in srgb,var(--accent) 8%,var(--surface2))",
                      border:`1.5px solid ${n.read?"var(--border)":"color-mix(in srgb,var(--accent) 25%,var(--border))"}`,
                    }}>
                      <div style={{
                        width:38,height:38,borderRadius:"50%",flexShrink:0,
                        background:"linear-gradient(135deg,var(--accent),var(--accent2))",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:18,color:"#fff",
                      }}>👤</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14}}>{n.name} joined</div>
                        <div style={{color:"var(--text2)",fontSize:12}}>{n.email}</div>
                        <div style={{color:"var(--text2)",fontSize:11,marginTop:2}}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{
                          width:8,height:8,borderRadius:"50%",
                          background:"var(--accent)",flexShrink:0,
                        }}/>
                      )}
                    </div>
                  ))}
                </>
              )}

              {tab === "users" && (
                users.map(u => (
                  <div key={u.id} style={{
                    display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                    borderRadius:12,marginBottom:8,
                    background: u.blocked
                      ? "color-mix(in srgb,var(--red) 5%,var(--surface2))"
                      : "var(--surface2)",
                    border:`1.5px solid ${u.blocked
                      ?"color-mix(in srgb,var(--red) 20%,var(--border))"
                      :"var(--border)"}`,
                  }}>
                    <div style={{
                      width:38,height:38,borderRadius:"50%",flexShrink:0,
                      background: u.blocked
                        ? "color-mix(in srgb,var(--red) 20%,var(--surface))"
                        : "linear-gradient(135deg,var(--accent),var(--accent2))",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:18,
                    }}>
                      {u.blocked ? "🚫" : "👤"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,
                        display:"flex",alignItems:"center",gap:6}}>
                        {u.name}
                        {u.email===ADMIN_EMAIL&&<Pill color="var(--gold)">Admin</Pill>}
                        {u.blocked&&<Pill color="var(--red)">Blocked</Pill>}
                      </div>
                      <div style={{color:"var(--text2)",fontSize:12,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {u.email}
                      </div>
                    </div>
                    {u.email !== ADMIN_EMAIL && (
                      <Btn
                        variant={u.blocked ? "secondary" : "danger"}
                        onClick={() => toggleBlock(u)}
                        style={{padding:"7px 12px",fontSize:12,whiteSpace:"nowrap",flexShrink:0}}>
                        {u.blocked ? "Unblock" : "Block"}
                      </Btn>
                    )}
                  </div>
                ))
              )}
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
    { id:"home",    icon:"⌂",  label:"Home"  },
    { id:"setup",   icon:"＋", label:"New"   },
    { id:"app",     icon:"✎",  label:"Entry" },
    { id:"summary", icon:"◈",  label:"Stats" },
    { id:"merit",   icon:"☰",  label:"Merit" },
  ];
  return (
    <div style={{
      position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",
      display:"flex",gap:4,padding:"7px 8px",borderRadius:22,
      background:"var(--surface)",border:"1.5px solid var(--border)",
      backdropFilter:"blur(18px)",boxShadow:"0 8px 30px rgba(0,0,0,0.2)",zIndex:1000,
    }}>
      {tabs.map(t => {
        const active = page === t.id;
        return (
          <button key={t.id} onClick={()=>go(t.id)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"8px 14px",borderRadius:16,border:"none",minWidth:50,
            background:active?"linear-gradient(135deg,var(--accent),var(--accent2))":"transparent",
            color:active?"#fff":"var(--text2)",fontSize:17,transition:"all 0.17s",
          }}>
            <span>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.05em"}}>{t.label}</span>
          </button>
        );
      })}
      {isAdmin && (
        <button onClick={onAdminOpen} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:2,
          padding:"8px 14px",borderRadius:16,border:"none",minWidth:50,
          background:"color-mix(in srgb,var(--gold) 15%,transparent)",
          color:"var(--gold)",fontSize:17,transition:"all 0.17s",
        }}>
          <span>⚡</span>
          <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.05em"}}>Admin</span>
        </button>
      )}
    </div>
  );
};

// ─── PDF Generator ────────────────────────────────────────────────────────────
const downloadPDF = async (project, showToast) => {
  if (!project?.students.length) return showToast("⚠ No students to export");
  showToast("⏳ Generating PDF…");

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
  const doc = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });

  doc.setFont("helvetica","bold");
  doc.setFontSize(20);
  doc.setTextColor(30,40,80);
  doc.text(project.examName, 14, 18);
  doc.setFont("helvetica","normal");
  doc.setFontSize(10);
  doc.setTextColor(100,110,130);
  doc.text(`Total Students: ${project.students.length}  |  Subjects: ${project.subjectCount}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 26);

  // Sort by roll number
  const sortedByRoll = [...project.students].sort((a,b) =>
    String(a.roll).localeCompare(String(b.roll), undefined, { numeric:true })
  );
  const meritRanks = getMeritRank(project.students);
  const subjectHeaders = Array.from({ length:project.subjectCount }, (_,i) => `Sub ${i+1}`);
  const head = [["#","Name","Roll","Merit","GPA","Grade","Total","Status",...subjectHeaders]];
  const body = sortedByRoll.map((s,i) => [
    i+1, s.name, s.roll, `#${meritRanks[s.roll]}`, s.gpa, s.grade,
    s.total, s.status, ...(s.subjectMarks||Array(project.subjectCount).fill("—")),
  ]);

  doc.autoTable({
    head, body, startY:32,
    styles:{ font:"helvetica", fontSize:9, cellPadding:3 },
    headStyles:{ fillColor:[37,99,235], textColor:255, fontStyle:"bold" },
    alternateRowStyles:{ fillColor:[245,247,255] },
    columnStyles:{
      0:{cellWidth:8,halign:"center"},3:{cellWidth:14,halign:"center"},
      4:{cellWidth:12,halign:"center"},5:{cellWidth:12,halign:"center"},
      6:{cellWidth:14,halign:"center"},7:{cellWidth:14,halign:"center"},
    },
    didParseCell:(data) => {
      if (data.section==="body") {
        if (data.column.index===7) {
          const v = data.cell.raw;
          data.cell.styles.textColor = v==="PASS"?[22,163,74]:[220,38,38];
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index===5) {
          const g=data.cell.raw;
          data.cell.styles.textColor = g==="A+"?[34,197,94]:g==="A"?[52,211,153]
            :g==="A-"?[110,231,183]:g==="B"?[96,165,250]
            :g==="C"?[245,158,11]:g==="D"?[251,146,60]:[239,68,68];
          data.cell.styles.fontStyle="bold";
        }
      }
    },
    margin:{left:14,right:14},
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i=1; i<=pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160,170,190);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width-20, doc.internal.pageSize.height-8, {align:"right"});
    doc.text("GPA Manager", 14, doc.internal.pageSize.height-8);
  }

  doc.save(`${project.examName.replace(/\s+/g,"_")}_students.pdf`);
  showToast("✓ PDF downloaded!");
};

// ─── Firebase Loader ──────────────────────────────────────────────────────────
const useFirebase = () => {
  const [firebase, setFirebase] = useState(null);
  const [fbReady,  setFbReady]  = useState(false);
  const [fbError,  setFbError]  = useState(false);

  useEffect(() => {
    const load = async () => {
      const loadScript = (src) => new Promise((res,rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      try {
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js");

        const app  = window.firebase.initializeApp(FIREBASE_CONFIG);
        const auth = window.firebase.auth();
        const db   = window.firebase.firestore();
        setFirebase({ app, auth, db });
        setFbReady(true);
      } catch(e) {
        console.error("Firebase load error:", e);
        setFbError(true);
      }
    };
    load();
  }, []);

  return { firebase, fbReady, fbError };
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { firebase, fbReady, fbError } = useFirebase();

  const [splash,  setSplash]  = useState(true);
  const [page,    setPage]    = useState("home");
  const [anim,    setAnim]    = useState(false);
  const [dark,    setDark]    = useState(true);
  const [toast,   setToast]   = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  // Auth state
  const [user,    setUser]    = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Project data
  const [projects, setProjects] = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  // Entry fields
  const [examName,     setExamName]     = useState("");
  const [subjectCount, setSubjectCount] = useState("");
  const [name,         setName]         = useState("");
  const [roll,         setRoll]         = useState("");
  const [marks,        setMarks]        = useState([]);
  const [viewStudent,  setViewStudent]  = useState(null);
  const [searchRoll,   setSearchRoll]   = useState("");
  const [saving,       setSaving]       = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(""), 2400);
  }, []);

  // ── Auth listener ──
  useEffect(() => {
    if (!firebase) return;
    const unsub = firebase.auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        // Load user's projects from Firestore
        try {
          const snap = await firebase.db.collection("users").doc(u.uid)
            .collection("projects").orderBy("createdAt","asc").get();
          setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) { console.error("Load projects error:", e); }
      } else {
        setProjects([]);
        setActiveProjectIndex(null);
      }
    });
    return () => unsub();
  }, [firebase]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // ── Dark mode persist ──
  useEffect(() => {
    const d = localStorage.getItem("gpa_dark");
    if (d !== null) setDark(JSON.parse(d));
  }, []);
  useEffect(() => {
    localStorage.setItem("gpa_dark", JSON.stringify(dark));
  }, [dark]);

  const go = useCallback((p) => {
    setAnim(true);
    setTimeout(() => { setPage(p); setAnim(false); }, 190);
  }, []);

  const activeProject = projects[activeProjectIndex] ?? null;

  // ── Save projects to Firestore ──
  const saveProjectsToFirestore = useCallback(async (updatedProjects) => {
    if (!user || !firebase) return;
    // We'll upsert the changed project
    // For simplicity, track by project id
  }, [user, firebase]);

  // ── Create project ──
  const createProject = async () => {
    if (!examName.trim() || !subjectCount) return showToast("⚠ Fill all fields");
    const n = Number(subjectCount);
    if (n<1||n>20) return showToast("⚠ Subjects: 1–20");
    setSaving(true);
    try {
      const np = { examName:examName.trim(), subjectCount:n, students:[], createdAt:new Date().toISOString() };
      const docRef = await firebase.db.collection("users").doc(user.uid).collection("projects").add(np);
      const newP = { ...np, id:docRef.id };
      const updated = [...projects, newP];
      setProjects(updated);
      setActiveProjectIndex(updated.length-1);
      setMarks(Array(n).fill(""));
      setExamName(""); setSubjectCount("");
      go("app");
      showToast("✓ Project created");
    } catch(e) { showToast("✗ " + e.message); }
    setSaving(false);
  };

  // ── Delete project ──
  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project and all its data?")) return;
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).delete();
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProject?.id === id) setActiveProjectIndex(null);
      showToast("✓ Deleted");
    } catch(e) { showToast("✗ " + e.message); }
  };

  // ── Add/update student ──
  const addStudent = async () => {
    if (!activeProject) return;
    if (!name.trim()||!roll.trim()) return showToast("⚠ Name & Roll required");
    if (marks.some(m=>m==="")) return showToast("⚠ Fill all subject marks");
    const nums = marks.map(Number);
    if (nums.some(isNaN)) return showToast("⚠ Invalid marks");
    const total = nums.reduce((a,b)=>a+b,0);
    const fail  = nums.some(m=>m<33);
    const avgGP = fail ? 0 : nums.reduce((a,b)=>a+getGP(b),0)/nums.length;
    const obj = {
      name:name.trim(), roll:roll.trim(), total,
      gpa:Number(avgGP.toFixed(2)), grade:getGrade(avgGP),
      status:fail?"FAIL":"PASS", subjectMarks:[...nums],
    };
    setSaving(true);
    try {
      const pr = { ...activeProject, students:[...activeProject.students] };
      const idx = pr.students.findIndex(s=>s.roll===obj.roll);
      if (idx!==-1) {
        if (!window.confirm("Student exists. Update?")) { setSaving(false); return; }
        pr.students[idx]=obj;
      } else { pr.students.push(obj); }

      await firebase.db.collection("users").doc(user.uid)
        .collection("projects").doc(pr.id).update({ students:pr.students });
      const updated = [...projects];
      updated[activeProjectIndex] = pr;
      setProjects(updated);
      setViewStudent(obj);
      setName(""); setRoll(""); setMarks(Array(activeProject.subjectCount).fill(""));
      showToast("✓ Saved");
    } catch(e) { showToast("✗ " + e.message); }
    setSaving(false);
  };

  const updateMark = (i, v) => {
    if (v==="") { const c=[...marks]; c[i]=""; setMarks(c); return; }
    if (Number(v)>100||Number(v)<0) return showToast("⚠ Marks: 0–100");
    const c=[...marks]; c[i]=v; setMarks(c);
  };

  const search = () => {
    const s = activeProject?.students.find(x=>x.roll.toLowerCase()===searchRoll.trim().toLowerCase());
    if (!s) return showToast("✗ Not found");
    setViewStudent(s);
  };

  const signOut = async () => {
    await firebase.auth.signOut();
    setProjects([]); setActiveProjectIndex(null);
    go("home");
    showToast("✓ Signed out");
  };

  const meritRanks   = activeProject ? getMeritRank(activeProject.students) : {};
  const sortedByRoll = activeProject
    ? [...activeProject.students].sort((a,b) =>
        String(a.roll).localeCompare(String(b.roll), undefined, { numeric:true }))
    : [];

  const summaryStats = () => {
    if (!activeProject?.students.length) return {pass:0,fail:0,rate:"0.0",avg:"0.00",total:0};
    const pass = activeProject.students.filter(s=>s.status==="PASS").length;
    const fail = activeProject.students.length-pass;
    const avg  = (activeProject.students.reduce((a,s)=>a+s.gpa,0)/activeProject.students.length).toFixed(2);
    return {pass,fail,rate:((pass/activeProject.students.length)*100).toFixed(1),avg,total:activeProject.students.length};
  };

  // ── Render ──
  return (
    <>
      <GlobalStyle dark={dark}/>
      {toast && <Toast msg={toast}/>}
      {splash && <LogoSplash onDone={()=>setSplash(false)}/>}
      {showAdmin && firebase && <AdminPanel firebase={firebase} showToast={showToast} onClose={()=>setShowAdmin(false)}/>}

      {/* Firebase config reminder banner */}
      {FIREBASE_CONFIG.apiKey === "AIzaSyDEMO_REPLACE_WITH_YOUR_KEY" && !splash && (
        <div style={{
          position:"fixed",top:0,left:0,right:0,zIndex:8000,
          background:"linear-gradient(90deg,#92400e,#78350f)",
          color:"#fef3c7",padding:"10px 16px",fontSize:13,fontWeight:600,
          textAlign:"center",lineHeight:1.4,
        }}>
          ⚠ Replace FIREBASE_CONFIG in the code with your own Firebase project credentials to enable auth &amp; data sync.
          <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer"
            style={{color:"#fcd34d",marginLeft:8,textDecoration:"underline"}}>
            Get credentials →
          </a>
        </div>
      )}

      <div style={{
        maxWidth:540,margin:"0 auto",
        paddingTop: FIREBASE_CONFIG.apiKey==="AIzaSyDEMO_REPLACE_WITH_YOUR_KEY" ? 70 : 20,
        paddingLeft:14,paddingRight:14,paddingBottom:110,
        opacity:anim?0:1,transform:anim?"translateY(12px)":"translateY(0)",
        transition:"opacity 0.19s, transform 0.19s",
      }}>

        {/* ── Loading ── */}
        {(!fbReady || !authReady) && !splash && (
          <Spinner/>
        )}

        {/* ── Firebase error ── */}
        {fbError && (
          <Card style={{marginTop:40,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>❌</div>
            <p style={{fontWeight:700,marginBottom:8}}>Firebase failed to load</p>
            <p style={{color:"var(--text2)",fontSize:13}}>Check your internet connection and Firebase config.</p>
          </Card>
        )}

        {/* ── Auth ── */}
        {fbReady && authReady && !user && !fbError && (
          <AuthPage firebase={firebase} onAuth={setUser} showToast={showToast}/>
        )}

        {/* ── Main App ── */}
        {fbReady && authReady && user && !fbError && (
          <>
            {/* HOME */}
            {page==="home" && (
              <div style={{animation:"up 0.28s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                  paddingTop:12,marginBottom:32}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
                      color:"var(--accent)",marginBottom:6}}>Academic Tool</div>
                    <h1 style={{fontSize:36,fontWeight:900,lineHeight:1.1}}>GPA Manager</h1>
                    <p style={{color:"var(--text2)",fontSize:13,marginTop:5}}>
                      Hi, {user.displayName||user.email?.split("@")[0]} 👋
                    </p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                    <button onClick={()=>setDark(!dark)} style={{
                      width:42,height:42,borderRadius:"50%",border:"1.5px solid var(--border)",
                      background:"var(--surface2)",color:"var(--text)",fontSize:18,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:"0 4px 14px rgba(0,0,0,0.12)",transition:"all 0.2s",
                    }}>{dark?"☀":"☾"}</button>
                    <button onClick={signOut} style={{
                      padding:"6px 12px",borderRadius:10,border:"1.5px solid var(--border)",
                      background:"var(--surface2)",color:"var(--text2)",fontSize:12,fontWeight:600,
                    }}>Sign Out</button>
                  </div>
                </div>

                <button onClick={()=>go("setup")} style={{
                  width:"100%",padding:"17px 24px",borderRadius:16,border:"none",
                  background:"linear-gradient(135deg,var(--accent),var(--accent2))",
                  color:"#fff",fontSize:15,fontWeight:700,marginBottom:18,
                  boxShadow:"0 6px 24px color-mix(in srgb,var(--accent) 32%,transparent)",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                }}>
                  <span style={{fontSize:20}}>+</span> Create New Project
                </button>

                {projects.length===0 ? (
                  <div style={{textAlign:"center",padding:"44px 0",color:"var(--text2)",fontSize:14}}>
                    <div style={{fontSize:38,marginBottom:12}}>📋</div>
                    No projects yet — create one above!
                  </div>
                ) : projects.map((p,i)=>(
                  <Card key={p.id} style={{display:"flex",alignItems:"center",gap:14,
                    padding:"15px 18px",marginBottom:10}}>
                    <div onClick={()=>{ setActiveProjectIndex(i); setMarks(Array(p.subjectCount).fill("")); go("app"); }}
                      style={{flex:1,cursor:"pointer"}}>
                      <div style={{fontWeight:700,fontSize:16,marginBottom:3}}>{p.examName}</div>
                      <div style={{color:"var(--text2)",fontSize:13}}>
                        {p.students.length} student{p.students.length!==1?"s":""} · {p.subjectCount} subject{p.subjectCount!==1?"s":""}
                      </div>
                    </div>
                    <Btn variant="danger" onClick={()=>deleteProject(p.id)} style={{padding:"8px 13px"}}>🗑</Btn>
                  </Card>
                ))}
              </div>
            )}

            {/* SETUP */}
            {page==="setup" && (
              <Card animate>
                <h2 style={{fontWeight:800,fontSize:22,marginBottom:4}}>New Project</h2>
                <p style={{color:"var(--text2)",fontSize:13,marginBottom:22}}>Configure your exam</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <Label>Exam / Project Name</Label>
                    <input placeholder="e.g. Semester 1 Final" value={examName}
                      onChange={e=>setExamName(e.target.value)}/>
                  </div>
                  <div>
                    <Label>Number of Subjects</Label>
                    <input type="number" placeholder="e.g. 6" value={subjectCount}
                      onChange={e=>setSubjectCount(e.target.value)} min={1} max={20}
                      onKeyDown={e=>e.key==="Enter"&&createProject()}/>
                  </div>
                  <Btn onClick={createProject} loading={saving} style={{width:"100%",marginTop:4}}>
                    Create Project →
                  </Btn>
                </div>
              </Card>
            )}

            {/* ENTRY */}
            {page==="app" && (
              <div style={{animation:"up 0.28s ease"}}>
                {!activeProject ? (
                  <Card>
                    <p style={{color:"var(--text2)",textAlign:"center"}}>
                      No project selected.{" "}
                      <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>go("home")}>
                        Go home →
                      </span>
                    </p>
                  </Card>
                ) : (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                      <div>
                        <div style={{fontSize:11,color:"var(--text2)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                          Active Project
                        </div>
                        <h2 style={{fontWeight:800,fontSize:20}}>{activeProject.examName}</h2>
                      </div>
                      <div style={{background:"var(--surface2)",border:"1.5px solid var(--border)",
                        borderRadius:10,padding:"5px 13px",fontSize:13,color:"var(--text2)"}}>
                        {activeProject.students.length} students
                      </div>
                    </div>

                    <Card style={{marginBottom:14}}>
                      <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Add / Update Student</div>
                      <div style={{display:"flex",gap:10,marginBottom:12}}>
                        <input placeholder="Student Name" value={name} onChange={e=>setName(e.target.value)}/>
                        <input placeholder="Roll" value={roll} onChange={e=>setRoll(e.target.value)} style={{maxWidth:110}}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:8,marginBottom:14}}>
                        {marks.map((m,i)=>(
                          <input key={i} type="number" value={m} placeholder={`Sub ${i+1}`}
                            onChange={e=>updateMark(i,e.target.value)} min={0} max={100}/>
                        ))}
                      </div>
                      <Btn onClick={addStudent} loading={saving} style={{width:"100%"}}>+ Add Student</Btn>
                    </Card>

                    <Card style={{marginBottom:14}}>
                      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Search Student</div>
                      <div style={{display:"flex",gap:10}}>
                        <input placeholder="Enter Roll No." value={searchRoll}
                          onChange={e=>setSearchRoll(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&search()}/>
                        <Btn variant="secondary" onClick={search} style={{whiteSpace:"nowrap"}}>Search</Btn>
                      </div>
                    </Card>

                    {viewStudent && (
                      <Card style={{
                        border:`1.5px solid color-mix(in srgb,${gradeColor(viewStudent.grade)} 35%,transparent)`,
                        background:`color-mix(in srgb,${gradeColor(viewStudent.grade)} 5%,var(--surface))`,
                        animation:"up 0.25s ease",
                      }}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                          <div>
                            <div style={{fontWeight:800,fontSize:19}}>{viewStudent.name}</div>
                            <div style={{color:"var(--text2)",fontSize:13}}>Roll: {viewStudent.roll}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:30,fontWeight:800,color:gradeColor(viewStudent.grade)}}>
                              {viewStudent.grade}
                            </div>
                            <Pill color={viewStudent.status==="PASS"?"var(--green)":"var(--red)"}>
                              {viewStudent.status}
                            </Pill>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:10}}>
                          <StatTile label="GPA" value={viewStudent.gpa} color={gradeColor(viewStudent.grade)}/>
                          <StatTile label="Total" value={viewStudent.total}/>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SUMMARY */}
            {page==="summary" && (
              <div style={{animation:"up 0.28s ease"}}>
                <h2 style={{fontWeight:800,fontSize:24,marginBottom:4}}>Summary</h2>
                <p style={{color:"var(--text2)",fontSize:13,marginBottom:22}}>
                  {activeProject?activeProject.examName:"Select a project first"}
                </p>
                {!activeProject?.students.length ? (
                  <Card><p style={{color:"var(--text2)",textAlign:"center"}}>No data yet.</p></Card>
                ) : (()=>{
                  const s=summaryStats();
                  return (
                    <>
                      <div style={{display:"flex",gap:10,marginBottom:10}}>
                        <StatTile label="Total Students" value={s.total}/>
                        <StatTile label="Pass Rate" value={`${s.rate}%`} color="var(--green)"/>
                      </div>
                      <div style={{display:"flex",gap:10,marginBottom:14}}>
                        <StatTile label="Passed" value={s.pass} color="var(--green)"/>
                        <StatTile label="Failed"  value={s.fail}  color="var(--red)"/>
                      </div>
                      <StatTile label="Average GPA" value={s.avg} style={{display:"block",marginBottom:14}}/>
                      <Card>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Grade Distribution</div>
                        {["A+","A","A-","B","C","D","F"].map(g=>{
                          const count=activeProject.students.filter(x=>x.grade===g).length;
                          const pct=((count/activeProject.students.length)*100).toFixed(0);
                          return (
                            <div key={g} style={{marginBottom:11}}>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                                <span style={{fontWeight:700,color:gradeColor(g)}}>{g}</span>
                                <span style={{color:"var(--text2)",fontVariantNumeric:"tabular-nums"}}>
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div style={{height:6,borderRadius:4,background:"var(--border)"}}>
                                <div style={{height:6,borderRadius:4,width:`${pct}%`,
                                  background:gradeColor(g),transition:"width 0.6s ease"}}/>
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

            {/* MERIT */}
            {page==="merit" && (
              <div style={{animation:"up 0.28s ease"}}>
                <div style={{marginBottom:20}}>
                  <h2 style={{fontWeight:800,fontSize:24,marginBottom:2}}>Merit Table</h2>
                  <p style={{color:"var(--text2)",fontSize:13}}>
                    {activeProject?.examName||"—"} · sorted by Roll No.
                  </p>
                </div>

                {!activeProject||!sortedByRoll.length ? (
                  <Card><p style={{color:"var(--text2)",textAlign:"center"}}>No students to display.</p></Card>
                ) : (
                  <>
                    <Card style={{overflowX:"auto",padding:0,marginBottom:16}}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{paddingLeft:18}}>#</th>
                            <th>Name</th>
                            <th>Roll</th>
                            <th>Merit</th>
                            <th>GPA</th>
                            <th>Grade</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedByRoll.map((s,i)=>{
                            const rank=meritRanks[s.roll];
                            const rankColor=rank===1?"#f59e0b":rank===2?"#94a3b8":rank===3?"#cd7c2f":null;
                            return (
                              <tr key={s.roll}>
                                <td style={{paddingLeft:18,color:"var(--text2)",fontSize:13,
                                  fontFamily:"'JetBrains Mono',monospace"}}>{i+1}</td>
                                <td style={{fontWeight:600}}>{s.name}</td>
                                <td style={{fontFamily:"'JetBrains Mono',monospace",color:"var(--text2)",fontSize:13}}>
                                  {s.roll}
                                </td>
                                <td>
                                  {rankColor ? (
                                    <span style={{
                                      display:"inline-flex",alignItems:"center",justifyContent:"center",
                                      width:28,height:28,borderRadius:"50%",fontSize:12,fontWeight:800,
                                      background:rankColor,color:"#fff",
                                    }}>{rank}</span>
                                  ) : (
                                    <span style={{color:"var(--text2)",fontSize:13,
                                      fontFamily:"'JetBrains Mono',monospace"}}>#{rank}</span>
                                  )}
                                </td>
                                <td style={{fontWeight:700,color:gradeColor(s.grade),
                                  fontFamily:"'JetBrains Mono',monospace"}}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{fontFamily:"'JetBrains Mono',monospace"}}>{s.total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>

                    {/* PDF download button at the bottom of merit page */}
                    <Btn
                      onClick={()=>downloadPDF(activeProject,showToast)}
                      style={{width:"100%",padding:"14px",fontSize:15}}>
                      ⬇ Download PDF Report
                    </Btn>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dock — only shown when logged in */}
      {fbReady && authReady && user && !fbError && (
        <Dock page={page} go={go} isAdmin={isAdmin} onAdminOpen={()=>setShowAdmin(true)}/>
      )}
    </>
  );
  }
