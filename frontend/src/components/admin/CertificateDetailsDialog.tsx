import { CalendarDays, Download, ExternalLink, Fingerprint, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Certificate } from "@/types/admin";

type Props = {
  certificate: Certificate | null;
  onOpenChange: (open: boolean) => void;
  onDownload: (certificate: Certificate) => void;
};

export function CertificateDetailsDialog({
  certificate,
  onOpenChange,
  onDownload,
}: Props) {
  if (!certificate) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-xl">Certificate details</DialogTitle>
              <DialogDescription className="mt-1.5 font-mono text-xs">
                {certificate.certificate_id}
              </DialogDescription>
            </div>
            <Badge
              variant={certificate.status === "active" ? "secondary" : "destructive"}
              className={
                certificate.status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : undefined
              }
            >
              {certificate.status === "active" ? "Active" : "Revoked"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">{certificate.recipient.name}</p>
              <p className="text-sm text-muted-foreground">{certificate.recipient.email}</p>
            </div>
          </div>

          <Separator />

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Fingerprint className="size-3.5" /> Program
              </dt>
              <dd className="font-medium">{certificate.program.name}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="size-3.5" /> Issue date
              </dt>
              <dd className="font-medium">{certificate.issued_at}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted-foreground">Expiration</dt>
              <dd className="font-medium">{certificate.expires_at ?? "No expiration"}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted-foreground">PDF</dt>
              <dd className="font-medium">{certificate.pdf_path ? "Generated" : "Generated on download"}</dd>
            </div>
          </dl>

          {certificate.status === "revoked" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">Revoked</p>
              <p className="mt-1 text-red-700">
                {certificate.revocation_reason ?? "No reason recorded."}
              </p>
              {certificate.revoked_at && (
                <p className="mt-2 text-xs text-red-600">
                  {new Date(certificate.revoked_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:mx-0 sm:mb-0 sm:rounded-xl">
          <Button variant="outline" asChild>
            <a
              href={`/certificates/${encodeURIComponent(certificate.certificate_id)}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink /> Public page
            </a>
          </Button>
          <Button onClick={() => onDownload(certificate)}>
            <Download /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
