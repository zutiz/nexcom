import ProductSearch from './ProductSearch.component';

/**
 * Product search for larger resolutions that do not show the mobile menu
 */
const SearchBox = () => {
  return (
    <div className="hidden mb-0.5 md:inline-block xl:inline-block">
      <div className="relative w-72">
        <ProductSearch variant="desktop" />
      </div>
    </div>
  );
};

export default SearchBox;
