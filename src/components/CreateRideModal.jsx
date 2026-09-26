import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

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
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.from.trim() || !form.to.trim() || !form.date || !form.time) {
      setError("From, to, date and time are all required.");
      return;
    }
    if (form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) {
      setError("From and to can't be the same place.");
      return;
    }

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

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="from">From</label>
              <input
                id="from"
                required
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
                placeholder="NIT Srinagar"
              />
            </div>
            <div className="field">
              <label htmlFor="to">To</label>
              <input
                id="to"
                required
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                placeholder="Railway Station"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                required
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="seats">Seats available (besides you)</label>
            <input
              id="seats"
              type="number"
              min={1}
              max={8}
              required
              value={form.totalSeats}
              onChange={(e) => update("totalSeats", e.target.value)}
            />
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
