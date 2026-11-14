// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./Login";
import Signup from "./Signup";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import MyDocuments from "./pages/MyDocuments";
import Templates from "./pages/Templates";
import DocumentEditor from "./pages/DocumentEditor";
import PresentationEditor from "./pages/PresentationEditor";
import SharedWithMe from "./pages/SharedWithMe";     // ← NEW
import Favorites from "./pages/Favorites";           // ← NEW

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected — ALL inside DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/documents" element={<MyDocuments />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/doc/:id" element={<DocumentEditor />} />
          <Route path="/presentation/:id" element={<PresentationEditor />} />
          <Route path="/shared" element={<SharedWithMe />} />        {/* ✅ INSIDE */}
          <Route path="/favorites" element={<Favorites />} />        {/* ✅ INSIDE */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}