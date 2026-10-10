'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatEventDate, CATEGORY_LABELS } from '@/lib/format';

interface AdminEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/events');
      if (!res.ok) {
        throw new Error('Failed to load events');
      }
      const data = await res.json();
      setEvents(data.items || []);
    } catch {
      setError('Could not load events from server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleToggleActive(id: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    setTogglingId(id);

    // Optimistic UI update
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: nextStatus } : e))
    );

    try {
      const res = await fetch(`/api/admin/events/${id}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to toggle event status');
      }
    } catch {
      // Rollback on failure
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: currentStatus } : e))
      );
      alert('Failed to update event status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  }

  const filteredEvents = events.filter((e) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      e.title.toLowerCase().includes(term) ||
      e.city.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term)
    );
  });

  const totalCount = events.length;
  const activeCount = events.filter((e) => e.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#a1a4a5' }}>
            Manage community events, view status, and toggle visibility.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '10px 18px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'background-color 150ms ease-out',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#eaeaea')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
        >
          <span>＋</span>
          <span>Add New Event</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#a1a4a5', marginBottom: '6px' }}>Total Events</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff' }}>{totalCount}</div>
        </div>
        <div
          style={{
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#a1a4a5', marginBottom: '6px' }}>Active Events</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#3ad389' }}>{activeCount}</div>
        </div>
        <div
          style={{
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#a1a4a5', marginBottom: '6px' }}>Inactive Events</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#6e727a' }}>{inactiveCount}</div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter by title, city, or category..."
          style={{
            width: '100%',
            maxWidth: '380px',
            height: '40px',
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '6px',
            padding: '0 14px',
            fontSize: '13px',
            color: '#ffffff',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#9281f7')}
          onBlur={(e) => (e.target.style.borderColor = '#292d30')}
        />
      </div>

      {/* Table Container */}
      {loading ? (
        <div
          style={{
            padding: '60px 0',
            textAlign: 'center',
            color: '#a1a4a5',
            fontSize: '14px',
          }}
        >
          Loading events...
        </div>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 100, 101, 0.08)',
            border: '1px solid rgba(255, 149, 146, 0.3)',
            color: '#ff9592',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '12px',
            color: '#a1a4a5',
          }}
        >
          No events found matching your filter.
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '12px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid #292d30',
                  color: '#a1a4a5',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <th style={{ padding: '14px 16px' }}>Event</th>
                <th style={{ padding: '14px 16px' }}>Category</th>
                <th style={{ padding: '14px 16px' }}>City</th>
                <th style={{ padding: '14px 16px' }}>Date & Time</th>
                <th style={{ padding: '14px 16px' }}>Price</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt, idx) => {
                const isToggling = togglingId === evt.id;
                return (
                  <tr
                    key={evt.id}
                    style={{
                      borderBottom:
                        idx === filteredEvents.length - 1 ? 'none' : '1px solid #1a1d20',
                      transition: 'background-color 150ms ease-out',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        'rgba(255, 255, 255, 0.02)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
                    }
                  >
                    {/* Event Title + Image */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={evt.imageUrl}
                          alt={evt.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #292d30',
                          }}
                          loading="lazy"
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: 500,
                              color: '#ffffff',
                              fontSize: '14px',
                              maxWidth: '240px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {evt.title}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#6e727a',
                              maxWidth: '240px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {evt.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', color: '#f0f0f0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: 'rgba(146, 129, 247, 0.12)',
                          color: '#baa7ff',
                          border: '1px solid rgba(146, 129, 247, 0.25)',
                        }}
                      >
                        {CATEGORY_LABELS[evt.category] || evt.category}
                      </span>
                    </td>

                    {/* City */}
                    <td style={{ padding: '14px 16px', color: '#f0f0f0' }}>{evt.city}</td>

                    {/* Starts At */}
                    <td style={{ padding: '14px 16px', color: '#a1a4a5', whiteSpace: 'nowrap' }}>
                      {formatEventDate(evt.startsAt)}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 500 }}>
                      {formatPrice(evt.price)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {evt.isActive ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            backgroundColor: 'rgba(58, 211, 137, 0.1)',
                            color: '#3ad389',
                            border: '1px solid rgba(58, 211, 137, 0.25)',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#3ad389',
                            }}
                          />
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            backgroundColor: 'rgba(110, 114, 122, 0.12)',
                            color: '#a1a4a5',
                            border: '1px solid #292d30',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#6e727a',
                            }}
                          />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Toggle Button (no delete button exists) */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleActive(evt.id, evt.isActive)}
                        disabled={isToggling}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: isToggling ? 'not-allowed' : 'pointer',
                          backgroundColor: evt.isActive ? 'transparent' : 'rgba(58, 211, 137, 0.08)',
                          color: evt.isActive ? '#a1a4a5' : '#3ad389',
                          border: evt.isActive ? '1px solid #292d30' : '1px solid rgba(58, 211, 137, 0.3)',
                          transition: 'all 150ms ease-out',
                        }}
                        onMouseEnter={(e) => {
                          if (!isToggling) {
                            if (evt.isActive) {
                              (e.currentTarget as HTMLElement).style.borderColor = '#ff9592';
                              (e.currentTarget as HTMLElement).style.color = '#ff9592';
                            } else {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(58, 211, 137, 0.16)';
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isToggling) {
                            if (evt.isActive) {
                              (e.currentTarget as HTMLElement).style.borderColor = '#292d30';
                              (e.currentTarget as HTMLElement).style.color = '#a1a4a5';
                            } else {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(58, 211, 137, 0.08)';
                            }
                          }
                        }}
                      >
                        {isToggling ? 'Updating...' : evt.isActive ? 'Set Inactive' : 'Set Active'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
