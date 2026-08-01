const RECENT_KEY = 'mitho-recent';
const MAX_ITEMS = 8;

export function recordRecentView(item) {
  if (!item || !item._id) return;
  try {
    const current = getRecentViews();
    const rest = current.filter((r) => r.id !== item._id);
    const next = [{ id: item._id, name: item.name, img: item.img }, ...rest].slice(0, MAX_ITEMS);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentViews() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearRecentViews() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}
