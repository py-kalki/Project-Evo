'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Music, Palette, UtensilsCrossed, Activity, Rocket, Check, Compass } from 'lucide-react';

interface CategoryOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const CATEGORIES: CategoryOption[] = [
  { value: 'MUSIC', label: 'Music', icon: <Music size={20} />, desc: 'Acoustic gigs, jazz nights, and live open mics' },
  { value: 'WORKSHOP', label: 'Workshop', icon: <Palette size={20} />, desc: 'Pottery, creative writing, and craft masterclasses' },
  { value: 'FOOD', label: 'Food', icon: <UtensilsCrossed size={20} />, desc: 'Food walks, street festivals, and pop-up markets' },
  { value: 'SPORTS', label: 'Sports', icon: <Activity size={20} />, desc: 'Marathons, beach runs, and community fitness' },
  { value: 'KIDS', label: 'Kids', icon: <Rocket size={20} />, desc: 'Science fairs, coding bootcamps, and art sessions' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrent() {
      try {
        const res = await fetch('/api/me/categories');
        if (res.status === 401) {
          router.push('/login?next=/onboarding');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSelected(data.categories || []);
        }
      } catch {
        // Continue with empty selection
      } finally {
        setLoading(false);
      }
    }
    loadCurrent();
  }, [router]);

  function toggleCategory(val: string) {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/me/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selected }),
      });

      if (!res.ok) {
        throw new Error('Failed to save categories');
      }

      router.push('/feed');
    } catch {
      setError('Could not save your preferences. Please try again.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
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
        Loading your preferences...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#000000',
        padding: '48px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#050505',
          border: '1px solid #292d30',
          borderRadius: '16px',
          padding: '36px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#1a1a1a',
              border: '1px solid #292d30',
              marginBottom: '16px',
              color: '#ffffff',
            }}
          >
            <Compass size={20} />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.4px',
              margin: '0 0 8px 0',
            }}
          >
            Personalize Your Feed
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#a1a4a5',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Choose the event categories you are interested in. You can change these anytime.
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
            }}
          >
            {error}
          </div>
        )}

        {/* Category Selection Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {CATEGORIES.map((cat) => {
            const isChecked = selected.includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: isChecked ? 'rgba(146, 129, 247, 0.08)' : '#000000',
                  border: isChecked ? '1px solid #9281f7' : '1px solid #292d30',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '22px' }}>{cat.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        color: isChecked ? '#ffffff' : '#f0f0f0',
                      }}
                    >
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a4a5', marginTop: '2px' }}>
                      {cat.desc}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: isChecked ? '1px solid #ffffff' : '1px solid #6e727a',
                    backgroundColor: isChecked ? '#ffffff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000000',
                    flexShrink: 0,
                  }}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/events"
            style={{
              fontSize: '13px',
              color: '#a1a4a5',
              textDecoration: 'none',
            }}
          >
            Skip for now
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'background-color 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eaeaea';
            }}
            onMouseLeave={(e) => {
              if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            {saving ? 'Saving...' : 'Save & View Feed →'}
          </button>
        </div>
      </div>
    </div>
  );
}
