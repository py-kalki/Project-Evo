'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  THEMES,
  THEME_GRADIENTS,
  THEME_LABELS,
  STICKERS,
  MAX_STICKERS,
  Theme,
  Sticker,
} from '@/lib/card';
import { formatPrice, formatEventDate } from '@/lib/format';
import { EventItem } from '@/components/EventCard';

interface CardDesignerProps {
  event: EventItem;
  initialTheme?: Theme;
  initialStickers?: string[];
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export function CardDesigner({
  event,
  initialTheme = 'sunset',
  initialStickers = [],
  isLoggedIn,
  onRequireLogin,
}: CardDesignerProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [stickers, setStickers] = useState<string[]>(initialStickers);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSticker(s: Sticker) {
    if (stickers.length >= MAX_STICKERS) return;
    setStickers((prev) => [...prev, s]);
    setSavedSuccess(false);
  }

  function removeSticker(index: number) {
    setStickers((prev) => prev.filter((_, i) => i !== index));
    setSavedSuccess(false);
  }

  async function handleSave() {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${event.id}/card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, stickers }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save card design');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      // Revert on failure
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
      {/* Live Preview Card */}
      <div>
        <div style={{ fontSize: '13px', color: '#a1a4a5', marginBottom: '12px', fontWeight: 500 }}>
          LIVE SOUVENIR CARD PREVIEW
        </div>

        <motion.div
          animate={{ background: THEME_GRADIENTS[theme] }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1.6 / 1',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Card Top: Wordmark & City */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                padding: '4px 10px',
                borderRadius: '6px',
                backdropFilter: 'blur(6px)',
              }}
            >
              Project Evo Pass
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              📍 {event.city}
            </div>
          </div>

          {/* Stickers Row in Card Center */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              minHeight: '48px',
            }}
          >
            <AnimatePresence>
              {stickers.map((stk, idx) => (
                <motion.button
                  key={`${stk}-${idx}`}
                  type="button"
                  onClick={() => removeSticker(idx)}
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 20, opacity: 0 }}
                  whileHover={{ scale: 1.25, rotate: 10 }}
                  title="Click to remove sticker"
                  style={{
                    fontSize: '36px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    padding: 0,
                  }}
                >
                  {stk}
                </motion.button>
              ))}
            </AnimatePresence>
            {stickers.length === 0 && (
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                Add up to 3 stickers below
              </span>
            )}
          </div>

          {/* Card Bottom: Event Title, Date, Price */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 6px 0',
                lineHeight: 1.25,
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.title}
            </h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              <span>{formatEventDate(event.startsAt)}</span>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>{formatPrice(event.price)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls & Configuration */}
      <div
        style={{
          backgroundColor: '#050505',
          border: '1px solid #292d30',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Theme Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#ffffff', marginBottom: '10px' }}>
              Select Card Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {THEMES.map((t) => {
                const isSelected = theme === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTheme(t);
                      setSavedSuccess(false);
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '8px',
                      background: THEME_GRADIENTS[t],
                      border: isSelected ? '2px solid #ffffff' : '1px solid #292d30',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      boxShadow: isSelected ? '0 0 12px rgba(255, 255, 255, 0.3)' : 'none',
                      transition: 'transform 150ms ease-out',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                  >
                    {THEME_LABELS[t]} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticker Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                Add Stickers
              </label>
              <span
                style={{
                  fontSize: '12px',
                  color: stickers.length >= MAX_STICKERS ? '#ff9592' : '#a1a4a5',
                  fontFamily: 'monospace',
                }}
              >
                {stickers.length}/{MAX_STICKERS} chosen
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {STICKERS.map((stk) => {
                const isMax = stickers.length >= MAX_STICKERS;
                return (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => addSticker(stk)}
                    disabled={isMax}
                    style={{
                      width: '46px',
                      height: '46px',
                      fontSize: '22px',
                      backgroundColor: isMax ? '#111111' : '#000000',
                      border: '1px solid #292d30',
                      borderRadius: '8px',
                      cursor: isMax ? 'not-allowed' : 'pointer',
                      opacity: isMax ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 150ms ease-out, border-color 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (!isMax) {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
                        (e.currentTarget as HTMLElement).style.borderColor = '#9281f7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMax) {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLElement).style.borderColor = '#292d30';
                      }
                    }}
                  >
                    {stk}
                  </button>
                );
              })}
            </div>
            {stickers.length > 0 && (
              <span style={{ display: 'block', fontSize: '11px', color: '#6e727a', marginTop: '6px' }}>
                Tip: Click any sticker on the preview card to remove it.
              </span>
            )}
          </div>
        </div>

        {/* Error and Status Display */}
        <div>
          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 100, 101, 0.08)',
                border: '1px solid rgba(255, 149, 146, 0.3)',
                color: '#ff9592',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              {error}
            </div>
          )}

          {savedSuccess && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(58, 211, 137, 0.08)',
                border: '1px solid rgba(58, 211, 137, 0.3)',
                color: '#3ad389',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              Card design saved successfully!
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              height: '42px',
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
            {saving
              ? 'Saving design...'
              : !isLoggedIn
              ? 'Log in to Save Design'
              : 'Save Card Design'}
          </button>
        </div>
      </div>
    </div>
  );
}
