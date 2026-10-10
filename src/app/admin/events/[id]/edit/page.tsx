'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

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

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MUSIC');
  const [city, setCity] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch the existing event
  useEffect(() => {
    async function load() {
      setLoadingData(true);
      setFetchError(null);
      try {
        const token = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('evo_token') || 'null') : null;
        const res = await fetch(`/api/admin/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setFetchError('Could not load event data.');
          return;
        }
        const evt = await res.json();
        setTitle(evt.title);
        setCategory(evt.category);
        setCity(evt.city);
        setStartsAt(toDatetimeLocal(evt.startsAt));
        setPrice(String(evt.price));
        setDescription(evt.description);
        setImageUrl(evt.imageUrl || PRESET_IMAGES[0].url);
      } catch {
        setFetchError('Network error loading event.');
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    if (title.trim().length < 3) { setSaveError('Title must be at least 3 characters'); return; }
    if (city.trim().length < 2) { setSaveError('City must be at least 2 characters'); return; }
    if (!startsAt) { setSaveError('Event date and time is required'); return; }
    if (description.trim().length < 10) { setSaveError('Description must be at least 10 characters'); return; }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) { setSaveError('Price must be a valid non-negative number'); return; }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('evo_token') || 'null') : null;
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
          setSaveError(`${firstKey}: ${data.details[firstKey][0]}`);
        } else {
          setSaveError(data.error || 'Failed to save event');
        }
        setSaving(false);
        return;
      }

      router.push('/admin');
    } catch {
      setSaveError('Network error while saving. Please try again.');
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '60px', textAlign: 'center' }}>
        <p style={{ color: '#a1a4a5', fontSize: '14px' }}>Loading event…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '60px', textAlign: 'center' }}>
        <p style={{ color: '#ff9592', fontSize: '14px', marginBottom: '16px' }}>{fetchError}</p>
        <Link href="/admin" style={{ color: '#f0f0f0', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}><ArrowLeft size={14} /> Back to Admin</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Back link */}
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
            Edit Event
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#a1a4a5' }}>
            Update the details for this event. Changes are published immediately.
          </p>
        </div>

        {saveError && (
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
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label htmlFor="title" style={labelStyle}>Event Title *</label>
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

          {/* Category & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="category" style={labelStyle}>Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
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
              <label htmlFor="city" style={labelStyle}>City *</label>
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

          {/* Date & Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="startsAt" style={labelStyle}>Date & Time (IST) *</label>
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
              <label htmlFor="price" style={labelStyle}>Price in ₹ (0 for Free) *</label>
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
            <label htmlFor="description" style={labelStyle}>Description * (min 10 characters)</label>
            <textarea
              id="description"
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview…"
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
            <label htmlFor="imageUrl" style={labelStyle}>Cover Image URL *</label>
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
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: '#a1a4a5', marginRight: '8px' }}>Presets:</span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    style={{
                      background: imageUrl === p.url ? 'rgba(255,255,255,0.1)' : '#111111',
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
              style={{ padding: '10px 16px', borderRadius: '6px', fontSize: '14px', color: '#a1a4a5', textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 150ms ease-out',
              }}
              onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eaeaea'; }}
              onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'; }}
            >
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#f0f0f0',
  marginBottom: '6px',
};

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