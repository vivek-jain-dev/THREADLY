'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  History,
  Plus,
  Edit3,
  RefreshCw,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import StockUpdateModal from '@/components/StockUpdateModal';
import { DashboardStats, Product, InventoryLog } from '@/types';
import { useToast } from '@/components/ToastContext';

interface Props {
  initialStats: DashboardStats;
}

export default function AdminDashboardClient({ initialStats }: Props) {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Reload dashboard stats
  const reloadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to refresh metrics');
      const updated: DashboardStats = await res.json();
      setStats(updated);
      showToast('Dashboard metrics updated to live database state!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error refreshing metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredLowStock = stats.low_stock_products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminNav />

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', flex: 1 }}>
        
        {/* Header Title + Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Inventory Control</span>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Executive Overview</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
              Warehouse Inventory Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={reloadStats}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </button>

            <a
              href="/admin/products"
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={15} />
              <span>Manage & Add Garments</span>
            </a>
          </div>
        </div>

        {/* 1. KEY KPI METRIC CARDS (6-Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          {/* Card 1: Total Products */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Products
              </span>
              <Boxes size={18} color="var(--text-secondary)" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {stats.total_products}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Across {stats.categories_count} Active Categories
            </span>
          </div>

          {/* Card 2: In Stock */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid #22C55E',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#166534', fontWeight: 700 }}>
                In Stock (&gt;10 units)
              </span>
              <CheckCircle2 size={18} color="#22C55E" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#166534', fontFamily: 'var(--font-serif)' }}>
              {stats.in_stock}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              {Math.round((stats.in_stock / (stats.total_products || 1)) * 100)}% of Catalog Ready
            </span>
          </div>

          {/* Card 3: Low Stock */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid #F59E0B',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B45309', fontWeight: 700 }}>
                Low Stock (1-10 units)
              </span>
              <AlertTriangle size={18} color="#F59E0B" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#B45309', fontFamily: 'var(--font-serif)' }}>
              {stats.low_stock}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Needs Restock Reorder
            </span>
          </div>

          {/* Card 4: Out of Stock */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid #EF4444',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#991B1B', fontWeight: 700 }}>
                Out of Stock (0 units)
              </span>
              <XCircle size={18} color="#EF4444" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#991B1B', fontFamily: 'var(--font-serif)' }}>
              {stats.out_of_stock}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Purchasing Paused
            </span>
          </div>

          {/* Card 5: Total Units in Warehouse */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Units In Stock
              </span>
              <PackageCheck size={18} color="var(--accent-primary)" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {stats.total_units}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Total Physical Pieces
            </span>
          </div>

          {/* Card 6: Total Inventory Value */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Inventory Asset Value
              </span>
              <TrendingUp size={18} color="var(--accent-primary)" />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {formatPrice(stats.total_inventory_value)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Based on Retail Value
            </span>
          </div>
        </div>

        {/* 2. TWO COLUMN WORKBENCH: Low-Stock Quick Restock Desk (Left) + Recent Audit Trail (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)', gap: '32px' }} className="admin-grid">
          
          {/* Left Column: Low-Stock & Out-of-Stock Immediate Action Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Critical Inventory Action Items
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Garments requiring restock or currently out of stock (Stock &le; 10 units)
                </p>
              </div>

              {/* Mini Search */}
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter alerts..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.785rem' }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Garment</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>SKU</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Stock</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLowStock.map((p) => {
                    const isZero = p.stock_quantity === 0;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={p.image_url}
                              alt={p.name}
                              style={{ width: '36px', height: '46px', objectFit: 'cover', borderRadius: '2px' }}
                            />
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category_name} &bull; {p.color}</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.785rem' }}>
                          {p.sku}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isZero ? '#991B1B' : '#B45309' }}>
                            {p.stock_quantity}
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          {isZero ? (
                            <span className="stock-badge out_of_stock">Out of Stock</span>
                          ) : (
                            <span className="stock-badge low_stock">Only {p.stock_quantity} Left</span>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedProductForStock(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '4px', fontSize: '0.75rem' }}
                          >
                            <RefreshCw size={12} />
                            <span>Update Stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLowStock.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No low-stock garments matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <a href="/admin/products" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                View All {stats.total_products} Inventory Products &rarr;
              </a>
            </div>
          </div>

          {/* Right Column: Real-Time Audit Trail Ledger */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Recent Stock Audit Trail
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Immutable database ledger of stock adjustments
                </p>
              </div>
              <History size={18} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.recent_logs.slice(0, 8).map((log) => {
                const isPositive = log.change_amount > 0;
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.product_name}</strong>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '2px',
                          backgroundColor: isPositive ? '#EBF7EE' : '#FEE2E2',
                          color: isPositive ? '#166534' : '#991B1B',
                        }}
                      >
                        {isPositive ? `+${log.change_amount}` : log.change_amount}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      <span>SKU: {log.sku} &bull; {log.previous_stock} &rarr; <strong>{log.new_stock} Units</strong></span>
                      <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Reason: {log.reason} ({log.updated_by})
                    </span>
                  </div>
                );
              })}

              {stats.recent_logs.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', textAlign: 'center', padding: '24px 0' }}>
                  No inventory logs registered yet.
                </p>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <a href="/admin/logs" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                View Full Audit History &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Stock Update Modal */}
      <StockUpdateModal
        product={selectedProductForStock}
        onClose={() => setSelectedProductForStock(null)}
        onUpdated={() => {
          reloadStats();
        }}
      />
    </div>
  );
}
