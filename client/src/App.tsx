/*
 * Main App Component
 * This is where everything comes together - routes, layout, etc.
 *
 * Author: Gourav Chaudhary
 */

import { BrowserRouter, Route, Routes } from "react-router";
import Footer from "./components/Footer.tsx";
import Header from "./components/Header.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import AssignmentAttempt from "./pages/AssignmentAttempt.tsx";
import AssignmentList from "./pages/AssignmentList.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
