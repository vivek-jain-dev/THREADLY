# 🧵 THREADLY — Smart Clothing Product Discovery & Real-Time Inventory

> **A Production-Grade Modern Fashion-Commerce Platform & Deterministic Inventory Engine**  
> Built with Next.js 14, TypeScript, React 18, SQLite (`node:sqlite` DatabaseSync), and Pure CSS Design Tokens.

---

## 🌟 Executive Overview & Business Value

**THREADLY** is a high-precision clothing product discovery and fixed-stock inventory management platform designed with luxury editorial fashion commerce aesthetics. 

Unlike traditional e-commerce templates with mock data or client-only filters, THREADLY is engineered around a **deterministic, real-time database-backed inventory system**:
- **Fixed Physical Stock**: Stock quantities are real, verified warehouse units.
- **Instant Admin-to-Storefront Synchronization**: Changing stock in the Admin Panel from `12` to `7` or `0` immediately updates the customer storefront, PDPs, badges, and purchase availability without page caching lag.
- **Intelligent Out-of-Stock Handling**: When inventory reaches `0`, garments display a distinctive *"Out of Stock"* status and disable bag additions, while remaining fully searchable, filterable, and indexable.
- **Multi-Term Tokenized Search**: Supports complex compound queries (e.g., `"oversized black"`, `"men linen shirt"`, `"selvedge"`, `"charcoal"`) with whitespace and partial-match tolerance across 8 database fields.
- **Dynamic Multi-Criteria Filtering**: Category, Gender, Size, Color, Price Range, Availability, and Brand work together seamlessly with real-time facet counting and active removable filter chips.

---

## 🏛️ System Architecture

```
                                  ┌───────────────────────────┐
                                  │      Client Browser       │
                                  │  (React 18 / Next.js 14)  │
                                  └─────────────┬─────────────┘
                                                │
                          HTTP REST APIs (JSON) │ URL Query State Sync (?search=...&category=...)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NEXT.JS APP ROUTER                                      │
├────────────────────────────────┬───────────────────────────┬────────────────────────────┤
│       Customer Storefront      │        Admin Portal       │       REST API Routes      │
│  - / (Editorial Home Page)     │  - /admin/login           │  - GET  /api/products      │
│  - /shop (Discovery & Facets)  │  - /admin (Dashboard KPIs)│  - POST /api/products      │
│  - /products/[id] (PDP)        │  - /admin/products (CRUD) │  - PATCH /api/products/    │
│  - /about (Atelier Ethos)      │  - /admin/logs (Audits)   │          [id]/stock        │
│  - /contact (Concierge Form)   │                           │  - POST /api/auth/login    │
│                                │                           │  - GET  /api/categories    │
└────────────────────────────────┴─────────────┬─────────────┴────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REPOSITORY LAYER                                        │
│  - Multi-Term Token Search Engine   - Dynamic Facet Aggregator                          │
│  - Compound SQL Query Builder       - Inventory Audit Logger                            │
└──────────────────────────────────────────────┬──────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            SQLITE RELATIONAL DATABASE                                   │
│                      (High-Performance node:sqlite / WAL Mode)                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐  │
│  │   products   ├───┤  categories  │   │    users     │   │      inventory_logs      │  │
│  │ (33 Garments)│   │ (6 Capsule)  │   │(Admin Auth)  │   │(Chronological Audit Trail│  │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
d:/ROYAL-Tech/
├── data/
│   └── threadly.db                  # SQLite database file (WAL mode, indexed)
├── scripts/
│   ├── seed.js                      # Database seeder with 33 realistic luxury garments
│   └── test-backend.js              # Automated search, multi-filter & stock test suite
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/page.tsx       # Admin Authentication with 1-click Demo Fill
│   │   │   ├── logs/                # Real-Time Inventory Audit Trail Ledger
│   │   │   ├── products/            # Full Product Catalog CRUD & Inline Stock Manager
│   │   │   ├── AdminDashboardClient.tsx # Executive KPI Metrics & Low-Stock Action Desk
│   │   │   └── page.tsx             # Protected Admin Dashboard
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/       # KPI metrics API endpoint
│   │   │   │   └── inventory-logs/  # Paginated audit trail API
│   │   │   ├── auth/
│   │   │   │   ├── login/           # Secure JWT auth endpoint
│   │   │   │   ├── logout/          # Session destruction endpoint
│   │   │   │   └── me/              # Token verification endpoint
│   │   │   ├── categories/          # Category metadata with product counts
│   │   │   └── products/
│   │   │       ├── [id]/
│   │   │       │   ├── stock/       # Instant stock update & audit logging API
│   │   │       │   └── route.ts     # Single product GET / PUT / DELETE API
│   │   │       └── route.ts         # Products search, filter, sort & pagination API
│   │   ├── products/[id]/           # Product Details Page (PDP) with live stock warnings
│   │   ├── shop/                    # Product Discovery Page with multi-filters & facets
│   │   ├── about/                   # Atelier brand story & textile provenance
│   │   ├── contact/                 # Customer concierge & inquiry desk
│   │   ├── HomeFeaturedClient.tsx   # Landing page interactive garment showcase
│   │   ├── layout.tsx               # Root layout with ToastProvider & Header/Footer
│   │   └── page.tsx                 # High-end fashion landing page
│   ├── components/
│   │   ├── AdminNav.tsx             # Admin header and navigation tabs
│   │   ├── Footer.tsx               # Dark minimalist luxury footer
│   │   ├── Header.tsx               # Sticky header with quick-search modal & drawer
│   │   ├── ProductCard.tsx          # Reusable garment card with stock badges
│   │   ├── QuickViewModal.tsx       # Instant garment inspection modal
│   │   ├── StockUpdateModal.tsx     # Validated stock update dialog with audit reasons
│   │   └── ToastContext.tsx         # Global notification toast system
│   ├── lib/
│   │   ├── auth.ts                  # Password hashing (bcryptjs) & JWT signatures
│   │   ├── db.ts                    # SQLite database singleton & table initialization
│   │   └── products-repository.ts   # Core query engine, token search & multi-filtering
│   ├── styles/
│   │   └── globals.css              # Editorial fashion design tokens & animations
│   └── types/
│       ├── index.ts                 # TypeScript domain interfaces
│       └── sqlite.d.ts              # SQLite type declarations
├── .env.example                     # Environment variables template
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Project manifest & scripts
└── tsconfig.json                    # TypeScript strict compiler config
```

---

## 💎 Design System Tokens

The user interface follows modern luxury editorial aesthetics (reminiscent of SSENSE, COS, and A.P.C.):
- **Palette**: Warm Off-White (`#FAFAF8`), Structured Bone (`#F2F1ED`), Deep Charcoal (`#171717`), Jet Black (`#121212`), and Warm Terracotta / Bronze Accent (`#8C4A2F`).
- **Typography**: Dual-font hierarchy pairing *Playfair Display* (Editorial headings) with *Plus Jakarta Sans* (Legible technical metadata).
- **Stock Badges**:
  - `In Stock` (>10 units): Forest green `#166534` badge on `#EBF7EE` background with pulsing green dot.
  - `Low Stock` (1–10 units): Amber `#92400E` badge on `#FEF3C7` background.
  - `Out of Stock` (0 units): Crimson `#991B1B` badge on `#FEE2E2` background.

---

## ⚡ Fast & Accurate Product Search Engine

Search is implemented in `src/lib/products-repository.ts` with multi-term tokenization:
- **Case-Insensitive & Whitespace Tolerant**: Splits user input into individual keywords.
- **Cross-Field Token Matching**: Queries `name`, `description`, `category_name`, `brand`, `sku`, `color`, `gender`, and `tags` simultaneously.
- **Compound Narrowing**: Searching `"oversized black"` finds items matching both *oversized* and *black*.
- **Debounced Input & URL Sync**: Automatically debounces user keystrokes (350ms) and synchronizes `/shop?search=shirt` for shareable bookmarking.

---

## 🎛️ Multi-Criteria Filtering & Facets

All filters operate conjunctively (satisfying ALL active constraints) without unnecessary full-page reloads:
1. **Category**: T-Shirts, Shirts, Jeans, Jackets, Hoodies, Trousers (with matching item counts).
2. **Gender**: Men, Women, Unisex.
3. **Sizes**: XS, S, M, L, XL, XXL, 28, 30, 32, 34, 36.
4. **Colors**: Visual color swatches with matching counts (Black, White, Blue, Beige, Green, Charcoal, Navy).
5. **Price Range**: Interactive slider + numeric minimum/maximum inputs (₹500 — ₹10,000).
6. **Availability**: *All*, *In Stock (>10 units)*, *Low Stock (1–10 units)*, *Out of Stock (0 units)*.
7. **Sorting**: Featured, Newest, Price: Low to High, Price: High to Low, Name: A–Z, Name: Z–A, Stock: Available First.
8. **Active Filter Chips**: Removable chips (`Men ✕`, `Shirts ✕`, `Black ✕`, `Size L ✕`) with 1-click **Clear All Filters**.

---

## 🔐 Admin Portal & Inventory Operations

- **Admin Login (`/admin/login`)**:
  - **Demo Email**: `admin@threadly.com`
  - **Demo Password**: `admin123456`
  - Includes a **"Fill Demo" button** for 1-click test evaluations!
- **Executive Dashboard (`/admin`)**:
  - 6 Real-time KPI Cards: Total Products, In Stock, Low Stock, Out of Stock, Total Units, Total Inventory Valuation.
  - **Low Stock Action Desk**: Identifies items needing replenishment with 1-click stock update.
  - **Live Audit Trail**: Chronological log of previous stock, new stock, author, and reason.
- **Catalog Management (`/admin/products`)**:
  - Searchable & filterable inventory table.
  - Add New Garment modal with validation.
  - Edit Garment modal.
  - Quick Stock Update modal (prevents negative values, rejects non-integers, provides live deltas).
  - Delete Garment modal with double confirmation.

---

## 🚀 Quick Setup & Local Execution

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` or `v24+`
- npm `v9+` or `v10+` or `v11+`

### 2. Installation
```bash
# Clone or navigate to the directory
cd d:/ROYAL-Tech

# Install dependencies
npm install
```

### 3. Seed Database
```bash
# Populate 33 realistic luxury garments, 6 categories, and default admin
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🧪 Rigorous Quality Assurance Verification

| Test Case | Procedure | Expected & Verified Outcome | Status |
|---|---|---|:---:|
| **Search "shirt"** | Enter "shirt" into search bar | Returns classic shirts, linen camp shirts, overshirts | ✅ PASS |
| **Search "black shirt"** | Enter "black shirt" | Intelligently matches black poplin shirt and dark button-downs | ✅ PASS |
| **Search "oversized black"** | Enter "oversized black" | Returns Classic Oversized Heavyweight T-Shirt | ✅ PASS |
| **Search invalid string** | Enter "xyz12345nonexistent" | Displays sleek empty state with Reset Filters CTA | ✅ PASS |
| **Filter by Category** | Select "Jeans" | Displays Japanese selvedge denim, wide-leg ecru, faded black | ✅ PASS |
| **Filter by Availability** | Select "Out of Stock" | Displays 7 sold-out garments with disabled purchase actions | ✅ PASS |
| **Combined Multi-Filter** | Men + Shirts + In Stock | Displays exact matching products satisfying all 3 rules | ✅ PASS |
| **Admin Login** | Login with `admin@threadly.com` / `admin123456` | Issues secure JWT, redirects to `/admin` dashboard | ✅ PASS |
| **Stock Update: 12 → 0** | Set Classic Oversized Tee stock to 0 in admin | Customer PDP immediately displays "Out of Stock" & disables bag button | ✅ PASS |
| **Stock Restock: 0 → 25** | Set stock back to 25 with reason "Supplier Restock" | Customer PDP restores "In Stock (25 Units)" & re-enables purchasing | ✅ PASS |
| **Audit Ledger Verification** | Inspect `/admin/logs` | Displays timestamped audit entry with author and reason | ✅ PASS |
| **Add New Product** | Submit new garment form in Admin | Immediately visible on customer storefront & searchable | ✅ PASS |
| **Responsive Drawer** | Test on mobile viewport (<768px) | Filter sheet slides out smoothly with instant results count | ✅ PASS |

---

## 🛡️ Security & Performance Best Practices

- **SQL Injection Prevention**: All queries use parameterized statements (`stmt.all(? , ?)`).
- **Password Protection**: Passwords salted and hashed with `bcryptjs`.
- **JWT Protection**: Protected routes verify signed JWT tokens in HTTP-only cookies and Authorization headers.
- **Server-Side Validation**: Product inputs and stock updates strictly validated on the server.
- **Database Indexing**: Indexes on `sku`, `category_id`, `gender`, `color`, `price`, `stock_quantity`, and `name`.
- **Zero Placeholder Images**: High-resolution Unsplash fashion photography with aspect-ratio containers.

---

## 📄 License & Attribution

Developed for hiring assessment & portfolio presentation.  
© 2026 **THREADLY ATELIER**. All rights reserved.
