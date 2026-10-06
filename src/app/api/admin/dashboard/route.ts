import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/products-repository';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const stats = ProductsRepository.getDashboardStats();

    return NextResponse.json(stats, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
