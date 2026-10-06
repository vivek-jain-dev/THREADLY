'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  History,
  ExternalLink,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';
import { useToast } from './ToastContext';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Logged out of Admin Portal successfully', 'info');
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { label: 'Overview & Metrics', href: '/admin', icon: LayoutDashboard },
    { label: 'Product Inventory & CRUD', href: '/admin/products', icon: Boxes },
    { label: 'Audit Trail Logs', href: '/admin/logs', icon: History },
  ];

  return (
    <div
      style={{
        backgroundColor: '#1E1E1E',
        color: '#E5E5E3',
        padding: '12px 0',
        borderBottom: '1px solid #2C2C2C',
      }}
    >
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Left: Admin Badge & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid #333333' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                boxShadow: '0 0 6px #22C55E',
              }}
            />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>
              Admin Console
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? '#333333' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={15} color={isActive ? '#D1B89D' : '#A1A1AA'} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: Storefront Link & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.785rem',
              color: '#D1B89D',
              padding: '6px 12px',
              backgroundColor: '#27272A',
              borderRadius: '4px',
              border: '1px solid #3F3F46',
            }}
          >
            <span>Live Customer Store</span>
            <ExternalLink size={13} />
          </a>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.785rem',
              color: '#F87171',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
