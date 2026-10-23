import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import { SEARCH_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

export interface ISearchProduct {
  databaseId: number;
  name: string;
  slug: string;
  onSale: boolean;
  shortDescription?: string | null;
  image?: { sourceUrl?: string | null } | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
}

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

/**
 * Debounced WooCommerce product search through WPGraphQL.
 */
export const useProductSearch = () => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const active = debounced.length >= MIN_LENGTH && query.trim().length >= MIN_LENGTH;

  const { data, loading } = useQuery<{ products: { nodes: ISearchProduct[] } }>(
    SEARCH_PRODUCTS_QUERY,
    { variables: { search: debounced }, skip: !active },
  );

  return {
    query,
    setQuery,
    active,
    loading,
    results: active ? (data?.products?.nodes ?? []) : [],
  };
};
