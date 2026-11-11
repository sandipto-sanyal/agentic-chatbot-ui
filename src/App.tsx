import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import TestPage from "./pages/Test";

// NavLink marks the link whose route is currently open as active, so the
// highlight follows the click and also works with back/forward and direct URLs.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `mr-4 ${isActive ? "text-brand-primary" : ""}`;

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-[#eee]">
        <NavLink to="/" end className={navLinkClass}>Home</NavLink>
        <NavLink to="/about" className={navLinkClass}>About</NavLink>
        {/* <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink> */}
        <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );

}