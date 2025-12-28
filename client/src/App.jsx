/*
 * Main App Component
 * This is where everything comes together - routes, layout, etc.
 *
 * Author: Gourav Chaudhary
 * Last updated: Dec 2024
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext.jsx";

// Layout components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Page components
import AssignmentList from "./pages/AssignmentList.jsx";
import AssignmentAttempt from "./pages/AssignmentAttempt.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  // v7 flags to suppress those annoying console warnings
  // TODO: migrate fully to react-router v7 when stable
  const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };

  return (
    <AuthProvider>
      <Router future={routerFutureFlags}>
        <div className="app">
          <Header />
          <main className="app__main">
            <Routes>
              <Route path="/" element={<AssignmentList />} />
              <Route path="/assignment/:id" element={<AssignmentAttempt />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
