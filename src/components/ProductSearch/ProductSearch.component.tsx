import { useState } from 'react';

import { useProductSearch } from '@/hooks/useProductSearch';
import SearchResultItem from './SearchResultItem.component';

interface IProductSearchProps {
  /** desktop: results in an absolute dropdown; mobile: results inline */
  variant?: 'desktop' | 'mobile';
}

/**
 * Product search box backed by WooCommerce (WPGraphQL)
 */
const ProductSearch = ({ variant = 'desktop' }: IProductSearchProps) => {
  const { query, setQuery, active, loading, results } = useProductSearch();
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const isDesktop = variant === 'desktop';

  const list = (
    <>
      {loading && <p className="p-4 text-base">Søker...</p>}
      {!loading && results.length === 0 && (
        <p className="p-4 text-base">Ingen produkter funnet</p>
      )}
      {results.map((product) => (
        <SearchResultItem key={product.databaseId} product={product} />
      ))}
    </>
  );

  return (
    <>
      <input
        type="search"
        aria-label="Søk her"
        placeholder="Søk etter produkter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        className={`w-full px-4 ${
          isDesktop ? 'py-2' : 'py-3 md:py-2'
        } text-base bg-surface border outline-none rounded-md transition-colors duration-200 ${
          hasFocus ? 'border-primary' : 'border-border'
        }`}
      />
      {active &&
        (isDesktop ? (
          <div className="absolute left-0 right-0 top-full z-50 bg-surface shadow-lg rounded-md mt-1">
            {list}
          </div>
        ) : (
          list
        ))}
    </>
  );
};

export default ProductSearch;
