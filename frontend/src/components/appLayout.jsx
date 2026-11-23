import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import { getProfile } from "../api/profile";
import "./appLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setUser({
          name: profile.full_name,
          email: profile.email,
        });
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}