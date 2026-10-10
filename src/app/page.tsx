import Link from 'next/link';
import { ChevronRight, ArrowRight, Radio, Sparkles, Bell, Palette, Layers, Terminal, ShieldCheck, HeartHandshake } from 'lucide-react';
import { HeroCube } from '@/components/HeroCube';
import { ResendIntegrateCode } from '@/components/resend/ResendIntegrateCode';
import { ResendTestMode } from '@/components/resend/ResendTestMode';
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
          1. Hero Section — Resend Black Velvet & Domaine Serif
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '56px', paddingBottom: '96px', position: 'relative' }}>
        {/* Subtle radial floor spotlight behind hero */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1200px',
            height: '600px',
            background: 'radial-gradient(ellipse at 50% 10%, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Left Column: Editorial Headline & Actions */}
            <div>
              {/* Announcement Pill with chromatic border feel */}
              <div style={{ marginBottom: '28px' }}>
                <Link
                  href="/events"
                  className="announcement-pill"
                  aria-label="Announcing Project Evo 2.0"
                >
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>Join us at Project Evo 2.0</span>
                  <ChevronRight size={14} color="#a1a4a5" />
                </Link>
              </div>

              {/* Large Domaine Serif Headline */}
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(52px, 7.5vw, 96px)',
                  lineHeight: '1.0',
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
                  maxWidth: '480px',
                  margin: '0 0 36px 0',
                }}
              >
                The developer-first community board for campus hackathons, technical workshops,
                acoustic jam sessions, and founder showcases at scale.
              </p>

              {/* CTA Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/signup"
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
          2. Social Proof / Logos Trust Bar (Resend Style)
      ───────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid #292d30',
          borderBottom: '1px solid #292d30',
          padding: '36px 0',
          backgroundColor: '#000000',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#6e727a',
              margin: '0 0 24px 0',
              fontWeight: 500,
            }}
          >
            Student clubs, developer chapters, and hacker communities across 10+ cities trust Project Evo.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 48px)',
              flexWrap: 'wrap',
              color: '#8e9297',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.3px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} /> NEXT.JS DELHI
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} /> BANGALORE HACKERS
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> ACM CHAPTER
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={16} /> DESIGN GUILD
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={16} /> ACOUSTIC COLLECTIVE
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. "Integrate in minutes" Multi-Language SDK Tabs Section
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-2px',
                lineHeight: 1.1,
                margin: '0 0 16px 0',
              }}
            >
              Integrate in minutes
            </h2>
            <p
              style={{
                color: '#a1a4a5',
                fontSize: '16px',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: '0 auto',
              }}
            >
              A simple, elegant interface so you can start querying events in seconds.
              It fits right into your code with SDKs for your favorite programming stacks.
            </p>
          </div>

          {/* Interactive Multi-Language Code Box */}
          <ResendIntegrateCode />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. "First-class developer experience" Bento Grid
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '32px 0 96px 0', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                margin: '0 0 16px 0',
              }}
            >
              First-class<br />
              developer experience
            </h2>
            <p style={{ color: '#a1a4a5', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
              We are a team of builders who love crafting tools for other builders. Our goal is to create the community events platform we always wished we had — one that <em>just works</em>.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Bento Card 1: Interactive Test Mode Simulator */}
            <div>
              <ResendTestMode />
            </div>

            {/* Bento Card 2: Commemorative Souvenir Card Studio */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '24px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
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
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                  Interactive souvenir cards
                </h3>
                <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Customize digital commemorative badges with luxury dark palettes, animated gradients, and holographic stickers saved directly to your account.
                </p>
              </div>

              {/* Visual Card Preview Mini Widget */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #111214 0%, #050505 100%)',
                  border: '1px solid #292d30',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#6e727a' }}>
                    SOUVENIR PASS #0042
                  </span>
                  <span style={{ fontSize: '11px', color: '#3ad389', fontWeight: 600 }}>VERIFIED</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  Acoustic Sunset Sessions
                </div>
                <div style={{ fontSize: '12px', color: '#a1a4a5' }}>
                  Bengaluru · Oct 18, 2026 · Theme: Midnight Velvet
                </div>
              </div>
            </div>

            {/* Bento Card 3: Zero-Latency Reminders */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '24px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
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
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                  Zero-latency notifications
                </h3>
                <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
                  Optimistic UI updates ensure immediate tactile feedback when reserving spots, backed by PostgreSQL composite constraints that eliminate duplicate registrations.
                </p>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  padding: '12px 16px',
                  backgroundColor: '#000000',
                  border: '1px solid #1f2224',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <span className="font-mono" style={{ color: '#f0f0f0' }}>POST /api/events/:id/reminder</span>
                <span style={{ color: '#3ad389', fontWeight: 600 }}>0ms UI</span>
              </div>
            </div>

            {/* Bento Card 4: Personalized Feed Matching */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '24px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
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
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                  Tailored community feed
                </h3>
                <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
                  Select your favourite categories during onboarding to curate your personal feed. Never miss a tech talk, sports tournament, or design critique.
                </p>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                {['TECH', 'WORKSHOP', 'MUSIC'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid #292d30',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. Live Featured Events Catalog
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 0 96px 0', borderTop: '1px solid #292d30', backgroundColor: '#000000' }}>
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
                <span>Live Catalog</span>
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
                Upcoming curated gatherings
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
              <p style={{ color: '#a1a4a5', margin: '0 0 16px 0' }}>No active upcoming events right now.</p>
              <Link href="/events" className="btn-primary">
                Browse Directory
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. "Beyond expectations" Community Testimonials
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', borderTop: '1px solid #292d30', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-1.4px',
                margin: '0 0 12px 0',
              }}
            >
              Beyond expectations
            </h2>
            <p style={{ color: '#a1a4a5', fontSize: '16px', margin: 0 }}>
              Hear what student leaders, hackathon organizers, and developers have to say.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Quote 1 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#f0f0f0', margin: '0 0 24px 0' }}>
                &ldquo;Project Evo makes hosting hackathons and tech meetups feel as polished as a developer tool. The REST endpoints and souvenir passes are brilliant.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1c1e21',
                    border: '1px solid #292d30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  AR
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Aarav Roy</div>
                  <div style={{ fontSize: '12px', color: '#6e727a' }}>Lead Organizer · HackBangalore</div>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#f0f0f0', margin: '0 0 24px 0' }}>
                &ldquo;Zero latency when setting reminders and an interface that looks like it belongs in the highest tier of design. No clutter, just pure elegance.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1c1e21',
                    border: '1px solid #292d30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  SN
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Sanya Nair</div>
                  <div style={{ fontSize: '12px', color: '#6e727a' }}>Design Engineer · Creative Collective</div>
                </div>
              </div>
            </div>

            {/* Quote 3 */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#f0f0f0', margin: '0 0 24px 0' }}>
                &ldquo;Finding acoustic sessions and weekend beginner workshops has never been this intuitive. The personalized feed nail the community feel.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1c1e21',
                    border: '1px solid #292d30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  KM
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Karan Mehta</div>
                  <div style={{ fontSize: '12px', color: '#6e727a' }}>Full-Stack Developer · Open Source Club</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          7. Pre-Footer Action Banner
      ───────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', borderTop: '1px solid #292d30', backgroundColor: '#000000', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: 'clamp(38px, 6vw, 68px)',
              fontWeight: 400,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '0 0 20px 0',
            }}
          >
            Start discovering<br />
            campus events today.
          </h2>
          <p style={{ color: '#a1a4a5', fontSize: '16px', lineHeight: 1.6, margin: '0 0 36px 0' }}>
            Join thousands of students and creators discovering meetups across your city.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-white">
              Get started for free
            </Link>
            <Link href="/events" className="btn-ghost" style={{ borderRadius: '9999px' }}>
              <span>Browse catalog</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          8. Resend Minimalist Footer
      ───────────────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #292d30',
          padding: '48px 0 36px 0',
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
            gap: '20px',
            fontSize: '13px',
            color: '#a1a4a5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.svg" alt="Project Evo" style={{ height: '14px', width: 'auto', display: 'block' }} />
            <span style={{ color: '#6e727a' }}>—</span>
            <span style={{ color: '#6e727a' }}>Community Events Board</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/events" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Events
            </Link>
            <Link href="/feed" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              My Feed
            </Link>
            <Link href="/admin" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Admin
            </Link>
            <Link href="/login" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Log in
            </Link>
            <Link href="/signup" style={{ color: '#a1a4a5', textDecoration: 'none' }} className="hover:text-white">
              Sign up
            </Link>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3ad389' }} />
              <span className="font-mono" style={{ fontSize: '12px', color: '#f0f0f0' }}>Operational</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
