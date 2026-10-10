import Link from 'next/link';
import { ChevronRight, ArrowRight, Radio, Bell, Palette, Sparkles, Terminal, Code2 } from 'lucide-react';
import { HeroCube } from '@/components/HeroCube';
import { EventCard, EventItem } from '@/components/EventCard';
import { db } from '@/lib/db';

async function getFeaturedEvents(): Promise<EventItem[]> {
  try {
    const events = await db.event.findMany({
      where: {
        isActive: true,
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      take: 3,
    });

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      city: e.city,
      startsAt: e.startsAt.toISOString(),
      price: e.price,
      description: e.description,
      imageUrl: e.imageUrl,
      isActive: e.isActive,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredEvents = await getFeaturedEvents();

  return (
    <div style={{ backgroundColor: '#000000', color: '#f0f0f0', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ─────────────────────────────────────────────────────────────────────────
          Hero Section — Resend Inspired Black Velvet & Domaine Serif
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '64px', paddingBottom: '96px', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            {/* Left Column: Editorial Headline & Actions */}
            <div>
              {/* Announcement Pill */}
              <div style={{ marginBottom: '28px' }}>
                <Link
                  href="/events"
                  className="announcement-pill"
                  aria-label="Explore events"
                >
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>Join us at Project Evo 2.0</span>
                  <ChevronRight size={14} color="#a1a4a5" />
                </Link>
              </div>

              {/* Large Serif Headline (Domaine aesthetic via Playfair Display) */}
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(52px, 7vw, 92px)',
                  lineHeight: '1.02',
                  fontWeight: 400,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  margin: '0 0 24px 0',
                }}
              >
                Events for<br />
                developers
              </h1>

              {/* Subheading */}
              <p
                style={{
                  fontSize: '17px',
                  lineHeight: '1.65',
                  color: '#a1a4a5',
                  maxWidth: '520px',
                  margin: '0 0 36px 0',
                }}
              >
                The developer-first community board for campus hackathons, tech meetups,
                acoustic jam sessions, and founder walks. Built with pure black velvet
                typography and zero fluff.
              </p>

              {/* CTA Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/events"
                  className="btn-white"
                  style={{ textDecoration: 'none' }}
                >
                  Get started
                </Link>

                <Link
                  href="/events"
                  style={{
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    transition: 'color 150ms ease-out',
                  }}
                  className="hover:text-white"
                >
                  <span>Explore events</span>
                  <ChevronRight size={14} color="#a1a4a5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Black Segmented Sculptural Cube */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <HeroCube />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          Developer Trust & Community Bar
      ───────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid #292d30',
          borderBottom: '1px solid #292d30',
          padding: '28px 0',
          backgroundColor: '#000000',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <span className="font-mono" style={{ fontSize: '12px', color: '#6e727a', letterSpacing: '0.5px' }}>
            TRUSTED BY TECH CLUBS & COMMUNITIES
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '36px',
              flexWrap: 'wrap',
              color: '#a1a4a5',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <span>Next.js Delhi</span>
            <span>Bangalore Hacker House</span>
            <span>Design Guild</span>
            <span>ACM Chapter</span>
            <span>Acoustic Circle</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          Code Terminal Window Showcase (DESIGN.md Terminal Window)
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ marginBottom: '40px', maxWidth: '640px' }}>
            <div
              className="font-mono"
              style={{
                fontSize: '12px',
                color: '#6e727a',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Terminal size={14} color="#a1a4a5" />
              <span>Programmatic Event Ingestion</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-1.4px',
                lineHeight: 1.15,
                margin: '0 0 16px 0',
              }}
            >
              Developer-first REST endpoints.
            </h2>
            <p style={{ color: '#a1a4a5', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
              Query live events, manage RSVPs, and generate digital commemorative badges using our cleanly documented, Zod-validated endpoints.
            </p>
          </div>

          {/* Terminal Window Card */}
          <div
            style={{
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'rgba(0, 0, 0, 0.4) 0px 20px 40px',
            }}
          >
            {/* Terminal Window Bar */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #292d30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0a0a0a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff6465', opacity: 0.8 }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffca16', opacity: 0.8 }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3ad389', opacity: 0.8 }} />
                <span className="font-mono" style={{ fontSize: '12px', color: '#6e727a', marginLeft: '12px' }}>
                  curl https://project-evo.local/api/events
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e727a', fontSize: '12px' }}>
                <span className="font-mono">HTTP/2 200 OK</span>
              </div>
            </div>

            {/* Code Body */}
            <div style={{ padding: '24px', overflowX: 'auto' }}>
              <pre
                className="font-mono"
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.65',
                  color: '#f0f0f0',
                }}
              >
{`{
  "total": 15,
  "totalPages": 2,
  "items": [
    {
      "id": "cm78b813...a8f",
      "title": "Acoustic Night: Unplugged Sessions",
      "category": "MUSIC",
      "city": "Bengaluru",
      "startsAt": "2026-10-18T18:30:00.000Z",
      "price": 0,
      "isActive": true,
      "remindersCount": 28,
      "status": "UPCOMING"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          Live Featured Events Section
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '40px 0 96px 0', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '36px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #292d30',
                  color: '#f0f0f0',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}
              >
                <Radio size={13} color="#3ad389" />
                <span>Live Board Preview</span>
              </div>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-1px',
                  margin: 0,
                }}
              >
                Curated upcoming experiences
              </h2>
            </div>

            <Link
              href="/events"
              className="btn-ghost"
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '9999px' }}
            >
              <span>View all events</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {featuredEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
              }}
            >
              <p style={{ color: '#a1a4a5', margin: '0 0 16px 0' }}>No upcoming events in preview mode.</p>
              <Link href="/events" className="btn-primary">
                Browse Full Catalog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          Feature Pillars (3 Cards with hairline borders)
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', borderTop: '1px solid #292d30', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 56px auto' }}>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-1.2px',
                margin: '0 0 16px 0',
              }}
            >
              Engineered for communities.
            </h2>
            <p style={{ color: '#a1a4a5', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
              Everything you need to discover, participate, and commemorate real-world campus gatherings.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Pillar 1 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#111214',
                  border: '1px solid #292d30',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Sparkles size={18} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                Personalized Feed
              </h3>
              <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
                Pick your preferred passions during onboarding — whether tech, music, or workshops — and receive a dedicated live feed.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#111214',
                  border: '1px solid #292d30',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Bell size={18} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                Zero-Latency Reminders
              </h3>
              <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
                Set reminders with instantaneous optimistic UI feedback, preventing accidental past-date signups via atomic database guards.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#111214',
                  border: '1px solid #292d30',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Palette size={18} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                Interactive Souvenir Cards
              </h3>
              <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
                Design custom digital souvenir cards with midnight gradients and collectible holographic stickers, saved idempotently to your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          Minimal Footer (Resend Style)
      ───────────────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #292d30',
          padding: '40px 0',
          backgroundColor: '#000000',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: '#a1a4a5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Project Evo</span>
            <span>—</span>
            <span>Community Events Board</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/events" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Events
            </Link>
            <Link href="/login" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Log in
            </Link>
            <Link href="/admin" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Admin
            </Link>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3ad389' }} />
              <span className="font-mono" style={{ fontSize: '12px' }}>Operational</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
