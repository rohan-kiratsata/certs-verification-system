const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const ADMIN_SESSION_KEY = "fueler.admin.session";

export type AdminSession = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export function getAdminSession(): AdminSession | null {
  const value = sessionStorage.getItem(ADMIN_SESSION_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as AdminSession;
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function setAdminSession(session: AdminSession): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getAdminSession();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(session
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

export async function downloadApiFile(
  path: string,
  filename: string,
): Promise<void> {
  const session = getAdminSession();
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/pdf",
      ...(session
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let body: unknown = null;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Download failed with status ${response.status}`;

    throw new ApiError(message, response.status, body);
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}
