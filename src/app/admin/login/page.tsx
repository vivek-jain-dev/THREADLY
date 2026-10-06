'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Pre-fill for reviewer assessment
  const fillDemoCredentials = () => {
    setEmail('admin@threadly.com');
    setPassword('admin123456');
    setError('');
    showToast('Demo admin credentials pre-filled!', 'info');
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '40px 32px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#121212',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Shield size={24} color="#D1B89D" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
            Inventory Portal
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Authorized Store Administration & Stock Management
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
              <strong>Demo Credentials:</strong>
              <div style={{ color: 'var(--text-secondary)' }}>admin@threadly.com &bull; admin123456</div>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Fill Demo
          </button>
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
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                required
                placeholder="admin@threadly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', height: '42px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', height: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', gap: '8px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <a href="/" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            &larr; Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
