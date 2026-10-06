import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, RefreshCw, Feather, Layers, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Our Atelier — THREADLY',
  description: 'Learn about the philosophy, materials, and deterministic inventory architecture behind THREADLY.',
};

export default function AboutPage() {
  return (
    <div style={{ paddingBottom: '64px' }}>
      
      {/* Editorial Hero */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '48px 0 40px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '840px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Our Atelier Ethos
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontFamily: 'var(--font-serif)', marginTop: '8px', marginBottom: '16px' }}>
            Material Honesty. <br />Deterministic Craft.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            THREADLY was founded on a simple observation: modern fashion e-commerce suffers from opacity—both in fabric provenance and inventory reliability. We engineered a platform where every garment is crafted from heirloom-grade textiles and backed by real-time physical stock.
          </p>
        </div>
      </section>

      {/* Main Philosophy Pillars */}
      <section className="container" style={{ maxWidth: '1080px', paddingTop: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', marginBottom: '48px' }}>
          
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              Fixed Inventory Principle
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              No phantom listings or oversold units. Our backend inventory ledger locks exact unit quantities. When an administrator logs a stock update or units sell, the customer website updates synchronously.
            </p>
          </div>

          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Feather size={22} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              Textile Integrity
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              We source directly from heritage textile mills—280 GSM combed organic cotton from Aegean farms, French Normandy long-staple flax linen, and 14.5oz shuttle-loomed Kurabo selvedge denim.
            </p>
          </div>

          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              Architectural Proportions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Every pattern is graded with millimeter precision. From structured dropped shoulders on our boxy tees to drape-engineered pleats in our tropical wool trousers, silhouette is never compromised.
            </p>
          </div>

        </div>

        {/* Visual Story Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop"
              alt="Atelier craftsmanship"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
              The Studio
            </span>
            <h2 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-serif)', marginTop: '4px', marginBottom: '16px' }}>
              Engineered For Modern Wear
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              By merging software-grade inventory synchronization with old-world garment construction, THREADLY sets a new architectural standard for luxury fashion e-commerce.
            </p>
            <a
              href="/shop"
              className="btn btn-primary"
              style={{
                backgroundColor: '#171717',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span style={{ color: '#ffffff' }}>Browse The Collection</span>
              <ArrowRight size={15} color="#ffffff" />
            </a>
          </div>
        </div>

      </section>
    </div>
  );
}
