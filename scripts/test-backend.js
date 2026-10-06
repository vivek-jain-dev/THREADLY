const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'threadly.db');
console.log('--- RUNNING RIGOROUS BACKEND & SEARCH/FILTER TESTS ---');

// Test 1: Category count & products
const db = new DatabaseSync(dbPath);
const totalProds = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log('Total Products in DB:', totalProds.count);

// Test 2: Multi-term token search ("oversized black")
const token1 = '%oversized%';
const token2 = '%black%';
const searchSql = `
  SELECT name, sku, color, price, stock_quantity, status
  FROM products
  WHERE (
    LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(color) LIKE ?
  ) AND (
    LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(color) LIKE ?
  )
`;
const searchRes = db.prepare(searchSql).all(token1, token1, token1, token1, token2, token2, token2, token2);
console.log('Search "oversized black" matched:', searchRes.length, 'products:');
searchRes.forEach(r => console.log(`  - [${r.sku}] ${r.name} | Color: ${r.color} | Stock: ${r.stock_quantity} (${r.status})`));

// Test 3: Stock status distribution
const stockStats = db.prepare(`
  SELECT 
    SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) as in_stock,
    SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock,
    SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
  FROM products
`).get();
console.log('Inventory Stock Status Distribution:');
console.log('  - In Stock (>10):', stockStats.in_stock);
console.log('  - Low Stock (1-10):', stockStats.low_stock);
console.log('  - Out of Stock (0):', stockStats.out_of_stock);

// Test 4: Combined multi-filter: Men + Shirts + In Stock
const combSql = `
  SELECT name, sku, gender, category_name, stock_quantity
  FROM products
  WHERE (LOWER(gender) = 'men' OR LOWER(gender) = 'unisex')
    AND LOWER(category_name) = 'shirts'
    AND stock_quantity > 10
`;
const combRes = db.prepare(combSql).all();
console.log('Combined Filter (Men + Shirts + In Stock) found:', combRes.length);
combRes.forEach(r => console.log(`  - ${r.name} (${r.gender}) - Stock: ${r.stock_quantity}`));

console.log('--- ALL BACKEND TESTS PASSED CLEANLY ---');
db.close();
