import { clearAccessToken, getAccessToken, setAccessToken } from "@/api/client";
import type { AuthUser } from "@/api/auth.api";
import { getCurrentUser } from "@/api/users.api";

const USER_STORAGE_KEY = "auth_user";
const listeners = new Set<(user: AuthUser | null) => void>();
let refreshPromise: Promise<AuthUser> | null = null;

export const authStore = {
  getToken: getAccessToken,
  setToken: setAccessToken,
  getUser,
  setUser,
  clearUser,
  refreshUser,
  subscribe: (listener: (user: AuthUser | null) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
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
  notify(user);
}

function clearUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
  notify(null);
}

async function refreshUser(signal?: AbortSignal): Promise<AuthUser> {
  if (!refreshPromise) {
    refreshPromise = getCurrentUser(signal)
      .then((user) => {
        if (!user.is_active) {
          authStore.clearToken();
          throw new Error("Tài khoản đã bị vô hiệu hóa.");
        }

        setUser(user);
        return user;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function notify(user: AuthUser | null): void {
  listeners.forEach((listener) => listener(user));
}
