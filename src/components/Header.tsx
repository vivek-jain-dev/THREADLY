'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Shield,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Home
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchModalOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      setSearchModalOpen(false);
      setHeaderSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/', isHome: true },
    { label: 'Collection', href: '/shop' },
    { label: 'Men', href: '/shop?gender=men' },
    { label: 'Women', href: '/shop?gender=women' },
    { label: 'T-Shirts', href: '/shop?category=t-shirts' },
    { label: 'Outerwear', href: '/shop?category=jackets' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div
        style={{
          backgroundColor: '#121212',
          color: '#E5E5E3',
          fontSize: '0.75rem',
          padding: '6px 16px',
          textAlign: 'center',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Sparkles size={12} color="#D1B89D" />
        <span>Live Real-Time Inventory &bull; Guaranteed Fixed Stock Availability &bull; Atelier Quality</span>
      </div>

      {/* Main Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? 'rgba(250, 250, 248, 0.98)' : 'var(--bg-primary)',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: isScrolled ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
          transition: 'all var(--transition-base)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          
          {/* Left: Mobile Menu Toggle & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-toggle btn-icon"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <a
              href="/"
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                THREADLY
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginTop: '3px',
                }}
              >
                Atelier Discovery &bull; Stock
              </span>
            </a>
          </div>

          {/* Center: Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
            {navLinks.map((link) => {
              const isActive = link.isHome 
                ? pathname === '/' 
                : pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]) && link.href.includes('?'));
              
              if (link.isHome) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                      color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--text-primary)' : 'var(--border-subtle)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Home size={14} color={isActive ? '#FFFFFF' : 'var(--accent-primary)'} />
                    <span>Home</span>
                  </a>
                );
              }

              return (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                    padding: '6px 0',
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions: Search Trigger & Admin Portal Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              aria-label="Search clothing garments"
            >
              <Search size={15} />
              <span style={{ display: 'none' }} className="search-text-label">Search garments...</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 5px',
                  backgroundColor: '#ffffff',
                  borderRadius: '3px',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                /
              </span>
            </button>

            {/* Shop CTA */}
            <a
              href="/shop"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', gap: '6px' }}
            >
              <SlidersHorizontal size={14} />
              <span style={{ fontSize: '0.785rem' }}>Browse</span>
            </a>

            {/* Admin Portal Button */}
            <a
              href="/admin"
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.785rem',
              }}
            >
              <Shield size={13} />
              <span>Admin</span>
            </a>
          </div>

        </div>
      </header>

      {/* Global Quick Search Overlay Modal */}
      {searchModalOpen && (
        <div className="modal-backdrop" onClick={() => setSearchModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)' }}>Search Threadly Inventory</h3>
              <button onClick={() => setSearchModalOpen(false)} className="btn-icon" aria-label="Close search">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '20px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                autoFocus
                placeholder="Try 'oversized black', 'linen shirt', 'selvedge', 'hoodie'..."
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '42px',
                  paddingRight: '90px',
                  fontSize: '0.9375rem',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px 14px',
                }}
              >
                Search
              </button>
            </form>

            {/* Quick Keyword Pills */}
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Popular Searches:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Oversized T-Shirt', 'Linen Shirt', 'Black Jeans', 'Wool Overcoat', 'In Stock Hoodies', 'Men Green'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      router.push(`/shop?search=${encodeURIComponent(tag)}`);
                      setSearchModalOpen(false);
                    }}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-out Drawer Menu */}
      {mobileMenuOpen && (
        <div className="modal-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '340px',
              backgroundColor: '#ffffff',
              zIndex: 110,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-drawer)',
              animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                THREADLY
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="btn-icon" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              {/* Prominent Home Button */}
              <a
                href="/"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: pathname === '/' ? '#FFFFFF' : 'var(--text-primary)',
                  backgroundColor: pathname === '/' ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: pathname === '/' ? 'var(--text-primary)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Home size={18} color={pathname === '/' ? '#FFFFFF' : 'var(--accent-primary)'} />
                  <span>Home & Atelier</span>
                </div>
                <ArrowRight size={15} color={pathname === '/' ? '#FFFFFF' : 'var(--text-muted)'} />
              </a>

              {/* Shop All Button */}
              <a
                href="/shop"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: pathname === '/shop' ? '#FFFFFF' : 'var(--text-primary)',
                  backgroundColor: pathname === '/shop' ? 'var(--text-primary)' : '#FFFFFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <SlidersHorizontal size={17} color={pathname === '/shop' ? '#FFFFFF' : 'var(--text-secondary)'} />
                  <span>Browse All Garments</span>
                </div>
                <ArrowRight size={15} color={pathname === '/shop' ? '#FFFFFF' : 'var(--text-muted)'} />
              </a>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

              <span style={{ fontSize: '0.725rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Curated Collections
              </span>

              {[
                { name: "Men's Collection", href: '/shop?gender=men' },
                { name: "Women's Collection", href: '/shop?gender=women' },
                { name: 'T-Shirts & Tees', href: '/shop?category=t-shirts' },
                { name: 'Button-down Shirts', href: '/shop?category=shirts' },
                { name: 'Denim & Selvedge', href: '/shop?category=jeans' },
                { name: 'Outerwear & Coats', href: '/shop?category=jackets' },
                { name: 'Fleece & Hoodies', href: '/shop?category=hoodies' },
                { name: 'Tailored Trousers', href: '/shop?category=trousers' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    padding: '2px 0',
                  }}
                >
                  {item.name}
                </a>
              ))}

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

              <a href="/about" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                About Atelier Threadly
              </a>
              <a href="/contact" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Customer Support & Concierge
              </a>
            </nav>

            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <a
                href="/admin"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <Shield size={16} />
                <span>Admin Inventory Portal</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
