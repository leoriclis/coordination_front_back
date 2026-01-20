'use client';
import { useEffect, useState } from 'react';
import { createHasuraClient, getAuthToken } from '../lib/hasura';
import { PRODUCTS_QUERY } from '../../graphql/documents';
import { Product, ProductsQuery } from '../../graphql/generated';

export default function ProductManagerGraphql() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Missing JWT. Use the login form first.');
      return;
    }

    const loadProducts = async () => {
      try {
        const client = createHasuraClient();
        const data = await client.request<ProductsQuery>(PRODUCTS_QUERY);
        setProducts(data.product);
      } catch (err) {
        setError('Failed to load products from Hasura.');
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="border p-4 rounded mb-6 w-full">
      <h2 className="text-lg font-semibold mb-2">Products (GraphQL)</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="border-b pb-2">
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm text-gray-500">
                {product.comment || 'No comment'} - Qty {product.quantity ?? 0}
              </div>
              <div className="text-xs text-gray-500">
                Company: {product.company?.name || product.company_id}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
