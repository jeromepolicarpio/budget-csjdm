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
    t.includes("estero") ||
    t.includes("pumping station") ||
    t.includes("retaining wall") ||
    t.includes("slope protection") ||
    t.includes("embankment")
  )
    return "Flood Control";
  if (
    t.includes("road") ||
    t.includes("pavement") ||
    t.includes("bridge") ||
    t.includes("concreting") ||
    t.includes("asphalt") ||
    t.includes("sidewalk") ||
    t.includes("pathway") ||
    t.includes("footpath") ||
    t.includes("pedestrian")
  )
    return "Roads";
  if (
    t.includes("water") ||
    t.includes("potable") ||
    t.includes("pipeline") ||
    t.includes("waterworks") ||
    t.includes("reservoir") ||
    t.includes("sewage") ||
    t.includes("septic") ||
    t.includes("sanitation") ||
    t.includes("electric") ||
    t.includes("power line") ||
    t.includes("utility")
  )
    return "Water & Utilities";
  if (
    t.includes("building") ||
    t.includes("hall") ||
    t.includes("center") ||
    t.includes("school") ||
    t.includes("classroom") ||
    t.includes("gymnasium") ||
    t.includes("sports") ||
    t.includes("multipurpose") ||
    t.includes("evacuation") ||
    t.includes("office") ||
    t.includes("station") ||
    t.includes("facility") ||
    t.includes("warehouse")
  )
    return "Buildings";
  if (
    t.includes("streetlight") ||
    t.includes("street light") ||
    t.includes("lighting") ||
    (t.includes("lamp") && !t.includes("clamp")) ||
    t.includes("led light") ||
    t.includes("solar light")
  )
    return "Street Lighting";
  if (
    t.includes("health") ||
    t.includes("medical") ||
    t.includes("hospital") ||
    t.includes("clinic") ||
    t.includes("pharmacy") ||
    t.includes("medicine") ||
    t.includes("puericulture") ||
    t.includes("rural health")
  )
    return "Health";
  if (
    t.includes("market") ||
    t.includes("slaughterhouse") ||
    t.includes("livelihood") ||
    t.includes("enterprise")
  )
    return "Livelihood";
  if (
    t.includes("park") ||
    t.includes("plaza") ||
    t.includes("garden") ||
    t.includes("monument") ||
    t.includes("landscaping")
  )
    return "Parks & Public Space";
  return "Other";
}
