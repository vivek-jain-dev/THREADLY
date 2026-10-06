const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'threadly.db');
const db = new DatabaseSync(dbPath);

console.log('Initializing database tables with node:sqlite...');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    category_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    discount_price REAL,
    color TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    sizes TEXT NOT NULL,
    image_url TEXT NOT NULL,
    gallery_images TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_stock',
    material TEXT,
    fit TEXT,
    care_instructions TEXT,
    tags TEXT,
    rating REAL DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_new_arrival INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS inventory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
  CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
  CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
  CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
  CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
`);

console.log('Clearing existing records for fresh seed...');
db.exec('DELETE FROM inventory_logs;');
db.exec('DELETE FROM products;');
db.exec('DELETE FROM categories;');
db.exec('DELETE FROM users;');
try {
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('products', 'categories', 'users', 'inventory_logs');");
} catch {
  // ignore if sqlite_sequence not initialized
}

// Seed Admin User
console.log('Seeding admin user...');
const adminSalt = bcrypt.genSaltSync(10);
const adminPasswordHash = bcrypt.hashSync('admin123456', adminSalt);

const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name, role)
  VALUES (?, ?, ?, ?)
`);
insertUser.run('admin@threadly.com', adminPasswordHash, 'Vivek Sharma (Store Director)', 'admin');

// Seed Categories
console.log('Seeding categories...');
const categories = [
  {
    id: 1,
    slug: 't-shirts',
    name: 'T-Shirts',
    description: 'Heavyweight organic cotton, boxy cuts, and refined everyday minimalist tees.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    display_order: 1
  },
  {
    id: 2,
    slug: 'shirts',
    name: 'Shirts',
    description: 'Bespoke poplin, structured linen, and tailored casual button-downs.',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    display_order: 2
  },
  {
    id: 3,
    slug: 'jeans',
    name: 'Jeans',
    description: 'Japanese selvedge denim, relaxed straight cuts, and vintage washed fits.',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    display_order: 3
  },
  {
    id: 4,
    slug: 'jackets',
    name: 'Jackets',
    description: 'Structured overcoats, utility blousons, and tailored wool outerwear.',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    display_order: 4
  },
  {
    id: 5,
    slug: 'hoodies',
    name: 'Hoodies',
    description: 'French terry fleece, double-layered hoods, and ergonomic streetwear silhouettes.',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    display_order: 5
  },
  {
    id: 6,
    slug: 'trousers',
    name: 'Trousers',
    description: 'Pleated wide-leg trousers, relaxed chinos, and tailored wool trousers.',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    display_order: 6
  }
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, slug, name, description, image_url, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

categories.forEach(cat => insertCategory.run(cat.id, cat.slug, cat.name, cat.description, cat.image_url, cat.display_order));

// Calculate status helper
function calculateStatus(stock) {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'in_stock';
}

console.log('Seeding 36 realistic luxury fashion products...');
const products = [
  // --- T-SHIRTS (Category 1) ---
  {
    sku: 'TH-TSH-001',
    name: 'Classic Oversized Heavyweight T-Shirt',
    slug: 'classic-oversized-heavyweight-t-shirt',
    description: 'Crafted from 280 GSM combed organic cotton with a dropped shoulder and structured ribbed collar. Retains a pristine boxy silhouette wash after wash.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 1499,
    discount_price: 1199,
    color: 'Black',
    color_hex: '#18181B',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 12,
    material: '100% Organic Combed Cotton (280 GSM)',
    fit: 'Oversized Boxy Fit',
    care_instructions: 'Machine wash cold inside out, dry flat in shade',
    tags: JSON.stringify(['t-shirt', 'oversized', 'black', 'cotton', 'heavyweight', 'streetwear', 'unisex']),
    rating: 4.8,
    reviews_count: 42,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TSH-002',
    name: 'Raw Edge Minimalist Off-White Tee',
    slug: 'raw-edge-minimalist-off-white-tee',
    description: 'An understated luxury essential featuring raw-edge hemlines and a breathable slub texture. Perfect for effortless layering or clean standalone wear.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Men',
    brand: 'Threadly Studio',
    price: 1299,
    discount_price: null,
    color: 'White',
    color_hex: '#F4F4F5',
    sizes: JSON.stringify(['M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 4, // Low stock
    material: '100% Pima Cotton (200 GSM)',
    fit: 'Regular Tailored Fit',
    care_instructions: 'Gentle cycle cold, iron low',
    tags: JSON.stringify(['t-shirt', 'white', 'raw-edge', 'minimalist', 'summer', 'men']),
    rating: 4.6,
    reviews_count: 19,
    is_featured: 1,
    is_new_arrival: 0
  },
  {
    sku: 'TH-TSH-003',
    name: 'Washed Charcoal Vintage Crewneck Tee',
    slug: 'washed-charcoal-vintage-crewneck-tee',
    description: 'Pigment-dyed and mineral-washed for an authentic lived-in vintage patina with subtle distressing along the ribbing.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 1650,
    discount_price: 1399,
    color: 'Charcoal',
    color_hex: '#374151',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '100% Ring-Spun Cotton',
    fit: 'Relaxed Fit',
    care_instructions: 'Wash with similar dark colors',
    tags: JSON.stringify(['t-shirt', 'charcoal', 'vintage', 'mineral-wash', 'men']),
    rating: 4.9,
    reviews_count: 58,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TSH-004',
    name: 'Sculpted Ribbed Cropped Tee',
    slug: 'sculpted-ribbed-cropped-tee',
    description: 'Form-fitting wide-rib knit with comfortable stretch recovery, mock neck trim, and a contemporary mid-waist cut.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 1199,
    discount_price: 999,
    color: 'Beige',
    color_hex: '#D1B89D',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 18,
    material: '95% Modal, 5% Elastane',
    fit: 'Sculpted Slim Fit',
    care_instructions: 'Hand wash cold or gentle machine wash',
    tags: JSON.stringify(['t-shirt', 'cropped', 'ribbed', 'beige', 'women', 'casual']),
    rating: 4.7,
    reviews_count: 31,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TSH-005',
    name: 'Forest Green Heavyweight Graphic Tee',
    slug: 'forest-green-heavyweight-graphic-tee',
    description: 'Features subtle archival typographic screenprint on high-density combed jersey with double-needle hems.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 1599,
    discount_price: null,
    color: 'Green',
    color_hex: '#1E3A2F',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 7, // Low stock
    material: '100% Organic Cotton (260 GSM)',
    fit: 'Boxy Relaxed',
    care_instructions: 'Wash inside out to protect print',
    tags: JSON.stringify(['t-shirt', 'green', 'forest', 'graphic', 'unisex', 'cotton']),
    rating: 4.5,
    reviews_count: 14,
    is_featured: 0,
    is_new_arrival: 0
  },
  {
    sku: 'TH-TSH-006',
    name: 'Silk-Blend Drape Tee',
    slug: 'silk-blend-drape-tee',
    description: 'An elevated basic combining smooth mulberry silk with breathable jersey for a luminous drape and featherlight touch.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 2199,
    discount_price: 1899,
    color: 'Navy',
    color_hex: '#1E293B',
    sizes: JSON.stringify(['XS', 'S', 'M']),
    image_url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 3, // Low stock
    material: '70% Modal, 30% Mulberry Silk',
    fit: 'Relaxed Fluid Fit',
    care_instructions: 'Dry clean or cold delicate hand wash',
    tags: JSON.stringify(['t-shirt', 'silk', 'navy', 'luxury', 'women']),
    rating: 4.9,
    reviews_count: 27,
    is_featured: 0,
    is_new_arrival: 1
  },

  // --- SHIRTS (Category 2) ---
  {
    sku: 'TH-SHR-001',
    name: 'Relaxed Linen Camp Collar Shirt',
    slug: 'relaxed-linen-camp-collar-shirt',
    description: 'Woven from 100% French Normandy flax linen with natural mother-of-pearl buttons and a laid-back Cuban collar.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 2899,
    discount_price: 2499,
    color: 'Beige',
    color_hex: '#E2D4C3',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 15,
    material: '100% French Normandy Linen',
    fit: 'Relaxed Boxy Fit',
    care_instructions: 'Machine wash delicate cold, air dry',
    tags: JSON.stringify(['shirt', 'linen', 'camp collar', 'beige', 'summer', 'men', 'vacation']),
    rating: 4.9,
    reviews_count: 53,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-SHR-002',
    name: 'Crisp Poplin Oversized Button-Down',
    slug: 'crisp-poplin-oversized-button-down',
    description: 'High-thread-count 120s 2-ply cotton poplin tailored with an elongated curved hem, French seams, and clean hidden placket.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 3199,
    discount_price: null,
    color: 'White',
    color_hex: '#FFFFFF',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 8, // Low stock
    material: '100% Long-Staple Egyptian Cotton',
    fit: 'Oversized Boyfriend Fit',
    care_instructions: 'Warm iron, gentle wash',
    tags: JSON.stringify(['shirt', 'white', 'poplin', 'oversized', 'button-down', 'women', 'office']),
    rating: 4.7,
    reviews_count: 22,
    is_featured: 1,
    is_new_arrival: 0
  },
  {
    sku: 'TH-SHR-003',
    name: 'Structured Japanese Denim Overshirt',
    slug: 'structured-japanese-denim-overshirt',
    description: '10.5oz rinsed denim shacket with matte gunmetal snap closures, dual chest patch pockets, and reinforced flat-felled seams.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Men',
    brand: 'Threadly Denim Co.',
    price: 3699,
    discount_price: 3199,
    color: 'Blue',
    color_hex: '#2563EB',
    sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
    image_url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 2, // Very low stock
    material: '100% Kurabo Mills Selvedge Denim',
    fit: 'Straight Overshirt Fit',
    care_instructions: 'Wash cold inside out, do not tumble dry',
    tags: JSON.stringify(['shirt', 'overshirt', 'denim', 'blue', 'jacket', 'men']),
    rating: 4.8,
    reviews_count: 36,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    sku: 'TH-SHR-004',
    name: 'Minimalist Oxford Cotton Shirt',
    slug: 'minimalist-oxford-cotton-shirt',
    description: 'A contemporary update to the ivy staple in premium basketweave Oxford cloth with a soft rolled button-down collar.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 2499,
    discount_price: 1999,
    color: 'Blue',
    color_hex: '#93C5FD',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '100% Combed Oxford Cotton',
    fit: 'Modern Regular Fit',
    care_instructions: 'Machine wash warm, medium iron',
    tags: JSON.stringify(['shirt', 'oxford', 'blue', 'smart-casual', 'men', 'classic']),
    rating: 4.6,
    reviews_count: 48,
    is_featured: 0,
    is_new_arrival: 0
  },
  {
    sku: 'TH-SHR-005',
    name: 'Silk Touch Camp Shirt in Olive',
    slug: 'silk-touch-camp-shirt-olive',
    description: 'Fluid cupro-viscose blend that drapes effortlessly across the shoulders with a subtle iridescent sheen and notched collar.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 2799,
    discount_price: null,
    color: 'Green',
    color_hex: '#4D5D53',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 21,
    material: '60% Cupro, 40% Viscose',
    fit: 'Fluid Relaxed Fit',
    care_instructions: 'Delicate cold cycle, cool iron',
    tags: JSON.stringify(['shirt', 'olive', 'green', 'camp', 'cupro', 'unisex', 'resort']),
    rating: 4.9,
    reviews_count: 15,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-SHR-006',
    name: 'Tailored Black Poplin Formal Shirt',
    slug: 'tailored-black-poplin-formal-shirt',
    description: 'Sleek architectural lines with knife pleats, stiffened point collar, and concealed placket designed for black-tie tailoring.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 3499,
    discount_price: 2999,
    color: 'Black',
    color_hex: '#111827',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 11,
    material: '100% Giza Cotton',
    fit: 'Slim Tailored Fit',
    care_instructions: 'Professional dry clean recommended',
    tags: JSON.stringify(['shirt', 'black', 'formal', 'evening', 'poplin', 'men']),
    rating: 4.8,
    reviews_count: 29,
    is_featured: 0,
    is_new_arrival: 0
  },

  // --- JEANS (Category 3) ---
  {
    sku: 'TH-JNS-001',
    name: 'Raw Indigo Selvedge Straight Jeans',
    slug: 'raw-indigo-selvedge-straight-jeans',
    description: 'Unwashed 14.5oz Japanese red-line selvedge denim that breaks in uniquely over time. Finished with copper rivets and chain-stitched hems.',
    category_id: 3,
    category_name: 'Jeans',
    gender: 'Men',
    brand: 'Threadly Denim Co.',
    price: 4999,
    discount_price: 4299,
    color: 'Blue',
    color_hex: '#1E3A8A',
    sizes: JSON.stringify(['30', '32', '34', '36']),
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 9, // Low stock
    material: '100% Organic Selvedge Cotton (14.5oz)',
    fit: 'Mid-Rise Straight Leg',
    care_instructions: 'Wash sparingly inside out with cold water',
    tags: JSON.stringify(['jeans', 'denim', 'selvedge', 'indigo', 'blue', 'men', 'raw']),
    rating: 4.9,
    reviews_count: 67,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-JNS-002',
    name: 'High-Rise Wide-Leg Ecru Denim',
    slug: 'high-rise-wide-leg-ecru-denim',
    description: 'Natural undyed ecru denim with subtle cotton seed specks. Flattering high-rise waist with a voluminous architectural wide leg.',
    category_id: 3,
    category_name: 'Jeans',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 4299,
    discount_price: null,
    color: 'White',
    color_hex: '#FDFBF7',
    sizes: JSON.stringify(['26', '28', '30', '32']),
    image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 14,
    material: '100% Organic Cotton Denim',
    fit: 'High-Rise Wide Leg',
    care_instructions: 'Machine wash cold inside out',
    tags: JSON.stringify(['jeans', 'ecru', 'white', 'wide-leg', 'women', 'minimalist']),
    rating: 4.8,
    reviews_count: 34,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-JNS-003',
    name: 'Faded Black Relaxed Tapered Jeans',
    slug: 'faded-black-relaxed-tapered-jeans',
    description: 'Enzyme-washed black denim with subtle whiskering and knee abrasion for effortless vintage street-style drape.',
    category_id: 3,
    category_name: 'Jeans',
    gender: 'Men',
    brand: 'Threadly Denim Co.',
    price: 3799,
    discount_price: 3199,
    color: 'Black',
    color_hex: '#27272A',
    sizes: JSON.stringify(['30', '32', '34', '36']),
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '99% Cotton, 1% Elastane',
    fit: 'Relaxed Tapered Leg',
    care_instructions: 'Cold wash, line dry',
    tags: JSON.stringify(['jeans', 'black', 'faded', 'tapered', 'men', 'streetwear']),
    rating: 4.6,
    reviews_count: 41,
    is_featured: 0,
    is_new_arrival: 0
  },
  {
    sku: 'TH-JNS-004',
    name: 'Vintage Wash 90s Loose Jeans',
    slug: 'vintage-wash-90s-loose-jeans',
    description: 'Mid-blue stonewashed heavy denim engineered with extra room through the thigh and seat, channeling archival 90s aesthetics.',
    category_id: 3,
    category_name: 'Jeans',
    gender: 'Unisex',
    brand: 'Threadly Denim Co.',
    price: 3999,
    discount_price: 3499,
    color: 'Blue',
    color_hex: '#3B82F6',
    sizes: JSON.stringify(['28', '30', '32', '34', '36']),
    image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 6, // Low stock
    material: '100% Rigid Cotton Denim (13oz)',
    fit: 'Loose Baggy Cut',
    care_instructions: 'Machine wash cold, tumble dry low',
    tags: JSON.stringify(['jeans', '90s', 'vintage', 'loose', 'baggy', 'blue', 'unisex']),
    rating: 4.7,
    reviews_count: 52,
    is_featured: 0,
    is_new_arrival: 1
  },

  // --- JACKETS (Category 4) ---
  {
    sku: 'TH-JKT-001',
    name: 'Double-Breasted Wool Atelier Overcoat',
    slug: 'double-breasted-wool-atelier-overcoat',
    description: 'Heavyweight Italian melton wool overcoat featuring peak lapels, horn buttons, deep flap pockets, and a full cupro interior lining.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 8999,
    discount_price: 7499,
    color: 'Black',
    color_hex: '#0F172A',
    sizes: JSON.stringify(['M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 5, // Low stock
    material: '80% Virgin Wool, 20% Cashmere',
    fit: 'Tailored Structured Overcoat',
    care_instructions: 'Specialist dry clean only',
    tags: JSON.stringify(['jacket', 'coat', 'overcoat', 'wool', 'cashmere', 'black', 'winter', 'luxury', 'men']),
    rating: 5.0,
    reviews_count: 24,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-JKT-002',
    name: 'Minimalist Camel Trench Coat',
    slug: 'minimalist-camel-trench-coat',
    description: 'Water-repellent bonded cotton twill with an oversized storm flap, raglan shoulders, and a self-tie waist belt for dramatic drape.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 7499,
    discount_price: null,
    color: 'Brown',
    color_hex: '#C29B75',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 16,
    material: '100% Water-Resistant Cotton Gabardine',
    fit: 'Fluid Longline Fit',
    care_instructions: 'Dry clean only',
    tags: JSON.stringify(['jacket', 'trench', 'camel', 'brown', 'autumn', 'women', 'outerwear']),
    rating: 4.9,
    reviews_count: 38,
    is_featured: 1,
    is_new_arrival: 0
  },
  {
    sku: 'TH-JKT-003',
    name: 'Tech Nylon Puffer Jacket',
    slug: 'tech-nylon-puffer-jacket',
    description: 'Ultralight matte ripstop nylon insulated with 700-fill-power ethical down. Features waterproof YKK Aquaguard zips and bungee hem cords.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 6499,
    discount_price: 5299,
    color: 'Green',
    color_hex: '#2D3A2F',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '100% Recycled Ripstop Nylon, 90/10 Down Fill',
    fit: 'Boxy Puffer',
    care_instructions: 'Machine wash cold with tennis balls, tumble dry low',
    tags: JSON.stringify(['jacket', 'puffer', 'down', 'green', 'winter', 'techwear', 'unisex']),
    rating: 4.8,
    reviews_count: 45,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    sku: 'TH-JKT-004',
    name: 'Lambskin Leather Biker Jacket',
    slug: 'lambskin-leather-biker-jacket',
    description: 'Supple full-grain lambskin leather with polished silver hardware, asymmetric front zip, and quilted satin interior.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Women',
    brand: 'Atelier Threadly',
    price: 9999,
    discount_price: 8499,
    color: 'Black',
    color_hex: '#111827',
    sizes: JSON.stringify(['XS', 'S', 'M']),
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 3, // Low stock
    material: '100% Genuine Lambskin Leather',
    fit: 'Cropped Slim Fit',
    care_instructions: 'Specialist leather clean only',
    tags: JSON.stringify(['jacket', 'leather', 'biker', 'black', 'luxury', 'women']),
    rating: 4.9,
    reviews_count: 31,
    is_featured: 1,
    is_new_arrival: 0
  },
  {
    sku: 'TH-JKT-005',
    name: 'Wool Harrington Zip Blouson',
    slug: 'wool-harrington-zip-blouson',
    description: 'Refined blouson jacket with two-way RiRi zipper, stand collar with throat latch, and elasticated hem inserts.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 5499,
    discount_price: null,
    color: 'Charcoal',
    color_hex: '#334155',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 13,
    material: '75% Wool, 25% Polyamide',
    fit: 'Relaxed Blouson Fit',
    care_instructions: 'Dry clean only',
    tags: JSON.stringify(['jacket', 'harrington', 'blouson', 'charcoal', 'wool', 'men']),
    rating: 4.7,
    reviews_count: 17,
    is_featured: 0,
    is_new_arrival: 1
  },

  // --- HOODIES (Category 5) ---
  {
    sku: 'TH-HD-001',
    name: 'Heavyweight Loopback Fleece Hoodie',
    slug: 'heavyweight-loopback-fleece-hoodie',
    description: 'Constructed from 480 GSM unbrushed loopback cotton fleece. Features double-rib side gussets and a substantial cross-over neckline without drawstrings.',
    category_id: 5,
    category_name: 'Hoodies',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 3299,
    discount_price: 2799,
    color: 'Charcoal',
    color_hex: '#27272A',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 19,
    material: '100% Organic Heavy Loopback Fleece (480 GSM)',
    fit: 'Relaxed Streetwear Silhouette',
    care_instructions: 'Machine wash cold inside out, dry flat',
    tags: JSON.stringify(['hoodie', 'charcoal', 'black', 'fleece', 'heavyweight', 'streetwear', 'unisex']),
    rating: 4.9,
    reviews_count: 73,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-HD-002',
    name: 'Oatmeal Heather Cashmere-Blend Hoodie',
    slug: 'oatmeal-heather-cashmere-blend-hoodie',
    description: 'Incomparably soft knit hoodie combining Mongolian cashmere with organic combed cotton for ultra-luxurious downtime warmth.',
    category_id: 5,
    category_name: 'Hoodies',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 4599,
    discount_price: 3899,
    color: 'Beige',
    color_hex: '#E7DFD5',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 4, // Low stock
    material: '85% Organic Cotton, 15% Pure Cashmere',
    fit: 'Relaxed Dropped Shoulder',
    care_instructions: 'Hand wash cold with wool detergent, reshape and dry flat',
    tags: JSON.stringify(['hoodie', 'cashmere', 'beige', 'oatmeal', 'knitwear', 'luxury', 'women']),
    rating: 5.0,
    reviews_count: 42,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-HD-003',
    name: 'Midnight Black Quarter-Zip Pullover',
    slug: 'midnight-black-quarter-zip-pullover',
    description: 'Elevated sport-luxe hoodie featuring an oxidized metal quarter zip, funnel collar, and discreet kangaroo pouch pockets.',
    category_id: 5,
    category_name: 'Hoodies',
    gender: 'Men',
    brand: 'Threadly Studio',
    price: 2999,
    discount_price: null,
    color: 'Black',
    color_hex: '#18181B',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '100% French Terry Cotton (400 GSM)',
    fit: 'Modern Regular',
    care_instructions: 'Machine wash cold',
    tags: JSON.stringify(['hoodie', 'quarter-zip', 'black', 'pullover', 'men', 'sport-luxe']),
    rating: 4.7,
    reviews_count: 28,
    is_featured: 0,
    is_new_arrival: 0
  },
  {
    sku: 'TH-HD-004',
    name: 'Earth Clay Sun-Faded Pullover Hoodie',
    slug: 'earth-clay-sun-faded-pullover-hoodie',
    description: 'Custom pigment dyed in warm terracotta clay and treated with sun-bleaching washes for nuanced chromatic depth.',
    category_id: 5,
    category_name: 'Hoodies',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 3499,
    discount_price: 2999,
    color: 'Brown',
    color_hex: '#9A5B42',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 8, // Low stock
    material: '100% Ring-Spun Cotton Fleece (420 GSM)',
    fit: 'Boxy Relaxed',
    care_instructions: 'Wash inside out with cold water',
    tags: JSON.stringify(['hoodie', 'clay', 'terracotta', 'brown', 'sun-faded', 'unisex']),
    rating: 4.8,
    reviews_count: 33,
    is_featured: 0,
    is_new_arrival: 1
  },

  // --- TROUSERS (Category 6) ---
  {
    sku: 'TH-TRS-001',
    name: 'Double-Pleated Wide Wool Trousers',
    slug: 'double-pleated-wide-wool-trousers',
    description: 'Impeccably tailored wide trousers in high-twist tropical wool with sharp front knife pleats, side adjusters, and blind hems.',
    category_id: 6,
    category_name: 'Trousers',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 4499,
    discount_price: 3999,
    color: 'Charcoal',
    color_hex: '#374151',
    sizes: JSON.stringify(['30', '32', '34', '36']),
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 10, // Low stock boundary
    material: '100% Super 120s Tropical Wool',
    fit: 'High-Rise Relaxed Wide Leg',
    care_instructions: 'Dry clean only',
    tags: JSON.stringify(['trousers', 'pleated', 'charcoal', 'wool', 'tailoring', 'men', 'formal']),
    rating: 4.9,
    reviews_count: 39,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TRS-002',
    name: 'Tailored Linen-Cotton Chinos',
    slug: 'tailored-linen-cotton-chinos',
    description: 'Breezy blend of Mediterranean linen and soft cotton tailored with an elasticated rear waistband and clean tailored front.',
    category_id: 6,
    category_name: 'Trousers',
    gender: 'Men',
    brand: 'Threadly Studio',
    price: 3299,
    discount_price: 2699,
    color: 'Beige',
    color_hex: '#D6C7B2',
    sizes: JSON.stringify(['30', '32', '34', '36']),
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 17,
    material: '55% Linen, 45% Cotton',
    fit: 'Straight Tapered Leg',
    care_instructions: 'Machine wash delicate cold, warm iron',
    tags: JSON.stringify(['trousers', 'chinos', 'linen', 'beige', 'summer', 'men']),
    rating: 4.6,
    reviews_count: 25,
    is_featured: 0,
    is_new_arrival: 0
  },
  {
    sku: 'TH-TRS-003',
    name: 'High-Waist Drape Palazzos',
    slug: 'high-waist-drape-palazzos',
    description: 'Architectural fluid palazzo trousers in heavyweight crepe with an exaggerated wide silhouette that moves with unmatched elegance.',
    category_id: 6,
    category_name: 'Trousers',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 3899,
    discount_price: null,
    color: 'Black',
    color_hex: '#111827',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 0, // Out of stock test
    material: '100% Japanese Triacetate Crepe',
    fit: 'High-Waist Ultra Wide Leg',
    care_instructions: 'Dry clean recommended or gentle hand wash',
    tags: JSON.stringify(['trousers', 'palazzo', 'black', 'wide-leg', 'crepe', 'women', 'luxury']),
    rating: 4.9,
    reviews_count: 44,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TRS-004',
    name: 'Utility Cargo Pants with Darted Knees',
    slug: 'utility-cargo-pants-darted-knees',
    description: 'Engineered from cotton ripstop featuring articulated knee darts, bellowed thigh pockets with snap flaps, and adjustable drawstring ankle cuffs.',
    category_id: 6,
    category_name: 'Trousers',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 3699,
    discount_price: 2999,
    color: 'Green',
    color_hex: '#3E4D3E',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify([
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop'
    ]),
    stock_quantity: 5, // Low stock
    material: '100% Cotton Ripstop (280 GSM)',
    fit: 'Articulated Relaxed Tapered',
    care_instructions: 'Machine wash warm, tumble dry medium',
    tags: JSON.stringify(['trousers', 'cargo', 'utility', 'green', 'olive', 'unisex', 'streetwear']),
    rating: 4.7,
    reviews_count: 36,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    sku: 'TH-TSH-007',
    name: 'Ribbed Crewneck Long Sleeve Top',
    slug: 'ribbed-crewneck-long-sleeve-top',
    description: 'Dense stretch-rib knit top cut with extra sleeve length for an elegant gathered cuff effect. Clean minimalist everyday layer.',
    category_id: 1,
    category_name: 'T-Shirts',
    gender: 'Women',
    brand: 'Threadly Femme',
    price: 1899,
    discount_price: 1499,
    color: 'Charcoal',
    color_hex: '#27272A',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    image_url: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify(['https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop']),
    stock_quantity: 14,
    material: '92% Organic Cotton, 8% Elastane',
    fit: 'Slim Stretch Fit',
    care_instructions: 'Machine wash cold delicate',
    tags: JSON.stringify(['t-shirt', 'long-sleeve', 'ribbed', 'charcoal', 'women', 'minimalist']),
    rating: 4.8,
    reviews_count: 18,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    sku: 'TH-SHR-007',
    name: 'Oversized Silk Bowling Shirt',
    slug: 'oversized-silk-bowling-shirt',
    description: 'Silky smooth drapey short-sleeve shirt with mother-of-pearl buttons and retro boxy proportions.',
    category_id: 2,
    category_name: 'Shirts',
    gender: 'Men',
    brand: 'Threadly Studio',
    price: 3399,
    discount_price: 2799,
    color: 'Beige',
    color_hex: '#D7C4B7',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify(['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop']),
    stock_quantity: 6, // Low stock
    material: '100% Habotai Silk Blend',
    fit: 'Boxy Bowling Cut',
    care_instructions: 'Hand wash cold, dry flat',
    tags: JSON.stringify(['shirt', 'silk', 'bowling', 'beige', 'summer', 'men']),
    rating: 4.9,
    reviews_count: 21,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-JKT-006',
    name: 'Minimalist Relaxed Wool Blazer',
    slug: 'minimalist-relaxed-wool-blazer',
    description: 'Unstructured single-breasted blazer with soft shoulders and jetted flap pockets in premium high-twist Italian wool.',
    category_id: 4,
    category_name: 'Jackets',
    gender: 'Men',
    brand: 'Atelier Threadly',
    price: 7999,
    discount_price: 6499,
    color: 'Navy',
    color_hex: '#1E293B',
    sizes: JSON.stringify(['M', 'L', 'XL']),
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify(['https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop']),
    stock_quantity: 0, // Out of stock test
    material: '100% Virgin Italian Wool',
    fit: 'Relaxed Tailored Fit',
    care_instructions: 'Specialist dry clean',
    tags: JSON.stringify(['jacket', 'blazer', 'navy', 'wool', 'tailoring', 'men', 'luxury']),
    rating: 4.9,
    reviews_count: 35,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    sku: 'TH-HD-005',
    name: 'Washed Sage Heavy Zip Hoodie',
    slug: 'washed-sage-heavy-zip-hoodie',
    description: 'Double-layered hood with antique brass two-way zipper and ribbed side panels in mineral washed sage fleece.',
    category_id: 5,
    category_name: 'Hoodies',
    gender: 'Unisex',
    brand: 'Threadly Studio',
    price: 3699,
    discount_price: null,
    color: 'Green',
    color_hex: '#5A6B5C',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    gallery_images: JSON.stringify(['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop']),
    stock_quantity: 9, // Low stock
    material: '100% Combed Cotton Fleece (450 GSM)',
    fit: 'Oversized Zip Hoodie',
    care_instructions: 'Cold wash with like colors',
    tags: JSON.stringify(['hoodie', 'zip-up', 'green', 'sage', 'fleece', 'unisex']),
    rating: 4.8,
    reviews_count: 22,
    is_featured: 0,
    is_new_arrival: 1
  }
];

const insertProduct = db.prepare(`
  INSERT INTO products (
    sku, name, slug, description, category_id, category_name, gender, brand,
    price, discount_price, color, color_hex, sizes, image_url, gallery_images,
    stock_quantity, status, material, fit, care_instructions, tags,
    rating, reviews_count, is_featured, is_new_arrival
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?
  )
`);

const insertLog = db.prepare(`
  INSERT INTO inventory_logs (
    product_id, product_name, sku, previous_stock, new_stock, change_amount, reason, updated_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(p => {
  const status = calculateStatus(p.stock_quantity);
  const info = insertProduct.run(
    p.sku,
    p.name,
    p.slug,
    p.description,
    p.category_id,
    p.category_name,
    p.gender,
    p.brand,
    p.price,
    p.discount_price,
    p.color,
    p.color_hex,
    p.sizes,
    p.image_url,
    p.gallery_images,
    p.stock_quantity,
    status,
    p.material,
    p.fit,
    p.care_instructions,
    p.tags,
    p.rating,
    p.reviews_count,
    p.is_featured,
    p.is_new_arrival
  );

  insertLog.run(
    Number(info.lastInsertRowid),
    p.name,
    p.sku,
    0,
    p.stock_quantity,
    p.stock_quantity,
    'Initial Inventory Ingestion',
    'system@threadly.com'
  );
});

console.log(`✅ Successfully seeded ${products.length} luxury fashion products, ${categories.length} categories, and admin account.`);
db.close();
