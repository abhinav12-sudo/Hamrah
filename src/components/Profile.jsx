import { useMemo, useState } from "react";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const MOBILE_RE = /^[6-9]\d{9}$/;

function memberSince(createdAt) {
  const d = createdAt?.toDate ? createdAt.toDate() : null;
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function Profile({ profile, uid, rides = [] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", hostel: "" });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const offered = rides.filter((r) => r.creatorId === uid);
    const booked = rides.filter((r) => (r.bookings || []).some((b) => b.uid === uid));
    const upcoming = [...offered, ...booked].filter((r) => r.date >= today).length;
    return { offered: offered.length, booked: booked.length, upcoming };
  }, [rides, uid]);

  function startEdit() {
    setForm({
      name: profile.name || "",
      mobile: profile.mobile || "",
      hostel: profile.hostel || "",
    });
    setError("");
    setErrors({});
    setSaved(false);
    setEditing(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((errs) => (errs[field] ? { ...errs, [field]: undefined } : errs));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const hostel = form.hostel.trim();

    const errs = {};
    if (!name) errs.name = "Name can't be empty.";
    if (!MOBILE_RE.test(mobile)) errs.mobile = "Enter a valid 10-digit mobile number.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), { name, mobile, hostel });

      // Keep the copies of your name/number stored on existing rides in sync.
      const batch = writeBatch(db);
      let writes = 0;
      rides.forEach((r) => {
        const ref = doc(db, "rides", r.id);
        if (r.creatorId === uid) {
          batch.update(ref, { creatorName: name, creatorMobile: mobile });
          writes++;
        } else if ((r.bookings || []).some((b) => b.uid === uid)) {
          const bookings = r.bookings.map((b) => (b.uid === uid ? { ...b, name, mobile } : b));
          batch.update(ref, { bookings });
          writes++;
        }
      });
      if (writes > 0) await batch.commit();

      setEditing(false);
      setSaved(true);
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (profile.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="section-heading">
        <h2>Profile</h2>
      </div>

      {saved && !editing && <div className="form-success">Profile updated.</div>}

      <div className="profile-card">
        <div className="profile-body">
          <div className="profile-top">
            <div className="profile-avatar">{initial}</div>
            {!editing && (
              <button className="btn btn-outline btn-sm" onClick={startEdit}>
                Edit profile
              </button>
            )}
          </div>

          {!editing ? (
            <>
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-email">{profile.email}</p>

              <dl className="profile-details">
                <div>
                  <dt>Mobile</dt>
                  <dd>{profile.mobile || "—"}</dd>
                </div>
                <div>
                  <dt>Hostel / branch</dt>
                  <dd>{profile.hostel || "—"}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{memberSince(profile.createdAt)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form" noValidate>
              {error && <div className="form-error">{error}</div>}
              <div className={`field ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Full name</label>
                <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="field-row">
                <div className={`field ${errors.mobile ? "has-error" : ""}`}>
                  <label htmlFor="mobile">Mobile number</label>
                  <input
                    id="mobile"
                    inputMode="numeric"
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                  />
                  {errors.mobile && <p className="field-error">{errors.mobile}</p>}
                </div>
                <div className="field">
                  <label htmlFor="hostel">Hostel / branch</label>
                  <input id="hostel" value={form.hostel} onChange={(e) => update("hostel", e.target.value)} />
                </div>
              </div>
              <p className="form-hint">Your email can't be changed here.</p>
              <div className="profile-actions">
                <button className="btn btn-primary" disabled={saving} type="submit">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="stat-num">{stats.offered}</div>
          <div className="stat-label">Rides offered</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{stats.booked}</div>
          <div className="stat-label">Rides booked</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>
    </div>
  );
}