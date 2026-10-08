const API_BASE = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/+$/, "");

export const fileUrl = (path?: string | null): string => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath;
};