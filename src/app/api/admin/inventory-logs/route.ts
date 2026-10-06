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

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const data = ProductsRepository.getInventoryLogs(page, limit);

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error: any) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
