import { useEffect, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { AdminUser, DataResponse, Program } from "@/types/admin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssued: () => void;
};

const today = new Date().toISOString().slice(0, 10);

export function IssueCertificateDialog({
  open,
  onOpenChange,
  onIssued,
}: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [programId, setProgramId] = useState("");
  const [issuedAt, setIssuedAt] = useState(today);
  const [expiresAt, setExpiresAt] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    api<DataResponse<Program[]>>("/admin/programs")
      .then((response) => setPrograms(response.data))
      .catch((caught) => {
        toast.error(
          caught instanceof Error ? caught.message : "Unable to load programs.",
        );
      });
  }, [open]);

  useEffect(() => {
    if (!open || selectedUser) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoadingUsers(true);
      const query = new URLSearchParams();
      if (userSearch.trim()) query.set("search", userSearch.trim());

      api<DataResponse<AdminUser[]>>(`/admin/users?${query.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => setUsers(response.data))
        .catch((caught) => {
          if (caught instanceof DOMException && caught.name === "AbortError") return;
          toast.error(
            caught instanceof Error ? caught.message : "Unable to load users.",
          );
        })
        .finally(() => setLoadingUsers(false));
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, selectedUser, userSearch]);

  function reset() {
    setSelectedUser(null);
    setUserSearch("");
    setProgramId("");
    setIssuedAt(today);
    setExpiresAt("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedUser || !programId) {
      setError("Select a Fueler user and a credential program.");
      return;
    }

    setSubmitting(true);

    try {
      await api("/admin/certificates", {
        method: "POST",
        body: JSON.stringify({
          user_id: selectedUser.id,
          creds_program_id: Number(programId),
          issued_at: issuedAt,
          expires_at: expiresAt || null,
        }),
      });

      toast.success(`Certificate issued to ${selectedUser.name}.`);
      reset();
      onOpenChange(false);
      onIssued();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to issue the certificate.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !submitting) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Issue a certificate</DialogTitle>
          <DialogDescription>
            Select an existing Fueler account. The recipient name and email are
            copied directly from that account.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="user-search">Fueler user</Label>

            {selectedUser ? (
              <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <UserRound className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{selectedUser.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border">
                <div className="relative border-b">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="user-search"
                    className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
                    placeholder="Search name or account email"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1.5">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                      <LoaderCircle className="size-4 animate-spin" /> Loading users…
                    </div>
                  ) : users.length ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        className="flex min-h-12 w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        type="button"
                        onClick={() => setSelectedUser(user)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                        <Check className="size-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No matching Fueler users.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Credential program</Label>
            <Select value={programId} onValueChange={setProgramId}>
              <SelectTrigger id="program" className="h-10 w-full">
                <SelectValue placeholder="Select a fellowship or program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={String(program.id)}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issued-at">Issue date</Label>
              <Input
                id="issued-at"
                type="date"
                value={issuedAt}
                onChange={(event) => setIssuedAt(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires-at">
                Expiration date <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="expires-at"
                type="date"
                min={issuedAt}
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="sm:mx-0 sm:mb-0 sm:rounded-xl">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {submitting ? "Issuing…" : "Issue certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
