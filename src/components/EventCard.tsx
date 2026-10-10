import Link from 'next/link';
import { formatPrice, formatEventDate, CATEGORY_LABELS } from '@/lib/format';

export interface EventItem {
  id: string;
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#050505',
        border: '1px solid #292d30',
        borderRadius: '16px',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 150ms ease-out, border-color 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.borderColor = '#9281f7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = '#292d30';
      }}
    >
      {/* Image container */}
      <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#111111' }}>
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
        />
        {/* Category Pill */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#baa7ff',
            border: '1px solid rgba(146, 129, 247, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {CATEGORY_LABELS[event.category] || event.category}
        </div>

        {/* Price Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            border: '1px solid #292d30',
          }}
        >
          {formatPrice(event.price)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Date and City */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#a1a4a5',
            marginBottom: '8px',
          }}
        >
          <span style={{ color: '#baa7ff', fontWeight: 500 }}>
            {formatEventDate(event.startsAt)}
          </span>
          <span>📍 {event.city}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#ffffff',
            margin: '0 0 8px 0',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '13px',
            color: '#a1a4a5',
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>
      </div>
    </Link>
  );
}
