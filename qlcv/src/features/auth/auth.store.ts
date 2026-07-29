import { clearAccessToken, getAccessToken, setAccessToken } from "@/api/client";
import type { AuthUser } from "@/api/auth.api";
import { getCurrentUser } from "@/api/users.api";

const USER_STORAGE_KEY = "auth_user";

export const authStore = {
  getToken: getAccessToken,
  setToken: setAccessToken,
  getUser,
  setUser,
  clearUser,
  refreshUser: async (signal?: AbortSignal) => {
    const user = await getCurrentUser(signal);
    setUser(user);
    return user;
  },
  clearToken: () => {
    clearAccessToken();
    clearUser();
  },
  isAuthenticated: () => Boolean(getAccessToken()),
  hasFeature: (featureFlag: string) => getUser()?.enabled_feature_flags?.includes(featureFlag) ?? false,
};

function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function setUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

function clearUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}
