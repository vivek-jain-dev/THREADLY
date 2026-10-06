'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import StockUpdateModal from '@/components/StockUpdateModal';
import { Product, Category } from '@/types';
import { useToast } from '@/components/ToastContext';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminProductsClient({ initialProducts, categories }: Props) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');

  // Modals state
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [editProductModal, setEditProductModal] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category_id: categories[0]?.id || 1,
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 1999,
    discount_price: null,
    color: 'Black',
    color_hex: '#18181B',
    sizes: ['S', 'M', 'L', 'XL'],
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    stock_quantity: 10,
    description: '',
    material: '100% Organic Cotton',
    fit: 'Regular Fit',
    care_instructions: 'Machine wash cold',
    tags: ['new', 'essential'],
  });

  const reloadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      if (!res.ok) throw new Error('Failed to reload inventory');
      const json = await res.json();
      setProducts(json.products);
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      sku: `TH-NEW-${Math.floor(100 + Math.random() * 900)}`,
      category_id: categories[0]?.id || 1,
      gender: 'Unisex',
      brand: 'Threadly Studio',
      price: 1999,
      discount_price: null,
      color: 'Black',
      color_hex: '#18181B',
      sizes: ['S', 'M', 'L', 'XL'],
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      stock_quantity: 15,
      description: 'Handcrafted luxury essential made from premium long-staple organic cotton.',
      material: '100% Organic Combed Cotton (280 GSM)',
      fit: 'Relaxed Modern Cut',
      care_instructions: 'Machine wash cold inside out, dry flat in shade',
      tags: ['cotton', 'luxury', 'essential'],
    });
    setIsCreatingProduct(true);
  };

  const handleOpenEdit = (p: Product) => {
    setFormData({
      ...p,
    });
    setEditProductModal(p);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!editProductModal;
      const url = isEdit ? `/api/products/${editProductModal.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save product');

      showToast(
        isEdit
          ? `Product "${json.product.name}" updated successfully!`
          : `New product "${json.product.name}" created with ${json.product.stock_quantity} units!`,
        'success'
      );

      setIsCreatingProduct(false);
      setEditProductModal(null);
      await reloadProducts();
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${deleteCandidate.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete product');

      showToast(`Product #${deleteCandidate.id} (${deleteCandidate.name}) deleted.`, 'success');
      setDeleteCandidate(null);
      await reloadProducts();
    } catch (err: any) {
      showToast(err.message || 'Error deleting product', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter products locally for table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      p.category_name.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock =
      selectedStockFilter === 'all' ||
      (selectedStockFilter === 'in_stock' && p.stock_quantity > 10) ||
      (selectedStockFilter === 'low_stock' && p.stock_quantity > 0 && p.stock_quantity <= 10) ||
      (selectedStockFilter === 'out_of_stock' && p.stock_quantity === 0);

    return matchesSearch && matchesCat && matchesStock;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

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
            marginBottom: '28px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Inventory Control</span>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Product Catalogue & CRUD</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
              Garment Inventory Management
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={reloadProducts}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Table</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add New Garment</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, SKU, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field select-field"
              style={{ height: '38px', fontSize: '0.8125rem', minWidth: '150px' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Stock status filter */}
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="input-field select-field"
              style={{ height: '38px', fontSize: '0.8125rem', minWidth: '160px' }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt;10 units)</option>
              <option value="low_stock">Low Stock (1-10 units)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>

        {/* Product Inventory Table */}
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
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>SKU</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Stock</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock_quantity === 0;
                  const isLowStock = p.stock_quantity > 0 && p.stock_quantity <= 10;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      
                      {/* Product Image & Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: '42px', height: '54px', objectFit: 'cover', borderRadius: '3px' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{p.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                              <span>{p.gender}</span>
                              <span>&bull;</span>
                              <span>{p.color}</span>
                              <span>&bull;</span>
                              <span>{p.sizes.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {p.sku}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        {p.category_name}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px' }}>
                        {p.discount_price ? (
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {formatPrice(p.discount_price)}
                            </span>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '4px' }}>
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: isOutOfStock ? '#991B1B' : isLowStock ? '#B45309' : '#166534',
                          }}
                        >
                          {p.stock_quantity}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>units</span>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        {isOutOfStock ? (
                          <span className="stock-badge out_of_stock">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="stock-badge low_stock">Only {p.stock_quantity} Left</span>
                        ) : (
                          <span className="stock-badge in_stock">In Stock</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setStockModalProduct(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
                            title="Update Stock"
                          >
                            <RefreshCw size={13} />
                            <span>Stock</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
                            title="Edit Garment"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <a
                            href={`/products/${p.slug || p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 8px' }}
                            title="View PDP"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            onClick={() => setDeleteCandidate(p)}
                            style={{
                              padding: '6px 8px',
                              color: '#EF4444',
                              backgroundColor: 'transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                            title="Delete Garment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No garments match the current inventory query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Stock Update Modal */}
      <StockUpdateModal
        product={stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        onUpdated={() => {
          reloadProducts();
        }}
      />

      {/* Add / Edit Product Modal Form */}
      {(isCreatingProduct || editProductModal) && (
        <div className="modal-backdrop" onClick={() => { setIsCreatingProduct(false); setEditProductModal(null); }}>
          <div
            className="modal-card"
            style={{ maxWidth: '680px', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Garment Catalog Management
                </span>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
                  {editProductModal ? `Edit: ${editProductModal.name}` : 'Add New Garment to Inventory'}
                </h3>
              </div>
              <button onClick={() => { setIsCreatingProduct(false); setEditProductModal(null); }} className="btn-icon" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Oversized Heavyweight T-Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    SKU Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TH-TSH-009"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="input-field select-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="input-field select-field"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.discount_price || ''}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : null })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Color Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Charcoal"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Color Hex
                  </label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.color_hex || '#000000'}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      value={formData.color_hex || '#000000'}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Sizes (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL"
                    value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Material Fabrication
                  </label>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Fit & Silhouette
                  </label>
                  <input
                    type="text"
                    value={formData.fit || ''}
                    onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setIsCreatingProduct(false); setEditProductModal(null); }}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {loading ? 'Saving...' : editProductModal ? 'Update Garment' : 'Create & Ingest Stock'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="modal-card" style={{ maxWidth: '440px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Trash2 size={24} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Are you sure you want to permanently delete <strong>{deleteCandidate.name}</strong> (SKU: {deleteCandidate.sku})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteCandidate(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn"
                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#DC2626', color: '#FFFFFF' }}
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
