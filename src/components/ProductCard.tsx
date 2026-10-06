'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  // Format currency in Indian Rupee (₹)
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div
      className="product-card-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all var(--transition-base)',
        opacity: isOutOfStock ? 0.88 : 1,
      }}
    >
      {/* Product Image Area */}
      <a
        href={`/products/${product.slug || product.id}`}
        style={{ position: 'relative', display: 'block', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: '#f3f2ee' }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isOutOfStock ? 'grayscale(30%)' : 'none',
          }}
          className="product-img"
        />

        {/* Stock Status Badge (Top Left) */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          {isOutOfStock ? (
            <span className="stock-badge out_of_stock">
              <span className="stock-dot" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="stock-badge low_stock">
              <span className="stock-dot" />
              Only {product.stock_quantity} Left
            </span>
          ) : (
            <span className="stock-badge in_stock">
              <span className="stock-dot" />
              In Stock ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Discount Badge (Top Right) */}
        {discountPercentage > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 2,
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.04em',
            }}
          >
            -{discountPercentage}%
          </div>
        )}

        {/* Overlay Action on Hover */}
        <div
          className="card-hover-actions"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            zIndex: 3,
            transition: 'all var(--transition-base)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(0,0,0,0.1)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.785rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backdropFilter: 'blur(4px)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
              }}
            >
              <Eye size={14} />
              <span>Quick View</span>
            </button>
          )}

          <a
            href={`/products/${product.slug || product.id}`}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--text-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="View Details"
          >
            <ArrowUpRight size={14} />
          </a>
        </div>
      </a>

      {/* Product Content Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Category & Brand row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              {product.category_name} &bull; {product.gender}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              SKU: {product.sku}
            </span>
          </div>

          {/* Product Name */}
          <a
            href={`/products/${product.slug || product.id}`}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            {product.name}
          </a>

          {/* Color Indicator & Sizes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            {/* Color Swatch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: product.color_hex || '#000000',
                  border: '1px solid rgba(0,0,0,0.15)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {product.color}
              </span>
            </div>

            {/* Available Sizes List */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  style={{
                    fontSize: '0.6875rem',
                    padding: '1px 5px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '2px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Stock Action row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {product.discount_price ? (
              <>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatPrice(product.discount_price)}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Action / Stock Status pill */}
          <div>
            {isOutOfStock ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--status-out-stock-text)',
                  backgroundColor: 'var(--status-out-stock-bg)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--status-out-stock-border)',
                }}
              >
                Sold Out
              </span>
            ) : (
              <a
                href={`/products/${product.slug || product.id}`}
                style={{
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View</span>
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
