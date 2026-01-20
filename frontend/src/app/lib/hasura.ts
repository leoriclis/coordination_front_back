import { GraphQLClient } from 'graphql-request';
import { createClient } from 'graphql-ws';

const hasuraUrl = process.env.NEXT_PUBLIC_HASURA_URL || '';
const hasuraWsUrl = process.env.NEXT_PUBLIC_HASURA_WS_URL || '';

const tokenStorageKey = 'tp_coord_front_back_token';

export const saveAuthToken = (token: string) => {
  localStorage.setItem(tokenStorageKey, token);
};

export const getAuthToken = () => localStorage.getItem(tokenStorageKey);

export const clearAuthToken = () => {
  localStorage.removeItem(tokenStorageKey);
};

export const createHasuraClient = () => {
  const token = getAuthToken();
  return new GraphQLClient(hasuraUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const createHasuraWsClient = () => {
  return createClient({
    url: hasuraWsUrl,
    connectionParams: async () => {
      const token = getAuthToken();
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    },
  });
};
