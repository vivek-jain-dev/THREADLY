import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Clock,
  ArrowUpRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { ProductsRepository } from '@/lib/products-repository';
import HomeFeaturedClient from './HomeFeaturedClient';

export const revalidate = 0; // Ensure live data on every load

export default async function HomePage() {
  // Fetch real database products & categories
  const categories = ProductsRepository.getCategories();
  const featuredResponse = ProductsRepository.getProducts({
    limit: 8,
    sort: 'featured',
  });
  const stats = ProductsRepository.getDashboardStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', paddingBottom: '64px' }}>
      
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          backgroundColor: '#171717',
          color: '#FAFAF8',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Atmosphere Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(18,18,18,0.92) 0%, rgba(18,18,18,0.7) 50%, rgba(18,18,18,0.4) 100%), url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            opacity: 0.9,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '40px', paddingBottom: '60px' }}>
          <div style={{ maxWidth: '680px' }}>
            
            {/* Live Inventory Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.785rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#E5E5E3',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                  display: 'inline-block',
                }}
              />
              <span>Live Inventory Engine &bull; {stats.total_units} Verified Units in Stock</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                fontWeight: 700,
                marginBottom: '20px',
                fontFamily: 'var(--font-serif)',
              }}
            >
              Refined Proportions. <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#D1B89D' }}>
                Guaranteed Inventory.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '1.08rem',
                color: '#D1D0CA',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '540px',
              }}
            >
              Atelier-grade garments engineered from 280 GSM organic cotton, Kurabo selvedge denim, and pure French linen with deterministic fixed-stock availability.
            </p>

            {/* Hero CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <a
                href="/shop"
                className="btn btn-primary btn-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#121212',
                  borderColor: '#FFFFFF',
                  fontWeight: 600,
                  gap: '10px',
                }}
              >
                <span>Shop All Garments</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="/shop?availability=in_stock"
                className="btn btn-outline btn-lg"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <ShieldCheck size={16} color="#22C55E" />
                <span>Ready to Ship ({stats.in_stock} Styles)</span>
              </a>
            </div>

            {/* Live Metrics Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '56px',
                paddingTop: '28px',
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', display: 'block', fontFamily: 'var(--font-serif)' }}>
                  {stats.total_products}
                </span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                  Curated Styles
                </span>
              </div>

              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22C55E', display: 'block', fontFamily: 'var(--font-serif)' }}>
                  {stats.in_stock}
                </span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                  In Stock Ready
                </span>
              </div>

              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B', display: 'block', fontFamily: 'var(--font-serif)' }}>
                  {stats.low_stock}
                </span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                  Low Stock Alert
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Curated Wardrobe
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
              Explore By Category
            </h2>
          </div>
          <a
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <span>View All Categories</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {categories.map((cat: any) => (
            <a
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                aspectRatio: '4/5',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
                color: '#FFFFFF',
                backgroundColor: '#1E1E1E',
                textDecoration: 'none',
              }}
              className="category-card"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18,18,18,0.85) 0%, rgba(18,18,18,0.2) 60%, transparent 100%)',
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D1B89D' }}>
                  {cat.product_count || 0} Garments Available
                </span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#FFFFFF', marginTop: '2px' }}>
                  {cat.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC INVENTORY SPOTLIGHT CLIENT COMPONENT */}
      <section className="container">
        <HomeFeaturedClient initialProducts={featuredResponse.products} />
      </section>

      {/* 4. EDITORIAL TRANSPARENCY SECTION: "THE FIXED INVENTORY LEDGER" */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '80px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Inventory Architecture
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontFamily: 'var(--font-serif)', marginTop: '6px', marginBottom: '20px', lineHeight: 1.15 }}>
                Zero Placeholders. <br />
                Deterministic Stock.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                Traditional fashion platforms show misleading availability or cancel orders post-purchase. Threadly is built on an immutable live inventory database ledger. Every item card reflects exact real-time warehouse count.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={18} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>Instant Admin-to-Storefront Synchronization</strong>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      When stock is adjusted from 12 to 7 or 0 in the Admin Panel, the customer interface responds immediately.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={18} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>Transparent Sold-Out Handling</strong>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Sold out items remain searchable and filterable while disabling purchase actions with unambiguous UI communication.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={18} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>Complete Audit Logging</strong>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Every stock increase or decrease is registered with timestamp, author, and change magnitude in the audit ledger.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <a href="/shop" className="btn btn-primary">
                  <span>Explore Search & Multi-Filters</span>
                  <ArrowRight size={15} />
                </a>
                <a href="/admin" className="btn btn-secondary">
                  <span>Open Admin Control</span>
                </a>
              </div>
            </div>

            {/* Visual Inventory Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Live Inventory Status
                  </span>
                  <h4 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
                    Warehouse Stock Ledger
                  </h4>
                </div>
                <span className="stock-badge in_stock">
                  <span className="stock-dot" /> Active Sync
                </span>
              </div>

              {/* Status Breakdown Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span>In Stock (&gt;10 units)</span>
                    <strong>{stats.in_stock} Styles ({Math.round((stats.in_stock / stats.total_products) * 100)}%)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.in_stock / stats.total_products) * 100}%`, height: '100%', backgroundColor: '#22C55E' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span>Low Stock (1-10 units)</span>
                    <strong style={{ color: '#D97706' }}>{stats.low_stock} Styles ({Math.round((stats.low_stock / stats.total_products) * 100)}%)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.low_stock / stats.total_products) * 100}%`, height: '100%', backgroundColor: '#F59E0B' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span>Out of Stock (0 units)</span>
                    <strong style={{ color: '#DC2626' }}>{stats.out_of_stock} Styles ({Math.round((stats.out_of_stock / stats.total_products) * 100)}%)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.out_of_stock / stats.total_products) * 100}%`, height: '100%', backgroundColor: '#EF4444' }} />
                  </div>
                </div>
              </div>

              {/* Recent inventory log sample */}
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Latest Audit Event:
                </span>
                {stats.recent_logs && stats.recent_logs.length > 0 ? (
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-primary)', margin: 0 }}>
                    <strong>{stats.recent_logs[0].product_name}</strong>: Stock set to {stats.recent_logs[0].new_stock} ({stats.recent_logs[0].reason})
                  </p>
                ) : (
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: 0 }}>Initial database inventory ingested.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. EDITORIAL CURATIONS BANNER */}
      <section className="container">
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#1E1E1E',
            color: '#FAFAF8',
            padding: '60px 40px',
            display: 'flex',
            alignItems: 'center',
            minHeight: '380px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '580px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D1B89D', fontWeight: 600 }}>
              The Minimalist Capsule &bull; Season 2026
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontFamily: 'var(--font-serif)', marginTop: '8px', marginBottom: '16px' }}>
              Precision Cut. Honest Fibers.
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#D1D0CA', lineHeight: 1.6, marginBottom: '28px' }}>
              Explore versatile boxy tees, unstructured virgin wool tailoring, and heavy French terry outerwear engineered for daily longevity.
            </p>
            <a
              href="/shop"
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: '#FFFFFF', color: '#121212', borderColor: '#FFFFFF', fontWeight: 600 }}
            >
              <span>Explore Complete Collection</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
