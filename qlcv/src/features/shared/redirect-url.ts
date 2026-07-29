export type RouteSearchParams = Record<string, string | string[] | undefined>;

export function redirectUrl(pathname: string, searchParams: RouteSearchParams): string {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (value !== undefined) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
