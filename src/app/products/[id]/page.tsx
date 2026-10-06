import React from 'react';
import { notFound } from 'next/navigation';
import { ProductsRepository } from '@/lib/products-repository';
import ProductDetailsClient from './ProductDetailsClient';
import { Metadata } from 'next';

export const revalidate = 0; // Dynamic real-time data

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let product = null;
  if (!isNaN(Number(params.id))) {
    product = ProductsRepository.getProductById(Number(params.id));
  } else {
    product = ProductsRepository.getProductBySlug(params.id);
  }

  if (!product) {
    return { title: 'Product Not Found — THREADLY' };
  }

  return {
    title: `${product.name} — THREADLY Atelier`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: [product.image_url],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  let product = null;

  if (!isNaN(Number(params.id))) {
    product = ProductsRepository.getProductById(Number(params.id));
  } else {
    product = ProductsRepository.getProductBySlug(params.id);
  }

  if (!product) {
    notFound();
  }

  const related = ProductsRepository.getRelatedProducts(product.id, product.category_id, 4);

  return <ProductDetailsClient product={product} relatedProducts={related} />;
}
