import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    hostel: "",
    email: "",
    password: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((errs) => (errs[field] ? { ...errs, [field]: undefined } : errs));
  }

  function validate() {
    const errs = {};
    if (mode === "signup") {
      if (!form.name.trim()) errs.name = "Enter your full name.";
      if (!MOBILE_RE.test(form.mobile.trim())) errs.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (!form.email.trim()) errs.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = "That email doesn't look right.";
    if (!form.password) errs.password = "Enter your password.";
    else if (mode === "signup" && form.password.length < 6)
      errs.password = "Use at least 6 characters.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );
        await updateProfile(cred.user, { displayName: form.name.trim() });
        await setDoc(doc(db, "users", cred.user.uid), {
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          hostel: form.hostel.trim(),
          email: form.email.trim(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      }
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="brand-mark">
          <img src="/logo-128.png" alt="" className="brand-logo" />
          Hamrah
        </span>
        <p className="tagline">Shared rides to and from campus, coordinated in one place.</p>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setErrors({}); setError(""); }}
            type="button"
          >
            Log in
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => { setMode("signup"); setErrors({}); setError(""); }}
            type="button"
          >
            Sign up
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <>
              <div className={`field ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Aatif Bashir"
                />
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
                    placeholder="9876543210"
                  />
                {errors.mobile && <p className="field-error">{errors.mobile}</p>}
                </div>
                <div className="field">
                  <label htmlFor="hostel">Hostel / branch</label>
                  <input
                    id="hostel"
                    value={form.hostel}
                    onChange={(e) => update("hostel", e.target.value)}
                    placeholder="e.g. BH-3, CSE"
                  />
                </div>
              </div>
            </>
          )}

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
            />
          {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className={`field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
            />
          {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function readableAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "An account already exists for that email.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Email or password is incorrect.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  return "Something went wrong. Please try again.";
}