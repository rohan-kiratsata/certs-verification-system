import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileBadge2,
  LoaderCircle,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  ShieldX,
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CertificateDetailsDialog } from "@/components/admin/CertificateDetailsDialog";
import { IssueCertificateDialog } from "@/components/admin/IssueCertificateDialog";
import { ApiError, api, clearAdminSession, downloadApiFile, getAdminSession } from "@/lib/api";
import type { Certificate, CertificateListResponse, DataResponse, Program } from "@/types/admin";

function StatusBadge({ status }: { status: Certificate["status"] }) {
  return status === "active" ? (
    <Badge variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="size-3.5" /> Active
    </Badge>
  ) : (
    <Badge variant="destructive"><ShieldX className="size-3.5" /> Revoked</Badge>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const session = getAdminSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [meta, setMeta] = useState<CertificateListResponse["meta"] | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [programId, setProgramId] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [revokeCertificate, setRevokeCertificate] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  const handleAuthFailure = useCallback(() => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), per_page: "15" });
    if (debouncedSearch) query.set("search", debouncedSearch);
    if (status !== "all") query.set("status", status);
    if (programId !== "all") query.set("creds_program_id", programId);

    try {
      const response = await api<CertificateListResponse>(`/admin/certificates?${query.toString()}`);
      setCertificates(response.data);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        handleAuthFailure();
        return;
      }
      toast.error(caught instanceof Error ? caught.message : "Unable to load certificates.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, handleAuthFailure, page, programId, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  useEffect(() => {
    api<DataResponse<Program[]>>("/admin/programs")
      .then((response) => setPrograms(response.data))
      .catch((caught) => {
        if (caught instanceof ApiError && caught.status === 401) handleAuthFailure();
      });
  }, [handleAuthFailure]);

  const pageStats = useMemo(() => {
    const active = certificates.filter((certificate) => certificate.status === "active").length;
    return { active, revoked: certificates.length - active };
  }, [certificates]);

  async function handleLogout() {
    try {
      await api("/admin/logout", { method: "DELETE" });
    } finally {
      clearAdminSession();
      navigate("/admin/login", { replace: true });
    }
  }

  async function handleDownload(certificate: Certificate) {
    try {
      toast.loading("Preparing certificate PDF…", { id: "pdf-download" });
      await downloadApiFile(
        `/admin/certificates/${certificate.id}/download`,
        `fueler-certificate-${certificate.certificate_id}.pdf`,
      );
      toast.success("Certificate downloaded.", { id: "pdf-download" });
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to download PDF.", { id: "pdf-download" });
    }
  }

  async function handleRevoke() {
    if (!revokeCertificate || !revocationReason.trim()) return;
    setRevoking(true);
    try {
      await api(`/admin/certificates/${revokeCertificate.id}/revoke`, {
        method: "PATCH",
        body: JSON.stringify({ reason: revocationReason.trim() }),
      });
      toast.success("Certificate revoked. Its public page now shows the revoked status.");
      setRevokeCertificate(null);
      setRevocationReason("");
      await loadCertificates();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to revoke certificate.");
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="min-h-svh bg-[#f7f7f5] text-neutral-950">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a className="text-2xl font-bold tracking-[-0.08em]" href="/">fueler</a>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">Certificate admin</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{session?.user.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
              <LogOut aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-violet-700 uppercase">Credentials</p>
            <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Certificate management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Issue, verify, download, and revoke credentials linked to existing Fueler accounts.
            </p>
          </div>
          <Button className="h-10 bg-violet-700 hover:bg-violet-800" onClick={() => setIssueOpen(true)}>
            <Plus aria-hidden="true" /> Issue certificate
          </Button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Certificate summary">
          <Card className="border-neutral-200 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Total certificates</p><p className="mt-1 text-2xl font-semibold tracking-tight">{meta?.total ?? "—"}</p></div><div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Award className="size-5" /></div></CardContent></Card>
          <Card className="border-neutral-200 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Active on this page</p><p className="mt-1 text-2xl font-semibold tracking-tight">{loading ? "—" : pageStats.active}</p></div><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-5" /></div></CardContent></Card>
          <Card className="border-neutral-200 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Revoked on this page</p><p className="mt-1 text-2xl font-semibold tracking-tight">{loading ? "—" : pageStats.revoked}</p></div><div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-700"><ShieldX className="size-5" /></div></CardContent></Card>
        </section>

        <Card className="overflow-hidden border-neutral-200 shadow-none">
          <div className="flex flex-col gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-10 pl-9" placeholder="Search recipient, email, or credential ID" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="h-10 w-full sm:w-36"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="revoked">Revoked</SelectItem></SelectContent>
              </Select>
              <Select value={programId} onValueChange={(value) => { setProgramId(value); setPage(1); }}>
                <SelectTrigger className="h-10 w-full sm:w-56"><SelectValue placeholder="All programs" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All programs</SelectItem>{programs.map((program) => <SelectItem key={program.id} value={String(program.id)}>{program.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/40"><TableHead className="min-w-52">Recipient</TableHead><TableHead className="min-w-52">Program</TableHead><TableHead className="min-w-44">Credential ID</TableHead><TableHead>Issued</TableHead><TableHead>Status</TableHead><TableHead className="w-14"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 6 }).map((_, index) => <TableRow key={index}>{Array.from({ length: 6 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-5 w-full max-w-36" /></TableCell>)}</TableRow>) : certificates.length ? certificates.map((certificate) => (
                  <TableRow key={certificate.id} className="group">
                    <TableCell><div className="font-medium">{certificate.recipient.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{certificate.recipient.email}</div></TableCell>
                    <TableCell><div className="font-medium">{certificate.program.name}</div><div className="mt-0.5 text-xs capitalize text-muted-foreground">{certificate.program.type}</div></TableCell>
                    <TableCell className="font-mono text-xs">{certificate.certificate_id}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{certificate.issued_at}</TableCell>
                    <TableCell><StatusBadge status={certificate.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${certificate.recipient.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setSelectedCertificate(certificate)}><FileBadge2 /> View details</DropdownMenuItem>
                        <DropdownMenuItem asChild><a href={`/certificates/${encodeURIComponent(certificate.certificate_id)}`} target="_blank" rel="noreferrer"><ExternalLink /> Public page</a></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(certificate)}><Download /> Download PDF</DropdownMenuItem>
                        {certificate.status === "active" && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setRevokeCertificate(certificate)}><ShieldX /> Revoke certificate</DropdownMenuItem></>}
                      </DropdownMenuContent></DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="h-56 text-center"><div className="mx-auto flex max-w-sm flex-col items-center"><FileBadge2 className="mb-3 size-9 text-muted-foreground/60" /><p className="font-medium">No certificates found</p><p className="mt-1 text-sm text-muted-foreground">Try changing the filters or issue a new certificate.</p></div></TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">{meta?.from ?? 0}–{meta?.to ?? 0} of {meta?.total ?? 0} certificates</p>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /> Previous</Button><span className="min-w-20 text-center text-xs text-muted-foreground">Page {meta?.current_page ?? page} of {meta?.last_page ?? 1}</span><Button variant="outline" size="sm" disabled={loading || page >= (meta?.last_page ?? 1)} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight /></Button></div>
          </div>
        </Card>
      </main>

      <IssueCertificateDialog open={issueOpen} onOpenChange={setIssueOpen} onIssued={loadCertificates} />
      <CertificateDetailsDialog certificate={selectedCertificate} onOpenChange={(open) => { if (!open) setSelectedCertificate(null); }} onDownload={handleDownload} />

      <AlertDialog open={Boolean(revokeCertificate)} onOpenChange={(open) => { if (!open && !revoking) { setRevokeCertificate(null); setRevocationReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Revoke this certificate?</AlertDialogTitle><AlertDialogDescription>This immediately changes the public verification result for <strong>{revokeCertificate?.recipient.name}</strong>. The historical record remains available.</AlertDialogDescription></AlertDialogHeader>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="revocation-reason">Reason for revocation</label><Textarea id="revocation-reason" value={revocationReason} onChange={(event) => setRevocationReason(event.target.value)} placeholder="Explain why this credential is no longer valid" rows={4} /></div>
          <AlertDialogFooter><AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={revoking || !revocationReason.trim()} onClick={(event) => { event.preventDefault(); handleRevoke(); }}>{revoking && <LoaderCircle className="animate-spin" />}{revoking ? "Revoking…" : "Revoke certificate"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
