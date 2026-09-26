function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function seatsTaken(ride) {
  return (ride.bookings || []).reduce((sum, b) => sum + (b.seats || 1), 0);
}

/**
 * variant: "search" | "booked" | "mine"
 */
export default function RideCard({
  ride,
  variant,
  onBook,
  onCancelBooking,
  onDelete,
  currentUid,
}) {
  const taken = seatsTaken(ride);
  const seatsLeft = ride.totalSeats - taken;
  const isFull = seatsLeft <= 0;
  const isOwnRide = ride.creatorId === currentUid;
  const myBooking = (ride.bookings || []).find((b) => b.uid === currentUid);

  return (
    <div className="ride-card">
      <div className="ride-route">
        <span>{ride.from}</span>
        <span className="arrow">&rarr;</span>
        <span>{ride.to}</span>
      </div>
      <div className="ride-meta">
        <span>{formatDate(ride.date)}</span>
        <span className="dot">{formatTime(ride.time)}</span>
        <span className="dot">
          {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left` : "Full"}
        </span>
      </div>
      {ride.notes && <div className="ride-notes">"{ride.notes}"</div>}

      <div className="ride-footer">
        <div className="ride-creator">
          Offered by <strong>{ride.creatorName}</strong> &middot; {ride.creatorMobile}
        </div>

        {variant === "search" && !isOwnRide && (
          <button
            className="btn btn-primary btn-sm"
            disabled={isFull || !!myBooking}
            onClick={() => onBook(ride)}
          >
            {myBooking ? "Booked" : isFull ? "Full" : "Book a seat"}
          </button>
        )}

        {variant === "search" && isOwnRide && (
          <span className="seats-pill">Your ride</span>
        )}

        {variant === "booked" && (
          <button className="btn btn-warn btn-sm" onClick={() => onCancelBooking(ride)}>
            Cancel booking
          </button>
        )}

        {variant === "mine" && (
          <button className="btn btn-warn btn-sm" onClick={() => onDelete(ride)}>
            Delete ride
          </button>
        )}
      </div>

      {variant === "mine" && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          {(ride.bookings || []).length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>No one has booked yet.</p>
          ) : (
            (ride.bookings || []).map((b) => (
              <div className="booking-row" key={b.uid}>
                <span>{b.name}</span>
                <span>{b.mobile}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
