import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Database file directory & path
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'threadly.db');

// Global connection singleton for Next.js dev server hot-reloading
const globalForDb = globalThis as unknown as {
  dbConnection: DatabaseSync | undefined;
};

export function getDb(): DatabaseSync {
  if (!globalForDb.dbConnection) {
    globalForDb.dbConnection = new DatabaseSync(dbPath);
    // Initialize schema
    initializeSchema(globalForDb.dbConnection);
  }
  return globalForDb.dbConnection;
}

export function initializeSchema(db: DatabaseSync) {
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
}

export default getDb;
