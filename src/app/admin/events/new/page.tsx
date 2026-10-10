'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'MUSIC', label: 'Music' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'FOOD', label: 'Food' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'KIDS', label: 'Kids' },
];

const PRESET_IMAGES = [
  { label: 'Concert', url: 'https://picsum.photos/seed/concert-live/800/500' },
  { label: 'Workshop', url: 'https://picsum.photos/seed/workshop-art/800/500' },
  { label: 'Food & Dining', url: 'https://picsum.photos/seed/food-market/800/500' },
  { label: 'Sports & Run', url: 'https://picsum.photos/seed/sports-marathon/800/500' },
  { label: 'Kids & Family', url: 'https://picsum.photos/seed/kids-fun/800/500' },
];

export default function NewEventPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MUSIC');
  const [city, setCity] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (city.trim().length < 2) {
      setError('City must be at least 2 characters long');
      return;
    }
    if (!startsAt) {
      setError('Event date and time is required');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid non-negative whole number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          city: city.trim(),
          startsAt: new Date(startsAt).toISOString(),
          price: priceNum,
          description: description.trim(),
          imageUrl: imageUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const firstKey = Object.keys(data.details)[0];
          setError(`${firstKey}: ${data.details[firstKey][0]}`);
        } else {
          setError(data.error || 'Failed to create event');
        }
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('Network error while saving event. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href="/admin"
          style={{
            fontSize: '13px',
            color: '#a1a4a5',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 150ms ease-out',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#a1a4a5')}
        >
          <ArrowLeft size={14} />
          Back to Events
        </Link>
      </div>

      <div
        style={{
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
              margin: '0 0 6px 0',
            }}
          >
            Create New Event
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#a1a4a5' }}>
            Fill in the details below to publish a new event to the community board.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
            >
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unplugged Indie Music Night"
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>

          {/* Category & City Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                htmlFor="category"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
              >
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ backgroundColor: '#111111', color: '#ffffff' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="city"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
              >
                City *
              </label>
              <input
                id="city"
                type="text"
                required
                minLength={2}
                maxLength={60}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Coimbatore, Bengaluru"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          </div>

          {/* StartsAt & Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                htmlFor="startsAt"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
              >
                Date & Time (IST) *
              </label>
              <input
                id="startsAt"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            <div>
              <label
                htmlFor="price"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
              >
                Price in ₹ (0 for Free) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                max="10000000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
            >
              Description * (min 10 characters)
            </label>
            <textarea
              id="description"
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview of what attendees can expect, what to bring, and highlights..."
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '10px 12px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>

          {/* Image URL & Presets */}
          <div>
            <label
              htmlFor="imageUrl"
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#f0f0f0', marginBottom: '6px' }}
            >
              Cover Image URL *
            </label>
            <input
              id="imageUrl"
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />

            {/* Presets */}
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: '#a1a4a5', marginRight: '8px' }}>Presets:</span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    style={{
                      background: imageUrl === p.url ? 'rgba(255, 255, 255, 0.1)' : '#111111',
                      border: imageUrl === p.url ? '1px solid #ffffff' : '1px solid #292d30',
                      color: imageUrl === p.url ? '#ffffff' : '#a1a4a5',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #292d30',
                  }}
                  onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
                  onLoad={(e) => ((e.currentTarget as HTMLElement).style.display = 'block')}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Link
              href="/admin"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#a1a4a5',
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
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
              {loading ? 'Creating event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
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
};

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#ffffff';
}

function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#292d30';
}
