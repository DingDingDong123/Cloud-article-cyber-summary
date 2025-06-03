import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing/landing.js";
import LoginPage from "../src/Pages/Login/login_page.js";
import React from "react";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sources from "./Pages/Sources/Sources";

function App() {
  return (
       <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        { <Route path="/login" element={<LoginPage />} /> }
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sources" element={<Sources />} />
      </Routes>
    </Router>
  );
}

export default App;
