export function EventCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#050505',
        border: '1px solid #292d30',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Skeleton */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          height: '180px',
        }}
      />
      {/* Content Skeleton */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '25%', height: '14px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton" style={{ width: '85%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
