'use client';
import { useEffect, useState } from 'react';
import { createHasuraClient, getAuthToken } from '../lib/hasura';
import { COMPANIES_QUERY } from '../../graphql/documents';
import { CompaniesQuery, Company } from '../../graphql/generated';

export default function CompanyManagerGraphql() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Missing JWT. Use the login form first.');
      return;
    }

    const loadCompanies = async () => {
      try {
        const client = createHasuraClient();
        const data = await client.request<CompaniesQuery>(COMPANIES_QUERY);
        setCompanies(data.company);
      } catch (err) {
        setError('Failed to load companies from Hasura.');
      }
    };

    loadCompanies();
  }, []);

  return (
    <div className="border p-4 rounded mb-6 w-full">
      <h2 className="text-lg font-semibold mb-2">Companies (GraphQL)</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && (
        <ul className="space-y-2">
          {companies.map((company) => (
            <li key={company.id} className="border-b pb-2">
              <div className="font-semibold">{company.name}</div>
              <div className="text-sm text-gray-500">
                Created: {company.created_at || 'n/a'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
