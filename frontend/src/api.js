const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let authToken = null;

export function setToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error("Could not reach the server. Check your connection and that the backend is running.");
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch (_) { /* no JSON body */ }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  requestOtp: (phone) => request("/api/auth/otp/request", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) => request("/api/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),

  listApplications: () => request("/api/applications"),
  decideApplication: (id, decision) => request(`/api/applications/${id}/decision`, { method: "POST", body: JSON.stringify({ decision }) }),

  listLoans: () => request("/api/loans"),
  toggleFreeze: (id) => request(`/api/loans/${id}/toggle-freeze`, { method: "POST" }),

  listMerchants: () => request("/api/merchants"),
  addMerchant: (payload) => request("/api/merchants", { method: "POST", body: JSON.stringify(payload) }),
  approveMerchant: (id) => request(`/api/merchants/${id}/approve`, { method: "POST" }),

  listVerifications: () => request("/api/verifications"),

  getSchemeConfig: () => request("/api/scheme-config"),
  updateSchemeConfig: (payload) => request("/api/scheme-config", { method: "PATCH", body: JSON.stringify(payload) }),

  getMe: () => request("/api/auth/me"),

  listInvoices: () => request("/api/billing/invoices"),
};

export { BASE_URL };
