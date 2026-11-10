import { NavLink } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar({
    user = {name: "Phuong Luu", email: "PhuongLuu@my.unt.edu" },
    onLogout,
}) {
const initials = user.name
.split(" ")
.map((part) => part[0])
.join("")
.slice(0,2)
.toUpperCase();

const navClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";
return (
    <aside className="sidebar">
      <div className="sidebar-logo">POCKETLY</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
        <NavLink to="/transactions" className={navClass}>Transactions</NavLink>
        <NavLink to="/profile" className={navClass}>Settings</NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{user.name}</div>
            <div className="sidebar-email">{user.email}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}