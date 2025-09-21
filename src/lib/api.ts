// src/lib/api.ts
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";


export type UserProfile = { id: string; email: string; createdAt: string };

export async function getProfileApi(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<UserProfile>(res);
}

/**
 * Generic API error shape
 */
export type ApiError = { status: number; message: string; body?: unknown };

/** parse response body to unknown */
async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (isJson) {
    return await res.json().catch(() => null);
  }
  return await res.text().catch(() => null);
}

/** handleRes returns typed T for successful responses, otherwise throws ApiError */
async function handleRes<T = unknown>(res: Response): Promise<T> {
  const body = await parseBody(res);
  if (!res.ok) {
    let message = res.statusText || "API error";
    if (body && typeof body === "object" && "message" in (body as Record<string, unknown>)) {
      const m = (body as Record<string, unknown>).message;
      message = typeof m === "string" ? m : String(m);
    } else if (typeof body === "string") {
      message = body;
    }
    const err: ApiError = { status: res.status, message, body };
    throw err;
  }
  return body as T;
}

/* ------------------ AUTH ------------------ */

export type AuthUser = { id: string; email?: string };
export type AuthResponse = { token: string; user: AuthUser };

export async function registerApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleRes<AuthResponse>(res);
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleRes<AuthResponse>(res);
}

/* ------------------ NOTES ------------------ */

/**
 * Note returned by backend
 * role = "sent" (sender’s copy) or "received" (receiver’s copy)
 */
export type Note = {
  id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  replied: boolean;
  senderId?: string;
  receiverId?: string;
  role: "sent" | "received";
};

export type DropResponse = { message: string; noteId?: string };
export type InboxResponse = { notes: Note[] };
export type ReplyResponse = { message: string };

export async function dropNoteApi(token: string, content: string): Promise<DropResponse> {
  const res = await fetch(`${API_URL}/api/notes/drop`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  return handleRes<DropResponse>(res);
}

export async function getInboxApi(token: string): Promise<InboxResponse> {
  const res = await fetch(`${API_URL}/api/notes/inbox`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<InboxResponse>(res);
}

export async function replyApi(token: string, noteId: string, content: string): Promise<ReplyResponse> {
  const res = await fetch(`${API_URL}/api/notes/${noteId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  return handleRes<ReplyResponse>(res);
}

export const sendReplyApi = replyApi;

/* ------------------ GDPR / misc ------------------ */

export async function gdprDeleteApi(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/gdpr/delete`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<{ message: string }>(res);
}

/* ------------------ token helpers ------------------ */
export function saveToken(token: string): void {
  try { localStorage.setItem("dropnote_token", token); } catch {return ;}
}
export function loadToken(): string | null {
  try { return localStorage.getItem("dropnote_token"); } catch { return null; }
}
export function clearToken(): void {
  try { localStorage.removeItem("dropnote_token"); } catch {return ;}
}

/* default export */
export default {
  registerApi,
  loginApi,
  dropNoteApi,
  getInboxApi,
  replyApi,
  sendReplyApi,
  gdprDeleteApi,
  saveToken,
  loadToken,
  clearToken,
};
