"use client";

import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { listCustomers, customerQueryKeys } from "@/features/customers/api/customers.api";
import type { CustomerListFilters } from "@/features/customers/api/customers.api";
import { useQuery } from "@tanstack/react-query";

export function useCustomersQuery(filters: CustomerListFilters = {}) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: [...customerQueryKeys.list(filters), accessToken],
    queryFn: ({ signal }) => listCustomers({ accessToken: accessToken!, signal }, filters),
    enabled: Boolean(accessToken),
  });
}
