'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventCard, EventItem } from '@/components/EventCard';
import { Pagination } from '@/components/Pagination';
import { EventGridSkeleton } from '@/components/EventCardSkeleton';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [needsCategories, setNeedsCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?page=${currentPage}&limit=9`);
      if (res.status === 401) {
        router.push('/login?next=/feed');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch personal feed');
      }

      const data = await res.json();
      if (data.needsCategories) {
        setNeedsCategories(true);
        setEvents([]);
      } else {
        setNeedsCategories(false);
        setEvents(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch {
      setError('Could not load your personalized feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, router]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  function handlePageChange(newPage: number) {
    router.push(`/feed?page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000' }}>
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(146, 129, 247, 0.1)',
                border: '1px solid rgba(146, 129, 247, 0.25)',
                color: '#baa7ff',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              <span>⚡</span>
              <span>Curated For You</span>
            </div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.8px',
                margin: '0 0 6px 0',
              }}
            >
              My Feed
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#a1a4a5' }}>
              Upcoming events matching your favourite categories, sorted nearest date first.
            </p>
          </div>

          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#f0f0f0',
              textDecoration: 'none',
              transition: 'border-color 150ms ease-out',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#9281f7')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#292d30')}
          >
            <span>⚙️</span>
            <span>Edit Favourites</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <EventGridSkeleton count={6} />
        ) : error ? (
          <div
            role="alert"
            style={{
              padding: '24px',
              backgroundColor: 'rgba(255, 100, 101, 0.08)',
              border: '1px solid rgba(255, 149, 146, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
              margin: '32px 0',
            }}
          >
            <p style={{ color: '#ff9592', fontSize: '15px', margin: '0 0 16px 0' }}>{error}</p>
            <button
              onClick={fetchFeed}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : needsCategories ? (
          /* Prompt to pick categories */
          <div
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '16px',
              maxWidth: '560px',
              margin: '40px auto',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Select Your Interests
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a4a5', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              You haven&apos;t chosen any favourite categories yet. Pick your favourite themes to get a tailored
              stream of events.
            </p>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#000000',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Pick Favourite Categories →
            </Link>
          </div>
        ) : events.length === 0 ? (
          /* Empty Feed */
          <div
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '16px',
              margin: '40px auto',
              maxWidth: '560px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗓️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              No Events Found Right Now
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a4a5', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              There are currently no upcoming events matching your favourite categories. Check back soon or browse the
              full community calendar.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link
                href="/events"
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Browse All Events
              </Link>
              <Link
                href="/onboarding"
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'transparent',
                  border: '1px solid #292d30',
                  color: '#f0f0f0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Change Favourites
              </Link>
            </div>
          </div>
        ) : (
          /* Events Grid */
          <>
            <div
              style={{
                fontSize: '13px',
                color: '#6e727a',
                marginBottom: '16px',
              }}
            >
              Showing {events.length} of {totalCount} matching events
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000' }}>
          <main className="container" style={{ paddingTop: '40px' }}>
            <EventGridSkeleton count={6} />
          </main>
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
