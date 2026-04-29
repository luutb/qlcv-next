'use client';

import { useEffect, useState } from 'react';
import { UserDetail } from '@/types';
import { userRepo } from '@/repositories/UserRepo';

export function useUsers() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    userRepo
      .getAll({ page: 1, limit: 200 })
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
}
