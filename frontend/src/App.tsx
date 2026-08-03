import { Navigate, Route, Routes, useParams } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { getAdminSession } from "@/lib/api";
import CertificatePage from "./pages/CertificatePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import "./App.css";

function VerificationAlias() {
  const { certificateId } = useParams<{
    certificateId: string;
  }>();

  return (
    <Navigate
      replace
      to={`/certificates/${encodeURIComponent(certificateId ?? "")}`}
    />
  );
}

function Home() {
  return (
    <main className="verification-page">
      <section className="result-card">
        <a className="fueler-brand" href="/">
          fueler
        </a>

        <h1>Fueler Credentials</h1>

        <p className="result-message">
          Digitally verified certificates for Fueler programs and achievements.
        </p>
      </section>
    </main>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  return getAdminSession() ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Home />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/certificates/:certificateId"
          element={<CertificatePage />}
        />

        <Route
          path="/verify/certificate/:certificateId"
          element={<VerificationAlias />}
        />

        <Route
          path="*"
          element={
            <main className="verification-page">
              <section className="result-card">
                <h1>Page not found</h1>
                <a className="text-link" href="/">
                  Return to Fueler
                </a>
              </section>
            </main>
          }
        />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
