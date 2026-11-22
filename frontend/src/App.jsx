import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/appLayout";
import Dashboard from "./pages/dashboard";

function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/transactions" element={<Placeholder title="Transactions" />} />
        <Route path="/profile" element={<Placeholder title="Profile" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;