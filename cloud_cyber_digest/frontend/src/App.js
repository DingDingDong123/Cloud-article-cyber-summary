import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing/landing.js";
import LoginPage from "../src/Pages/Login/login_page.js";
import React from "react";

function Dashboard() {
  return <h1 className="text-center mt-20 text-2xl">Welcome to your Dashboard</h1>;
}

function App() {
  return (
       <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        { <Route path="/login" element={<LoginPage />} /> }
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
