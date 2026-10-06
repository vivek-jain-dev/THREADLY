import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwtToken } from '@/lib/auth';
import { ProductsRepository } from '@/lib/products-repository';
import AdminLogsClient from './AdminLogsClient';

export const revalidate = 0; // Always fresh audit data

export default async function AdminLogsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('threadly_token')?.value;

  if (!token || !verifyJwtToken(token)) {
    redirect('/admin/login');
  }

  const data = ProductsRepository.getInventoryLogs(1, 100);

  return <AdminLogsClient initialLogs={data.logs} initialTotal={data.pagination.total} />;
}
