'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { Product } from '@/types';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';

interface Props {
  initialProducts: Product[];
}

export default function HomeFeaturedClient({ initialProducts }: Props) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'in_stock' | 't-shirts' | 'jackets'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredProducts = initialProducts.filter((p) => {
    if (selectedTab === 'in_stock') return p.stock_quantity > 0;
    if (selectedTab === 't-shirts') return p.category_name.toLowerCase().includes('t-shirt');
    if (selectedTab === 'jackets') return p.category_name.toLowerCase().includes('jacket');
    return true;
  });

  return (
    <div>
      {/* Section Header with Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
            CLOTHESFOX
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
            Featured Inventory
          </h2>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Featured' },
            { key: 'in_stock', label: 'In Stock Only' },
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'jackets', label: 'Outerwear' },
          ].map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        {filteredProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {/* Bottom CTA banner */}
      <div style={{ textAlign: 'center' }}>
        <a
          href="/shop"
          className="btn btn-secondary btn-lg"
          style={{ display: 'inline-flex', gap: '8px' }}
        >
          <span>Discover Complete Catalogue ({initialProducts.length}+ Garments)</span>
          <ArrowRight size={16} />
        </a>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
