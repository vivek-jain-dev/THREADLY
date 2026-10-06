'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { History, RefreshCw, ArrowLeft, Search, Filter } from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import { InventoryLog } from '@/types';
import { useToast } from '@/components/ToastContext';

interface Props {
  initialLogs: InventoryLog[];
  initialTotal: number;
}

export default function AdminLogsClient({ initialLogs, initialTotal }: Props) {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<InventoryLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const reloadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory-logs?limit=100');
      if (!res.ok) throw new Error('Failed to refresh logs');
      const json = await res.json();
      setLogs(json.logs);
      showToast('Inventory audit ledger refreshed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error reloading logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.product_name.toLowerCase().includes(search.toLowerCase()) ||
    log.sku.toLowerCase().includes(search.toLowerCase()) ||
    log.reason.toLowerCase().includes(search.toLowerCase()) ||
    log.updated_by.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminNav />

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', flex: 1 }}>
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Inventory Control</span>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Audit Ledger</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
              Physical Stock Audit Trail
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Complete chronological ledger of all stock quantity increases, reductions, and adjustments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={reloadLogs}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search audit trail by SKU, garment, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.84rem' }}
            />
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {filteredLogs.length} of {logs.length} Recorded Adjustments
          </span>
        </div>

        {/* Logs Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-subtle)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Garment Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>SKU</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Previous Stock</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>New Stock</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Change</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Audit Reason</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Author</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isPositive = log.change_amount > 0;
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{log.product_name}</strong>
                      </td>

                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {log.sku}
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {log.previous_stock} units
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {log.new_stock} units
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '0.785rem',
                            backgroundColor: isPositive ? '#EBF7EE' : '#FEE2E2',
                            color: isPositive ? '#166534' : '#991B1B',
                          }}
                        >
                          {isPositive ? `+${log.change_amount}` : log.change_amount}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {log.reason}
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.785rem' }}>
                        {log.updated_by}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No audit events match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
