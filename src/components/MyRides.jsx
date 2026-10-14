import { useMemo, useState } from "react";
import RideCard from "./RideCard";
import ConfirmDialog from "./ConfirmDialog";
import { deleteRide } from "../rideActions";

export default function MyRides({ rides, uid }) {
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // ride awaiting confirmation
  const [deleting, setDeleting] = useState(false);

  const myRides = useMemo(
    () =>
      rides
        .filter((r) => r.creatorId === uid)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [rides, uid]
  );

  function handleDelete(ride) {
    setError("");
    setPendingDelete(ride);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteRide(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      setPendingDelete(null);
      setError("Couldn't delete that ride. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const bookedCount = (pendingDelete?.bookings || []).length;

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

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this ride?"
          confirmLabel="Delete ride"
          cancelLabel="Keep it"
          danger
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        >
          <p className="confirm-route">
            {pendingDelete.from} &rarr; {pendingDelete.to}
          </p>
          <p>
            {bookedCount > 0
              ? `${bookedCount} ${bookedCount === 1 ? "student has" : "students have"} already booked this ride. Deleting it removes their booking too, so let them know.`
              : "This can't be undone."}
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}