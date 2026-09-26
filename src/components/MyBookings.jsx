import { useMemo, useState } from "react";
import RideCard from "./RideCard";
import { cancelBooking } from "../rideActions";

export default function MyBookings({ rides, uid }) {
  const [error, setError] = useState("");

  const myRides = useMemo(
    () =>
      rides
        .filter((r) => (r.bookings || []).some((b) => b.uid === uid))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [rides, uid]
  );

  async function handleCancel(ride) {
    setError("");
    try {
      await cancelBooking(ride.id, uid);
    } catch {
      setError("Couldn't cancel that booking. Please try again.");
    }
  }

  return (
    <div>
      <div className="section-heading">
        <h2>Your booked rides</h2>
        <span className="count">{myRides.length}</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {myRides.length === 0 ? (
        <div className="empty-state">
          <h3>No rides booked yet</h3>
          <p>Rides you book from "Find a ride" will show up here.</p>
        </div>
      ) : (
        <div className="ride-list">
          {myRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              variant="booked"
              currentUid={uid}
              onCancelBooking={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
