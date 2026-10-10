'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'FOOD', label: 'Food' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'KIDS', label: 'Kids' },
];

interface EventFiltersProps {
  selectedCategory: string;
  selectedCity: string;
  searchQuery: string;
  onFilterChange: (filters: { category?: string; city?: string; q?: string }) => void;
}

export function EventFilters({
  selectedCategory,
  selectedCity,
  searchQuery,
  onFilterChange,
}: EventFiltersProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch('/api/cities');
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadCities();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ q: localSearch.trim() || undefined });
  }

  function handleCategoryClick(cat: string) {
    onFilterChange({ category: cat || undefined });
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onFilterChange({ city: e.target.value || undefined });
  }

  function handleClear() {
    setLocalSearch('');
    onFilterChange({ category: undefined, city: undefined, q: undefined });
  }

  const hasActiveFilters = Boolean(selectedCategory || selectedCity || searchQuery);

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Search and City Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {/* Search form */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: '1 1 280px',
            position: 'relative',
            display: 'flex',
          }}
        >
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title, artist, topic..."
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '6px',
              padding: '0 40px 0 14px',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 150ms ease-out',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#ffffff')}
            onBlur={(e) => (e.target.style.borderColor = '#292d30')}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#a1a4a5',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Search"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </form>

        {/* City Select */}
        <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            aria-label="Filter by City"
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: '#050505',
              border: '1px solid #292d30',
              borderRadius: '6px',
              padding: '0 12px',
              fontSize: '14px',
              color: selectedCity ? '#ffffff' : '#a1a4a5',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ backgroundColor: '#111111', color: '#ffffff' }}>
              All Cities
            </option>
            {cities.map((c) => (
              <option key={c} value={c} style={{ backgroundColor: '#111111', color: '#ffffff' }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              height: '42px',
              padding: '0 14px',
              backgroundColor: 'transparent',
              border: '1px dashed #292d30',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#a1a4a5',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#ff9592';
              (e.currentTarget as HTMLElement).style.color = '#ff9592';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#292d30';
              (e.currentTarget as HTMLElement).style.color = '#a1a4a5';
            }}
          >
            <span>Clear Filters</span>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryClick(cat.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                backgroundColor: isSelected ? '#ffffff' : '#050505',
                color: isSelected ? '#000000' : '#f0f0f0',
                border: isSelected ? '1px solid #ffffff' : '1px solid #292d30',
                transition: 'all 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#ffffff';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#292d30';
                  (e.currentTarget as HTMLElement).style.color = '#f0f0f0';
                }
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
