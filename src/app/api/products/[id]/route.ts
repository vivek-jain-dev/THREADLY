import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/products-repository';
import { getAuthUser } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/products/[id] - Fetch single product by ID or Slug + Related Products
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const paramId = params.id;
    let product = null;

    if (!isNaN(Number(paramId))) {
      product = ProductsRepository.getProductById(Number(paramId));
    } else {
      product = ProductsRepository.getProductBySlug(paramId);
    }

    if (!product) {
      return NextResponse.json({ error: `Product '${paramId}' not found` }, { status: 404 });
    }

    const related = ProductsRepository.getRelatedProducts(product.id, product.category_id, 4);

    return NextResponse.json(
      { product, related },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error: any) {
    console.error('Error getting product details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve product details', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product details (Admin only)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const productId = Number(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const updated = ProductsRepository.updateProduct(productId, body, user.email);

    return NextResponse.json({ success: true, product: updated }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const productId = Number(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const deleted = ProductsRepository.deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Product #${productId} deleted successfully` }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
