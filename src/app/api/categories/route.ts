import { NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/products-repository';

export async function GET() {
  try {
    const categories = ProductsRepository.getCategories();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
