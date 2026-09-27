import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const MOBILE_RE = /^[6-9]\d{9}$/;

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    hostel: "",
    email: "",
    password: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !MOBILE_RE.test(form.mobile.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

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
            onClick={() => setMode("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Aatif Bashir"
                />
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
                    placeholder="9876543210"
                  />
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

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
            />
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