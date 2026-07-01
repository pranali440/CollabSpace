import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import { useMyContext } from "../../store/ContextApi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

// ── Icons ─────────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(/[\s_]/).map((w) => w[0]?.toUpperCase()).join("").slice(0, 2) || "U";

const ACCENT = "#2563eb";

// ── StatusPill ────────────────────────────────────────────────────────────────
const StatusPill = ({ ok, label }) => (
  <div style={S.statusPill}>
    <span style={{ ...S.dot, background: ok ? "#10b981" : "#ef4444" }} />
    <span style={S.pillLabel}>{label}</span>
    <span style={{ ...S.pillStatus, color: ok ? "#10b981" : "#ef4444" }}>
      {ok ? "OK" : "Issue"}
    </span>
  </div>
);

// ── InfoRow ────────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div style={S.infoRow}>
    <span style={S.infoLabel}>{label}</span>
    <span style={S.infoValue}>{value || "—"}</span>
  </div>
);

// ── FormField ──────────────────────────────────────────────────────────────────
const FormField = ({ label, id, type = "text", register, errors, rules, placeholder, readOnly, hint }) => (
  <div style={S.fieldWrap}>
    <label style={S.fieldLabel} htmlFor={id}>{label}</label>
    <input
      id={id}
      type={type}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{
        ...S.fieldInput,
        background: readOnly ? "#f1f5f9" : "#fff",
        color: readOnly ? "#94a3b8" : "#1e293b",
        cursor: readOnly ? "not-allowed" : "text",
      }}
      {...(register ? register(id, rules) : {})}
    />
    {hint && <p style={S.hint}>{hint}</p>}
    {errors?.[id] && <p style={S.fieldError}>{errors[id].message}</p>}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const UserProfile = () => {
  const { currentUser, token, setCurrentUser } = useMyContext();
  const [loginSession, setLoginSession] = useState(null);
  const [pageLoader, setPageLoader] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const fileRef = useRef();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ mode: "onTouched" });

  // Decode JWT → last login
  useEffect(() => {
    if (!token) return;
    try {
      const d = jwtDecode(token);
      if (d?.iat) setLoginSession(moment.unix(d.iat).format("ddd, D MMM YYYY · h:mm A"));
    } catch {}
  }, [token]);

  // Populate form + avatar from context (works on refresh too via localStorage)
  useEffect(() => {
    if (!currentUser?.id) { setPageLoader(false); return; }
    setValue("userName", currentUser.username);
    setValue("email", currentUser.email);
    if (currentUser.profileImage) setAvatarPreview(currentUser.profileImage);
    setPageLoader(false);
  }, [currentUser, setValue]);

  const onPhoto = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setAvatarPreview(base64);
      setAvatarBase64(base64);
      // Auto save image immediately
      try {
        await api.put(`/users/${currentUser.id}`, { profileImage: base64 });
        const updatedImage = base64;
        setCurrentUser(prev => ({ ...prev, profileImage: updatedImage }));
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, profileImage: updatedImage }));
        toast.success("Photo updated!");
      } catch (err) {
        toast.error("Photo save failed.");
      }
    };
    reader.readAsDataURL(f);
  };

  // Save changes
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {};
      if (data.password?.trim()) payload.password = data.password.trim();
      if (avatarBase64) payload.profileImage = avatarBase64;

      await api.put(`/users/${currentUser.id}`, payload);

      const updatedImage = avatarBase64 || currentUser?.profileImage || null;

      // ✅ 1. Update React context → all components that read currentUser re-render instantly
      setCurrentUser(prev => ({
        ...prev,
        profileImage: updatedImage,
      }));

      // ✅ 2. Persist to localStorage → survives page refresh
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        profileImage: updatedImage,
      }));

      setSaveSuccess(true);
      toast.success("Profile updated!");
      setValue("password", "");
      setAvatarBase64(null); // reset so next save doesn't re-send same base64
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(currentUser?.username || "");
  const roleLabel = (currentUser?.roles?.[0] || "ROLE_USER").replace("ROLE_", "");

  if (pageLoader) {
    return (
      <div style={S.loaderWrap}>
        <div style={{ ...S.spinner, borderTopColor: ACCENT }} />
        <p style={S.loaderText}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        .pc { animation: fadeUp .3s ease both; }
        .pc:nth-child(2) { animation-delay:.07s }
        .av:hover .av-ov { opacity:1!important }
        .av { cursor:pointer }
        .upload-btn:hover { background:${ACCENT}12!important }
        .save-btn:hover { opacity:.88!important }
      `}</style>

      {/* HERO */}
      <div className="pc" style={{ ...S.hero, borderTop: `4px solid ${ACCENT}` }}>

        {/* Avatar */}
        <div className="av" style={S.avWrap} onClick={() => fileRef.current?.click()} title="Click to upload photo">
          {avatarPreview
            ? <img src={avatarPreview} alt="avatar" style={S.avImg} />
            : <div style={{ ...S.avInitials, background: ACCENT }}>{initials}</div>
          }
          <div className="av-ov" style={S.avOverlay}>
            <CameraIcon />
            <span style={{ fontSize: "10px", marginTop: "3px", fontWeight: 600 }}>Change</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhoto} />
        </div>

        <div style={S.heroInfo}>
          <h1 style={S.heroName}>{currentUser?.username}</h1>
          <p style={S.heroEmail}>{currentUser?.email}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ ...S.chip, background: ACCENT + "18", color: ACCENT, border: `1px solid ${ACCENT}33` }}>
              {roleLabel}
            </span>
            <span style={{ ...S.chip, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
              Active
            </span>
          </div>
        </div>

        <div style={S.heroMeta}>
          <span style={S.metaLbl}>Last login</span>
          <span style={S.metaVal}>{loginSession || "—"}</span>
          <span style={{ ...S.chip, marginTop: "6px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
            {avatarPreview ? "📷 Photo set" : "No photo"}
          </span>
        </div>
      </div>

      {/* GRID */}
      <div style={S.grid}>

        {/* LEFT col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Account Info */}
          <div className="pc" style={S.card}>
            <h3 style={{ ...S.cardHead, borderBottom: `2px solid ${ACCENT}` }}>Account Info</h3>
            <InfoRow label="Username" value={currentUser?.username} />
            <InfoRow label="Email"    value={currentUser?.email} />
            <InfoRow label="Role"     value={roleLabel} />
          </div>

          {/* Security Status */}
          <div className="pc" style={S.card}>
            <h3 style={{ ...S.cardHead, borderBottom: `2px solid ${ACCENT}` }}>Security Status</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <StatusPill ok={currentUser?.accountNonExpired}     label="Account Active"  />
              <StatusPill ok={currentUser?.accountNonLocked}      label="Not Locked"      />
              <StatusPill ok={currentUser?.enabled}               label="Access Enabled"  />
              <StatusPill ok={currentUser?.credentialsNonExpired} label="Password Valid"  />
            </div>
          </div>

        </div>

        {/* RIGHT col — Edit form */}
        <div className="pc" style={{ ...S.card, alignSelf: "start" }}>
          <h3 style={{ ...S.cardHead, borderBottom: `2px solid ${ACCENT}` }}>Edit Profile</h3>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FormField
              label="New Password"
              id="password"
              type="password"
              register={register}
              errors={errors}
              placeholder="e.g. Admin@123"
              hint="Min 8 characters · uppercase · number · @ symbol required"
              rules={{
  validate: (val) => {
    if (!val || val.trim() === "") return true; // ← allow empty, photo-only save works
    if (val.length < 8) return "Minimum 8 characters required";
    if (!/[A-Z]/.test(val)) return "Must contain at least one uppercase letter";
    if (!/[0-9]/.test(val)) return "Must contain at least one number";
    if (!val.includes("@")) return "Must contain the @ symbol";
    return true;
  },
}}
            />

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
              style={{
                ...S.saveBtn,
                background: saveSuccess ? "#10b981" : ACCENT,
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving
                ? "Saving…"
                : saveSuccess
                  ? <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}><CheckIcon /> Saved!</span>
                  : "Save Changes"
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "calc(100vh - 74px)",
    padding: "2rem 1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#f8fafc",
  },
  loaderWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "60vh", gap: "14px",
  },
  spinner: {
    width: "38px", height: "38px", borderRadius: "50%",
    border: "3px solid #e2e8f0",
    animation: "spin 0.75s linear infinite",
  },
  loaderText: { color: "#64748b", fontSize: "14px", margin: 0 },
  hero: {
    background: "#fff", borderRadius: "16px", padding: "1.75rem 2rem",
    display: "flex", alignItems: "center", gap: "1.5rem",
    marginBottom: "1.25rem", flexWrap: "wrap",
    boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
  },
  avWrap: { position: "relative", width: "80px", height: "80px", borderRadius: "50%", flexShrink: 0, overflow: "hidden" },
  avImg: { width: "100%", height: "100%", objectFit: "cover" },
  avInitials: { width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 700, color: "#fff" },
  avOverlay: { position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,.52)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0, transition: "opacity .2s" },
  heroInfo: { flex: 1, minWidth: "160px" },
  heroName: { margin: "0 0 4px", fontSize: "21px", fontWeight: 700, color: "#0f172a" },
  heroEmail: { margin: "0 0 10px", fontSize: "13px", color: "#64748b" },
  chip: { fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.4px", textTransform: "uppercase" },
  heroMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" },
  metaLbl: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
  metaVal: { fontSize: "13px", color: "#475569", fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px", alignItems: "start" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.03)" },
  cardHead: { margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "#0f172a", paddingBottom: "10px", display: "flex", alignItems: "center" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9" },
  infoLabel: { fontSize: "13px", color: "#64748b" },
  infoValue: { fontSize: "13px", color: "#1e293b", fontWeight: 500 },
  statusPill: { display: "flex", alignItems: "center", gap: "7px", background: "#f8fafc", borderRadius: "8px", padding: "9px 11px", border: "1px solid #e2e8f0" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  pillLabel: { fontSize: "12px", color: "#475569", flex: 1 },
  pillStatus: { fontSize: "11px", fontWeight: 700 },
  photoRow: { display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "#f8fafc", borderRadius: "8px", marginBottom: "12px" },
  photoThumb: { width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 },
  outlineBtn: { display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px solid", borderRadius: "6px", background: "transparent", padding: "6px 13px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "background .15s" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "5px" },
  fieldLabel: { fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  fieldInput: { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", transition: "border-color .15s, box-shadow .15s" },
  hint: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  fieldError: { margin: 0, fontSize: "11px", color: "#ef4444" },
  saveBtn: { width: "100%", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 700, color: "#fff", cursor: "pointer", transition: "background .2s, opacity .15s", letterSpacing: "0.3px" },
};

export default UserProfile;