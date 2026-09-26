import { useMemo, useState } from "react";
import RideCard from "./RideCard";
import { deleteRide } from "../rideActions";

export default function MyRides({ rides, uid }) {
  const [error, setError] = useState("");

  const myRides = useMemo(
    () =>
      rides
        .filter((r) => r.creatorId === uid)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [rides, uid]
  );

  async function handleDelete(ride) {
    if (!window.confirm("Delete this ride? This can't be undone.")) return;
    setError("");
    try {
      await deleteRide(ride.id);
    } catch {
      setError("Couldn't delete that ride. Please try again.");
    }
  }

  return (
    <div>
      <div className="section-heading">
        <h2>Your initiated rides</h2>
        <span className="count">{myRides.length}</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {myRides.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't offered a ride yet</h3>
          <p>Post one from "Find a ride" — students who book will show up here with their number.</p>
        </div>
      ) : (
        <div className="ride-list">
          {myRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} variant="mine" currentUid={uid} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
