import { Navigate, Route, Routes, useParams } from "react-router";
import CertificatePage from "./pages/CertificatePage";
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

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />

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
  );
}

export default App;
