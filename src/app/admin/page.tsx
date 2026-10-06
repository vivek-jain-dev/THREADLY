import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwtToken } from '@/lib/auth';
import { ProductsRepository } from '@/lib/products-repository';
import AdminDashboardClient from './AdminDashboardClient';

export const revalidate = 0; // Always fresh inventory stats

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('threadly_token')?.value;

  if (!token || !verifyJwtToken(token)) {
    redirect('/admin/login');
  }

  const initialStats = ProductsRepository.getDashboardStats();

  return <AdminDashboardClient initialStats={initialStats} />;
}
