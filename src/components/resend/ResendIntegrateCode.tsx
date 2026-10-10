'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, Terminal } from 'lucide-react';

interface CodeSnippet {
  language: string;
  filename: string;
  code: string;
}

const SNIPPETS: Record<string, CodeSnippet> = {
  nextjs: {
    language: 'TypeScript / Next.js',
    filename: 'app/api/events/route.ts',
    code: `import { NextResponse } from 'next/server';
import { evo } from '@project-evo/sdk';

export async function GET(request: Request) {
  const { data, error } = await evo.events.list({
    category: 'TECH',
    city: 'Bengaluru',
    limit: 10,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}`,
  },
  nodejs: {
    language: 'Node.js',
    filename: 'index.js',
    code: `import { Evo } from 'project-evo';

const evo = new Evo('evo_live_sec_8932fa');

(async function () {
  const { data, error } = await evo.events.create({
    title: 'Acoustic Sunset Jam',
    category: 'MUSIC',
    city: 'Bengaluru',
    startsAt: '2026-10-18T18:30:00Z',
    price: 0,
  });

  if (error) {
    return console.error('Failed to publish event:', error);
  }

  console.log('Event published successfully:', data.id);
})();`,
  },
  python: {
    language: 'Python',
    filename: 'main.py',
    code: `import project_evo

client = project_evo.Client(api_key="evo_live_sec_8932fa")

# Query active upcoming events
events = client.events.list(
    category="WORKSHOP",
    status="UPCOMING",
    limit=5
)

for event in events:
    print(f"[{event.city}] {event.title} - ₹{event.price}")`,
  },
  curl: {
    language: 'cURL',
    filename: 'terminal.sh',
    code: `curl -X GET "https://api.projectevo.app/v1/events" \\
  -H "Authorization: Bearer evo_live_sec_8932fa" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "TECH",
    "city": "Bengaluru",
    "limit": 9
  }'`,
  },
  react: {
    language: 'React Hooks',
    filename: 'EventCard.tsx',
    code: `import { useEventReminder } from '@project-evo/react';

export function RSVPButton({ eventId }: { eventId: string }) {
  const { isReminded, toggleReminder, isPending } = useEventReminder(eventId);

  return (
    <button 
      onClick={toggleReminder}
      disabled={isPending}
      className="btn-ghost"
    >
      {isReminded ? 'Reminder set' : 'Notify me'}
    </button>
  );
}`,
  },
};

export function ResendIntegrateCode() {
  const [activeTab, setActiveTab] = useState<string>('nextjs');
  const [copied, setCopied] = useState(false);

  const snippet = SNIPPETS[activeTab] || SNIPPETS.nextjs;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = snippet.code.split('\n');

  return (
    <div
      style={{
        backgroundColor: '#000000',
        border: '1px solid #292d30',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Top Header / Tab Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #292d30',
          padding: '0 16px',
          backgroundColor: '#050505',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '56px' }}>
          {Object.entries(SNIPPETS).map(([key, item]) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : '#a1a4a5',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid #292d30' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.language}
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #292d30',
              backgroundColor: '#111214',
              color: copied ? '#3ad389' : '#a1a4a5',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 150ms ease-out',
            }}
            aria-label="Copy code"
          >
            {copied ? <Check size={14} color="#3ad389" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div
        style={{
          padding: '24px 20px',
          overflowX: 'auto',
          backgroundColor: '#000000',
          fontFamily: "'JetBrains Mono', 'Commit Mono', monospace",
          fontSize: '13px',
          lineHeight: '1.7',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} style={{ verticalAlign: 'top' }}>
                <td
                  style={{
                    width: '36px',
                    paddingRight: '16px',
                    color: '#464a4d',
                    textAlign: 'right',
                    userSelect: 'none',
                    fontSize: '12px',
                  }}
                >
                  {idx + 1}
                </td>
                <td style={{ color: '#f0f0f0', whiteSpace: 'pre' }}>
                  {formatHighlightedCode(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Bar */}
      <div
        style={{
          borderTop: '1px solid #292d30',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          fontSize: '12px',
          color: '#6e727a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono">{snippet.filename}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a1a4a5' }}>
            <span>TypeScript 5.x</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a1a4a5' }}>
            <span>ESM Ready</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Lightweight syntactic colorizer for developer code preview */
function formatHighlightedCode(line: string) {
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span style={{ color: '#6e727a' }}>{line}</span>;
  }

  // Keywords highlighting
  const parts = line.split(
    /(import|from|export|async|function|const|return|if|for|in|print|let|new|default)/g
  );

  return (
    <>
      {parts.map((p, i) => {
        if (
          [
            'import',
            'from',
            'export',
            'async',
            'function',
            'const',
            'return',
            'if',
            'for',
            'in',
            'print',
            'let',
            'new',
            'default',
          ].includes(p)
        ) {
          return (
            <span key={i} style={{ color: '#ffffff', fontWeight: 600 }}>
              {p}
            </span>
          );
        }
        if (p.includes("'") || p.includes('"')) {
          return (
            <span key={i} style={{ color: '#a1a4a5' }}>
              {p}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
