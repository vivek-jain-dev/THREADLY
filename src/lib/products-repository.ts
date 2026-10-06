import { getDb } from './db';
import {
  Product,
  RawProduct,
  ProductSearchParams,
  PaginatedProductsResponse,
  FilterFacets,
  DashboardStats,
  InventoryLog,
  StockStatus
} from '@/types';

// Utility to convert node:sqlite null-prototype objects to pure plain serializable JS objects
export function toPlain<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// Helper to compute live stock status based on stock_quantity
export function computeStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'in_stock';
}

// Transform raw SQLite DB row to parsed Product object
export function parseProductRow(rawRow: RawProduct): Product {
  if (!rawRow) return null as any;
  const row = { ...rawRow };

  let parsedSizes: string[] = [];
  try {
    parsedSizes = JSON.parse(row.sizes || '[]');
  } catch {
    parsedSizes = row.sizes ? String(row.sizes).split(',').map(s => s.trim()) : [];
  }

  let parsedGallery: string[] = [];
  try {
    parsedGallery = JSON.parse(row.gallery_images || '[]');
  } catch {
    parsedGallery = [];
  }
  if (!parsedGallery.length && row.image_url) {
    parsedGallery = [row.image_url];
  }

  let parsedTags: string[] = [];
  try {
    parsedTags = JSON.parse(row.tags || '[]');
  } catch {
    parsedTags = row.tags ? String(row.tags).split(',').map(t => t.trim()) : [];
  }

  const liveStatus = computeStockStatus(Number(row.stock_quantity));

  return {
    id: Number(row.id),
    sku: String(row.sku),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    category_id: Number(row.category_id),
    category_name: String(row.category_name),
    gender: row.gender,
    brand: String(row.brand),
    price: Number(row.price),
    discount_price: row.discount_price ? Number(row.discount_price) : null,
    color: String(row.color),
    color_hex: String(row.color_hex),
    sizes: parsedSizes,
    image_url: String(row.image_url),
    gallery_images: parsedGallery,
    stock_quantity: Number(row.stock_quantity),
    status: liveStatus,
    material: row.material ? String(row.material) : null,
    fit: row.fit ? String(row.fit) : null,
    care_instructions: row.care_instructions ? String(row.care_instructions) : null,
    tags: parsedTags,
    rating: Number(row.rating || 4.5),
    reviews_count: Number(row.reviews_count || 0),
    is_featured: Number(row.is_featured || 0),
    is_new_arrival: Number(row.is_new_arrival || 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class ProductsRepository {
  /**
   * Search and filter products with dynamic pagination and facet aggregations
   */
  static getProducts(params: ProductSearchParams = {}): PaginatedProductsResponse {
    const db = getDb();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const positionalParams: (string | number)[] = [];

    // 1. Search Query: Multi-term tokenized search
    if (params.search && params.search.trim()) {
      const tokens = params.search
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(t => t.length > 0);

      if (tokens.length > 0) {
        const tokenConditions = tokens.map(token => {
          const pattern = `%${token}%`;
          for (let i = 0; i < 8; i++) {
            positionalParams.push(pattern);
          }
          return `(
            LOWER(p.name) LIKE ? OR
            LOWER(p.description) LIKE ? OR
            LOWER(p.category_name) LIKE ? OR
            LOWER(p.brand) LIKE ? OR
            LOWER(p.sku) LIKE ? OR
            LOWER(p.color) LIKE ? OR
            LOWER(p.gender) LIKE ? OR
            LOWER(p.tags) LIKE ?
          )`;
        });
        conditions.push(`(${tokenConditions.join(' AND ')})`);
      }
    }

    // 2. Category Filter
    if (params.category && params.category !== 'all') {
      const catSlugs = params.category.split(',').map(s => s.trim().toLowerCase());
      if (catSlugs.length === 1) {
        conditions.push(`(LOWER(c.slug) = ? OR LOWER(p.category_name) = ?)`);
        positionalParams.push(catSlugs[0], catSlugs[0]);
      } else if (catSlugs.length > 1) {
        const placeholders = catSlugs.map(() => '?').join(',');
        conditions.push(`(LOWER(c.slug) IN (${placeholders}) OR LOWER(p.category_name) IN (${placeholders}))`);
        positionalParams.push(...catSlugs, ...catSlugs);
      }
    }

    // 3. Gender Filter
    if (params.gender && params.gender !== 'all') {
      const genders = params.gender.split(',').map(g => g.trim().toLowerCase());
      if (genders.length === 1) {
        conditions.push(`(LOWER(p.gender) = ? OR LOWER(p.gender) = 'unisex')`);
        positionalParams.push(genders[0]);
      } else {
        const placeholders = genders.map(() => '?').join(',');
        conditions.push(`(LOWER(p.gender) IN (${placeholders}) OR LOWER(p.gender) = 'unisex')`);
        positionalParams.push(...genders);
      }
    }

    // 4. Color Filter
    if (params.color && params.color !== 'all') {
      const colors = params.color.split(',').map(c => c.trim().toLowerCase());
      if (colors.length === 1) {
        conditions.push(`LOWER(p.color) = ?`);
        positionalParams.push(colors[0]);
      } else {
        const placeholders = colors.map(() => '?').join(',');
        conditions.push(`LOWER(p.color) IN (${placeholders})`);
        positionalParams.push(...colors);
      }
    }

    // 5. Size Filter
    if (params.size && params.size !== 'all') {
      const sizes = params.size.split(',').map(s => s.trim().toUpperCase());
      const sizeConds = sizes.map(size => {
        positionalParams.push(`%"${size}"%`);
        return `p.sizes LIKE ?`;
      });
      conditions.push(`(${sizeConds.join(' OR ')})`);
    }

    // 6. Price Range
    if (params.min_price !== undefined && !isNaN(Number(params.min_price))) {
      conditions.push(`COALESCE(p.discount_price, p.price) >= ?`);
      positionalParams.push(Number(params.min_price));
    }
    if (params.max_price !== undefined && !isNaN(Number(params.max_price))) {
      conditions.push(`COALESCE(p.discount_price, p.price) <= ?`);
      positionalParams.push(Number(params.max_price));
    }

    // 7. Availability Filter
    if (params.availability && params.availability !== 'all') {
      if (params.availability === 'in_stock') {
        conditions.push(`p.stock_quantity > 10`);
      } else if (params.availability === 'low_stock') {
        conditions.push(`p.stock_quantity > 0 AND p.stock_quantity <= 10`);
      } else if (params.availability === 'out_of_stock') {
        conditions.push(`p.stock_quantity = 0`);
      }
    }

    // 8. Brand Filter
    if (params.brand && params.brand !== 'all') {
      conditions.push(`LOWER(p.brand) = ?`);
      positionalParams.push(params.brand.toLowerCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting Clause
    let orderByClause = 'ORDER BY p.is_featured DESC, p.id DESC';
    switch (params.sort) {
      case 'newest':
        orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
        break;
      case 'price_asc':
        orderByClause = 'ORDER BY COALESCE(p.discount_price, p.price) ASC';
        break;
      case 'price_desc':
        orderByClause = 'ORDER BY COALESCE(p.discount_price, p.price) DESC';
        break;
      case 'name_asc':
        orderByClause = 'ORDER BY p.name ASC';
        break;
      case 'name_desc':
        orderByClause = 'ORDER BY p.name DESC';
        break;
      case 'stock_desc':
        orderByClause = 'ORDER BY p.stock_quantity DESC';
        break;
      case 'featured':
      default:
        orderByClause = 'ORDER BY p.is_featured DESC, p.id DESC';
        break;
    }

    // Total Count Query
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const totalRow = db.prepare(countSql).get(...positionalParams) as { total: number } | undefined;
    const total = totalRow ? Number(totalRow.total) : 0;
    const total_pages = Math.ceil(total / limit) || 1;

    // Fetch Products with Pagination
    const selectSql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const rawRows = db.prepare(selectSql).all(...positionalParams, limit, offset) as unknown as RawProduct[];
    const products = rawRows.map(parseProductRow);

    // Compute dynamic Facet Aggregations
    const facets = this.calculateFacets(params.search);

    // Calculate active filter count
    let activeFiltersCount = 0;
    if (params.search) activeFiltersCount++;
    if (params.category && params.category !== 'all') activeFiltersCount++;
    if (params.gender && params.gender !== 'all') activeFiltersCount++;
    if (params.color && params.color !== 'all') activeFiltersCount++;
    if (params.size && params.size !== 'all') activeFiltersCount++;
    if (params.min_price !== undefined) activeFiltersCount++;
    if (params.max_price !== undefined) activeFiltersCount++;
    if (params.availability && params.availability !== 'all') activeFiltersCount++;
    if (params.brand && params.brand !== 'all') activeFiltersCount++;

    return toPlain({
      products,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
      facets,
      active_filters_count: activeFiltersCount,
    });
  }

  /**
   * Calculate filter facets with live counts
   */
  static calculateFacets(searchQuery?: string): FilterFacets {
    const db = getDb();
    let baseWhere = '';
    const facetPosParams: string[] = [];

    if (searchQuery && searchQuery.trim()) {
      const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
        const tokenConds = tokens.map(token => {
          const pattern = `%${token}%`;
          for (let i = 0; i < 5; i++) facetPosParams.push(pattern);
          return `(
            LOWER(p.name) LIKE ? OR
            LOWER(p.description) LIKE ? OR
            LOWER(p.category_name) LIKE ? OR
            LOWER(p.brand) LIKE ? OR
            LOWER(p.color) LIKE ?
          )`;
        });
        baseWhere = `WHERE ${tokenConds.join(' AND ')}`;
      }
    }

    // 1. Categories
    const catRows = db.prepare(`
      SELECT c.slug as value, c.name as label, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `).all() as unknown as { value: string; label: string; count: number }[];

    // 2. Genders
    const genderRows = db.prepare(`
      SELECT p.gender as value, p.gender as label, COUNT(p.id) as count
      FROM products p
      ${baseWhere}
      GROUP BY p.gender
      ORDER BY count DESC
    `).all(...facetPosParams) as unknown as { value: string; label: string; count: number }[];

    // 3. Colors
    const colorRows = db.prepare(`
      SELECT p.color as value, p.color as label, p.color_hex, COUNT(p.id) as count
      FROM products p
      ${baseWhere}
      GROUP BY p.color
      ORDER BY count DESC
    `).all(...facetPosParams) as unknown as { value: string; label: string; color_hex: string; count: number }[];

    // 4. Brands
    const brandRows = db.prepare(`
      SELECT p.brand as value, p.brand as label, COUNT(p.id) as count
      FROM products p
      ${baseWhere}
      GROUP BY p.brand
      ORDER BY count DESC
    `).all(...facetPosParams) as unknown as { value: string; label: string; count: number }[];

    // 5. Availability
    const availRows = db.prepare(`
      SELECT 
        SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
      FROM products p
      ${baseWhere}
    `).get(...facetPosParams) as { in_stock: number; low_stock: number; out_of_stock: number } | undefined;

    // 6. Sizes
    const allSizesRaw = db.prepare(`
      SELECT sizes FROM products p ${baseWhere}
    `).all(...facetPosParams) as unknown as { sizes: string }[];

    const sizeCountMap: Record<string, number> = {};
    ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36'].forEach(s => {
      sizeCountMap[s] = 0;
    });

    allSizesRaw.forEach(row => {
      try {
        const parsed: string[] = JSON.parse(row.sizes || '[]');
        parsed.forEach(size => {
          sizeCountMap[size] = (sizeCountMap[size] || 0) + 1;
        });
      } catch {
        // ignore
      }
    });

    const sizeFacets = Object.entries(sizeCountMap)
      .filter(([_, count]) => count > 0)
      .map(([size, count]) => ({
        value: size,
        label: size,
        count: Number(count),
      }));

    // 7. Price bounds
    const priceBounds = db.prepare(`
      SELECT 
        MIN(COALESCE(discount_price, price)) as min_price,
        MAX(COALESCE(discount_price, price)) as max_price
      FROM products
    `).get() as { min_price: number; max_price: number } | undefined;

    return toPlain({
      categories: (catRows || []).map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
      genders: (genderRows || []).map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
      colors: (colorRows || []).map(r => ({ value: String(r.value), label: String(r.label), color_hex: String(r.color_hex), count: Number(r.count) })),
      brands: (brandRows || []).map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
      sizes: sizeFacets,
      availability: [
        { value: 'in_stock', label: 'In Stock (>10 units)', count: Number(availRows?.in_stock || 0) },
        { value: 'low_stock', label: 'Low Stock (1-10 units)', count: Number(availRows?.low_stock || 0) },
        { value: 'out_of_stock', label: 'Out of Stock (0 units)', count: Number(availRows?.out_of_stock || 0) },
      ],
      priceRange: {
        min: Math.floor(Number(priceBounds?.min_price || 0)),
        max: Math.ceil(Number(priceBounds?.max_price || 10000)),
      },
    });
  }

  /**
   * Get product by ID
   */
  static getProductById(id: number): Product | null {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) return null;
    const db = getDb();
    const row = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(numId) as unknown as RawProduct | undefined;

    return row ? toPlain(parseProductRow(row)) : null;
  }

  /**
   * Get product by Slug, SKU, or ID
   */
  static getProductBySlug(slugOrId: string): Product | null {
    const db = getDb();
    const num = Number(slugOrId);
    let row: RawProduct | undefined;

    if (!isNaN(num) && num > 0) {
      row = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? OR p.slug = ? OR LOWER(p.sku) = LOWER(?)
      `).get(num, slugOrId, slugOrId) as unknown as RawProduct | undefined;
    } else {
      row = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ? OR LOWER(p.sku) = LOWER(?)
      `).get(slugOrId, slugOrId) as unknown as RawProduct | undefined;
    }

    return row ? toPlain(parseProductRow(row)) : null;
  }

  /**
   * Get related products based on category
   */
  static getRelatedProducts(productId: number, categoryId: number, limit = 4): Product[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.is_featured DESC
      LIMIT ?
    `).all(categoryId, productId, limit) as unknown as RawProduct[];

    return toPlain(rows.map(parseProductRow));
  }

  /**
   * Update stock quantity for a product and write to inventory_logs
   */
  static updateStock(
    productId: number,
    newStock: number,
    reason = 'Admin Manual Stock Adjustment',
    adminEmail = 'admin@threadly.com'
  ): { success: boolean; product: Product; log: InventoryLog } {
    const db = getDb();

    if (isNaN(newStock) || newStock < 0) {
      throw new Error('Stock quantity must be a non-negative integer.');
    }

    const currentProduct = this.getProductById(productId);
    if (!currentProduct) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const prevStock = currentProduct.stock_quantity;
    const changeAmount = newStock - prevStock;
    const newStatus = computeStockStatus(newStock);

    // 1. Update product stock and status
    db.prepare(`
      UPDATE products 
      SET stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStock, newStatus, productId);

    // 2. Insert audit log
    const logInfo = db.prepare(`
      INSERT INTO inventory_logs (
        product_id, product_name, sku, previous_stock, new_stock, change_amount, reason, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      currentProduct.name,
      currentProduct.sku,
      prevStock,
      newStock,
      changeAmount,
      reason,
      adminEmail
    );

    const createdLog = db.prepare(`
      SELECT * FROM inventory_logs WHERE id = ?
    `).get(Number(logInfo.lastInsertRowid)) as unknown as InventoryLog;

    const updatedProduct = this.getProductById(productId)!;

    return toPlain({
      success: true,
      product: updatedProduct,
      log: createdLog,
    });
  }

  /**
   * Create new product
   */
  static createProduct(data: Partial<Product>, adminEmail = 'admin@threadly.com'): Product {
    const db = getDb();

    if (!data.name || !data.sku || !data.category_id || data.price === undefined) {
      throw new Error('Required product fields: name, sku, category_id, price');
    }

    const stock = Number(data.stock_quantity || 0);
    const status = computeStockStatus(stock);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get category name
    const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(data.category_id) as { name: string } | undefined;
    const categoryName = cat ? cat.name : 'Uncategorized';

    const insertInfo = db.prepare(`
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
    `).run(
      data.sku,
      data.name,
      slug,
      data.description || '',
      data.category_id,
      categoryName,
      data.gender || 'Unisex',
      data.brand || 'Threadly Studio',
      Number(data.price),
      data.discount_price ? Number(data.discount_price) : null,
      data.color || 'Black',
      data.color_hex || '#000000',
      JSON.stringify(data.sizes || ['M', 'L']),
      data.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      JSON.stringify(data.gallery_images || []),
      stock,
      status,
      data.material || '100% Organic Cotton',
      data.fit || 'Regular Fit',
      data.care_instructions || 'Machine wash cold',
      JSON.stringify(data.tags || []),
      data.rating || 5.0,
      data.reviews_count || 1,
      data.is_featured ? 1 : 0,
      data.is_new_arrival ? 1 : 0
    );

    const newId = Number(insertInfo.lastInsertRowid);

    // Add inventory log
    db.prepare(`
      INSERT INTO inventory_logs (
        product_id, product_name, sku, previous_stock, new_stock, change_amount, reason, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, data.name, data.sku, 0, stock, stock, 'Product Created / Initial Stock', adminEmail);

    return this.getProductById(newId)!;
  }

  /**
   * Update existing product details
   */
  static updateProduct(id: number, data: Partial<Product>, adminEmail = 'admin@threadly.com'): Product {
    const db = getDb();
    const existing = this.getProductById(id);
    if (!existing) {
      throw new Error(`Product ${id} not found.`);
    }

    const stock = data.stock_quantity !== undefined ? Number(data.stock_quantity) : existing.stock_quantity;
    const status = computeStockStatus(stock);

    let categoryName = existing.category_name;
    if (data.category_id && data.category_id !== existing.category_id) {
      const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(data.category_id) as { name: string } | undefined;
      if (cat) categoryName = cat.name;
    }

    db.prepare(`
      UPDATE products SET
        sku = COALESCE(?, sku),
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        category_name = ?,
        gender = COALESCE(?, gender),
        brand = COALESCE(?, brand),
        price = COALESCE(?, price),
        discount_price = ?,
        color = COALESCE(?, color),
        color_hex = COALESCE(?, color_hex),
        sizes = COALESCE(?, sizes),
        image_url = COALESCE(?, image_url),
        gallery_images = COALESCE(?, gallery_images),
        stock_quantity = ?,
        status = ?,
        material = COALESCE(?, material),
        fit = COALESCE(?, fit),
        care_instructions = COALESCE(?, care_instructions),
        tags = COALESCE(?, tags),
        is_featured = COALESCE(?, is_featured),
        is_new_arrival = COALESCE(?, is_new_arrival),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.sku || null,
      data.name || null,
      data.slug || null,
      data.description || null,
      data.category_id || null,
      categoryName,
      data.gender || null,
      data.brand || null,
      data.price !== undefined ? Number(data.price) : null,
      data.discount_price !== undefined ? (data.discount_price ? Number(data.discount_price) : null) : existing.discount_price,
      data.color || null,
      data.color_hex || null,
      data.sizes ? JSON.stringify(data.sizes) : null,
      data.image_url || null,
      data.gallery_images ? JSON.stringify(data.gallery_images) : null,
      stock,
      status,
      data.material || null,
      data.fit || null,
      data.care_instructions || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : null,
      data.is_new_arrival !== undefined ? (data.is_new_arrival ? 1 : 0) : null,
      id
    );

    // If stock changed, record log
    if (stock !== existing.stock_quantity) {
      db.prepare(`
        INSERT INTO inventory_logs (
          product_id, product_name, sku, previous_stock, new_stock, change_amount, reason, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.name || existing.name,
        data.sku || existing.sku,
        existing.stock_quantity,
        stock,
        stock - existing.stock_quantity,
        'Product Details & Inventory Update',
        adminEmail
      );
    }

    return this.getProductById(id)!;
  }

  /**
   * Delete product
   */
  static deleteProduct(id: number): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  }

  /**
   * Get Admin Dashboard stats & metrics
   */
  static getDashboardStats(): DashboardStats {
    const db = getDb();

    const counts = db.prepare(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(stock_quantity) as total_units,
        SUM(stock_quantity * price) as total_inventory_value
      FROM products
    `).get() as {
      total_products: number;
      in_stock: number;
      low_stock: number;
      out_of_stock: number;
      total_units: number;
      total_inventory_value: number;
    } | undefined;

    const categoriesCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;

    const recentLogs = db.prepare(`
      SELECT * FROM inventory_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all() as unknown as InventoryLog[];

    const lowStockRaw = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= 10
      ORDER BY p.stock_quantity ASC
      LIMIT 10
    `).all() as unknown as RawProduct[];

    return toPlain({
      total_products: Number(counts?.total_products || 0),
      in_stock: Number(counts?.in_stock || 0),
      low_stock: Number(counts?.low_stock || 0),
      out_of_stock: Number(counts?.out_of_stock || 0),
      total_units: Number(counts?.total_units || 0),
      total_inventory_value: Number(counts?.total_inventory_value || 0),
      categories_count: Number(categoriesCount || 0),
      recent_logs: (recentLogs || []).map(l => ({ ...l })),
      low_stock_products: lowStockRaw.map(parseProductRow),
    });
  }

  /**
   * Get all categories with product counts
   */
  static getCategories() {
    const db = getDb();
    const rows = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `).all();
    return toPlain(rows.map((r: any) => ({ ...r, product_count: Number(r.product_count || 0) })));
  }

  /**
   * Get all inventory audit logs with pagination
   */
  static getInventoryLogs(page = 1, limit = 20) {
    const db = getDb();
    const offset = (page - 1) * limit;

    const totalRow = db.prepare('SELECT COUNT(*) as total FROM inventory_logs').get() as { total: number };
    const total = totalRow ? Number(totalRow.total) : 0;
    const logs = db.prepare(`
      SELECT * FROM inventory_logs 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as unknown as InventoryLog[];

    return toPlain({
      logs: logs.map(l => ({ ...l })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    });
  }
}
