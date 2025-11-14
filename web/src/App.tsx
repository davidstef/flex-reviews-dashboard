import { Link, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Property from "./pages/Property";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-badge">FL</div>
          <h1>Flex Living – Reviews</h1>
        </div>
        <nav className="nav">
          <Link to="/">Dashboard</Link>
          <Link to="/property/Shoreditch%20Loft%20B2">Property page</Link>
        </nav>
        <span className="path">{pathname}</span>
      </header>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/property/:listingName" element={<Property />} />
      </Routes>

      <footer className="app-footer">© Flex Living — Reviews Dashboard</footer>
    </div>
  );
}
