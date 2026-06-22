export function categorizeTitle(title: string): string {
  const t = title.toLowerCase();
  if (
    t.includes("flood") ||
    t.includes("drainage") ||
    t.includes("canal") ||
    t.includes("culvert") ||
    t.includes("dike") ||
    t.includes("revetment") ||
    t.includes("riprap") ||
    t.includes("desilt") ||
    t.includes("riverbank") ||
    t.includes("creek") ||
    t.includes("estero")
  )
    return "Flood Control";
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
  if (t.includes("light") || (t.includes("lamp") && !t.includes("clamp"))) return "Street Lighting";
  if (t.includes("health") || t.includes("medical") || t.includes("hospital"))
    return "Health";
  return "Other";
}
