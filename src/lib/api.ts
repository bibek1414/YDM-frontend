const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ydm_auth_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw errorData;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Auth endpoints (no token needed)
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: Record<string, unknown> }>(
      "/api/account/login/",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    ),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
  }) =>
    request<{ token: string; user: Record<string, unknown> }>(
      "/api/account/register/",
      { method: "POST", body: JSON.stringify(data) },
      false
    ),
};

export async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw errorData;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function uploadFile<T>(endpoint: string, file: File, fieldName = "file"): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Do NOT set Content-Type — browser sets it with the correct boundary for multipart
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw errorData;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const utils = {
  downloadExcelSample: () => downloadFile("/api/orders/template/", "orders-template.xlsx"),
  uploadExcel: (file: File) => uploadFile("/api/orders/import/", file, "file"),
};

// Authenticated API helper (token auto-attached)
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
