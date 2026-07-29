export function getInitials(name: string, unassignedLabel?: string): string {
  if (name === "Unassigned" && unassignedLabel) return unassignedLabel;

  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
