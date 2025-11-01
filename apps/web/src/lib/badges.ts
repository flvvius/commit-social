export const AVAILABLE_BADGES: string[] = [
  "Active Contributor Badge Design.png",
  "Daily Game Badge Design.png",
  "Quiz Master Badge Design.png",
  "Smoke Break Crew Badge Design.png",
  "Streak Hero Badge Design.png",
];

export function badgeUrl(fileName: string) {
  // Files live under /public/badges; ensure URL-encoding for spaces/special chars
  return `/badges/${encodeURIComponent(fileName)}`;
}
