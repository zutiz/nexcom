import Link from 'next/link';
import Image from 'next/image';
import { trimmedStringToLength } from '@/utils/functions/functions';
import { formatPrice } from '@/utils/functions/price';
import type { ISearchProduct } from '@/hooks/useProductSearch';

interface ISearchResultItemProps {
  product: ISearchProduct;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '');

/**
 * Displays a single WooCommerce product search result
 */
const SearchResultItem = ({ product }: ISearchResultItemProps) => {
  const { name, slug, onSale, image, price, regularPrice, salePrice } = product;
  const description = stripHtml(product.shortDescription ?? '');

  return (
    <article className="cursor-pointer hit">
      <Link href={`/produkt/${slug}`}>
        <div className="flex p-6 bg-surface">
          <header className="hit-image-container relative w-12 h-12">
            {image?.sourceUrl && (
              <Image
                src={image.sourceUrl}
                alt={name}
                fill
                sizes="48px"
                className="hit-image object-cover"
              />
            )}
          </header>
          <div className="pl-4 text-left">
            <span className="text-lg font-bold">{name}</span>
            <br />
            {onSale ? (
              <>
                <span className="text-base font-bold text-error">
                  {formatPrice(salePrice ?? price)}
                </span>
                <span className="ml-2 text-base text-text-light line-through">
                  {formatPrice(regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-base">
                {formatPrice(price ?? regularPrice)}
              </span>
            )}
            <br />
            <span className="text-base">
              {trimmedStringToLength(description, 30)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default SearchResultItem;
