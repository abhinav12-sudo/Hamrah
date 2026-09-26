import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const TABS = [
  { id: "search", label: "Find a ride" },
  { id: "bookings", label: "Your booked rides" },
  { id: "mine", label: "Your initiated rides" },
  { id: "profile", label: "Profile" },
];

export default function Navbar({ profile, activeTab, onTabChange }) {
  const initial = (profile?.name || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">🚗 Hamrah</span>
          <span className="brand-sub">NIT Srinagar rideshare</span>
        </div>
        <div className="topbar-user">
          <div className="who">
            <div className="name">{profile?.name}</div>
            <div className="hostel">{profile?.hostel || "—"}</div>
          </div>
          <div className="avatar-circle">{initial}</div>
          <button className="btn btn-outline btn-sm" onClick={() => signOut(auth)}>
            Log out
          </button>
        </div>
      </div>
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
