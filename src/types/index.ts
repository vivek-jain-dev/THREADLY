export type Gender = 'Men' | 'Women' | 'Unisex';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name: string;
  gender: Gender;
  brand: string;
  price: number;
  discount_price: number | null;
  color: string;
  color_hex: string;
  sizes: string[]; // parsed from JSON
  image_url: string;
  gallery_images: string[]; // parsed from JSON
  stock_quantity: number;
  status: StockStatus;
  material?: string | null;
  fit?: string | null;
  care_instructions?: string | null;
  tags: string[]; // parsed from JSON
  rating: number;
  reviews_count: number;
  is_featured: number; // 0 or 1
  is_new_arrival: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface RawProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name: string;
  gender: Gender;
  brand: string;
  price: number;
  discount_price: number | null;
  color: string;
  color_hex: string;
  sizes: string;
  image_url: string;
  gallery_images: string | null;
  stock_quantity: number;
  status: StockStatus;
  material: string | null;
  fit: string | null;
  care_instructions: string | null;
  tags: string | null;
  rating: number;
  reviews_count: number;
  is_featured: number;
  is_new_arrival: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  product_count?: number;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: string;
  updated_by: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface AuthSession {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // slug or comma-separated
  gender?: string; // 'Men', 'Women', 'Unisex', or multiple
  size?: string; // 'S', 'M', 'L', 'XL'
  color?: string; // 'Black', 'White', etc.
  min_price?: number;
  max_price?: number;
  availability?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  brand?: string;
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'stock_desc';
}

export interface FacetCount {
  value: string;
  label: string;
  count: number;
  color_hex?: string;
}

export interface FilterFacets {
  categories: FacetCount[];
  genders: FacetCount[];
  sizes: FacetCount[];
  colors: FacetCount[];
  brands: FacetCount[];
  availability: FacetCount[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  facets: FilterFacets;
  active_filters_count: number;
}

export interface DashboardStats {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_units: number;
  total_inventory_value: number;
  categories_count: number;
  recent_logs: InventoryLog[];
  low_stock_products: Product[];
}
