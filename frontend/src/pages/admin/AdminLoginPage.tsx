import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  api,
  getAdminSession,
  setAdminSession,
  type AdminSession,
} from "@/lib/api";

type LoginResponse = AdminSession & { message: string };

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@fueler.io");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (getAdminSession()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api<LoginResponse>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setAdminSession({ token: response.token, user: response.user });
      navigate("/admin", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-svh bg-[#f6f5f1] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-neutral-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(124,58,237,0.34),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(249,115,22,0.18),transparent_34%)]" />
        <a className="relative text-3xl font-bold tracking-[-0.08em]" href="/">
          fueler
        </a>
        <div className="relative max-w-xl">
          <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="mb-4 text-sm font-medium tracking-[0.18em] text-violet-300 uppercase">
            Credential operations
          </p>
          <h1 className="text-5xl leading-[1.04] font-semibold tracking-[-0.055em] xl:text-6xl">
            Issue trust. Keep every credential verifiable.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-neutral-300">
            Manage fellowship certificates, public verification, PDF credentials,
            and revocations from one secure workspace.
          </p>
        </div>
        <p className="relative text-sm text-neutral-500">
          Internal access only · Fueler Credentials
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <a className="mb-10 block text-3xl font-bold tracking-[-0.08em] lg:hidden" href="/">
            fueler
          </a>

          <Card className="border-neutral-200/80 bg-white shadow-xl shadow-neutral-900/5">
            <CardHeader className="gap-3 px-6 pt-7 sm:px-8 sm:pt-9">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <KeyRound className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-2xl tracking-[-0.035em]">
                  Admin sign in
                </CardTitle>
                <CardDescription className="mt-2 leading-6">
                  Use your Fueler administrator account to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-7 sm:px-8 sm:pb-9">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <Button className="h-10 w-full" disabled={submitting} type="submit">
                  {submitting && (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  )}
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
