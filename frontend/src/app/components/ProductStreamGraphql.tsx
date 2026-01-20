'use client';
import { useEffect, useState } from 'react';
import { createHasuraWsClient, getAuthToken } from '../lib/hasura';
import { PRODUCTS_SUBSCRIPTION } from '../../graphql/documents';
import { Product, ProductsLiveSubscription } from '../../graphql/generated';

export default function ProductStreamGraphql() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setStatus('Missing JWT. Use the login form first.');
      return;
    }

    const wsClient = createHasuraWsClient();
    const unsubscribe = wsClient.subscribe(
      { query: PRODUCTS_SUBSCRIPTION },
      {
        next: (result) => {
          const data = result.data as ProductsLiveSubscription | undefined;
          if (data?.product) {
            setProducts(data.product);
            setStatus('Live');
          }
        },
        error: () => setStatus('Subscription error.'),
        complete: () => setStatus('Disconnected.'),
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="border p-4 rounded mb-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Products (GraphQL subscription)</h2>
        <span className="text-sm text-gray-500">{status}</span>
      </div>
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
    </div>
  );
}
