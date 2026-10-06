'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Inventory & Sizing Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received by our concierge!', 'success');
  };

  return (
    <div style={{ paddingBottom: '64px' }}>
      
      {/* Header */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '48px 0 40px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '780px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Client Care
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontFamily: 'var(--font-serif)', marginTop: '8px', marginBottom: '14px' }}>
            Atelier Concierge
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Have questions regarding garment sizing, custom restocking timelines, or inventory specifications? Our client services team is at your service.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="container" style={{ maxWidth: '1080px', paddingTop: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
          
          {/* Left: Contact Info & Warehouse Details */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
              Direct Inquiries
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
              We maintain direct communication lines with both retail clients and stock administrators.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <Mail size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Email Concierge</strong>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>concierge@threadly.com</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <Phone size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Customer Support Desk</strong>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>+91 98765 43210 (Mon–Fri, 9am–7pm IST)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <MapPin size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Central Fulfillment Facility</strong>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Threadly Atelier Distribution Hub, Cyber City, Phase 2, Gurugram, India</span>
                </div>
              </div>
            </div>

            {/* Admin quick callout */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>Store Administrator?</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                If you are a store manager looking to update physical warehouse stock or modify product parameters:
              </p>
              <a
                href="/admin/login"
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: '#171717',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span style={{ color: '#ffffff' }}>Access Inventory Management Portal</span>
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EBF7EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle2 size={30} color="#166534" />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                  Message Transmitted
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Thank you, <strong>{formData.name}</strong>. A dedicated wardrobe advisor has received your message and will respond within 4 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'Inventory & Sizing Inquiry', message: '' });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
                  Send An Inquiry
                </h3>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vivek Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vivek@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Subject Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field select-field"
                  >
                    <option value="Inventory & Sizing Inquiry">Inventory & Sizing Inquiry</option>
                    <option value="Restock Request for Out-of-Stock Item">Restock Request for Out-of-Stock Item</option>
                    <option value="Order & Dispatch Status">Order & Dispatch Status</option>
                    <option value="Material & Textile Consultation">Material & Textile Consultation</option>
                    <option value="Wholesale / Commercial Partnership">Wholesale / Commercial Partnership</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the garment SKU, size requirement, or inventory question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#171717',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <Send size={16} color="#ffffff" />
                  <span style={{ color: '#ffffff' }}>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
