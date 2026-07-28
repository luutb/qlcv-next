'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR and hydration issues
const LoginPageClient = dynamic(() => import('@/components/auth/LoginPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginPageClient />;
}