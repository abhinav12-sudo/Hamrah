import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import AuthScreen from "./components/AuthScreen";
import Navbar from "./components/Navbar";
import SearchRides from "./components/SearchRides";
import MyBookings from "./components/MyBookings";
import MyRides from "./components/MyRides";
import Profile from "./components/Profile";

export default function App() {
  const { user, profile, authLoading, profileLoading } = useAuth();
  const [rides, setRides] = useState([]);
  const [ridesLoaded, setRidesLoaded] = useState(false);
  const [tab, setTab] = useState("search");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rides"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRides(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setRidesLoaded(true);
    });
    return unsub;
  }, [user]);

  if (authLoading) {
    return <CenteredMessage text="Loading…" />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (profileLoading || !ridesLoaded) {
    return <CenteredMessage text="Loading your account…" />;
  }

  if (!profile) {
    return (
      <CenteredMessage text="We couldn't find your profile. Try logging out and signing up again." />
    );
  }

  return (
    <div className="app-shell">
      <Navbar profile={profile} activeTab={tab} onTabChange={setTab} />
      <div className="main-area">
        {tab === "search" && <SearchRides rides={rides} profile={profile} uid={user.uid} />}
        {tab === "bookings" && <MyBookings rides={rides} uid={user.uid} />}
        {tab === "mine" && <MyRides rides={rides} uid={user.uid} />}
        {tab === "profile" && <Profile profile={profile} uid={user.uid} rides={rides} />}
      </div>
    </div>
  );
}

function CenteredMessage({ text }) {
  return (
    <div className="auth-screen">
      <p style={{ color: "var(--text-muted)" }}>{text}</p>
    </div>
  );
}