interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No events found',
  description = 'Try adjusting your filters or search keywords to find what you are looking for.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '64px 24px',
        textAlign: 'center',
        backgroundColor: '#050505',
        border: '1px solid #292d30',
        borderRadius: '16px',
        margin: '24px 0',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔍</div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#ffffff',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#a1a4a5',
          maxWidth: '420px',
          margin: '0 auto 20px auto',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 150ms ease-out',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#eaeaea')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
