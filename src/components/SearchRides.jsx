import { useMemo, useState } from "react";
import RideCard from "./RideCard";
import CreateRideModal from "./CreateRideModal";
import { bookRide } from "../rideActions";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function SearchRides({ rides, profile, uid }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const results = useMemo(() => {
    const today = todayStr();
    return rides
      .filter((r) => r.date >= today)
      .filter((r) => (from ? r.from.toLowerCase().includes(from.toLowerCase()) : true))
      .filter((r) => (to ? r.to.toLowerCase().includes(to.toLowerCase()) : true))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [rides, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  async function handleBook(ride) {
    setError("");
    try {
      await bookRide(ride.id, { uid, name: profile.name, mobile: profile.mobile });
    } catch (err) {
      setError(err.message || "Couldn't book this ride.");
    }
  }

  return (
    <div>
      <div className="section-heading">
        <h2>Find a ride</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Offer a ride
        </button>
      </div>

      <div className="search-bar">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>From</label>
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Anywhere" />
        </div>
        <button className="swap" onClick={swap} type="button" aria-label="Swap">
          &#8646;
        </button>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>To</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Anywhere" />
        </div>
        <div />
      </div>

      {error && <div className="form-error">{error}</div>}

      {results.length === 0 ? (
        <div className="empty-state">
          <h3>No rides match yet</h3>
          <p>Be the first to post one, or check back closer to the date.</p>
        </div>
      ) : (
        <div className="ride-list">
          {results.map((ride) => (
            <RideCard key={ride.id} ride={ride} variant="search" currentUid={uid} onBook={handleBook} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateRideModal profile={profile} uid={uid} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
