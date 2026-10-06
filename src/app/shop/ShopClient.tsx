'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Grid3X3,
  LayoutGrid,
  List,
  Check,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { Product, FilterFacets, PaginatedProductsResponse } from '@/types';
import { useToast } from '@/components/ToastContext';

interface ShopClientProps {
  initialData: PaginatedProductsResponse;
}

export default function ShopClient({ initialData }: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [data, setData] = useState<PaginatedProductsResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Search input state
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Price range local state for smooth slider dragging
  const [localMinPrice, setLocalMinPrice] = useState<number>(
    searchParams.get('min_price') ? Number(searchParams.get('min_price')) : initialData.facets.priceRange.min
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<number>(
    searchParams.get('max_price') ? Number(searchParams.get('max_price')) : initialData.facets.priceRange.max
  );

  // Sync state if initialData changes from server
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Update URL search parameters cleanly
  const updateQuery = useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(window.location.search);

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '' || val === 'all') {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });

      // Reset to page 1 on filter/search change unless page was explicitly set
      if (!newParams.page) {
        current.delete('page');
      }

      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  // Debounced search input handler
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (searchInput === currentSearch) return;

    const timer = setTimeout(() => {
      updateQuery({ search: searchInput.trim() || null });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, updateQuery]);

  // Clear search input helper
  const handleClearSearch = () => {
    setSearchInput('');
    updateQuery({ search: null });
  };

  // Multi-select toggle helper for array filters (categories, sizes, colors, genders)
  const toggleArrayFilter = (paramKey: string, value: string) => {
    const currentVal = searchParams.get(paramKey);
    let values = currentVal ? currentVal.split(',').map((s) => s.trim()) : [];

    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
    } else {
      values.push(value);
    }

    updateQuery({ [paramKey]: values.length > 0 ? values.join(',') : null });
  };

  // Helper for single value filters (availability, sort, gender)
  const handleSingleFilter = (paramKey: string, value: string) => {
    const currentVal = searchParams.get(paramKey);
    if (currentVal === value) {
      updateQuery({ [paramKey]: null });
    } else {
      updateQuery({ [paramKey]: value });
    }
  };

  // Clear all active filters
  const handleClearAllFilters = () => {
    setSearchInput('');
    setLocalMinPrice(data.facets.priceRange.min);
    setLocalMaxPrice(data.facets.priceRange.max);
    router.replace(pathname, { scroll: false });
    showToast('All filters have been reset.', 'info');
  };

  // Price slider / input submit
  const applyPriceFilter = () => {
    updateQuery({
      min_price: localMinPrice > data.facets.priceRange.min ? localMinPrice : null,
      max_price: localMaxPrice < data.facets.priceRange.max ? localMaxPrice : null,
    });
  };

  // Format currency
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Current filter values from URL
  const activeCategories = (searchParams.get('category') || '').split(',').filter(Boolean);
  const activeGenders = (searchParams.get('gender') || '').split(',').filter(Boolean);
  const activeSizes = (searchParams.get('size') || '').split(',').filter(Boolean);
  const activeColors = (searchParams.get('color') || '').split(',').filter(Boolean);
  const activeAvailability = searchParams.get('availability') || 'all';
  const activeSort = searchParams.get('sort') || 'featured';
  const activeBrand = searchParams.get('brand') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Render Filter Sidebar Content (Shared between Desktop Sidebar and Mobile Drawer)
  const renderFilterControls = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Category Filter Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Category
          </h4>
          {activeCategories.length > 0 && (
            <button
              onClick={() => updateQuery({ category: null })}
              style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.facets.categories.map((cat) => {
            const isChecked = activeCategories.includes(cat.value);
            return (
              <label
                key={cat.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isChecked ? 600 : 400,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayFilter('category', cat.value)}
                    style={{ accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                  />
                  <span>{cat.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({cat.count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 2. Gender Filter Section */}
      <div>
        <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '12px' }}>
          Gender / Department
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { value: 'men', label: 'Men' },
            { value: 'women', label: 'Women' },
            { value: 'unisex', label: 'Unisex' },
          ].map((item) => {
            const isSelected = activeGenders.includes(item.value);
            return (
              <button
                key={item.value}
                onClick={() => toggleArrayFilter('gender', item.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 3. Availability Filter Section (Real-Time Stock) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Inventory Stock Status
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'all', label: 'All Garments', dotColor: '#9CA3AF' },
            { value: 'in_stock', label: 'In Stock (>10 left)', dotColor: '#22C55E' },
            { value: 'low_stock', label: 'Low Stock (1-10 left)', dotColor: '#F59E0B' },
            { value: 'out_of_stock', label: 'Out of Stock (0 left)', dotColor: '#EF4444' },
          ].map((avail) => {
            const isSelected = activeAvailability === avail.value;
            const facetInfo = data.facets.availability.find((a) => a.value === avail.value);
            return (
              <label
                key={avail.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="availability_filter"
                    checked={isSelected}
                    onChange={() => handleSingleFilter('availability', avail.value)}
                    style={{ accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                  />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: avail.dotColor }} />
                  <span>{avail.label}</span>
                </div>
                {facetInfo && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({facetInfo.count})
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 4. Sizes Multi-Select Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Sizes
          </h4>
          {activeSizes.length > 0 && (
            <button
              onClick={() => updateQuery({ size: null })}
              style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {data.facets.sizes.map((s) => {
            const isSelected = activeSizes.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggleArrayFilter('size', s.value)}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                title={`${s.label} (${s.count} matching)`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 5. Colors Palette Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Color
          </h4>
          {activeColors.length > 0 && (
            <button
              onClick={() => updateQuery({ color: null })}
              style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.facets.colors.map((c) => {
            const isChecked = activeColors.includes(c.value);
            return (
              <label
                key={c.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isChecked ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayFilter('color', c.value)}
                    style={{ accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: c.color_hex || '#000000',
                      border: '1px solid rgba(0,0,0,0.2)',
                    }}
                  />
                  <span>{c.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({c.count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 6. Price Range Filter Section */}
      <div>
        <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '12px' }}>
          Price Range
        </h4>

        {/* Dual Number Inputs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Min (₹)</span>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(Number(e.target.value))}
              className="input-field"
              style={{ padding: '6px 8px', fontSize: '0.8125rem' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', paddingTop: '16px' }}>—</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Max (₹)</span>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
              className="input-field"
              style={{ padding: '6px 8px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={data.facets.priceRange.min}
          max={data.facets.priceRange.max}
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--text-primary)', cursor: 'pointer', marginBottom: '12px' }}
        />

        <button
          onClick={applyPriceFilter}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Apply Price Filter
        </button>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* 7. Clear All Filters CTA */}
      <div>
        <button
          onClick={handleClearAllFilters}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} />
          <span>Clear All Filters</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '64px' }}>
      
      {/* 1. Header with Compact Alignment */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.4rem)', fontFamily: 'var(--font-serif)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Garment Collection
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Live atelier inventory with verified real-time stock availability &bull; <strong>{data.pagination.total}</strong> garments
          </p>
        </div>
      </div>

      {/* 2. Top Search & Controls Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Real-Time Search Bar with Clear Button */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '520px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search by name, color, style, tags, SKU (e.g. 'oversized black', 'linen', 'selvedge')..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: '38px',
              paddingRight: searchInput ? '36px' : '14px',
              height: '42px',
              fontSize: '0.875rem',
            }}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right Controls: Sort, View mode, Mobile Filter button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Mobile Filter Sheet Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-secondary btn-sm mobile-filter-btn"
            style={{ gap: '6px' }}
          >
            <Filter size={15} />
            <span>Filters {data.active_filters_count > 0 && `(${data.active_filters_count})`}</span>
          </button>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort by:</span>
            <select
              value={activeSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="input-field select-field"
              style={{
                height: '42px',
                padding: '0 32px 0 12px',
                fontSize: '0.8125rem',
                minWidth: '170px',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="stock_desc">Stock: Available First</option>
            </select>
          </div>

          {/* View Grid Switcher */}
          <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="Standard Grid"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'compact' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'compact' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="Compact Grid"
            >
              <Grid3X3 size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Active Filter Chips & Results Count Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '24px',
          fontSize: '0.875rem',
        }}
      >
        {/* Results count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>
            {data.pagination.total} {data.pagination.total === 1 ? 'Garment' : 'Garments'} Found
          </strong>
          {searchInput && (
            <span style={{ color: 'var(--text-secondary)' }}>
              for &ldquo;{searchInput}&rdquo;
            </span>
          )}
        </div>

        {/* Active Filter Chips */}
        {data.active_filters_count > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {activeCategories.map((c) => (
              <span key={c} className="filter-chip">
                <span>Category: {c}</span>
                <button onClick={() => toggleArrayFilter('category', c)}><X size={12} /></button>
              </span>
            ))}
            {activeGenders.map((g) => (
              <span key={g} className="filter-chip">
                <span>Gender: {g}</span>
                <button onClick={() => toggleArrayFilter('gender', g)}><X size={12} /></button>
              </span>
            ))}
            {activeSizes.map((s) => (
              <span key={s} className="filter-chip">
                <span>Size: {s}</span>
                <button onClick={() => toggleArrayFilter('size', s)}><X size={12} /></button>
              </span>
            ))}
            {activeColors.map((col) => (
              <span key={col} className="filter-chip">
                <span>Color: {col}</span>
                <button onClick={() => toggleArrayFilter('color', col)}><X size={12} /></button>
              </span>
            ))}
            {activeAvailability !== 'all' && (
              <span className="filter-chip">
                <span>Stock: {activeAvailability.replace('_', ' ')}</span>
                <button onClick={() => updateQuery({ availability: null })}><X size={12} /></button>
              </span>
            )}
            {searchParams.get('min_price') && (
              <span className="filter-chip">
                <span>Min: {formatPrice(Number(searchParams.get('min_price')))}</span>
                <button onClick={() => updateQuery({ min_price: null })}><X size={12} /></button>
              </span>
            )}
            {searchParams.get('max_price') && (
              <span className="filter-chip">
                <span>Max: {formatPrice(Number(searchParams.get('max_price')))}</span>
                <button onClick={() => updateQuery({ max_price: null })}><X size={12} /></button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                textDecoration: 'underline',
                marginLeft: '6px',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Two-Column Layout: Sidebar + Product Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px', alignItems: 'flex-start' }} className="shop-layout-grid">
        
        {/* Desktop Left Filter Sidebar */}
        <aside
          className="desktop-filter-sidebar"
          style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-subtle)',
            position: 'sticky',
            top: '90px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <SlidersHorizontal size={16} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Refine Search
            </span>
          </div>
          {renderFilterControls()}
        </aside>

        {/* Right Column: Product Results Grid / Loading / Empty State */}
        <main>
          {loading ? (
            /* Skeleton Loading Grid */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'compact' ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '18px', width: '90%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                </div>
              ))}
            </div>
          ) : data.products.length > 0 ? (
            /* Product Results Grid */
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'compact' ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px',
                  marginBottom: '40px',
                }}
              >
                {data.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {data.pagination.total_pages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateQuery({ page: currentPage - 1 })}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>

                  {Array.from({ length: data.pagination.total_pages }).map((_, idx) => {
                    const pNum = idx + 1;
                    const isActive = pNum === currentPage;
                    return (
                      <button
                        key={pNum}
                        onClick={() => updateQuery({ page: pNum })}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 700 : 500,
                          backgroundColor: isActive ? 'var(--text-primary)' : '#ffffff',
                          color: isActive ? '#ffffff' : 'var(--text-primary)',
                          border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                          cursor: 'pointer',
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage >= data.pagination.total_pages}
                    onClick={() => updateQuery({ page: currentPage + 1 })}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Professional Empty State */
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '64px 32px',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}
              >
                <Search size={26} />
              </div>

              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                No Garments Match Your Selection
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                We couldn&rsquo;t find any garments matching your active filters or search terms. Try clearing some criteria or exploring our staple collections.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={handleClearAllFilters} className="btn btn-primary">
                  <span>Reset All Filters</span>
                </button>
                <a href="/shop?category=t-shirts" className="btn btn-secondary">
                  <span>Explore T-Shirts</span>
                </a>
                <a href="/shop?availability=in_stock" className="btn btn-secondary">
                  <span>View In-Stock Items</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 5. Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="modal-backdrop" onClick={() => setMobileFilterOpen(false)}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '90%',
              maxWidth: '380px',
              backgroundColor: '#FFFFFF',
              zIndex: 110,
              padding: '24px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-drawer)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} />
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)' }}>Filter Products</h3>
              </div>
              <button onClick={() => setMobileFilterOpen(false)} className="btn-icon" aria-label="Close filters">
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, paddingBottom: '32px' }}>
              {renderFilterControls()}
            </div>

            <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#FFFFFF', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                View {data.pagination.total} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
