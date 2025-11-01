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

// Metadata and criteria for how to earn each badge (used for tooltips)
const META: Record<string, { title: string; description: string }> = {
  "Active Contributor Badge Design.png": {
    title: "Active Contributor",
    description: "Publică cel puțin 3 postări.",
  },
  "Streak Hero Badge Design.png": {
    title: "Streak Hero",
    description: "Obține un streak mai mare de 5 la jocul zilnic.",
  },
  "Smoke Break Crew Badge Design.png": {
    title: "Smoke Break Crew",
    description: "Alătură-te grupului ‘Smokers Lounge’.",
  },
  "Daily Game Badge Design.png": {
    title: "Daily Game",
    description: "Joacă jocul zilnic cel puțin o dată.",
  },
  "Quiz Master Badge Design.png": {
    title: "Quiz Master",
    description: "Demonstrează performanțe excelente la quiz-ul zilnic.",
  },
};

export function getBadgeMeta(fileName: string) {
  const fallbackTitle = fileName.replace(/\.[^.]+$/, "");
  return (
    META[fileName] || {
      title: fallbackTitle,
      description: "Badge – criterii în curând.",
    }
  );
}
