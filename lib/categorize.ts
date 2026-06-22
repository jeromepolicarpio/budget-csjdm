export function categorizeTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("flood") || t.includes("drainage")) return "Flood Control";
  if (t.includes("road") || t.includes("pavement") || t.includes("bridge"))
    return "Roads";
  if (t.includes("water") || t.includes("potable")) return "Water & Utilities";
  if (
    t.includes("building") ||
    t.includes("hall") ||
    t.includes("center") ||
    t.includes("school")
  )
    return "Buildings";
  if (t.includes("light") || t.includes("lamp")) return "Street Lighting";
  if (t.includes("health") || t.includes("medical") || t.includes("hospital"))
    return "Health";
  return "Other";
}
