import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, RefreshCw, Truck, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#121212',
        color: '#E5E5E3',
        paddingTop: '64px',
        paddingBottom: '32px',
        marginTop: 'auto',
        borderTop: '1px solid #262626',
      }}
    >
      <div className="container">
        {/* Core Value Props Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            paddingBottom: '48px',
            borderBottom: '1px solid #262626',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#1E1E1E', borderRadius: '4px' }}>
              <ShieldCheck size={20} color="#D1B89D" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Guaranteed Fixed Stock
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.4 }}>
                Real-time inventory database. If you see it in stock, it is reserved for you.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#1E1E1E', borderRadius: '4px' }}>
              <Award size={20} color="#D1B89D" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Atelier Grade Fabrics
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.4 }}>
                Heavyweight organic combed cottons, French linens & Kurabo selvedge denim.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#1E1E1E', borderRadius: '4px' }}>
              <Truck size={20} color="#D1B89D" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Express Dispatch
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.4 }}>
                Direct fulfillment from our climate-controlled inventory warehouse.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#1E1E1E', borderRadius: '4px' }}>
              <RefreshCw size={20} color="#D1B89D" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Seamless Returns
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.4 }}>
                Complimentary 14-day return and exchange policy on all unworn items.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '12px',
              }}
            >
              THREADLY
            </span>
            <p style={{ fontSize: '0.875rem', color: '#A1A1AA', maxWidth: '320px', lineHeight: 1.6, marginBottom: '16px' }}>
              A high-precision fashion discovery and inventory intelligence system. Designing modern minimalist garments with uncompromised material honesty.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.785rem',
                  padding: '6px 12px',
                  backgroundColor: '#27272A',
                  color: '#D1B89D',
                  borderRadius: '4px',
                  border: '1px solid #3F3F46',
                }}
              >
                <span>Stock Operations Portal</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Col 1: Shop */}
          <div>
            <h5 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', marginBottom: '16px' }}>
              Discovery
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <li><a href="/shop" style={{ color: '#9CA3AF' }}>All Garments</a></li>
              <li><a href="/shop?gender=men" style={{ color: '#9CA3AF' }}>Men&apos;s Edit</a></li>
              <li><a href="/shop?gender=women" style={{ color: '#9CA3AF' }}>Women&apos;s Edit</a></li>
              <li><a href="/shop?availability=in_stock" style={{ color: '#9CA3AF' }}>Ready to Ship</a></li>
              <li><a href="/shop?sort=newest" style={{ color: '#9CA3AF' }}>New Arrivals</a></li>
            </ul>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', marginBottom: '16px' }}>
              Categories
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <li><a href="/shop?category=t-shirts" style={{ color: '#9CA3AF' }}>Heavyweight Tees</a></li>
              <li><a href="/shop?category=shirts" style={{ color: '#9CA3AF' }}>Poplin & Linen Shirts</a></li>
              <li><a href="/shop?category=jeans" style={{ color: '#9CA3AF' }}>Selvedge Denim</a></li>
              <li><a href="/shop?category=jackets" style={{ color: '#9CA3AF' }}>Wool Overcoats</a></li>
              <li><a href="/shop?category=hoodies" style={{ color: '#9CA3AF' }}>French Terry Fleece</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h5 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', marginBottom: '16px' }}>
              Atelier
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <li><a href="/about" style={{ color: '#9CA3AF' }}>Brand Ethos</a></li>
              <li><a href="/about#materials" style={{ color: '#9CA3AF' }}>Material Standards</a></li>
              <li><a href="/contact" style={{ color: '#9CA3AF' }}>Client Concierge</a></li>
              <li><a href="/contact#faq" style={{ color: '#9CA3AF' }}>Inventory FAQ</a></li>
              <li><a href="/admin/login" style={{ color: '#9CA3AF' }}>Staff Login</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid #262626',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.785rem',
            color: '#71717A',
          }}
        >
          <p>© {new Date().getFullYear()} THREADLY ATELIER &bull; Smart Clothing Product Discovery & Inventory Engine.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Designed & Developed By Vivek Jain +919588611472</span>
            <span>&bull;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
