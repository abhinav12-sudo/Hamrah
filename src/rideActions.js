import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

function seatsTaken(ride) {
  return (ride.bookings || []).reduce((sum, b) => sum + (b.seats || 1), 0);
}

/** Books one seat on a ride for the given rider. Re-reads the ride first
 *  so two people booking at nearly the same time don't both grab the
 *  last seat undetected. */
export async function bookRide(rideId, rider) {
  const ref = doc(db, "rides", rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("This ride no longer exists.");

  const ride = snap.data();
  const already = (ride.bookings || []).some((b) => b.uid === rider.uid);
  if (already) throw new Error("You've already booked this ride.");

  if (seatsTaken(ride) + 1 > ride.totalSeats) {
    throw new Error("Sorry, this ride just filled up.");
  }

  const bookings = [
    ...(ride.bookings || []),
    {
      uid: rider.uid,
      name: rider.name,
      mobile: rider.mobile,
      seats: 1,
      bookedAt: new Date().toISOString(),
    },
  ];

  await updateDoc(ref, { bookings });
}

/** Removes the current rider's own booking from a ride. */
export async function cancelBooking(rideId, uid) {
  const ref = doc(db, "rides", rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const ride = snap.data();
  const bookings = (ride.bookings || []).filter((b) => b.uid !== uid);
  await updateDoc(ref, { bookings });
}

/** Deletes a ride the current user created. */
export async function deleteRide(rideId) {
  await deleteDoc(doc(db, "rides", rideId));
}
