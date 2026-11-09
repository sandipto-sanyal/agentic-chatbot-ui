import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import TestPage from "./pages/Test";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-[#eee]">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about" className="mr-4">About</Link>
        <Link to="/dashboard" className="mr-4">Dashboard</Link>
        <Link to="/chat">Chat</Link>
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