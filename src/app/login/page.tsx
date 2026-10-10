'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to log in');
        setLoading(false);
        return;
      }

      // Store in localStorage for client-side UI sync
      localStorage.setItem('evo_user', JSON.stringify(data.user));
      localStorage.setItem('evo_token', data.token);

      // Redirect logic
      if (nextUrl && nextUrl.startsWith('/')) {
        router.push(nextUrl);
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/events');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  function fillAdminDemo() {
    setEmail('admin@events.test');
    setPassword('Admin@123');
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: '#000000',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#050505',
          border: '1px solid #292d30',
          borderRadius: '16px',
          padding: '32px 28px',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.4px',
              margin: '0 0 8px 0',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#a1a4a5',
              margin: 0,
            }}
          >
            Enter your credentials to access your account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 100, 101, 0.08)',
              border: '1px solid rgba(255, 149, 146, 0.3)',
              color: '#ff9592',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: '1.4',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#f0f0f0',
                marginBottom: '6px',
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#000000',
                border: '1px solid #292d30',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease-out',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#9281f7')}
              onBlur={(e) => (e.target.style.borderColor = '#292d30')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#f0f0f0',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#000000',
                border: '1px solid #292d30',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease-out',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#9281f7')}
              onBlur={(e) => (e.target.style.borderColor = '#292d30')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '42px',
              marginTop: '8px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eaeaea';
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo Admin Helper */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '8px',
            border: '1px dashed #292d30',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#f0f0f0' }}>Demo Admin Login</span>
            <button
              type="button"
              onClick={fillAdminDemo}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9281f7',
                fontSize: '12px',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Fill Credentials
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#a1a4a5', fontFamily: 'monospace' }}>
            admin@events.test / Admin@123
          </p>
        </div>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#a1a4a5',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

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
            color: '#a1a4a5',
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
