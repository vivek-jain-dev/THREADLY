'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Check, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Product } from '@/types';
import { useToast } from './ToastContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const images = product.gallery_images && product.gallery_images.length > 0
    ? product.gallery_images
    : [product.image_url];

  const handleAction = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }
    if (!selectedSize && product.sizes.length > 0) {
      showToast('Please select an available size.', 'info');
      return;
    }
    showToast(`Added ${product.name} (Size: ${selectedSize || 'Standard'}) to your order bag!`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '820px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          {/* Left Column: Image Gallery */}
          <div style={{ position: 'relative', backgroundColor: '#F5F5F3', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%', overflow: 'hidden' }}>
              <img
                src={images[activeImageIndex] || product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Close button on mobile overlay */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  zIndex: 5,
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Stock Status Badge */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 4 }}>
                {isOutOfStock ? (
                  <span className="stock-badge out_of_stock">
                    <span className="stock-dot" /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="stock-badge low_stock">
                    <span className="stock-dot" /> Only {product.stock_quantity} Left
                  </span>
                ) : (
                  <span className="stock-badge in_stock">
                    <span className="stock-dot" /> In Stock ({product.stock_quantity})
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-subtle)' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Info & Actions */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Header category & close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  {product.category_name} &bull; {product.brand} &bull; {product.gender}
                </span>
                <button onClick={onClose} className="btn-icon" style={{ padding: 4 }} aria-label="Close dialog">
                  <X size={18} />
                </button>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                {product.name}
              </h2>

              {/* SKU & live rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>SKU: <strong style={{ color: 'var(--text-primary)' }}>{product.sku}</strong></span>
                <span>&bull;</span>
                <span>★ {product.rating.toFixed(1)} ({product.reviews_count} reviews)</span>
              </div>

              {/* Pricing */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                {product.discount_price ? (
                  <>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatPrice(product.discount_price)}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '2px 6px', borderRadius: '2px' }}>
                      Save {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {product.description}
              </p>

              {/* Live Real-Time Inventory Stock Warning box */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.8125rem',
                  backgroundColor: isOutOfStock
                    ? 'var(--status-out-stock-bg)'
                    : isLowStock
                    ? 'var(--status-low-stock-bg)'
                    : 'var(--status-in-stock-bg)',
                  border: `1px solid ${
                    isOutOfStock
                      ? 'var(--status-out-stock-border)'
                      : isLowStock
                      ? 'var(--status-low-stock-border)'
                      : 'var(--status-in-stock-border)'
                  }`,
                  color: isOutOfStock
                    ? 'var(--status-out-stock-text)'
                    : isLowStock
                    ? 'var(--status-low-stock-text)'
                    : 'var(--status-in-stock-text)',
                }}
              >
                {isOutOfStock ? (
                  <>
                    <AlertTriangle size={16} />
                    <span><strong>Out of Stock:</strong> No units currently available. Administrators can restock from the Admin Panel.</span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle size={16} />
                    <span><strong>Low Stock Alert:</strong> Only <strong>{product.stock_quantity} units</strong> remaining in inventory.</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span><strong>In Stock:</strong> <strong>{product.stock_quantity} units</strong> ready for immediate dispatch.</span>
                  </>
                )}
              </div>

              {/* Color & Size selection */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Color: <strong>{product.color}</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: product.color_hex || '#000000',
                        border: '1px solid rgba(0,0,0,0.2)',
                        display: 'inline-block',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Select Size:</span>
                    {selectedSize && <span style={{ fontWeight: 600 }}>Selected: {selectedSize}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(size)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-secondary)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.5 : 1,
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleAction}
                disabled={isOutOfStock}
                className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isOutOfStock ? 'Unavailable (Out of Stock)' : 'Add to Collection Bag'}
              </button>

              <a
                href={`/products/${product.slug || product.id}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
              >
                <span>View Complete Product Specifications</span>
                <ArrowRight size={14} />
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
