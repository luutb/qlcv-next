/** Match Go validator rune limits and bcrypt's byte limit. */
export function isValidEmployeePassword(password: string): boolean {
  return Array.from(password).length >= 6 && new TextEncoder().encode(password).length <= 72;
}

export function isValidEmployeeUsername(username: string): boolean {
  const length = Array.from(username.trim()).length;
  return length >= 3 && length <= 100;
}

export function localDateInputMax(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
