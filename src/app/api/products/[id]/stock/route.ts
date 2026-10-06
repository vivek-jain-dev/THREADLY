import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/products-repository';
import { getAuthUser } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// PATCH /api/products/[id]/stock - Quick update product stock + record inventory log
export async function PATCH(req: NextRequest, { params }: Params) {
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
    const stockQuantity = Number(body.stock_quantity ?? body.stock);

    if (stockQuantity === undefined || isNaN(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json(
        { error: 'Invalid stock quantity: stock must be a non-negative integer (0 or greater)' },
        { status: 400 }
      );
    }

    const reason = body.reason || 'Admin Quick Stock Update';
    const result = ProductsRepository.updateStock(
      productId,
      Math.floor(stockQuantity),
      reason,
      user.email
    );

    return NextResponse.json(
      {
        success: true,
        message: `Stock updated to ${result.product.stock_quantity} units (${result.product.status})`,
        product: result.product,
        log: result.log,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update product stock', details: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
