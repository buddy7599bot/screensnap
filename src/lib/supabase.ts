// Screenshot metadata stored in localStorage for MVP
export interface Screenshot {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  createdAt: string;
  expiresAt: string | null;
}

const STORAGE_KEY = "screensnap_screenshots";

export function getScreenshots(): Screenshot[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const items: Screenshot[] = JSON.parse(raw);
  // Filter expired
  return items.filter((s) => !s.expiresAt || new Date(s.expiresAt) > new Date());
}

export function saveScreenshot(s: Screenshot) {
  const items = getScreenshots();
  items.unshift(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function deleteScreenshot(id: string) {
  const items = getScreenshots().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getScreenshot(id: string): Screenshot | null {
  return getScreenshots().find((s) => s.id === id) || null;
}

export function setExpiry(id: string, hours: number | null) {
  const items = getScreenshots();
  const item = items.find((s) => s.id === id);
  if (!item) return;
  item.expiresAt = hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function uploadScreenshot(file: File): Promise<Screenshot> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  const data = await res.json();
  const screenshot: Screenshot = {
    id: data.id,
    url: data.url,
    filename: data.filename,
    size: data.size,
    contentType: data.contentType,
    createdAt: data.createdAt,
    expiresAt: null,
  };

  saveScreenshot(screenshot);
  return screenshot;
}
