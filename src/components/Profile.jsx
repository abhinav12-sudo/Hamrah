import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const MOBILE_RE = /^[6-9]\d{9}$/;

export default function Profile({ profile, uid }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    mobile: profile.mobile || "",
    hostel: profile.hostel || "",
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!MOBILE_RE.test(form.mobile.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        hostel: form.hostel.trim(),
      });
      setSaved(true);
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (form.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div>
      <div className="section-heading">
        <h2>Profile</h2>
      </div>

      <div className="profile-header">
        <div className="avatar-circle">{initial}</div>
        <div>
          <div style={{ fontWeight: 600 }}>{profile.email}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
            This is what other students will see on your rides.
          </div>
        </div>
      </div>

      <div className="card">
        {error && <div className="form-error">{error}</div>}
        {saved && (
          <div
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            Profile updated.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="mobile">Mobile number</label>
              <input
                id="mobile"
                required
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="hostel">Hostel / branch</label>
              <input id="hostel" value={form.hostel} onChange={(e) => update("hostel", e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
