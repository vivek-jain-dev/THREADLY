'use client';

import React, { useState } from 'react';
import { X, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Product } from '@/types';
import { useToast } from './ToastContext';

interface StockUpdateModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdated: (updatedProduct: Product) => void;
}

export default function StockUpdateModal({ product, onClose, onUpdated }: StockUpdateModalProps) {
  const { showToast } = useToast();
  const [stockValue, setStockValue] = useState<string>(
    product ? String(product.stock_quantity) : '0'
  );
  const [reason, setReason] = useState('Physical Warehouse Inventory Ingestion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const currentStock = product.stock_quantity;
  const newStockNum = parseInt(stockValue, 10);
  const stockDifference = isNaN(newStockNum) ? 0 : newStockNum - currentStock;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isNaN(newStockNum) || newStockNum < 0) {
      setError('Stock must be a non-negative integer (0 or greater).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: newStockNum,
          reason,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update stock');
      }

      showToast(
        `Stock for ${product.name} updated: ${currentStock} → ${newStockNum} units!`,
        'success'
      );
      onUpdated(resData.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating stock');
      showToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '520px', padding: '28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Real-Time Stock Adjustment
            </span>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
              Update Garment Inventory
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Product Snapshot */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            alignItems: 'center',
          }}
        >
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.875rem', display: 'block' }}>{product.name}</strong>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
              <span>SKU: <strong>{product.sku}</strong></span>
              <span>&bull;</span>
              <span>Current Stock: <strong>{currentStock} Units</strong></span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--status-out-stock-bg)',
              color: 'var(--status-out-stock-text)',
              border: '1px solid var(--status-out-stock-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* New Stock Input */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              New Verified Stock Quantity *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                min="0"
                step="1"
                required
                autoFocus
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="input-field"
                style={{ fontSize: '1.125rem', fontWeight: 700, padding: '10px 14px' }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setStockValue('0')}
                  style={{
                    padding: '0 12px',
                    backgroundColor: 'var(--status-out-stock-bg)',
                    color: 'var(--status-out-stock-text)',
                    border: '1px solid var(--status-out-stock-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Mark as Out of Stock"
                >
                  Set 0 (Out of Stock)
                </button>
                <button
                  type="button"
                  onClick={() => setStockValue(String(currentStock + 10))}
                  style={{
                    padding: '0 12px',
                    backgroundColor: 'var(--status-in-stock-bg)',
                    color: 'var(--status-in-stock-text)',
                    border: '1px solid var(--status-in-stock-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Restock +10"
                >
                  +10 Units
                </button>
              </div>
            </div>

            {/* Live Delta feedback */}
            <div style={{ marginTop: '8px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              {stockDifference > 0 ? (
                <span style={{ color: '#166534', fontWeight: 600 }}>
                  &uarr; Inventory Increase: +{stockDifference} units will be added
                </span>
              ) : stockDifference < 0 ? (
                <span style={{ color: '#991B1B', fontWeight: 600 }}>
                  &darr; Inventory Reduction: {stockDifference} units ({newStockNum === 0 ? 'Will be marked Out of Stock' : 'Reduced'})
                </span>
              ) : (
                <span>No quantity difference</span>
              )}
            </div>
          </div>

          {/* Audit Reason Select */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Reason For Adjustment (Logged to Audit Ledger)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field select-field"
            >
              <option value="Physical Warehouse Inventory Ingestion">Physical Warehouse Inventory Ingestion</option>
              <option value="Supplier Restock Shipment Arrival">Supplier Restock Shipment Arrival</option>
              <option value="Stock Audit Reconciliation">Stock Audit Reconciliation</option>
              <option value="Damaged / Defective Garment Write-off">Damaged / Defective Garment Write-off</option>
              <option value="Showroom Sample Allocation">Showroom Sample Allocation</option>
              <option value="Manual Reviewer Testing Adjustment">Manual Reviewer Testing Adjustment</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1.5, justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Committing...' : 'Commit Stock Update'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
