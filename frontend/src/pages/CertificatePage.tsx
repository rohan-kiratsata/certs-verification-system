import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api, apiUrl } from "../lib/api";

type VerificationStatus = "verified" | "revoked" | "expired";

type CertificateData = {
  certificate_id: string;
  recipient_name: string;
  program: {
    name: string;
    type: string;
  };
  issued_at: string;
  expires_at: string | null;
  status: VerificationStatus;
  verified: boolean;
  message: string;
};

type CertificateResponse = {
  data: CertificateData;
};

type PageState =
  | { type: "loading" }
  | { type: "success"; certificate: CertificateData }
  | { type: "error"; message: string };

function StatusIcon({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
        <path
          d="m5 12 4.25 4.25L19 6.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  if (status === "revoked") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
        <path
          d="M7 7l10 10M17 7 7 17"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 8v4l2.5 2.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function CertificatePage() {
  const { certificateId } = useParams<{
    certificateId: string;
  }>();

  const [state, setState] = useState<PageState>({
    type: "loading",
  });

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  useEffect(() => {
    if (!certificateId) {
      setState({
        type: "error",
        message: "Certificate ID is missing.",
      });

      return;
    }

    const controller = new AbortController();

    setState({ type: "loading" });

    api<CertificateResponse>(
      `/certificates/${encodeURIComponent(certificateId)}`,
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        setState({
          type: "success",
          certificate: response.data,
        });

        document.title = `${response.data.recipient_name} — Fueler Certificate`;
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to verify this certificate.",
        });
      });

    return () => controller.abort();
  }, [certificateId]);

  if (state.type === "loading") {
    return (
      <main className="verification-page">
        <section className="loading-card" aria-live="polite" aria-busy="true">
          <div className="loading-mark" />
          <div className="loading-line loading-line-short" />
          <div className="loading-line" />
          <div className="loading-certificate" />

          <span className="sr-only">Verifying certificate</span>
        </section>
      </main>
    );
  }

  if (state.type === "error") {
    return (
      <main className="verification-page">
        <section className="result-card result-card-error">
          <div className="result-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 8v5M12 17.2v.1"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          <p className="eyebrow">Verification result</p>
          <h1>Certificate not found</h1>
          <p className="result-message">{state.message}</p>

          <p className="result-help">
            Check that the credential ID or verification link was entered
            correctly.
          </p>
        </section>
      </main>
    );
  }

  const { certificate } = state;

  const canonicalUrl =
    `${window.location.origin}/certificates/` +
    encodeURIComponent(certificate.certificate_id);

  const linkedInUrl =
    "https://www.linkedin.com/sharing/share-offsite/?url=" +
    encodeURIComponent(canonicalUrl);

  const xText =
    `I earned the ${certificate.program.name} ` + `certificate from Fueler.`;

  const xUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(xText) +
    "&url=" +
    encodeURIComponent(canonicalUrl);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopyStatus("copied");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <main className="verification-page">
      <header className="public-header">
        <a className="fueler-brand" href="/" aria-label="Fueler home">
          fueler
        </a>

        <span className="header-label">Credential verification</span>
      </header>

      <section
        className={`status-banner status-${certificate.status}`}
        aria-live="polite"
      >
        <span className="status-icon">
          <StatusIcon status={certificate.status} />
        </span>

        <span>
          <strong>
            {certificate.status === "verified"
              ? "Verified certificate"
              : certificate.status === "revoked"
                ? "Revoked certificate"
                : "Expired certificate"}
          </strong>

          <span className="status-description">{certificate.message}</span>
        </span>
      </section>

      <article className="certificate-card">
        <div className="certificate-border">
          <div className="certificate-brand">fueler</div>

          <p className="certificate-kicker">Certificate of completion</p>

          <h1>Certificate of Achievement</h1>

          <p className="certificate-intro">
            This credential is proudly presented to
          </p>

          <h2>{certificate.recipient_name}</h2>

          <p className="certificate-copy">
            for successfully completing the
            <strong>{certificate.program.name}</strong>
            and demonstrating commitment, consistency, and excellence throughout
            the program.
          </p>

          <dl className="credential-details">
            <div>
              <dt>Issued on</dt>
              <dd>{formatDate(certificate.issued_at)}</dd>
            </div>

            <div>
              <dt>Credential ID</dt>
              <dd>{certificate.certificate_id}</dd>
            </div>

            <div>
              <dt>Issued by</dt>
              <dd>Fueler</dd>
            </div>
          </dl>
        </div>
      </article>

      <section className="certificate-actions">
        {certificate.verified && (
          <a
            className="action-button action-button-primary"
            href={apiUrl(
              `/certificates/${encodeURIComponent(
                certificate.certificate_id,
              )}/download`,
            )}
          >
            Download PDF
          </a>
        )}

        <a
          className="action-button"
          href={linkedInUrl}
          target="_blank"
          rel="noreferrer"
        >
          Share on LinkedIn
        </a>

        <a
          className="action-button"
          href={xUrl}
          target="_blank"
          rel="noreferrer"
        >
          Share on X
        </a>

        <button className="action-button" type="button" onClick={copyLink}>
          {copyStatus === "copied"
            ? "Link copied"
            : copyStatus === "failed"
              ? "Unable to copy"
              : "Copy link"}
        </button>
      </section>

      <footer className="public-footer">
        This credential was issued and verified by Fueler.
      </footer>
    </main>
  );
}
