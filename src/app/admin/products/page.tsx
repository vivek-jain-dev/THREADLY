import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwtToken } from '@/lib/auth';
import { ProductsRepository } from '@/lib/products-repository';
import AdminProductsClient from './AdminProductsClient';

export const revalidate = 0; // Always fresh inventory data

export default async function AdminProductsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('threadly_token')?.value;

  if (!token || !verifyJwtToken(token)) {
    redirect('/admin/login');
  }

  const { products } = ProductsRepository.getProducts({ limit: 100 });
  const categories = ProductsRepository.getCategories() as any;

  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
