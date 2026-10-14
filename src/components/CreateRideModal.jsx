import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { localDateStr, isFutureDateTime } from "../dateUtils";

export default function CreateRideModal({ profile, uid, onClose }) {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    totalSeats: 3,
    notes: "",
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const today = localDateStr();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // clear that field's message as soon as the user edits it
    setErrors((errs) => (errs[field] ? { ...errs, [field]: undefined } : errs));
  }

  function validate() {
    const errs = {};
    const from = form.from.trim();
    const to = form.to.trim();

    if (!from) errs.from = "Enter where the ride starts.";
    if (!to) errs.to = "Enter the destination.";
    else if (from && from.toLowerCase() === to.toLowerCase())
      errs.to = "Destination can't be the same as the start.";

    if (!form.date) errs.date = "Pick a date.";
    else if (form.date < today) errs.date = "That date has already passed.";

    if (!form.time) errs.time = "Pick a time.";
    else if (!errs.date && !isFutureDateTime(form.date, form.time)) {
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      errs.time = `That time has passed. Pick a time after ${now}.`;
    }

    const seats = Number(form.totalSeats);
    if (!Number.isInteger(seats) || seats < 1 || seats > 8)
      errs.totalSeats = "Seats must be a whole number from 1 to 8.";

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "rides"), {
        creatorId: uid,
        creatorName: profile.name,
        creatorMobile: profile.mobile,
        from: form.from.trim(),
        to: form.to.trim(),
        date: form.date,
        time: form.time,
        totalSeats: Number(form.totalSeats) || 1,
        notes: form.notes.trim(),
        bookings: [],
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError("Couldn't create the ride. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Offer a ride</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className={`field ${errors.from ? "has-error" : ""}`}>
              <label htmlFor="from">From</label>
              <input
                id="from"
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
                placeholder="NIT Srinagar"
              />
              {errors.from && <p className="field-error">{errors.from}</p>}
            </div>
            <div className={`field ${errors.to ? "has-error" : ""}`}>
              <label htmlFor="to">To</label>
              <input
                id="to"
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                placeholder="Railway Station"
              />
              {errors.to && <p className="field-error">{errors.to}</p>}
            </div>
          </div>

          <div className="field-row">
            <div className={`field ${errors.date ? "has-error" : ""}`}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                min={today}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
              {errors.date && <p className="field-error">{errors.date}</p>}
            </div>
            <div className={`field ${errors.time ? "has-error" : ""}`}>
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
              {errors.time && <p className="field-error">{errors.time}</p>}
            </div>
          </div>

          <div className={`field ${errors.totalSeats ? "has-error" : ""}`}>
            <label htmlFor="seats">Seats available (besides you)</label>
            <input
              id="seats"
              type="number"
              min={1}
              max={8}
              value={form.totalSeats}
              onChange={(e) => update("totalSeats", e.target.value)}
            />
            {errors.totalSeats && <p className="field-error">{errors.totalSeats}</p>}
          </div>

          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="e.g. leaving from the main gate, splitting the fare"
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={saving} type="submit">
            {saving ? "Posting…" : "Post ride"}
          </button>
        </form>
      </div>
    </div>
  );
}