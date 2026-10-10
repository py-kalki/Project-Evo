'use client';

import { useState } from 'react';
import { Send, CheckCircle2, ChevronDown } from 'lucide-react';

interface SimulatedLog {
  id: string;
  status: string;
  time: string;
  category: string;
}

export function ResendTestMode() {
  const [selectedCategory, setSelectedCategory] = useState('TECH');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<SimulatedLog[]>([
    {
      id: 'cm78b813a8f921',
      status: 'RSVP_CONFIRMED',
      time: '12ms',
      category: 'TECH',
    },
    {
      id: 'cm78b813b19402',
      status: 'REMINDER_ACTIVE',
      time: '18ms',
      category: 'MUSIC',
    },
    {
      id: 'cm78b813c02341',
      status: 'CARD_SAVED',
      time: '24ms',
      category: 'WORKSHOP',
    },
  ]);

  function handleTriggerTest() {
    setIsSending(true);
    setTimeout(() => {
      const randomId = 'cm78' + Math.random().toString(36).substring(2, 10);
      const randomLatency = Math.floor(Math.random() * 25) + 8 + 'ms';
      const newEntry: SimulatedLog = {
        id: randomId,
        status: 'EVENT_DISPATCHED',
        time: randomLatency,
        category: selectedCategory,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 4)]);
      setIsSending(false);
    }, 450);
  }

  return (
    <div
      style={{
        backgroundColor: '#050505',
        border: '1px solid #292d30',
        borderRadius: '24px',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Visual Sandbox Top Half */}
      <div
        style={{
          padding: '32px 24px',
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 70%)',
          borderBottom: '1px solid #292d30',
        }}
      >
        <div style={{ maxWidth: '380px', margin: '0 auto' }}>
          {/* Mock Input Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '6px 10px',
              borderRadius: '12px',
              border: '1px solid #292d30',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(58, 211, 137, 0.15)',
                  color: '#3ad389',
                  border: '1px solid rgba(58, 211, 137, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                {selectedCategory}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: '#f0f0f0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                student@campus.dev
              </span>
            </div>

            <button
              onClick={handleTriggerTest}
              disabled={isSending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #ffffff',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.7 : 1,
                transition: 'all 150ms ease-out',
                whiteSpace: 'nowrap',
              }}
            >
              <Send size={12} />
              <span>{isSending ? 'Sending...' : 'Trigger'}</span>
            </button>
          </div>

          {/* Category Selector Buttons */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {['TECH', 'MUSIC', 'WORKSHOP', 'FOOD'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: selectedCategory === cat ? '1px solid #ffffff' : '1px solid #292d30',
                  backgroundColor: selectedCategory === cat ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: selectedCategory === cat ? '#ffffff' : '#a1a4a5',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Event Stream Logs */}
        <div
          style={{
            marginTop: '24px',
            backgroundColor: '#000000',
            border: '1px solid #1f2224',
            borderRadius: '12px',
            padding: '12px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            height: '110px',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#a1a4a5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3ad389', fontWeight: 600 }}>HTTP 200:</span>
                <span style={{ color: '#f0f0f0' }}>{log.status}</span>
                <span style={{ color: '#6e727a' }}>({log.id})</span>
              </div>
              <span style={{ color: '#6e727a' }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description Bottom Half */}
      <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
          Simulated test mode
        </h3>
        <p style={{ fontSize: '14px', color: '#a1a4a5', lineHeight: 1.6, margin: 0 }}>
          Experiment with event RSVP dispatches and test reminder webhooks safely without broadcasting fake notifications to actual campus users.
        </p>
      </div>
    </div>
  );
}
