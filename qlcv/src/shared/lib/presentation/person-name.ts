export function getInitials(name: string): string {
  if (name === "Unassigned") return "--";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
