import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductsRepository } from '@/lib/products-repository';
import ShopClient from './ShopClient';
import { ProductSearchParams } from '@/types';

export const revalidate = 0; // Always fresh server data

export const metadata: Metadata = {
  title: 'Collection & Discovery — THREADLY Atelier',
  description: 'Explore the complete capsule collection with multi-term search, category, gender, color, size, and real-time inventory filters.',
};

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    gender?: string;
    size?: string;
    color?: string;
    min_price?: string;
    max_price?: string;
    availability?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    brand?: string;
    sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'stock_desc';
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params: ProductSearchParams = {
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: searchParams.limit ? Number(searchParams.limit) : 12,
    search: searchParams.search,
    category: searchParams.category,
    gender: searchParams.gender,
    size: searchParams.size,
    color: searchParams.color,
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    availability: searchParams.availability,
    brand: searchParams.brand,
    sort: searchParams.sort || 'featured',
  };

  const initialData = ProductsRepository.getProducts(params);

  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading Collection...</div>}>
      <ShopClient initialData={initialData} />
    </Suspense>
  );
}
