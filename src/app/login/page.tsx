'use client';

import { Suspense } from 'react';
import ModernLoginSignup from '@/components/ui/modern-login-signup';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#a1a4a5',
          }}
        >
          Loading...
        </div>
      }
    >
      <ModernLoginSignup initialMode="login" />
    </Suspense>
  );
}
