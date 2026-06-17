import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppStore, initializeStore } from "./lib/store";
import NavBar from "./components/NavBar";
import OnboardingPage from "./pages/OnboardingPage";
import ReadingPage from "./pages/ReadingPage";
import DiscussionPage from "./pages/DiscussionPage";
import ReflectionPage from "./pages/ReflectionPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const { userContext, initialized } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStore().then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>正在加载...</div>
        </div>
      </div>
    );
  }

  if (!userContext) {
    return <OnboardingPage />;
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/discussion" element={<DiscussionPage />} />
        <Route path="/reflection" element={<ReflectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/reading" replace />} />
      </Routes>
      <NavBar />
    </div>
  );
}
