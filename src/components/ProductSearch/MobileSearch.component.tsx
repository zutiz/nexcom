import ProductSearch from './ProductSearch.component';

/**
 * Product search for mobile menu.
 */
const MobileSearch = () => {
  return (
    <div className="mt-4 md:hidden">
      <ProductSearch variant="mobile" />
    </div>
  );
};

export default MobileSearch;
