# Project Skill: nextjs-woocom

Read this first if you are an AI model working in this repository. For full source, see `DOCS/repository_context.txt` (generated, read-only).

## What this is
A headless eCommerce storefront. Next.js (Pages Router) + React + TypeScript frontend; WordPress + WooCommerce backend exposed through **WPGraphQL** and **WooGraphQL**. The UI language is **Norwegian** (routes, labels, error messages).

There is **no Algolia and no other external search service**. Product search runs against WooCommerce through WPGraphQL (`products(where: { search })`).

## Stack
| Area | Choice |
|---|---|
| Framework | Next.js 16 (Pages Router, `src/pages`), React 19, TypeScript |
| Data | `@apollo/client` against `NEXT_PUBLIC_GRAPHQL_URL` |
| State | `zustand` (persisted cart store) |
| Forms | `react-hook-form` |
| Styling | Tailwind CSS 3 (+ small `src/styles/*.css`), `motion` for animation |
| Tests | Playwright (`src/tests/**`), Lighthouse CI, pa11y |
| Package manager | pnpm (npm lockfile also present); the repo's scripts use `pnpm exec` |

## Commands
- `pnpm dev` — `next dev --turbopack`
- `pnpm build` / `pnpm start`
- `pnpm lint`, `pnpm format` (prettier)
- `pnpm playwright` (also `:ui`, `:debug`, `:codegen`)
- `npx tsc --noEmit` — type check
- Build needs `NEXT_PUBLIC_GRAPHQL_URL` set. Without it static pages fail with `Failed to parse URL from /graphql`.

## Environment (`.env.example`)
`NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL`, `NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL`, `NODE_ENV`, `NEXT_PUBLIC_AUTH_TOKEN_SS_KEY`, `NEXT_PUBLIC_REFRESH_TOKEN_LS_KEY`, `NEXT_PUBLIC_SESSION_TOKEN_LS_KEY`, `NEXT_PUBLIC_AUTH_KEY_TIMEOUT`. Images must come from hosts allowed in `next.config.ts` `remotePatterns`.

## Layout
```
src/
  pages/          Routes (Norwegian names)
  components/     UI by feature: Cart, Category, Checkout, Footer, Header, Index,
                  Input, Layout, Product, ProductSearch, UI, User, Animations, SVG
  hooks/          useCartQuery, useProductFilters, useProductSearch
  stores/         cartStore.ts (zustand + persist)
  utils/
    apollo/ApolloClient.ts   Apollo client + session middleware/afterware
    gql/GQL_QUERIES.ts       All queries
    gql/GQL_MUTATIONS.ts     All mutations
    functions/               price.ts (formatPrice), productUtils.ts (filter/sort), functions.tsx
    constants/               LINKS.ts (nav), INPUT_FIELDS.ts (checkout fields)
    auth.ts                  Login helper + Norwegian error mapping
  types/          cart, checkout, graphql, product
  tests/          Playwright specs
wordpress/mu-plugins/headless-graphql-cors.php   CORS for the GraphQL endpoint
```

## Routes
| Route | File | Data fetching |
|---|---|---|
| `/` | `pages/index.tsx` | `getStaticProps`, revalidate 60 |
| `/produkter` | `pages/produkter.tsx` | `getStaticProps`, revalidate 60 |
| `/produkt/[slug]` | `pages/produkt/[slug].tsx` | `getServerSideProps` |
| `/kategorier` | `pages/kategorier.tsx` | `getStaticProps`, revalidate 10 |
| `/kategori/[slug]` | `pages/kategori/[slug].tsx` | `getServerSideProps` |
| `/handlekurv` | cart | client |
| `/kasse` | checkout | client |
| `/logg-inn`, `/min-konto` | login / account (`withAuth`) | client |

`pages/registrer.tsx.backup` is an inactive backup, not a route.

## Key flows
- **WooCommerce connection:** one Apollo client (`utils/apollo/ApolloClient.ts`). Middleware adds `woocommerce-session: Session <token>` from localStorage (key `woo-session:v1`, dropped after 7 days); afterware stores the token returned by WooGraphQL. Auth is cookie-based (`credentials: 'include'`).
- **Cart:** `cartStore` (zustand, persisted, key `woocommerce-cart:v1`) mirrors the server cart. `useCartQuery` runs `GET_CART`; `CartInitializer` seeds it. Mutations live in `GQL_MUTATIONS.ts`.
- **Product listing/filtering:** the product list is fetched once (`FETCH_ALL_PRODUCTS_QUERY`, first 50). Filtering and sorting by price, size, color and type happen **client-side** in `useProductFilters` and `utils/functions/productUtils.ts`.
- **Search:** `hooks/useProductSearch.ts` debounces input (300 ms), requires 2+ characters, and runs `SEARCH_PRODUCTS_QUERY` (8 results). UI is `components/ProductSearch/` (`SearchBox` desktop dropdown, `MobileSearch` inline, both built on `ProductSearch`; `SearchResultItem` renders a hit and links to `/produkt/<slug>`). Search quality depends on WordPress's default search, so a relevance plugin on the WP side improves it without frontend changes.
- **Prices:** always render through `formatPrice` (`nb-NO`, NOK, two decimals). WooGraphQL returns prices as strings that may include HTML or ranges.

## Product data shape
`Product` (`src/types/product.ts`): `databaseId, name, slug, onSale, price, regularPrice, salePrice?, image?.sourceUrl`, plus `productCategories`, `allPaColors`, `allPaSizes`, `variations.nodes` for variable products. Price fields exist only inside `... on SimpleProduct` / `... on VariableProduct` fragments, so new product queries must include those fragments.

## Conventions
- Components: `Name.component.tsx`, default export, PascalCase; hooks `useX.ts`; GraphQL documents as `UPPER_SNAKE` constants in `utils/gql`.
- Keep user-facing text Norwegian. Keep new routes Norwegian.
- Persisted client keys are versioned (`:v1`); bump the version if a stored schema changes.
- Prefer the shared UI pieces in `components/UI` and `components/Input`.
- Use `next/image` for images and keep hosts in `next.config.ts`.
- Prettier formatting; lint with `next lint`.

## When changing things
- New data → add the query/mutation in `utils/gql`, a type in `src/types`, and consume via Apollo hooks (client) or `client.query` in `getStaticProps`/`getServerSideProps` (server).
- Do not add a search service dependency without being asked; extend the WPGraphQL query instead.
- Never hardcode the GraphQL URL; use `NEXT_PUBLIC_GRAPHQL_URL`.
- After changes, run `npx tsc --noEmit`, `pnpm lint`, and (with env set) `pnpm build`.

## Known gaps
- No `/sok` search results page (dropdown only).
- Full product list is capped at 50 and filtered on the client.
- `DOCS/repository_context.txt` is generated by Repomix (`.github/workflows/repomix.yml`: `repomix --output DOCS/repository_context.txt --style markdown --remove-empty-lines`). Regenerate it instead of hand-editing.
