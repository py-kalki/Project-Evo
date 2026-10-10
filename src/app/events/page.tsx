'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radio } from 'lucide-react';
import { EventCard, EventItem } from '@/components/EventCard';
import { EventFilters } from '@/components/EventFilters';
import { Pagination } from '@/components/Pagination';
import { EventGridSkeleton } from '@/components/EventCardSkeleton';
import { EmptyState } from '@/components/EmptyState';

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filter state from URL
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const qParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (categoryParam) query.set('category', categoryParam);
    if (cityParam) query.set('city', cityParam);
    if (qParam) query.set('q', qParam);
    query.set('page', currentPage.toString());
    query.set('limit', '9');

    try {
      const res = await fetch(`/api/events?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await res.json();
      setEvents(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch {
      setError('Could not connect to the event service. Please check your connection or database.');
    } finally {
      setLoading(false);
    }
  }, [categoryParam, cityParam, qParam, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Update URL search parameters
  const updateUrl = useCallback(
    (newParams: { category?: string; city?: string; q?: string; page?: number }) => {
      const sp = new URLSearchParams(searchParams.toString());

      if ('category' in newParams) {
        if (newParams.category) sp.set('category', newParams.category);
        else sp.delete('category');
        sp.delete('page'); // Jump to page 1 on filter change
      }

      if ('city' in newParams) {
        if (newParams.city) sp.set('city', newParams.city);
        else sp.delete('city');
        sp.delete('page');
      }

      if ('q' in newParams) {
        if (newParams.q) sp.set('q', newParams.q);
        else sp.delete('q');
        sp.delete('page');
      }

      if ('page' in newParams && newParams.page !== undefined) {
        if (newParams.page > 1) sp.set('page', newParams.page.toString());
        else sp.delete('page');
      }

      const queryString = sp.toString();
      router.push(queryString ? `/events?${queryString}` : '/events');
    },
    [router, searchParams]
  );

  function handleFilterChange(filters: { category?: string; city?: string; q?: string }) {
    updateUrl(filters);
  }

  function handlePageChange(newPage: number) {
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearFilters() {
    router.push('/events');
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000' }}>
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Hero Section */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid #292d30',
              color: '#f0f0f0',
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            <Radio size={14} color="#3ad389" />
            <span>Live Community Board</span>
          </div>

          <h1
            style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-1px',
              margin: '0 0 12px 0',
              lineHeight: 1.15,
            }}
          >
            Discover Local Events
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#a1a4a5',
              maxWidth: '600px',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Explore acoustic music sessions, beginner workshops, food walks, and community runs across your city.
          </p>
        </div>

        {/* Filters */}
        <EventFilters
          selectedCategory={categoryParam}
          selectedCity={cityParam}
          searchQuery={qParam}
          onFilterChange={handleFilterChange}
        />

        {/* Status Indicator */}
        {!loading && !error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#6e727a',
              marginBottom: '20px',
            }}
          >
            <span>
              Showing {events.length} of {totalCount} {totalCount === 1 ? 'event' : 'events'}
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Error State */}
        {error ? (
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
              onClick={fetchEvents}
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
        ) : loading ? (
          /* Loading Skeletons */
          <EventGridSkeleton count={9} />
        ) : events.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="No events found"
            description="We couldn't find any upcoming active events matching your selected criteria."
            actionLabel="Clear all filters"
            onAction={handleClearFilters}
          />
        ) : (
          /* Event Grid */
          <>
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

            {/* Pagination */}
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

export default function EventsPage() {
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
      <EventsContent />
    </Suspense>
  );
}
