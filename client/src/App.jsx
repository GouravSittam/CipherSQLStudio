import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import AssignmentList from "./pages/AssignmentList.jsx";
import AssignmentAttempt from "./pages/AssignmentAttempt.jsx";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<AssignmentList />} />
            <Route path="/assignment/:id" element={<AssignmentAttempt />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
