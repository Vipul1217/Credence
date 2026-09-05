import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, FileCheck2, Wallet, Store, Radio, Settings2,
  BarChart3, Receipt, Search, Plus, Check, X, Flag, AlertTriangle,
  ChevronRight, Download, Bell, LogOut, ShieldCheck, User, Loader2,
  Nfc, QrCode, Info
} from "lucide-react";

function initials(name) {
  if (!name) return "O";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}
import { api, setToken } from "./api.js";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  border: "#E5DDD1",
  brown: "#8B6F4E",
  brownDark: "#6E5638",
  textDark: "#3D2E1F",
  textMuted: "#8A7B68",
  green: "#2F7A4D",
  greenBg: "#EAF4EC",
  amber: "#B8863B",
  amberBg: "#FBF2E3",
  red: "#B84A3E",
  redBg: "#FBEBE9",
};

/* ---------------------------------- MOCK DATA ---------------------------------- */
const initialApplications = [
  { id: "APP-1042", name: "Jashanjeet Singh", score: 72, band: "medium", amount: 40000, category: "Cart & Equipment", date: "2026-09-05", status: "pending", safeLimit: 49242, cashflow: "1.00�", debtBurden: "0%", incomeConsistency: "45%", customerDiversity: "40 payers", transactionVelocity: "55/month", repaymentIntegrity: "Zero Bounces", longevity: "11 months", leanPeriodResilience: "Strong" },
  { id: "APP-1041", name: "Ravi Kumar", score: 81, band: "high", amount: 50000, category: "Cart & Equipment", date: "2026-09-04", status: "pending", safeLimit: 68500, cashflow: "1.18�", debtBurden: "8%", incomeConsistency: "82%", customerDiversity: "56 payers", transactionVelocity: "71/month", repaymentIntegrity: "Zero Bounces", longevity: "19 months", leanPeriodResilience: "Strong" },
  { id: "APP-1040", name: "Meena Devi", score: 64, band: "medium", amount: 30000, category: "Raw Material", date: "2026-09-04", status: "pending", safeLimit: 35800, cashflow: "0.94�", debtBurden: "14%", incomeConsistency: "61%", customerDiversity: "31 payers", transactionVelocity: "43/month", repaymentIntegrity: "1 late payment", longevity: "9 months", leanPeriodResilience: "Moderate" },
  { id: "APP-1039", name: "Farida Bano", score: 48, band: "low", amount: 20000, category: "Shop Renovation", date: "2026-09-03", status: "pending", safeLimit: 18000, cashflow: "0.76�", debtBurden: "29%", incomeConsistency: "38%", customerDiversity: "18 payers", transactionVelocity: "29/month", repaymentIntegrity: "2 late payments", longevity: "6 months", leanPeriodResilience: "Weak" },
  { id: "APP-1038", name: "Manjeet Kaur", score: 69, band: "medium", amount: 30000, category: "Sewing Equipment", date: "2026-09-02", status: "approved", safeLimit: 41200, cashflow: "1.04�", debtBurden: "6%", incomeConsistency: "68%", customerDiversity: "37 payers", transactionVelocity: "49/month", repaymentIntegrity: "Zero Bounces", longevity: "13 months", leanPeriodResilience: "Moderate" },
  { id: "APP-1037", name: "Devendra Yadav", score: 86, band: "high", amount: 50000, category: "Cart & Equipment", date: "2026-09-01", status: "approved", safeLimit: 74200, cashflow: "1.26�", debtBurden: "4%", incomeConsistency: "88%", customerDiversity: "63 payers", transactionVelocity: "79/month", repaymentIntegrity: "Zero Bounces", longevity: "24 months", leanPeriodResilience: "Strong" },
];

const initialLoans = [
  { id: "LN-3081", name: "Anita Sharma", status: "active", balance: 8400, category: "Sewing Equipment", mode: "NFC" },
  { id: "LN-3080", name: "Ravi Prasad", status: "active", balance: 15200, category: "Cart & Equipment", mode: "QR" },
  { id: "LN-3079", name: "Neelam Gupta", status: "flagged", balance: 4200, category: "Raw Material", mode: "NFC" },
  { id: "LN-3078", name: "Suresh Pal", status: "active", balance: 19800, category: "Shop Renovation", mode: "QR" },
];

const initialMerchants = [
  { id: "MER-201", name: "Bansal Cart Suppliers", category: "Cart & Equipment", location: "Sadar Bazaar, Ludhiana", reader: "NFC + QR", status: "verified" },
  { id: "MER-202", name: "Singh Sewing Traders", category: "Sewing Equipment", location: "Chowk Bazaar, Ludhiana", reader: "QR only", status: "verified" },
  { id: "MER-203", name: "New Horizon Textiles", category: "Raw Material", location: "Gill Road, Ludhiana", reader: "NFC only", status: "pending" },
  { id: "MER-204", name: "Kapoor Hardware", category: "Shop Renovation", location: "Model Town, Ludhiana", reader: "NFC + QR", status: "pending" },
];

const initialVerifications = [
  { id: "VE-9931", seeker: "Ramesh Kumar", merchant: "Bansal Cart Suppliers", match: true, amount: 1200, time: "09:41", mode: "NFC" },
  { id: "VE-9930", seeker: "Sunita Devi", merchant: "Singh Sewing Traders", match: true, amount: 850, time: "09:22", mode: "QR" },
  { id: "VE-9929", seeker: "Iqbal Singh", merchant: "New Horizon Textiles", match: false, amount: 2000, time: "08:58", mode: "NFC" },
  { id: "VE-9928", seeker: "Manjeet Kaur", merchant: "Kapoor Hardware", match: true, amount: 3400, time: "08:30", mode: "QR" },
];

const NOTIFICATIONS = [
  { id: 1, text: "New merchant request from Kapoor Hardware", time: "10m ago" },
  { id: 2, text: "3 declined taps at New Horizon Textiles in the last hour", time: "42m ago" },
  { id: 3, text: "Monthly billing invoice generated", time: "2h ago" },
];

const CATEGORIES = ["Cart & Equipment", "Sewing Equipment", "Raw Material", "Shop Renovation"];
const READER_TYPES = ["NFC only", "QR only", "NFC + QR"];

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "applications", label: "Applications", icon: FileCheck2 },
  { key: "loans", label: "Active loans", icon: Wallet },
  { key: "merchants", label: "Merchants", icon: Store },
  { key: "verification", label: "Verification log", icon: Radio },
  { key: "config", label: "Scheme config", icon: Settings2 },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "billing", label: "Billing", icon: Receipt },
];

/* ---------------------------------- HELPERS ---------------------------------- */
function downloadFile(filename, content, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(rows, headers) {
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  return head + "\n" + body;
}

function bandTone(band) { return band === "high" ? "green" : band === "medium" ? "amber" : "red"; }

/* ---------------------------------- DISBURSEMENT PATH (NFC = Path A, QR = Path B) ----------------------------------
   Two verification modes map to two different money-movement models, not just two
   different tap methods — this is the Round 1 / Challenge 2 hardware-shortage adaptation:
     Path A (NFC) — prepaid restricted card. Balance is already loaded; a matched tap
       moves money instantly from that pre-loaded balance. No new money enters the system.
     Path B (QR)  — verify-then-disburse. The tap/scan is only a logged verification event;
       the vendor never holds the money. Once logged, the scheme releases payment directly
       to the merchant/vendor account afterward — a reimbursement, not a card swipe. */
const PATH_INFO = {
  NFC: {
    path: "Path A",
    icon: Nfc,
    tone: "purple",
    title: "Prepaid card tap",
    detail: "Deducted instantly from the card's pre-loaded restricted balance.",
  },
  QR: {
    path: "Path B",
    icon: QrCode,
    tone: "teal",
    title: "Verify-then-disburse",
    detail: "Logged as a verification event; scheme pays the merchant/vendor afterward. Vendor never holds the funds.",
  },
};

/* ---------------------------------- SMALL UI PARTS ---------------------------------- */
function Badge({ tone, children }) {
  const tones = {
    green: { bg: C.greenBg, text: C.green },
    amber: { bg: C.amberBg, text: C.amber },
    red: { bg: C.redBg, text: C.red },
    brown: { bg: "#F1E9DD", text: C.brownDark },
    purple: { bg: "#EFE9F7", text: "#6B4FA0" },
    teal: { bg: "#E4F3F1", text: "#227A6C" },
  };
  const t = tones[tone] || tones.brown;
  return (
    <span style={{
      background: t.bg, color: t.text, fontSize: 12, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999, display: "inline-block", whiteSpace: "nowrap"
    }}>{children}</span>
  );
}

/* Mode badge — shows NFC/QR *and* which disbursement path it belongs to,
   with a native tooltip (title=) explaining the money-movement difference. */
function ModeBadge({ mode, compact }) {
  const info = PATH_INFO[mode] || PATH_INFO.NFC;
  const Icon = info.icon;
  return (
    <span title={`${info.path} — ${info.detail}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        background: info.tone === "purple" ? "#EFE9F7" : "#E4F3F1",
        color: info.tone === "purple" ? "#6B4FA0" : "#227A6C",
        fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
        display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap"
      }}>
        <Icon size={12} />{mode}
      </span>
      {!compact && <span style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap" }}>{info.path}</span>}
    </span>
  );
}

/* Small explainer banner used above the verification log / loans tables so an
   officer can see at a glance what NFC vs QR actually means for money movement. */
function PathLegend() {
  return (
    <div style={{
      display: "flex", gap: 18, flexWrap: "wrap", background: "#FBFAF7",
      border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14
    }}>
      {["NFC", "QR"].map(mode => {
        const info = PATH_INFO[mode];
        const Icon = info.icon;
        return (
          <div key={mode} style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: "1 1 260px", minWidth: 240 }}>
            <span style={{
              background: info.tone === "purple" ? "#EFE9F7" : "#E4F3F1",
              color: info.tone === "purple" ? "#6B4FA0" : "#227A6C",
              borderRadius: 8, padding: 6, display: "flex", flexShrink: 0
            }}><Icon size={15} /></span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.textDark }}>{info.path} · {info.title}</div>
              <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.4 }}>{info.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "18px 20px", ...style
    }}>{children}</div>
  );
}

function Metric({ label, value, sub }) {
  return (
    <Card style={{ flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.textDark }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function StatusRow({ children, accent }) {
  return (
    <div style={{
      borderLeft: `3px solid ${accent}`, background: C.surface, marginBottom: 8,
      borderRadius: 6, padding: "12px 16px", display: "flex", alignItems: "center",
      gap: 16, border: `1px solid ${C.border}`, borderLeftWidth: 3, borderLeftColor: accent
    }}>{children}</div>
  );
}

function IconBtn({ icon: Icon, onClick, tone = "neutral", label }) {
  const tones = {
    neutral: { border: C.border, color: C.textDark, bg: C.surface },
    green: { border: C.green, color: C.green, bg: C.greenBg },
    red: { border: C.red, color: C.red, bg: C.redBg },
    amber: { border: C.amber, color: C.amber, bg: C.amberBg },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
      color: t.color, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6,
      padding: "6px 11px", cursor: "pointer"
    }}>
      <Icon size={14} />{label}
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: C.textDark, color: "#fff", padding: "10px 20px", borderRadius: 8,
      fontSize: 13.5, fontWeight: 500, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", zIndex: 999
    }}>{message}</div>
  );
}

const th = { padding: "8px 10px", fontWeight: 600 };
const td = { padding: "12px 10px", color: C.textDark, verticalAlign: "middle" };
const inputStyle = { width: "100%", padding: "9px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 6, outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: C.textMuted, marginBottom: 6, display: "block" };
const primaryBtn = { width: "100%", padding: "10px 0", borderRadius: 7, border: "none", background: C.brown, color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };
const primaryBtnSmall = { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7, border: "none", background: C.brown, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const errorText = { fontSize: 12, color: C.red, marginBottom: 10 };

const GLOBAL_STYLES = `
  * { box-sizing: border-box; }
  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible {
    outline: 2px solid ${C.brown}; outline-offset: 2px;
  }
  @media (max-width: 780px) {
    .credence-sidebar { width: 64px !important; padding: 16px 8px !important; }
    .credence-sidebar .nav-label { display: none; }
    .credence-sidebar .brand-label { display: none; }
    .credence-main { padding: 16px !important; }
    .credence-drawer { width: 100% !important; }
  }
`;

function GlobalStyles() {
  return <style>{GLOBAL_STYLES}</style>;
}

const SECTION_KEYS = ["overview", "applications", "loans", "merchants", "verification", "config", "analytics", "billing", "profile"];

function getHashSection() {
  const h = window.location.hash.replace("#", "");
  return SECTION_KEYS.includes(h) ? h : "overview";
}

function Spinner({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 24, color: C.textMuted, fontSize: 13 }}>
      <Loader2 size={16} className="spin" style={{ animation: "spin 0.8s linear infinite" }} />
      {label || "Loading..."}
      <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      background: C.redBg, border: `1px solid ${C.red}`, color: C.red, borderRadius: 8,
      padding: "10px 14px", fontSize: 13, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10
    }}>
      <span>{message}</span>
      {onRetry && <button onClick={onRetry} style={{ border: "none", background: "transparent", color: C.red, fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>Retry</button>}
    </div>
  );
}

/* ---------------------------------- MAIN APP ---------------------------------- */
export default function App() {
  const [active, setActiveState] = useState(getHashSection());
  const [applications, setApplications] = useState(initialApplications);
  const [loans, setLoans] = useState(initialLoans);
  const [merchants, setMerchants] = useState(initialMerchants);
  const [verifications, setVerifications] = useState(initialVerifications);
  const [selectedApp, setSelectedApp] = useState(null);
  const [dataSource, setDataSource] = useState("demo"); // "demo" | "live"
  const [loadError, setLoadError] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [filterBand, setFilterBand] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [remoteMode, setRemoteMode] = useState(true);
  const [newMerchant, setNewMerchant] = useState({ name: "", category: CATEGORIES[0], location: "", reader: READER_TYPES[2] });
  const [merchantError, setMerchantError] = useState("");
  const [tiers, setTiers] = useState([10000, 20000, 50000]);
  const [newTier, setNewTier] = useState("");
  const [liveFeed, setLiveFeed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [officer, setOfficer] = useState({ id: "", name: "Scheme Officer", phone: "", role: "officer" });
  const [schemeInfo, setSchemeInfo] = useState({ name: "PM Street Vendor Credit Scheme", purpose_categories: CATEGORIES, amount_tiers: [10000, 20000, 50000], remote_mode_enabled: true });

  // ---------- Auth state ----------
  const [loggedIn, setLoggedIn] = useState(false);
  const [otpStage, setOtpStage] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [authError, setAuthError] = useState("");

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  const setActive = useCallback((key) => {
    setActiveState(key);
    window.location.hash = key;
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveState(getHashSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ---------- Escape key closes any open overlay (drawer, modal, dropdowns) ----------
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      setSelectedApp(null);
      setShowAddMerchant(false);
      setShowNotifs(false);
      setShowProfile(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ---------- Load real data once logged in; fall back to demo data if the backend is unreachable ----------
  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");
    try {
      const [appsRes, ls, merchRes, verRes, cfg, me] = await Promise.all([
        api.listApplications(), api.listLoans(), api.listMerchants(), api.listVerifications(), api.getSchemeConfig(), api.getMe(),
      ]);
      const apps = appsRes.items || appsRes;
      const ms = merchRes.items || merchRes;
      const vs = verRes.items || verRes;
      setApplications(apps.map(a => ({ ...a, date: (a.date_applied || "").slice(0, 10) })));
      setLoans(ls);
      setMerchants(ms.map(m => ({ ...m, reader: m.reader_type, status: m.verification_status })));
      setVerifications(vs.map(v => ({ ...v, seeker: v.seeker_name, merchant: v.merchant_name, match: v.category_matched, time: (v.timestamp || "").slice(11, 16) })));
      setTiers(cfg.amount_tiers || []);
      setRemoteMode(cfg.remote_mode_enabled);
      setSchemeInfo(cfg);
      setOfficer(me);
      setDataSource("live");
    } catch (err) {
      // Backend not reachable (or empty) - keep the built-in demo data so the
      // dashboard is still fully explorable without a running backend.
      setDataSource("demo");
      setLoadError("Showing demo data — could not load from the Credence API (" + err.message + ")");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // ---------- Close notification/profile dropdowns on outside click ----------
  const headerMenuRef = useRef(null);
  useEffect(() => {
    function onClickOutside(e) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setShowNotifs(false);
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);
  const feedRef = useRef(null);
  useEffect(() => {
    if (liveFeed) {
      feedRef.current = setInterval(() => {
        const seekers = ["Ramesh Kumar", "Sunita Devi", "Iqbal Singh", "Manjeet Kaur", "Farida Bano"];
        const merchList = merchants.map(m => m.name);
        const match = Math.random() > 0.2;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setVerifications(v => [{
          id: "VE-" + Math.floor(1000 + Math.random() * 9000),
          seeker: seekers[Math.floor(Math.random() * seekers.length)],
          merchant: merchList[Math.floor(Math.random() * merchList.length)],
          match, amount: Math.floor(500 + Math.random() * 3000), time,
          mode: Math.random() > 0.5 ? "NFC" : "QR"
        }, ...v].slice(0, 20));
      }, 4000);
      return () => clearInterval(feedRef.current);
    }
  }, [liveFeed, merchants]);

  // ---------- Auth handlers ----------
  // Tries the real backend first; if it's unreachable, falls back to a local
  // simulated OTP so the dashboard stays fully explorable without a server.
  const [otpLoading, setOtpLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setAuthError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setAuthError("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.requestOtp(phone);
      setGeneratedOtp(res.demo_code || "");
      setOtpStage("otp");
      flash(res.demo_code ? `OTP sent — demo code is ${res.demo_code}` : "OTP sent");
    } catch (err) {
      // Backend unreachable — fall back to a locally simulated OTP.
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setOtpStage("otp");
      flash(`Backend unreachable, using demo mode — code is ${code}`);
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setAuthError("");
    if (!/^\d{6}$/.test(otpInput)) {
      setAuthError("Enter the 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.verifyOtp(phone, otpInput);
      setToken(res.access_token);
      setLoggedIn(true);
      flash("Welcome back, Officer");
      loadAllData();
    } catch (err) {
      // Fall back to comparing against the locally generated demo code,
      // in case the backend is unreachable (network error) or rejected it.
      if (otpInput === generatedOtp && generatedOtp) {
        setLoggedIn(true);
        flash("Welcome back, Officer (demo mode)");
      } else {
        setAuthError(err.message || "Incorrect OTP. Check the demo code and try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  }

  function signOut() {
    setLoggedIn(false);
    setToken(null);
    setOtpStage("phone");
    setPhone(""); setOtpInput(""); setGeneratedOtp(""); setAuthError("");
    setShowProfile(false);
    setDataSource("demo");
    setActive("overview");
  }

  // ---------- Applications ----------
  // Each handler tries the live API first (when connected), and always
  // applies the optimistic local update so the UI stays responsive in demo
  // mode or if the request fails.
  async function decide(id, decision) {
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status: decision } : a));
    setSelectedApp(null);
    flash(decision === "approved" ? `${id} approved` : decision === "rejected" ? `${id} rejected` : `${id} sent back for more info`);
    if (dataSource === "live") {
      try { await api.decideApplication(id, decision); }
      catch (err) { flash(`Could not sync decision to server: ${err.message}`); }
    }
  }

  async function toggleFreeze(id) {
    setLoans(ls => ls.map(l => l.id === id ? { ...l, status: l.status === "frozen" ? "active" : "frozen" } : l));
    flash("Loan status updated");
    if (dataSource === "live") {
      try { await api.toggleFreeze(id); }
      catch (err) { flash(`Could not sync to server: ${err.message}`); }
    }
  }

  async function approveMerchant(id) {
    setMerchants(ms => ms.map(m => m.id === id ? { ...m, status: "verified" } : m));
    flash("Merchant approved");
    if (dataSource === "live") {
      try { await api.approveMerchant(id); }
      catch (err) { flash(`Could not sync to server: ${err.message}`); }
    }
  }

  async function submitMerchant(e) {
    e.preventDefault();
    if (!newMerchant.name.trim() || !newMerchant.location.trim()) {
      setMerchantError("Fill in name and location first");
      return;
    }
    setMerchantError("");
    setShowAddMerchant(false);
    const payload = { name: newMerchant.name, category: newMerchant.category, location: newMerchant.location, reader_type: newMerchant.reader };
    if (dataSource === "live") {
      try {
        const created = await api.addMerchant(payload);
        setMerchants(ms => [{ ...created, reader: created.reader_type, status: created.verification_status }, ...ms]);
        flash("Merchant request submitted for review");
      } catch (err) {
        flash(`Could not add merchant: ${err.message}`);
      }
    } else {
      const id = "MER-" + Math.floor(200 + Math.random() * 700);
      setMerchants(ms => [{ id, ...newMerchant, status: "pending" }, ...ms]);
      flash("Merchant request submitted for review");
    }
    setNewMerchant({ name: "", category: CATEGORIES[0], location: "", reader: READER_TYPES[2] });
  }

  async function addTier() {
    const val = Number(newTier);
    if (!val || val <= 0) { flash("Enter a valid amount"); return; }
    if (tiers.includes(val)) { flash("Tier already exists"); return; }
    const updated = [...tiers, val].sort((a, b) => a - b);
    setTiers(updated);
    setNewTier("");
    flash("Amount tier added");
    if (dataSource === "live") {
      try { await api.updateSchemeConfig({ amount_tiers: updated }); }
      catch (err) { flash(`Could not sync to server: ${err.message}`); }
    }
  }

  async function removeTier(val) {
    const updated = tiers.filter(x => x !== val);
    setTiers(updated);
    flash("Amount tier removed");
    if (dataSource === "live") {
      try { await api.updateSchemeConfig({ amount_tiers: updated }); }
      catch (err) { flash(`Could not sync to server: ${err.message}`); }
    }
  }

  function exportApplications() {
    const csv = toCSV(applications, ["id", "name", "score", "band", "amount", "category", "date", "status"]);
    downloadFile("credence_applications_report.csv", csv);
    flash("Report exported");
  }

  function downloadInvoice(month) {
    const content = `Credence — Scheme Invoice\nBilling period: ${month}\nLicensing fee: Rs. 45,000\nVerification volume: ${verifications.length}\nStatus: Paid`;
    downloadFile(`invoice_${month.replace(" ", "_")}.txt`, content, "text/plain");
    flash(`Downloading ${month} invoice`);
  }

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const bandMatch = filterBand === "all" || a.band === filterBand;
      const searchMatch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
      return bandMatch && searchMatch;
    });
  }, [applications, filterBand, search]);

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const disbursedThisMonth = loans.reduce((s, l) => s + (12000 - l.balance > 0 ? 12000 - l.balance : 4000), 0);
  const verificationRate = Math.round((verifications.filter(v => v.match).length / verifications.length) * 100);

  /* ---------------------------------- LOGIN SCREEN ---------------------------------- */
  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <GlobalStyles />
        <Card style={{ width: 360, textAlign: "center" }}>
          <ShieldCheck size={30} color={C.brown} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>Credence — Officer sign in</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Verify your identity to continue</div>

          {otpStage === "phone" && (
            <form onSubmit={sendOtp} style={{ textAlign: "left" }}>
              <label style={labelStyle}>Registered mobile number</label>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number" style={inputStyle} />
              {authError && <div style={errorText}>{authError}</div>}
              <button type="submit" disabled={otpLoading} style={{ ...primaryBtn, marginTop: 6, opacity: otpLoading ? 0.7 : 1 }}>
                {otpLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {otpStage === "otp" && (
            <form onSubmit={verifyOtp} style={{ textAlign: "left" }}>
              <label style={labelStyle}>Enter 6-digit OTP sent to {phone}</label>
              <input value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP" style={inputStyle} />
              {authError && <div style={errorText}>{authError}</div>}
              <button type="submit" disabled={otpLoading} style={{ ...primaryBtn, marginTop: 6, opacity: otpLoading ? 0.7 : 1 }}>
                {otpLoading ? "Verifying..." : "Verify & continue"}
              </button>
              <button type="button" onClick={() => { setOtpStage("phone"); setAuthError(""); }}
                style={{ ...primaryBtnSmall, background: "transparent", color: C.textMuted, width: "100%", justifyContent: "center", marginTop: 8 }}>
                Change number
              </button>
            </form>
          )}
        </Card>
      </div>
    );
  }

  /* ---------------------------------- DASHBOARD ---------------------------------- */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "Inter, system-ui, sans-serif", position: "relative" }}>
      <GlobalStyles />
      {/* SIDEBAR */}
      <div className="credence-sidebar" style={{ width: 220, background: C.textDark, padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 20px", color: "#fff" }}>
          <ShieldCheck size={20} color="#E9C58A" />
          <span className="brand-label" style={{ fontWeight: 700, fontSize: 15 }}>Credence</span>
        </div>
        {NAV.map(n => {
          const Icon = n.icon;
          const isActive = active === n.key;
          return (
            <button key={n.key} onClick={() => setActive(n.key)} aria-current={isActive ? "page" : undefined} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7,
              border: "none", cursor: "pointer", textAlign: "left", fontSize: 13.5, fontWeight: 500,
              background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,0.65)"
            }}>
              <Icon size={16} /><span className="nav-label">{n.label}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={signOut} aria-label="Sign out" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7,
          border: "none", background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 13, cursor: "pointer"
        }}><LogOut size={15} /><span className="nav-label">Sign out</span></button>
      </div>

      {/* MAIN */}
      <div className="credence-main" style={{ flex: 1, padding: "22px 28px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.textDark }}>{NAV.find(n => n.key === active)?.label}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted }}>PM Street Vendor Credit Scheme · Punjab region {dataSource === "demo" && "· Demo data"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }} ref={headerMenuRef}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowNotifs(s => !s); setShowProfile(false); }}
                aria-label="Notifications" aria-expanded={showNotifs} aria-haspopup="true"
                style={{ border: "none", background: "transparent", cursor: "pointer", position: "relative" }}>
                <Bell size={18} color={C.textMuted} />
                <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: C.red }} />
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", right: 0, top: 28, width: 280, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 8px 20px rgba(61,46,31,0.12)", zIndex: 20 }}>
                  <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13, color: C.textDark, borderBottom: `1px solid ${C.border}` }}>Notifications</div>
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 12.5, color: C.textDark }}>
                      {n.text}
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowProfile(s => !s); setShowNotifs(false); }}
                aria-label="Officer profile menu" aria-expanded={showProfile} aria-haspopup="true"
                style={{
                  width: 32, height: 32, borderRadius: "50%", background: C.brown, color: "#fff", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, cursor: "pointer"
                }}>{initials(officer.name)}</button>
              {showProfile && (
                <div style={{ position: "absolute", right: 0, top: 40, width: 210, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 8px 20px rgba(61,46,31,0.12)", zIndex: 20 }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.textDark }}>{officer.name}</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted }}>{officer.phone ? `+91 ${officer.phone}` : "Not signed in"}</div>
                  </div>
                  <button onClick={() => { setActive("profile"); setShowProfile(false); }} style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", fontSize: 12.5, color: C.textDark, cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                    <User size={14} />View profile
                  </button>
                  <button onClick={signOut} style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", fontSize: 12.5, color: C.red, cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                    <LogOut size={14} />Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loadingData && <Spinner label="Loading live data..." />}
        {!loadingData && loadError && <ErrorBanner message={loadError} onRetry={loadAllData} />}

        {/* OVERVIEW */}
        {active === "overview" && (
          <>
            <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <Metric
                label="Disbursed this month"
                value={`₹${disbursedThisMonth.toLocaleString()}`}
                sub="Across all active loans"
              />

              <Metric
                label="Active loans"
                value={loans.filter(l => l.status !== "frozen").length}
                sub={`${loans.filter(l => l.status === "flagged").length} flagged`}
              />

              <Metric
                label="Pending applications"
                value={pendingCount}
                sub="Awaiting officer review"
              />

              <Metric
                label="Verification success rate"
                value={`${verificationRate}%`}
                sub="Last 24 hours"
              />

              <Metric
                label="Avg Trust Score"
                value={Math.round(
                  applications.reduce((sum, a) => sum + a.score, 0) / applications.length
                )}
                sub="Across applicant portfolio"
              />

              <Metric
                label="Safe lending capacity"
                value={`₹${applications
                  .reduce((sum, a) => sum + a.safeLimit, 0)
                  .toLocaleString()}`}
                sub="Based on Trust Score"
              />
            </div>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12, color: C.textDark }}>Alerts</div>
              <StatusRow accent={C.red}>
                <AlertTriangle size={16} color={C.red} />
                <span style={{ fontSize: 13.5, color: C.textDark }}>Category mismatch spike detected at New Horizon Textiles — 3 declined taps in the last hour</span>
              </StatusRow>
              <StatusRow accent={C.amber}>
                <Store size={16} color={C.amber} />
                <span style={{ fontSize: 13.5, color: C.textDark }}>2 merchants pending verification for over 48 hours</span>
              </StatusRow>
            </Card>
          </>
        )}

        {/* APPLICATIONS */}
        {active === "applications" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", flex: 1, maxWidth: 280 }}>
                <Search size={14} color={C.textMuted} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID"
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "high", "medium", "low"].map(b => (
                  <button key={b} onClick={() => setFilterBand(b)} style={{
                    border: `1px solid ${filterBand === b ? C.brown : C.border}`, background: filterBand === b ? "#F1E9DD" : "#fff",
                    color: filterBand === b ? C.brownDark : C.textMuted, borderRadius: 6, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textTransform: "capitalize"
                  }}>{b}</button>
                ))}
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.textMuted, fontSize: 12 }}>
                  <th style={th}>Applicant</th><th style={th}>Score</th><th style={th}>Amount</th><th style={th}>Category</th><th style={th}>Date</th><th style={th}>Status</th><th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(a => (
                  <tr key={a.id} onClick={() => setSelectedApp(a)} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <td style={td}><div style={{ fontWeight: 600, color: C.textDark }}>{a.name}</div><div style={{ fontSize: 11.5, color: C.textMuted }}>{a.id}</div></td>
                    <td style={td}><Badge tone={bandTone(a.band)}>{a.score}</Badge></td>
                    <td style={td}>₹{a.amount.toLocaleString()}</td>
                    <td style={td}>{a.category}</td>
                    <td style={td}>{a.date}</td>
                    <td style={td}>{a.status === "pending" ? <Badge tone="amber">Pending</Badge> : a.status === "approved" ? <Badge tone="green">Approved</Badge> : a.status === "rejected" ? <Badge tone="red">Rejected</Badge> : <Badge tone="brown">More info</Badge>}</td>
                    <td style={td}><ChevronRight size={15} color={C.textMuted} /></td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No applications match your filters</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* ACTIVE LOANS */}
        {active === "loans" && (
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.textMuted, fontSize: 12 }}>
                  <th style={th}>Borrower</th><th style={th}>Category</th><th style={th}>Balance</th><th style={th}>Disbursement path</th><th style={th}>Status</th><th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={td}><div style={{ fontWeight: 600, color: C.textDark }}>{l.name}</div><div style={{ fontSize: 11.5, color: C.textMuted }}>{l.id}</div></td>
                    <td style={td}>{l.category}</td>
                    <td style={td}>₹{l.balance.toLocaleString()}</td>
                    <td style={td}><ModeBadge mode={l.mode} /></td>
                    <td style={td}>{l.status === "active" ? <Badge tone="green">Active</Badge> : <Badge tone="red">Frozen</Badge>}</td>
                    <td style={td}>
                      <IconBtn icon={l.status === "frozen" ? Check : Flag} tone={l.status === "frozen" ? "green" : "red"}
                        label={l.status === "frozen" ? "Unfreeze" : "Freeze"} onClick={() => toggleFreeze(l.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* MERCHANTS */}
        {active === "merchants" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <button onClick={() => { setShowAddMerchant(true); setMerchantError(""); }} style={primaryBtnSmall}><Plus size={14} />Add merchant</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.textMuted, fontSize: 12 }}>
                  <th style={th}>Merchant</th><th style={th}>Category</th><th style={th}>Location</th><th style={th}>Reader</th><th style={th}>Status</th><th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={td}><div style={{ fontWeight: 600, color: C.textDark }}>{m.name}</div><div style={{ fontSize: 11.5, color: C.textMuted }}>{m.id}</div></td>
                    <td style={td}>{m.category}</td>
                    <td style={td}>{m.location}</td>
                    <td style={td}>{m.reader}</td>
                    <td style={td}>{m.status === "verified" ? <Badge tone="green">Verified</Badge> : <Badge tone="amber">Pending</Badge>}</td>
                    <td style={td}>{m.status === "pending" && <IconBtn icon={Check} tone="green" label="Approve" onClick={() => approveMerchant(m.id)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* VERIFICATION LOG */}
        {active === "verification" && (
          <Card>
            <PathLegend />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: liveFeed ? C.green : C.textMuted, display: "inline-block" }} />
                <span style={{ fontSize: 12.5, color: C.textMuted }}>{liveFeed ? "Live feed running" : "Live feed paused"}</span>
              </div>
              <button onClick={() => { setLiveFeed(f => !f); flash(liveFeed ? "Live feed paused" : "Live feed started"); }} style={primaryBtnSmall}>
                {liveFeed ? "Pause feed" : "Start live feed"}
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.textMuted, fontSize: 12 }}>
                  <th style={th}>Seeker</th><th style={th}>Merchant</th><th style={th}>Match</th><th style={th}>Amount</th><th style={th}>Time</th><th style={th}>Path</th><th style={th}>Money movement</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map(v => {
                  const info = PATH_INFO[v.mode] || PATH_INFO.NFC;
                  return (
                    <tr key={v.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={td}>{v.seeker}</td>
                      <td style={td}>{v.merchant}</td>
                      <td style={td}>{v.match ? <Badge tone="green">Matched</Badge> : <Badge tone="red">Mismatch</Badge>}</td>
                      <td style={td}>₹{v.amount.toLocaleString()}</td>
                      <td style={td}>{v.time}</td>
                      <td style={td}><ModeBadge mode={v.mode} compact /></td>
                      <td style={td}>
                        <div style={{ fontSize: 12, color: C.textDark, fontWeight: 600 }}>
                          {v.match ? (v.mode === "NFC" ? "Card balance deducted" : "Payment released to merchant") : "No funds moved"}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{v.mode === "NFC" ? "Prepaid balance" : "Reimbursement — vendor never held funds"}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {/* SCHEME CONFIG */}
        {active === "config" && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6, color: C.textDark }}>Verification mode</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Info size={13} style={{ marginTop: 1, flexShrink: 0 }} />
              Path A (NFC) deducts from a pre-loaded restricted card balance. Path B (QR) is a
              fallback for when NFC hardware isn't available — it only logs verification, then
              the scheme pays the merchant/vendor afterward. Toggle below controls whether Path B is allowed.
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: C.textDark }}>Allow remote (QR / Path B) verification</div>
                <div style={{ fontSize: 12.5, color: C.textMuted }}>Lets seekers verify purchases without an in-person NFC tap</div>
              </div>
              <button onClick={async () => {
                const next = !remoteMode;
                setRemoteMode(next);
                flash(next ? "Remote mode enabled" : "Remote mode disabled");
                if (dataSource === "live") {
                  try { await api.updateSchemeConfig({ remote_mode_enabled: next }); }
                  catch (err) { flash(`Could not sync to server: ${err.message}`); }
                }
              }} aria-label={remoteMode ? "Disable remote QR verification" : "Enable remote QR verification"} style={{
                width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                background: remoteMode ? C.green : "#D8D2C6", position: "relative"
              }}>
                <span style={{ position: "absolute", top: 2, left: remoteMode ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
              </button>
            </div>

            <div style={{ marginTop: 18, fontWeight: 700, fontSize: 14.5, marginBottom: 10, color: C.textDark }}>Amount tiers</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {tiers.map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge tone="brown">₹{t.toLocaleString()}</Badge>
                  <button onClick={() => removeTier(t)} aria-label={`Remove ₹${t.toLocaleString()} tier`} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.red }}><X size={13} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, maxWidth: 320 }}>
              <input value={newTier} onChange={e => setNewTier(e.target.value.replace(/\D/g, ""))} placeholder="New tier amount (e.g. 30000)" style={{ ...inputStyle, marginBottom: 0 }} />
              <button onClick={addTier} style={primaryBtnSmall}><Plus size={14} />Add</button>
            </div>
          </Card>
        )}

        {/* ANALYTICS */}
        {active === "analytics" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: C.textDark }}>Score band distribution</div>
              <button onClick={exportApplications} style={primaryBtnSmall}><Download size={14} />Export CSV</button>
            </div>
            {["high", "medium", "low"].map(band => {
              const count = applications.filter(a => a.band === band).length;
              const pct = Math.round((count / applications.length) * 100);
              return (
                <div key={band} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4, color: C.textDark, textTransform: "capitalize" }}>
                    <span>{band}</span><span>{count} applicants</span>
                  </div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: band === "high" ? C.green : band === "medium" ? C.amber : C.red }} />
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* BILLING */}
        {active === "billing" && (
          <Card>
            <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <Metric label="Monthly licensing fee" value="₹45,000" />
              <Metric label="Verification volume" value={verifications.length + "+"} sub="This billing period" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10, color: C.textDark }}>Invoice history</div>
            {["Jul 2026", "Jun 2026", "May 2026"].map(m => (
              <StatusRow key={m} accent={C.brown}>
                <span style={{ fontSize: 13.5, flex: 1, color: C.textDark }}>{m} invoice</span>
                <Badge tone="green">Paid</Badge>
                <button onClick={() => downloadInvoice(m)} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.brown }}><Download size={15} /></button>
              </StatusRow>
            ))}
          </Card>
        )}

        {/* PROFILE */}
        {active === "profile" && (
          <>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: C.brown, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0
                }}>{initials(officer.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16.5, color: C.textDark }}>{officer.name}</div>
                  <div style={{ fontSize: 12.5, color: C.textMuted, textTransform: "capitalize" }}>{officer.role} · {officer.id || "Not synced from server"}</div>
                </div>
              </div>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12, color: C.textDark }}>Officer details</div>
              <div style={{ fontSize: 13.5, color: C.textDark, lineHeight: 2 }}>
                <div><b>Phone:</b> {officer.phone ? `+91 ${officer.phone}` : "—"}</div>
                <div><b>Role:</b> <span style={{ textTransform: "capitalize" }}>{officer.role}</span></div>
                <div><b>Permissions:</b> {(officer.permissions && officer.permissions.length) ? officer.permissions.join(", ") : "Standard officer access"}</div>
              </div>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12, color: C.textDark }}>Scheme assignment</div>
              <div style={{ fontSize: 13.5, color: C.textDark, lineHeight: 2 }}>
                <div><b>Scheme:</b> {schemeInfo.name}</div>
                <div><b>Purpose categories:</b> {(schemeInfo.purpose_categories || []).join(", ")}</div>
                <div><b>Amount tiers:</b> {(schemeInfo.amount_tiers || []).map(t => `₹${t.toLocaleString()}`).join(", ")}</div>
                <div><b>Path B (QR) verification:</b> {schemeInfo.remote_mode_enabled ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}</div>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                Editable from <button onClick={() => setActive("config")} style={{ border: "none", background: "transparent", color: C.brown, cursor: "pointer", fontWeight: 600, padding: 0, fontSize: 12 }}>Scheme config</button>.
              </div>
            </Card>
          </>
        )}
      </div>

      {/* APPLICATION DETAIL DRAWER */}
      {selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(61,46,31,0.35)", display: "flex", justifyContent: "flex-end", zIndex: 30 }} onClick={() => setSelectedApp(null)}>
          <div onClick={e => e.stopPropagation()} className="credence-drawer" role="dialog" aria-modal="true" aria-label="Application details" style={{ width: 360, background: C.surface, height: "100%", padding: 24, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>{selectedApp.name}</div>
                <div style={{ fontSize: 12.5, color: C.textMuted }}>{selectedApp.id}</div>
              </div>
              <button onClick={() => setSelectedApp(null)} aria-label="Close application details" style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} color={C.textMuted} /></button>
            </div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 6 }}>Trust score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.textDark }}>{selectedApp.score}</div>
                <Badge tone={bandTone(selectedApp.band)}>{selectedApp.band} band</Badge>
              </div>
            </Card>
            <div style={{ marginBottom: 20 }}>

              <div style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.textDark,
                marginBottom: 12
              }}>
                Underwriting Summary
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 18
              }}>
                <div style={{ background: C.bg, padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Trust Score</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{selectedApp.score}/100</div>
                </div>

                <div style={{ background: C.bg, padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Safe Limit</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    ₹{selectedApp.safeLimit.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: C.bg, padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Cashflow</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedApp.cashflow}</div>
                </div>

                <div style={{ background: C.bg, padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Debt Burden</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedApp.debtBurden}</div>
                </div>
              </div>

              <div style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.textDark,
                marginBottom: 10
              }}>
                Risk Diagnostics
              </div>

              <div style={{
                fontSize: 13.5,
                color: C.textDark,
                lineHeight: 1.9,
                marginBottom: 18
              }}>
                <div><b>Income Consistency:</b> {selectedApp.incomeConsistency}</div>
                <div><b>Customer Diversity:</b> {selectedApp.customerDiversity}</div>
                <div><b>Transaction Velocity:</b> {selectedApp.transactionVelocity}</div>
                <div><b>Repayment Integrity:</b> {selectedApp.repaymentIntegrity}</div>
                <div><b>Longevity:</b> {selectedApp.longevity}</div>
                <div><b>Lean-period Resilience:</b> {selectedApp.leanPeriodResilience}</div>
              </div>

              <div style={{
                borderTop: `1px solid ${C.border}`,
                paddingTop: 14,
                fontSize: 13.5,
                color: C.textDark,
                lineHeight: 1.9
              }}>
                <div><b>Requested amount:</b> ₹{selectedApp.amount.toLocaleString()}</div>
                <div><b>Purpose category:</b> {selectedApp.category}</div>
                <div><b>Date applied:</b> {selectedApp.date}</div>
                <div><b>Document check:</b> <Badge tone="green">Verified</Badge></div>
              </div>

            </div>
            {selectedApp.status === "pending" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <IconBtn icon={Check} tone="green" label="Approve" onClick={() => decide(selectedApp.id, "approved")} />
                <IconBtn icon={X} tone="red" label="Reject" onClick={() => decide(selectedApp.id, "rejected")} />
                <IconBtn icon={AlertTriangle} tone="amber" label="More info" onClick={() => decide(selectedApp.id, "more_info")} />
              </div>
            ) : <Badge tone="brown">Decision recorded</Badge>}
          </div>
        </div>
      )}

      {/* ADD MERCHANT MODAL */}
      {showAddMerchant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(61,46,31,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30 }} onClick={() => setShowAddMerchant(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={submitMerchant} role="dialog" aria-modal="true" aria-label="Add merchant" style={{ width: 360, background: C.surface, borderRadius: 10, padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.textDark, marginBottom: 16 }}>Add merchant</div>
            <label style={labelStyle}>Merchant name</label>
            <input style={inputStyle} value={newMerchant.name} onChange={e => setNewMerchant({ ...newMerchant, name: e.target.value })} placeholder="e.g. Bansal Cart Suppliers" />
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={newMerchant.category} onChange={e => setNewMerchant({ ...newMerchant, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={labelStyle}>Reader hardware</label>
            <select style={inputStyle} value={newMerchant.reader} onChange={e => setNewMerchant({ ...newMerchant, reader: e.target.value })}>
              {READER_TYPES.map(r => <option key={r}>{r}</option>)}
            </select>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={newMerchant.location} onChange={e => setNewMerchant({ ...newMerchant, location: e.target.value })} placeholder="e.g. Sadar Bazaar, Ludhiana" />
            {merchantError && <div style={errorText}>{merchantError}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" style={primaryBtnSmall}>Submit for review</button>
              <button type="button" onClick={() => setShowAddMerchant(false)} style={{ ...primaryBtnSmall, background: "#fff", color: C.textDark, border: `1px solid ${C.border}` }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}

