import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/products-repository';
import { getAuthUser } from '@/lib/auth';
import { ProductSearchParams } from '@/types';

// GET /api/products - Search, Filter, Sort, Paginate & Facets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: ProductSearchParams = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      gender: searchParams.get('gender') || undefined,
      size: searchParams.get('size') || undefined,
      color: searchParams.get('color') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      availability: (searchParams.get('availability') as any) || undefined,
      brand: searchParams.get('brand') || undefined,
      sort: (searchParams.get('sort') as any) || 'featured',
    };

    const response = ProductsRepository.getProducts(params);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // Validation
    if (!body.name || !body.sku || !body.category_id || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, category_id, price' },
        { status: 400 }
      );
    }

    if (Number(body.price) <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    if (body.stock_quantity !== undefined && Number(body.stock_quantity) < 0) {
      return NextResponse.json({ error: 'Stock quantity cannot be negative' }, { status: 400 });
    }

    const product = ProductsRepository.createProduct(body, user.email);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
