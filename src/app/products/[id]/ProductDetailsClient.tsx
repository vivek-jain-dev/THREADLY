'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
  Heart,
  Check,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/components/ToastContext';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailsClient({ product, relatedProducts }: Props) {
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'shipping'>('specs');

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const images = product.gallery_images && product.gallery_images.length > 0
    ? product.gallery_images
    : [product.image_url];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This garment is currently out of stock.', 'error');
      return;
    }
    if (!selectedSize && product.sizes.length > 0) {
      showToast('Please select your preferred size.', 'info');
      return;
    }
    showToast(`Added ${quantity}x ${product.name} (${selectedSize}) to your bag!`, 'success');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '80px' }}>
      
      {/* 1. Compact Navigation & Category Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <a href="/shop" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
          &larr; <span>Back to Collection</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Department:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {product.category_name} &bull; {product.gender}
          </span>
        </div>
      </div>

      {/* 2. Main PDP Grid: Gallery (Left) + Details (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1fr)', gap: '48px', alignItems: 'flex-start', marginBottom: '80px' }} className="pdp-grid">
        
        {/* Left Column: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Large Image */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              backgroundColor: '#F3F2EE',
              aspectRatio: '3/4',
              width: '100%',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <img
              src={images[selectedImageIndex] || product.image_url}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isOutOfStock ? 'grayscale(25%)' : 'none',
              }}
            />

            {/* Top Left Stock Badge */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
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
                  <span className="stock-dot" /> In Stock ({product.stock_quantity} Units)
                </span>
              )}
            </div>

            {/* Top Right Share & Wishlist */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, display: 'flex', gap: '8px' }}>
              <button
                onClick={handleShare}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
                title="Copy Product Link"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '80px',
                    height: '100px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: selectedImageIndex === idx ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Details, Stock & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header & Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.785rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {product.brand}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
              <span style={{ fontSize: '0.785rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {product.gender} &bull; {product.category_name}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontFamily: 'var(--font-serif)', fontWeight: 700, lineHeight: 1.15, marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* SKU and Live Reviews */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>SKU: <strong style={{ color: 'var(--text-primary)' }}>{product.sku}</strong></span>
              <span>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#F59E0B' }}>★</span>
                <span>{product.rating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({product.reviews_count} verified reviews)</span>
              </div>
            </div>
          </div>

          {/* Pricing Row */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
            }}
          >
            {product.discount_price ? (
              <>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatPrice(product.discount_price)}
                </span>
                <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </span>
                <span style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '3px 8px', borderRadius: '4px' }}>
                  Save {discountPercent}% ({formatPrice(product.price - product.discount_price)})
                </span>
              </>
            ) : (
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatPrice(product.price)}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Taxes Included &bull; Free Express Delivery
            </span>
          </div>

          {/* Real-Time Live Stock Inventory Callout */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '0.875rem',
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
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Inventory Status: OUT OF STOCK</strong>
                  <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.9 }}>
                    All warehouse inventory has been allocated. Purchasing is currently paused. Administrators can restock units in the Admin Panel to instantly restore purchasing.
                  </p>
                </div>
              </>
            ) : isLowStock ? (
              <>
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>
                    Low Stock Notice: Only {product.stock_quantity} Garments Left
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.9 }}>
                    Demand for this size and colorway is high. Fixed stock is guaranteed upon checkout completion.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>
                    In Stock: {product.stock_quantity} Units Verified
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.9 }}>
                    Item is physically staged in our central fulfillment warehouse and ready for dispatch.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Color Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Colorway:</span>
              <span style={{ fontWeight: 600 }}>{product.color}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '3px',
                  borderRadius: '50%',
                  border: '2px solid var(--text-primary)',
                  display: 'inline-flex',
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: product.color_hex || '#000000',
                    display: 'inline-block',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {product.color} (Factory Shade)
              </span>
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Select Size:</span>
                <span style={{ fontWeight: 600 }}>Selected: {selectedSize}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'var(--text-primary)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.4 : 1,
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

          {/* Quantity and Add to Cart Row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  height: '48px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ padding: '0 14px', height: '100%', fontSize: '1rem', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  style={{ padding: '0 14px', height: '100%', fontSize: '1rem', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            )}

            {/* Purchase CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'} btn-lg`}
              style={{ flex: 1, height: '48px', fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {isOutOfStock ? 'Currently Out of Stock' : 'Add to Wardrobe Bag'}
            </button>
          </div>

          {/* Description & Overview */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Garment Overview
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {product.description}
            </p>
          </div>

          {/* Accordion Tabs for Specs, Care, and Dispatch */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
              {[
                { id: 'specs', label: 'Specifications' },
                { id: 'care', label: 'Care & Materials' },
                { id: 'shipping', label: 'Shipping & Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--text-primary)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px' }}>
              {activeTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Fabrication</span>
                    <strong>{product.material || '100% Organic Heavyweight Cotton'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cut / Silhouette</span>
                    <strong>{product.fit || 'Regular Modern Fit'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Department</span>
                    <strong>{product.gender}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Inventory SKU</span>
                    <strong>{product.sku}</strong>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Care Instructions:</strong> {product.care_instructions || 'Machine wash cold inside out, dry flat in shade.'}
                  </p>
                  <p>
                    All Threadly garments are pre-shrunk and enzyme washed to ensure dimensions hold true across repeated wash cycles.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Fixed Warehouse Dispatch:</strong> Orders placed before 3:00 PM IST are processed same-day. Delivered within 2-4 business days.
                  </p>
                  <p>
                    Complimentary 14-day returns and exchanges for all unworn garments in original packaging.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Related Garments Section */}
      {relatedProducts.length > 0 && (
        <section style={{ paddingTop: '40px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Coordinated Styling
              </span>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                You May Also Admire
              </h2>
            </div>
            <a
              href={`/shop?category=${product.category_name.toLowerCase()}`}
              style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              More in {product.category_name} &rarr;
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
