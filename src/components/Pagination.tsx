'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '40px',
      }}
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          padding: '8px 14px',
          backgroundColor: '#050505',
          border: '1px solid #292d30',
          borderRadius: '6px',
          fontSize: '13px',
          color: currentPage <= 1 ? '#464a4d' : '#f0f0f0',
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          transition: 'all 150ms ease-out',
        }}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      {/* Page Numbers */}
      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: isCurrent ? '#ffffff' : '#050505',
              border: isCurrent ? '1px solid #ffffff' : '1px solid #292d30',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isCurrent ? 600 : 400,
              color: isCurrent ? '#000000' : '#f0f0f0',
              cursor: 'pointer',
              transition: 'all 150ms ease-out',
            }}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          padding: '8px 14px',
          backgroundColor: '#050505',
          border: '1px solid #292d30',
          borderRadius: '6px',
          fontSize: '13px',
          color: currentPage >= totalPages ? '#464a4d' : '#f0f0f0',
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 150ms ease-out',
        }}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}
