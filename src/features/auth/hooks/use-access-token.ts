"use client";

import { getAccessToken, subscribeToSession } from "@/features/auth/model/session";
import { useSyncExternalStore } from "react";

const getServerSnapshot = () => null;

export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribeToSession, getAccessToken, getServerSnapshot);
}
